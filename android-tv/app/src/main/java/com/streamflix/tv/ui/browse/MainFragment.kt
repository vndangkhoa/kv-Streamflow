package com.streamflix.tv.ui.browse

import android.content.Intent
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.view.View
import androidx.core.content.ContextCompat
import androidx.leanback.app.BackgroundManager
import androidx.leanback.app.BrowseSupportFragment
import androidx.leanback.widget.*
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition
import com.streamflix.tv.R
import com.streamflix.tv.data.MyListManager
import com.streamflix.tv.data.WatchHistoryManager
import com.streamflix.tv.data.api.ApiClient
import com.streamflix.tv.data.model.HomeSection
import com.streamflix.tv.data.model.Movie
import com.streamflix.tv.ui.details.DetailsActivity
import com.streamflix.tv.ui.search.SearchActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Main Browse Fragment using Leanback BrowseSupportFragment
 * Displays movie categories in horizontal rows from /api/rophim/home/curated
 */
class MainFragment : BrowseSupportFragment() {

    private lateinit var backgroundManager: BackgroundManager
    private var defaultBackground: Drawable? = null
    private val rowsAdapter = ArrayObjectAdapter(ListRowPresenter())

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupUI()
        setupBackgroundManager()
        setupEventListeners()
        loadCategories()
    }
    
    override fun onResume() {
        super.onResume()
        // Refresh to show updated watch history
        loadCategories()
    }

    private fun setupUI() {
        title = getString(R.string.browse_title)
        
        // Headers (category sidebar) settings
        headersState = HEADERS_ENABLED
        isHeadersTransitionOnBackEnabled = true
        
        // Brand colors
        brandColor = ContextCompat.getColor(requireContext(), R.color.primary_dark)
        searchAffordanceColor = ContextCompat.getColor(requireContext(), R.color.accent)
        
        // Set the adapter
        adapter = rowsAdapter
    }

    private fun setupBackgroundManager() {
        backgroundManager = BackgroundManager.getInstance(requireActivity()).apply {
            attach(requireActivity().window)
        }
        defaultBackground = ContextCompat.getDrawable(requireContext(), R.drawable.default_background)
        backgroundManager.drawable = defaultBackground
    }

    private fun setupEventListeners() {
        // Search button click
        setOnSearchClickedListener {
            startActivity(Intent(requireContext(), SearchActivity::class.java))
        }

        // Item selected - update background
        onItemViewSelectedListener = OnItemViewSelectedListener { _, item, _, _ ->
            if (item is Movie) {
                updateBackground(item)
            }
        }

        // Item clicked - open details
        onItemViewClickedListener = OnItemViewClickedListener { _, item, _, _ ->
            if (item is Movie) {
                val intent = Intent(requireContext(), DetailsActivity::class.java).apply {
                    putExtra(DetailsActivity.EXTRA_MOVIE, item)
                }
                startActivity(intent)
            }
        }
    }

    private fun loadCategories() {
        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.api.getHomeCurated()
                }

                if (response.sections.isNullOrEmpty()) {
                    loadFallbackCatalog()
                } else {
                    populateRows(response.sections)
                }
            } catch (e: Exception) {
                e.printStackTrace()
                // Try fallback to catalog on error
                loadFallbackCatalog()
            }
        }
    }

    private suspend fun loadFallbackCatalog() {
        try {
            val response = withContext(Dispatchers.IO) {
                ApiClient.api.getCatalog(category = "phim-le", limit = 30)
            }
            
            if (response.movies.isNullOrEmpty()) {
                if (isAdded) showError()
            } else {
                rowsAdapter.clear()
                val cardPresenter = CardPresenter()
                val listRowAdapter = ArrayObjectAdapter(cardPresenter)
                response.movies.forEach { listRowAdapter.add(it) }
                val header = HeaderItem(0, "Popular Movies")
                rowsAdapter.add(ListRow(header, listRowAdapter))
            }
        } catch (e: Exception) {
            e.printStackTrace()
            if (isAdded) showError()
        }
    }

    private fun populateRows(sections: List<HomeSection>) {
        rowsAdapter.clear()
        
        var rowIndex = 0
        
        // Add "Continue Watching" row first if there's history
        val watchHistory = WatchHistoryManager.getWatchHistory()
        if (watchHistory.isNotEmpty()) {
            val cardPresenter = CardPresenter()
            val listRowAdapter = ArrayObjectAdapter(cardPresenter)
            watchHistory.forEach { listRowAdapter.add(it) }
            val header = HeaderItem(rowIndex.toLong(), "Continue Watching")
            rowsAdapter.add(ListRow(header, listRowAdapter))
            rowIndex++
        }
        
        // Add "My List" row if there are items
        val myList = MyListManager.getMyList()
        if (myList.isNotEmpty()) {
            val cardPresenter = CardPresenter()
            val listRowAdapter = ArrayObjectAdapter(cardPresenter)
            myList.forEach { listRowAdapter.add(it) }
            val header = HeaderItem(rowIndex.toLong(), "My List")
            rowsAdapter.add(ListRow(header, listRowAdapter))
            rowIndex++
        }

        sections.forEachIndexed { _, section ->
            val movies = section.movies
            if (!movies.isNullOrEmpty()) {
                val cardPresenter = CardPresenter()
                val listRowAdapter = ArrayObjectAdapter(cardPresenter)

                movies.forEach { movie ->
                    listRowAdapter.add(movie)
                }

                val header = HeaderItem(rowIndex.toLong(), section.title)
                rowsAdapter.add(ListRow(header, listRowAdapter))
                rowIndex++
            }
        }

        if (rowsAdapter.size() == 0) {
            showError()
        }
    }

    private fun updateBackground(movie: Movie) {
        val imageUrl = movie.getThumbImage()
        val context = context ?: return
        
        if (imageUrl.isEmpty()) {
            backgroundManager.drawable = defaultBackground
            return
        }

        Glide.with(context)
            .load(imageUrl)
            .centerCrop()
            .into(object : CustomTarget<Drawable>() {
                override fun onResourceReady(resource: Drawable, transition: Transition<in Drawable>?) {
                    if (isAdded) {
                        backgroundManager.drawable = resource
                    }
                }

                override fun onLoadCleared(placeholder: Drawable?) {
                    if (isAdded) {
                        backgroundManager.drawable = defaultBackground
                    }
                }
            })
    }

    private fun showError() {
        if (!isAdded) return
        val ctx = context ?: return
        
        val errorFragment = androidx.leanback.app.ErrorSupportFragment().apply {
            imageDrawable = ContextCompat.getDrawable(ctx, R.drawable.ic_error)
            message = ctx.getString(R.string.error_loading)
            setDefaultBackground(true)
            buttonText = ctx.getString(R.string.retry)
            buttonClickListener = View.OnClickListener {
                parentFragmentManager.popBackStack()
                loadCategories()
            }
        }

        // Use replace instead of add to avoid fragment stacking in error state
        parentFragmentManager.beginTransaction()
            .replace(R.id.main_browse_fragment, errorFragment)
            .addToBackStack(null)
            .commit()
    }

    override fun onDestroy() {
        super.onDestroy()
        backgroundManager.release()
    }
}

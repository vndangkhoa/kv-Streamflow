package com.streamflix.tv.ui.search

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import androidx.leanback.app.SearchSupportFragment
import androidx.leanback.widget.*
import androidx.lifecycle.lifecycleScope
import com.streamflix.tv.R
import com.streamflix.tv.data.api.ApiClient
import com.streamflix.tv.data.model.Movie
import com.streamflix.tv.ui.browse.CardPresenter
import com.streamflix.tv.ui.details.DetailsActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Search Fragment using Leanback SearchSupportFragment
 * Supports both voice and text search with debouncing
 */
class SearchFragment : SearchSupportFragment(), SearchSupportFragment.SearchResultProvider {

    private val handler = Handler(Looper.getMainLooper())
    private var searchRunnable: Runnable? = null
    private val rowsAdapter = ArrayObjectAdapter(ListRowPresenter())
    
    companion object {
        private const val SEARCH_DELAY_MS = 400L
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setSearchResultProvider(this)
        setupEventListeners()
        
        // Customization
        // setBadgeDrawable(resources.getDrawable(R.drawable.app_banner, null))
        setTitle("Search StreamFlix")
        // setSearchAffordanceColors(resources.getColor(R.color.primary), resources.getColor(R.color.background_dark))
    }

    private fun setupEventListeners() {
        setOnItemViewClickedListener { _, item, _, _ ->
            if (item is Movie) {
                val intent = Intent(requireContext(), DetailsActivity::class.java).apply {
                    putExtra(DetailsActivity.EXTRA_MOVIE, item)
                }
                startActivity(intent)
            }
        }
    }

    override fun getResultsAdapter(): ObjectAdapter {
        return rowsAdapter
    }

    override fun onQueryTextChange(newQuery: String): Boolean {
        // Cancel previous search
        searchRunnable?.let { handler.removeCallbacks(it) }
        
        if (newQuery.length >= 2) {
            searchRunnable = Runnable { performSearch(newQuery) }
            handler.postDelayed(searchRunnable!!, SEARCH_DELAY_MS)
        } else {
            rowsAdapter.clear()
        }
        
        return true
    }

    override fun onQueryTextSubmit(query: String): Boolean {
        // Cancel debounced search and perform immediately
        searchRunnable?.let { handler.removeCallbacks(it) }
        if (query.isNotEmpty()) {
            performSearch(query)
        }
        return true
    }

    private fun performSearch(query: String) {
        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.api.searchMovies(query, limit = 30)
                }

                if (isAdded) {
                    response.movies?.let { movies ->
                        displayResults(movies, query)
                    } ?: run {
                        showNoResults(query)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                if (isAdded) {
                    showError()
                }
            }
        }
    }

    private fun displayResults(movies: List<Movie>, query: String) {
        rowsAdapter.clear()
        
        if (movies.isEmpty()) {
            showNoResults(query)
            return
        }
        
        // Search working - no debug needed

        val cardPresenter = CardPresenter()
        val listRowAdapter = ArrayObjectAdapter(cardPresenter)
        
        movies.forEach { movie ->
            listRowAdapter.add(movie)
        }
        
        val header = HeaderItem(getString(R.string.search_results_format, movies.size))
        rowsAdapter.add(ListRow(header, listRowAdapter))
    }

    private fun showNoResults(query: String) {
        rowsAdapter.clear()
        // The Leanback search fragment will show a "no results" message automatically
        // But let's add a Toast for clarity
        android.widget.Toast.makeText(requireContext(), "No results found for '$query'", android.widget.Toast.LENGTH_SHORT).show()
    }

    private fun showError() {
        rowsAdapter.clear()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        searchRunnable?.let { handler.removeCallbacks(it) }
    }
}

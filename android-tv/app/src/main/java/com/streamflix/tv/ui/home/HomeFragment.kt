
package com.streamflix.tv.ui.home

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.streamflix.tv.R
import com.streamflix.tv.data.api.ApiClient
import com.streamflix.tv.data.model.HomeSection
import com.streamflix.tv.data.model.Movie
import com.streamflix.tv.ui.details.DetailsActivity
import com.streamflix.tv.ui.playback.PlaybackActivity
import com.streamflix.tv.ui.search.SearchActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.async
import com.streamflix.tv.data.api.StreamflixApi
import com.streamflix.tv.data.WatchHistoryManager
import androidx.core.content.ContextCompat

/**
 * Netflix-style Home Fragment with Hero Slider and Category Rows
 * Replaces the traditional Leanback BrowseSupportFragment for a more modern look
 */
class HomeFragment : Fragment() {

    // Hero slider state
    private var featuredMovies = mutableListOf<Movie>()
    private var currentHeroIndex = 0
    private val heroAutoScrollHandler = Handler(Looper.getMainLooper())
    private val heroAutoScrollDelay = 5000L // 5 seconds
    
    // Category rows
    private var categorySections = mutableListOf<HomeSection>()
    
    // Views
    private lateinit var heroBackdrop: ImageView
    private lateinit var heroTitle: TextView
    private lateinit var heroYear: TextView
    private lateinit var heroRating: TextView
    private lateinit var heroQuality: TextView
    private lateinit var heroDescription: TextView
    private lateinit var heroPlayButton: Button
    private lateinit var heroInfoButton: Button
    private lateinit var heroIndicators: LinearLayout
    private lateinit var categoryRowsRecycler: RecyclerView
    private lateinit var loadingOverlay: View
    private lateinit var heroContainer: android.widget.FrameLayout
    
    // Sidebar
    private lateinit var sidebarContainer: LinearLayout
    private lateinit var sidebarSearch: ImageView
    private lateinit var sidebarHome: ImageView
    private lateinit var sidebarSeries: ImageView
    private lateinit var sidebarMovies: ImageView
    private lateinit var sidebarKorea: ImageView
    private lateinit var sidebarChina: ImageView
    private lateinit var sidebarAnime: ImageView
    private lateinit var sidebarUpdate: ImageView
    
    // State
    private var activeTabId = R.id.sidebarHome
    
    private val heroAutoScrollRunnable = object : Runnable {
        override fun run() {
            if (featuredMovies.isNotEmpty()) {
                currentHeroIndex = (currentHeroIndex + 1) % featuredMovies.size
                updateHeroContent(featuredMovies[currentHeroIndex])
                updateHeroIndicators()
            }
            heroAutoScrollHandler.postDelayed(this, heroAutoScrollDelay)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_home, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        initViews(view)
        setupListeners()
        loadContent(StreamflixApi.CATEGORY_PHIM_MOI)
    }
    
    private fun initViews(view: View) {
        heroBackdrop = view.findViewById(R.id.heroBackdrop)
        heroTitle = view.findViewById(R.id.heroTitle)
        heroYear = view.findViewById(R.id.heroYear)
        heroRating = view.findViewById(R.id.heroRating)
        heroQuality = view.findViewById(R.id.heroQuality)
        heroDescription = view.findViewById(R.id.heroDescription)
        heroPlayButton = view.findViewById(R.id.heroPlayButton)
        heroInfoButton = view.findViewById(R.id.heroInfoButton)
        heroIndicators = view.findViewById(R.id.heroIndicators)
        categoryRowsRecycler = view.findViewById(R.id.categoryRowsRecycler)
        heroContainer = view.findViewById(R.id.heroContainer)
        loadingOverlay = view.findViewById(R.id.loadingOverlay)
        
        sidebarContainer = view.findViewById(R.id.sidebarContainer)
        sidebarSearch = view.findViewById(R.id.sidebarSearch)
        sidebarHome = view.findViewById(R.id.sidebarHome)
        sidebarSeries = view.findViewById(R.id.sidebarSeries)
        sidebarMovies = view.findViewById(R.id.sidebarMovies)
        sidebarKorea = view.findViewById(R.id.sidebarKorea)
        sidebarChina = view.findViewById(R.id.sidebarChina)
        sidebarAnime = view.findViewById(R.id.sidebarAnime)
        sidebarUpdate = view.findViewById(R.id.sidebarUpdate)
        
        // Explicitly set correct icon for Movies (was defaulting to search)
        sidebarMovies.setImageResource(R.drawable.ic_movie_theater)
        
        categoryRowsRecycler.layoutManager = LinearLayoutManager(requireContext())
        categoryRowsRecycler.setHasFixedSize(false)
    }
    
    private fun setupListeners() {
        // Play button - start playback immediately
        heroPlayButton.setOnClickListener {
            if (featuredMovies.isNotEmpty()) {
                val movie = featuredMovies[currentHeroIndex]
                val intent = Intent(requireContext(), PlaybackActivity::class.java).apply {
                    putExtra(PlaybackActivity.EXTRA_MOVIE, movie)
                }
                startActivity(intent)
            }
        }
        
        // More Info button - go to details
        heroInfoButton.setOnClickListener {
            if (featuredMovies.isNotEmpty()) {
                val movie = featuredMovies[currentHeroIndex]
                val intent = Intent(requireContext(), DetailsActivity::class.java).apply {
                    putExtra(DetailsActivity.EXTRA_MOVIE, movie)
                }
                startActivity(intent)
            }
        }
        
        // D-pad up/down to navigate hero slider (when hero is focused)
        heroPlayButton.setOnKeyListener { _, keyCode, event ->
            if (event.action == android.view.KeyEvent.ACTION_DOWN) {
                when (keyCode) {
                    android.view.KeyEvent.KEYCODE_DPAD_LEFT -> {
                        navigateHero(-1)
                        true
                    }
                    android.view.KeyEvent.KEYCODE_DPAD_RIGHT -> {
                        navigateHero(1)
                        true
                    }
                    else -> false
                }
            } else false
        }

        // Sidebar Navigation
        sidebarSearch.setOnClickListener {
            startActivity(Intent(requireContext(), SearchActivity::class.java))
        }
        
        sidebarHome.setOnClickListener {
             updateSidebarState(R.id.sidebarHome)
             loadContent(StreamflixApi.CATEGORY_PHIM_MOI) // "phim-moi" or empty for home? Using helper to decide
             heroContainer.requestFocus()
        }

        sidebarSeries.setOnClickListener {
            updateSidebarState(R.id.sidebarSeries)
            loadContent(StreamflixApi.CATEGORY_PHIM_BO) // Series
        }

        sidebarMovies.setOnClickListener {
            updateSidebarState(R.id.sidebarMovies)
            loadContent(StreamflixApi.CATEGORY_PHIM_LE) // Movies
        }

        sidebarKorea.setOnClickListener {
            updateSidebarState(R.id.sidebarKorea)
            loadContent("phim-han") // Assuming "phim-han" is valid or will return generic
        }

        sidebarChina.setOnClickListener {
            updateSidebarState(R.id.sidebarChina)
            loadContent("phim-trung") // Assuming "phim-trung"
        }

        sidebarAnime.setOnClickListener {
            updateSidebarState(R.id.sidebarAnime)
            loadContent(StreamflixApi.CATEGORY_HOAT_HINH) // Anime
        }

        sidebarUpdate.setOnClickListener {
             // For update, we might not switch tab content, just action
             com.streamflix.tv.data.UpdateManager.checkForUpdate(requireContext(), true)
        }

        // Sidebar Focus Animation
        val sidebarIcons = listOf(sidebarSearch, sidebarHome, sidebarSeries, sidebarMovies, sidebarKorea, sidebarChina, sidebarAnime, sidebarUpdate)
        sidebarIcons.forEach { icon ->
            icon.setOnFocusChangeListener { v, hasFocus ->
                v.animate().scaleX(if (hasFocus) 1.2f else 1.0f).scaleY(if (hasFocus) 1.2f else 1.0f).duration = 150
                // If we want the container to expand/contract:
                // if (hasFocus) sidebarContainer.animate().alpha(1.0f) ...
            }
        }
        
        // Init visual state
        updateSidebarState(activeTabId)
    }
    
    private fun updateSidebarState(activeId: Int) {
        activeTabId = activeId
        
        val icons = mapOf(
            R.id.sidebarHome to sidebarHome,
            R.id.sidebarSeries to sidebarSeries,
            R.id.sidebarMovies to sidebarMovies,
            R.id.sidebarKorea to sidebarKorea,
            R.id.sidebarChina to sidebarChina,
            R.id.sidebarAnime to sidebarAnime
        )
        
        icons.forEach { (id, view) ->
            if (id == activeId) {
                view.alpha = 1.0f
                view.setColorFilter(ContextCompat.getColor(requireContext(), R.color.primary)) // Highlight
            } else {
                view.alpha = 0.5f // Dimmed
                view.clearColorFilter()
            }
        }
        
        // Fix Focus Navigation: Ensure pressing Left from Hero buttons goes back to the Active Tab
        heroPlayButton.nextFocusLeftId = activeId
        heroInfoButton.nextFocusLeftId = activeId
        
        // Also set nextFocusLeft for the first item of recycler view if possible (tricky without view reference)
    }
    
    private fun navigateHero(direction: Int) {
        if (featuredMovies.isEmpty()) return
        
        currentHeroIndex = (currentHeroIndex + direction + featuredMovies.size) % featuredMovies.size
        updateHeroContent(featuredMovies[currentHeroIndex])
        updateHeroIndicators()
        
        // Reset auto-scroll timer
        heroAutoScrollHandler.removeCallbacks(heroAutoScrollRunnable)
        heroAutoScrollHandler.postDelayed(heroAutoScrollRunnable, heroAutoScrollDelay)
    }
    
    private fun loadContent(category: String = StreamflixApi.CATEGORY_PHIM_MOI) {
        loadingOverlay.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            try {
                // If asking for curated home (phim-moi or default)
                if (category == StreamflixApi.CATEGORY_PHIM_MOI) {
                     val response = withContext(Dispatchers.IO) {
                        ApiClient.api.getHomeCurated()
                    }
                    response.sections?.let { sections ->
                        // 1. Get Watch History (Local)
                        val history = WatchHistoryManager.getWatchHistory()
                        val historySection = if (history.isNotEmpty()) {
                            HomeSection("Continue Watching", "history", history)
                        } else null
                        
                        // 2. Add extra rows for "Suggestions"
                        val extraRows = withContext(Dispatchers.IO) {
                             val recommendedDeferred = async { ApiClient.api.getCatalog(sort = StreamflixApi.SORT_VIEWS, limit = 15) }
                             val acclaimedDeferred = async { ApiClient.api.getCatalog(sort = StreamflixApi.SORT_RATING, limit = 15) }
                             
                             val recommended = try { recommendedDeferred.await() } catch (e: Exception) { null }
                             val acclaimed = try { acclaimedDeferred.await() } catch (e: Exception) { null }
                             
                             listOfNotNull(
                                 recommended?.movies?.let { HomeSection("Recommended for You", "recommended", it) },
                                 acclaimed?.movies?.let { HomeSection("Critically Acclaimed", "acclaimed", it) }
                             )
                        }
                        
                        // Combine: History + Curated + Recommendations
                        val finalSections = listOfNotNull(historySection) + sections + extraRows
                        updateUIWithSections(finalSections)
                    }
                } else {
                    // Asking for specific catalog (Series/Movies) - Fetch 4 distinct rows using parallel requests
                    val rows = withContext(Dispatchers.IO) {
                        val latestDeferred = async { ApiClient.api.getCatalog(category = category, limit = 15, sort = StreamflixApi.SORT_MODIFIED) }
                        val ratingDeferred = async { ApiClient.api.getCatalog(category = category, limit = 15, sort = StreamflixApi.SORT_RATING) }
                        val yearDeferred = async { ApiClient.api.getCatalog(category = category, limit = 15, sort = StreamflixApi.SORT_YEAR) }
                        // For "Trending", we try 'views' if available or just page 2 of 'modified'
                        val trendingDeferred = async { ApiClient.api.getCatalog(category = category, limit = 15, page = 2, sort = StreamflixApi.SORT_MODIFIED) }

                        val latest = try { latestDeferred.await() } catch (e: Exception) { null }
                        val rating = try { ratingDeferred.await() } catch (e: Exception) { null }
                        val year = try { yearDeferred.await() } catch (e: Exception) { null }
                        val trending = try { trendingDeferred.await() } catch (e: Exception) { null }
                        
                        val categoryTitle = when(category) {
                            StreamflixApi.CATEGORY_PHIM_BO -> "Series"
                            StreamflixApi.CATEGORY_PHIM_LE -> "Movies"
                            StreamflixApi.CATEGORY_HOAT_HINH -> "Anime"
                            "phim-han" -> "Korea"
                            "phim-trung" -> "China"
                            else -> "Catalog"
                        }
                        
                        listOfNotNull(
                            latest?.movies?.let { HomeSection("$categoryTitle - Latest", category, it) },
                            rating?.movies?.let { HomeSection("$categoryTitle - Top Rated", category, it) },
                            year?.movies?.let { HomeSection("$categoryTitle - New Releases", category, it) },
                            trending?.movies?.let { HomeSection("$categoryTitle - Trending", category, it) }
                        )
                    }

                    if (rows.isNotEmpty()) {
                        updateUIWithSections(rows)
                    }
                }
                
                loadingOverlay.visibility = View.GONE
                
                // Reset scroll position to top
                view?.findViewById<androidx.core.widget.NestedScrollView>(R.id.homeScrollView)?.scrollTo(0, 0)
                // Focus hero container or play button to show "top banner"
                heroPlayButton.requestFocus()
                
            } catch (e: Exception) {
                e.printStackTrace()
                loadingOverlay.visibility = View.GONE
                val errorMsg = if (e is retrofit2.HttpException) {
                    "API Error: ${e.code()} ${e.message()}"
                } else {
                    "Error: ${e.localizedMessage}"
                }
                android.widget.Toast.makeText(requireContext(), errorMsg, android.widget.Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun updateUIWithSections(sections: List<HomeSection>) {
        // Use first section's movies as featured content for hero slider
        val featured = sections.firstOrNull()?.movies?.take(5) ?: emptyList()
        featuredMovies.clear()
        featuredMovies.addAll(featured)
        
        categorySections.clear()
        categorySections.addAll(sections)
        
        // Update UI
        if (featuredMovies.isNotEmpty()) {
            updateHeroContent(featuredMovies[0])
            createHeroIndicators()
            startHeroAutoScroll()
            heroContainer.visibility = View.VISIBLE
        } else {
             heroContainer.visibility = View.GONE
        }
        
        // Setup category rows adapter
        categoryRowsRecycler.adapter = CategoryRowsAdapter(categorySections) { movie ->
            // On movie click - go to details
            val intent = Intent(requireContext(), DetailsActivity::class.java).apply {
                putExtra(DetailsActivity.EXTRA_MOVIE, movie)
            }
            startActivity(intent)
        }
    }
    
    private fun updateHeroContent(movie: Movie) {
        heroTitle.text = movie.getDisplayTitle()
        heroYear.text = movie.getYearDisplay()
        heroRating.text = movie.getRatingDisplay().takeIf { it.isNotEmpty() } ?: "N/A"
        heroQuality.text = movie.getQualityBadge()
        heroDescription.text = movie.content ?: ""
        
        // Load backdrop image
        val imageUrl = movie.getThumbImage().takeIf { it.isNotEmpty() } ?: movie.getPosterImage()
        if (imageUrl.isNotEmpty()) {
            Glide.with(this)
                .load(imageUrl)
                .centerCrop()
                .into(heroBackdrop)
        }
    }
    
    private fun createHeroIndicators() {
        heroIndicators.removeAllViews()
        
        featuredMovies.forEachIndexed { index, _ ->
            val dot = View(requireContext()).apply {
                layoutParams = LinearLayout.LayoutParams(12, 12).apply {
                    marginEnd = 8
                }
                setBackgroundResource(
                    if (index == currentHeroIndex) R.drawable.indicator_active
                    else R.drawable.indicator_inactive
                )
            }
            heroIndicators.addView(dot)
        }
    }
    
    private fun updateHeroIndicators() {
        for (i in 0 until heroIndicators.childCount) {
            heroIndicators.getChildAt(i).setBackgroundResource(
                if (i == currentHeroIndex) R.drawable.indicator_active
                else R.drawable.indicator_inactive
            )
        }
    }
    
    private fun startHeroAutoScroll() {
        heroAutoScrollHandler.postDelayed(heroAutoScrollRunnable, heroAutoScrollDelay)
    }
    
    override fun onResume() {
        super.onResume()
        startHeroAutoScroll()
    }
    
    override fun onPause() {
        super.onPause()
        heroAutoScrollHandler.removeCallbacks(heroAutoScrollRunnable)
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        heroAutoScrollHandler.removeCallbacks(heroAutoScrollRunnable)
    }
}

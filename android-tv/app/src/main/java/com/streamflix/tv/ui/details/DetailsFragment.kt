package com.streamflix.tv.ui.details

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.leanback.app.DetailsSupportFragment
import androidx.leanback.app.DetailsSupportFragmentBackgroundController
import androidx.leanback.widget.*
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition
import com.streamflix.tv.R
import com.streamflix.tv.data.MyListManager
import com.streamflix.tv.data.api.ApiClient
import com.streamflix.tv.data.model.Movie
import com.streamflix.tv.ui.browse.CardPresenter
import com.streamflix.tv.ui.playback.PlaybackActivity
import com.streamflix.tv.ui.episodes.EpisodesActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Details Fragment using Leanback DetailsSupportFragment
 * Shows movie details with play button and related movies
 */
class DetailsFragment : DetailsSupportFragment() {

    companion object {
        private const val EXTRA_MOVIE = "extra_movie"
        
        private const val ACTION_PLAY = 1L
        private const val ACTION_ADD_LIST = 2L
        private const val ACTION_EPISODES = 3L
        
        fun newInstance(movie: Movie): DetailsFragment {
            return DetailsFragment().apply {
                arguments = Bundle().apply {
                    putSerializable(EXTRA_MOVIE, movie)
                }
            }
        }
    }

    private lateinit var movie: Movie
    private lateinit var backgroundController: DetailsSupportFragmentBackgroundController
    private lateinit var presenterSelector: ClassPresenterSelector
    private lateinit var rowsAdapter: ArrayObjectAdapter
    
    // Episode data for TV series
    private var episodeServers: List<com.streamflix.tv.data.model.EpisodeServer> = emptyList()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        movie = arguments?.getSerializable(EXTRA_MOVIE) as? Movie ?: run {
            requireActivity().finish()
            return
        }

        setupBackgroundController()
        setupAdapter()
        loadMovieDetails()
    }

    private fun setupBackgroundController() {
        backgroundController = DetailsSupportFragmentBackgroundController(this).apply {
            enableParallax()
        }
    }

    private fun setupAdapter() {
        presenterSelector = ClassPresenterSelector()
        
        // Full width details presenter for the main details row
        val detailsPresenter = FullWidthDetailsOverviewRowPresenter(
            DetailsDescriptionPresenter()
        ).apply {
            backgroundColor = ContextCompat.getColor(requireContext(), R.color.primary_dark)
            
            // Set up action click listener
            setOnActionClickedListener { action ->
                when (action.id) {
                    ACTION_PLAY -> playMovie()
                    ACTION_ADD_LIST -> addToList()
                    ACTION_EPISODES -> showEpisodes()
                }
            }
        }
        
        presenterSelector.addClassPresenter(DetailsOverviewRow::class.java, detailsPresenter)
        presenterSelector.addClassPresenter(ListRow::class.java, ListRowPresenter())
        
        rowsAdapter = ArrayObjectAdapter(presenterSelector)
        adapter = rowsAdapter
    }

    private fun loadMovieDetails() {
        lifecycleScope.launch {
            try {
                // Fetch full movie details from API
                val response = withContext(Dispatchers.IO) {
                    ApiClient.api.getMovieDetails(movie.slug)
                }

                // Update movie with full details if available
                val detail = response.movie ?: run {
                    // Try to use flat structure fields
                    com.streamflix.tv.data.model.MovieDetail(
                        slug = response.slug,
                        name = response.name ?: response.title,
                        content = response.content ?: response.description,
                        director = response.director,
                        actor = response.actor ?: response.cast,
                        year = response.year,
                        quality = response.quality
                    )
                }

                // Merge detail data into movie object
                movie = movie.copy(
                    name = detail.name ?: movie.name,
                    title = detail.title ?: movie.title,
                    content = detail.content ?: detail.description ?: movie.content,
                    year = if (detail.year != null && detail.year != 0) detail.year else movie.year,
                    quality = detail.quality ?: movie.quality,
                    director = parseAnyToList(detail.director) ?: movie.director,
                    actor = parseAnyToList(detail.actor ?: detail.cast) ?: movie.actor
                )
                
                // Parse episode data if available
                parseEpisodeData(response.episodes)

                setupDetailsOverviewRow()
                setupDetailsOverviewRow()
                setupSuggestedRow()
                setupForYouRow()
                loadBackgroundImage()
            } catch (e: Exception) {
                e.printStackTrace()
                // Use the basic movie data we already have
                setupDetailsOverviewRow()
                loadBackgroundImage()
            }
        }
    }
    
    private fun parseEpisodeData(episodesData: Any?) {
        if (episodesData == null) return
        
        try {
            // episodesData can be List<EpisodeServer> or similar structure
            when (episodesData) {
                is List<*> -> {
                    episodeServers = episodesData.mapNotNull { item ->
                        when (item) {
                            is com.streamflix.tv.data.model.EpisodeServer -> item
                            is Map<*, *> -> {
                                val serverName = item["server_name"] as? String
                                val serverData = (item["server_data"] as? List<*>)?.mapNotNull { ep ->
                                    when (ep) {
                                        is com.streamflix.tv.data.model.EpisodeItem -> ep
                                        is Map<*, *> -> com.streamflix.tv.data.model.EpisodeItem(
                                            name = ep["name"] as? String,
                                            slug = ep["slug"] as? String,
                                            filename = ep["filename"] as? String,
                                            link_embed = ep["link_embed"] as? String,
                                            link_m3u8 = ep["link_m3u8"] as? String
                                        )
                                        else -> null
                                    }
                                }
                                com.streamflix.tv.data.model.EpisodeServer(
                                    server_name = serverName,
                                    server_data = serverData
                                )
                            }
                            else -> null
                        }
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun setupDetailsOverviewRow() {
        val row = DetailsOverviewRow(movie)

        // Load poster image
        val imageUrl = movie.getPosterImage()
        val context = context ?: return
        
        if (imageUrl.isNotEmpty()) {
            Glide.with(context)
                .asBitmap()
                .load(imageUrl)
                .into(object : CustomTarget<Bitmap>(200, 300) {
                    override fun onResourceReady(resource: Bitmap, transition: Transition<in Bitmap>?) {
                        if (isAdded) {
                            row.setImageBitmap(requireContext(), resource)
                        }
                    }

                    override fun onLoadCleared(placeholder: Drawable?) {}
                })
        }

        // Add action buttons
        val actionAdapter = ArrayObjectAdapter()
        actionAdapter.add(Action(ACTION_PLAY, getString(R.string.play), null))
        
        // Add Episodes button for TV series
        if (movie.isSeries() || episodeServers.isNotEmpty()) {
            actionAdapter.add(Action(ACTION_EPISODES, getString(R.string.episodes), null))
        }
        
        actionAdapter.add(Action(ACTION_ADD_LIST, getString(R.string.add_to_list), null))
        row.actionsAdapter = actionAdapter

        rowsAdapter.add(row)
    }

    private fun setupSuggestedRow() {
        lifecycleScope.launch {
            try {
                // Strategy: Try to search by first actor, otherwise fallback to category
                var results: List<Movie> = emptyList()
                var headerTitle = getString(R.string.related_movies)
                
                // 1. Try Actor Search
                val actors = movie.actor
                if (actors != null && actors.isNotEmpty()) {
                    val firstActor = actors.first()
                    // Assuming searchMovies returns SearchResponse with movies list
                     val response = withContext(Dispatchers.IO) {
                        ApiClient.api.searchMovies(keyword = firstActor, limit = 10)
                    }
                    if (response.movies?.isNotEmpty() == true) {
                        results = response.movies
                        headerTitle = "More with $firstActor"
                    }
                }
                
                // 2. Fallback to Category if no actor results
                if (results.isEmpty()) {
                    val category = if (movie.isSeries()) "phim-bo" else "phim-le"
                    val response = withContext(Dispatchers.IO) {
                        ApiClient.api.getCatalog(category = category, limit = 15)
                    }
                    results = response.movies ?: emptyList()
                    headerTitle = "Suggested Videos"
                }

                if (results.isNotEmpty()) {
                    val cardPresenter = CardPresenter()
                    val listRowAdapter = ArrayObjectAdapter(cardPresenter)

                    results
                        .filter { it.slug != movie.slug }
                        .take(10)
                        .forEach { listRowAdapter.add(it) }

                    if (listRowAdapter.size() > 0) {
                        val header = HeaderItem(headerTitle)
                        rowsAdapter.add(ListRow(header, listRowAdapter))
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun setupForYouRow() {
        lifecycleScope.launch {
            try {
                // Load Curated Home and pick a section
                 val response = withContext(Dispatchers.IO) {
                    ApiClient.api.getHomeCurated()
                }
                
                response.sections?.let { sections ->
                    // Pick "Phim bộ mới cập nhật" or similar, or just the second section
                    val forYouSection = sections.firstOrNull { it.title.contains("Hot") || it.title.contains("Top") } ?: sections.getOrNull(1)
                    
                    if (forYouSection?.movies?.isNotEmpty() == true) {
                        val cardPresenter = CardPresenter()
                        val listRowAdapter = ArrayObjectAdapter(cardPresenter)
                        
                        forYouSection.movies.take(10).forEach { listRowAdapter.add(it) }
                        
                        val header = HeaderItem("For Your Interest")
                        rowsAdapter.add(ListRow(header, listRowAdapter))
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun loadBackgroundImage() {
        val imageUrl = movie.getThumbImage()
        val context = context ?: return
        
        if (imageUrl.isNotEmpty()) {
            Glide.with(context)
                .asBitmap()
                .load(imageUrl)
                .into(object : CustomTarget<Bitmap>() {
                    override fun onResourceReady(resource: Bitmap, transition: Transition<in Bitmap>?) {
                        if (isAdded) {
                            backgroundController.coverBitmap = resource
                        }
                    }

                    override fun onLoadCleared(placeholder: Drawable?) {}
                })
        }
    }

    private fun playMovie() {
        // Start playback - PlaybackFragment will fetch stream URL if needed
        val intent = Intent(requireContext(), PlaybackActivity::class.java).apply {
            putExtra(PlaybackActivity.EXTRA_MOVIE, movie)
            // Stream URL will be fetched by PlaybackFragment
        }
        startActivity(intent)
    }

    private fun addToList() {
        val added = MyListManager.toggle(movie)
        val message = if (added) {
            "Added to My List"
        } else {
            "Removed from My List"
        }
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
    }
    
    private fun showEpisodes() {
        if (episodeServers.isEmpty()) {
            Toast.makeText(requireContext(), "No episodes available", Toast.LENGTH_SHORT).show()
            return
        }
        
        val intent = Intent(requireContext(), EpisodesActivity::class.java).apply {
            putExtra(EpisodesActivity.EXTRA_MOVIE, movie)
            putExtra(EpisodesActivity.EXTRA_EPISODES, ArrayList(episodeServers) as java.io.Serializable)
        }
        startActivity(intent)
    }

    private fun parseAnyToList(any: Any?): List<String>? {
        if (any == null) return null
        if (any is List<*>) {
            return any.filterIsInstance<String>()
        }
        if (any is String) {
            return any.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        }
        return null
    }
}

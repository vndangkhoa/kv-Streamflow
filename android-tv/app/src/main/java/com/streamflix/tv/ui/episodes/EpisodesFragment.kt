package com.streamflix.tv.ui.episodes

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.Spinner
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.streamflix.tv.R
import com.streamflix.tv.data.model.EpisodeItem
import com.streamflix.tv.data.model.EpisodeServer
import com.streamflix.tv.data.model.Movie
import com.streamflix.tv.ui.playback.PlaybackActivity
import java.io.Serializable

/**
 * Fragment for displaying seasons and episodes of a TV series
 * Shows season selector, episode grid with thumbnails
 */
class EpisodesFragment : Fragment() {

    companion object {
        private const val ARG_MOVIE = "arg_movie"
        private const val ARG_EPISODES = "arg_episodes"
        
        fun newInstance(movie: Movie, episodeServers: List<EpisodeServer>): EpisodesFragment {
            return EpisodesFragment().apply {
                arguments = Bundle().apply {
                    putSerializable(ARG_MOVIE, movie)
                    putSerializable(ARG_EPISODES, ArrayList(episodeServers) as Serializable)
                }
            }
        }
    }

    private lateinit var movie: Movie
    private var episodeServers = listOf<EpisodeServer>()
    private var currentServerIndex = 0
    
    // Views
    private lateinit var seasonSpinner: Spinner
    private lateinit var episodesRecycler: RecyclerView
    private lateinit var episodeCountText: TextView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_episodes, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        // Get arguments
        movie = arguments?.getSerializable(ARG_MOVIE) as? Movie ?: run {
            requireActivity().onBackPressed()
            return
        }
        
        @Suppress("UNCHECKED_CAST")
        episodeServers = (arguments?.getSerializable(ARG_EPISODES) as? ArrayList<EpisodeServer>) ?: emptyList()
        
        initViews(view)
        setupSeasonSelector()
        displayEpisodes()
    }
    
    private fun initViews(view: View) {
        seasonSpinner = view.findViewById(R.id.seasonSpinner)
        episodesRecycler = view.findViewById(R.id.episodesRecycler)
        episodeCountText = view.findViewById(R.id.episodeCountText)
        
        // Setup grid layout - 4 columns for TV
        episodesRecycler.layoutManager = GridLayoutManager(requireContext(), 4)
    }
    
    private fun setupSeasonSelector() {
        if (episodeServers.isEmpty()) return
        
        // Use server names as "seasons" - some movies have multiple servers
        val serverNames = episodeServers.mapIndexed { index, server ->
            server.server_name ?: getString(R.string.season_format, index + 1)
        }
        
        val adapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_item,
            serverNames
        ).apply {
            setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        }
        
        seasonSpinner.adapter = adapter
        seasonSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                currentServerIndex = position
                displayEpisodes()
            }
            
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
        
        // Hide spinner if only one server/season
        seasonSpinner.visibility = if (episodeServers.size > 1) View.VISIBLE else View.GONE
    }
    
    private fun displayEpisodes() {
        if (episodeServers.isEmpty()) return
        
        val episodes = episodeServers.getOrNull(currentServerIndex)?.server_data ?: emptyList()
        episodeCountText.text = "${episodes.size} ${getString(R.string.episodes)}"
        
        episodesRecycler.adapter = EpisodeAdapter(episodes) { episode, index ->
            // Play this episode
            val intent = Intent(requireContext(), PlaybackActivity::class.java).apply {
                putExtra(PlaybackActivity.EXTRA_MOVIE, movie)
                putExtra("episode_index", index)
                putExtra("episode_url", episode.link_m3u8 ?: episode.link_embed)
            }
            startActivity(intent)
        }
    }
}

/**
 * Adapter for episode grid items
 */
class EpisodeAdapter(
    private val episodes: List<EpisodeItem>,
    private val onEpisodeClick: (EpisodeItem, Int) -> Unit
) : RecyclerView.Adapter<EpisodeAdapter.EpisodeViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): EpisodeViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_episode, parent, false)
        return EpisodeViewHolder(view)
    }

    override fun onBindViewHolder(holder: EpisodeViewHolder, position: Int) {
        holder.bind(episodes[position], position)
    }

    override fun getItemCount() = episodes.size

    inner class EpisodeViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val episodeNumber: TextView = itemView.findViewById(R.id.episodeNumber)
        private val episodeName: TextView = itemView.findViewById(R.id.episodeName)
        private val episodeThumbnail: ImageView = itemView.findViewById(R.id.episodeThumbnail)

        fun bind(episode: EpisodeItem, index: Int) {
            val epNum = index + 1
            episodeNumber.text = epNum.toString()
            episodeName.text = episode.name ?: "Episode $epNum"
            
            // Focus handling for D-pad
            itemView.isFocusable = true
            itemView.isFocusableInTouchMode = true
            
            itemView.setOnFocusChangeListener { v, hasFocus ->
                val scale = if (hasFocus) 1.08f else 1.0f
                v.animate()
                    .scaleX(scale)
                    .scaleY(scale)
                    .setDuration(150)
                    .start()
            }
            
            itemView.setOnClickListener {
                onEpisodeClick(episode, index)
            }
        }
    }
}

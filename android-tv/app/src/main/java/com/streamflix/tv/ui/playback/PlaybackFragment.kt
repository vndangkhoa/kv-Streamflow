package com.streamflix.tv.ui.playback

import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.leanback.app.VideoSupportFragment
import androidx.leanback.app.VideoSupportFragmentGlueHost
import androidx.leanback.media.PlaybackTransportControlGlue
import androidx.lifecycle.lifecycleScope
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.ui.leanback.LeanbackPlayerAdapter
import com.streamflix.tv.R
import com.streamflix.tv.data.WatchHistoryManager
import com.streamflix.tv.data.api.ApiClient
import com.streamflix.tv.data.model.Movie
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Video playback fragment using ExoPlayer with HLS support
 * Uses Media3 LeanbackPlayerAdapter for native TV transport controls
 */
class PlaybackFragment : VideoSupportFragment() {

    companion object {
        private const val EXTRA_MOVIE = "extra_movie"
        private const val EXTRA_STREAM_URL = "extra_stream_url"
        private const val UPDATE_DELAY_MS = 16

        fun newInstance(movie: Movie, streamUrl: String?): PlaybackFragment {
            return PlaybackFragment().apply {
                arguments = Bundle().apply {
                    putSerializable(EXTRA_MOVIE, movie)
                    putString(EXTRA_STREAM_URL, streamUrl)
                }
            }
        }
    }

    private lateinit var movie: Movie
    private var streamUrl: String? = null
    private var player: ExoPlayer? = null
    private var transportControlGlue: PlaybackTransportControlGlue<LeanbackPlayerAdapter>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        movie = arguments?.getSerializable(EXTRA_MOVIE) as? Movie ?: run {
            requireActivity().finish()
            return
        }
        streamUrl = arguments?.getString(EXTRA_STREAM_URL)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        if (streamUrl != null) {
            initializePlayer(streamUrl!!)
        } else {
            // Fetch stream URL from API
            fetchStreamUrl()
        }
    }

    private fun fetchStreamUrl() {
        lifecycleScope.launch {
            try {
                val response = withContext(Dispatchers.IO) {
                    ApiClient.api.getStreamUrl(movie.slug)
                }
                
                if (isAdded) {
                    response.stream_url?.let { url ->
                        initializePlayer(url)
                    } ?: run {
                        showError("Stream not available")
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                if (isAdded) {
                    showError("Failed to load stream: ${e.message}")
                }
            }
        }
    }

    private fun initializePlayer(mediaUrl: String) {
        val context = context ?: return
        
        // Add to watch history
        WatchHistoryManager.addToHistory(movie)
        
        // Create ExoPlayer instance
        player = ExoPlayer.Builder(context).build()

        // Create Leanback player adapter
        val playerAdapter = LeanbackPlayerAdapter(context, player!!, UPDATE_DELAY_MS)

        // Create transport control glue
        transportControlGlue = PlaybackTransportControlGlue(requireActivity(), playerAdapter).apply {
            host = VideoSupportFragmentGlueHost(this@PlaybackFragment)
            title = movie.getDisplayTitle()
            subtitle = movie.getYearDisplay()
            isSeekEnabled = true
        }

        // Prepare media source
        prepareMediaSource(mediaUrl)
    }

    private fun prepareMediaSource(mediaUrl: String) {
        val player = this.player ?: return

        // Use the stream URL directly - it's already a valid HLS URL
        val finalUrl = mediaUrl

        android.util.Log.d("PlaybackFragment", "Playing stream: $finalUrl")

        // Create HLS media source with proper headers
        val dataSourceFactory = DefaultHttpDataSource.Factory()
            .setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .setConnectTimeoutMs(30000)
            .setReadTimeoutMs(30000)
            .setAllowCrossProtocolRedirects(true)

        val mediaSource = HlsMediaSource.Factory(dataSourceFactory)
            .createMediaSource(MediaItem.fromUri(Uri.parse(finalUrl)))

        // Add error listener
        player.addListener(object : Player.Listener {
            override fun onPlayerError(error: PlaybackException) {
                handlePlaybackError(error)
            }

            override fun onPlaybackStateChanged(state: Int) {
                if (state == Player.STATE_ENDED) {
                    requireActivity().finish()
                }
            }
        })

        // Set media source and start playback
        player.setMediaSource(mediaSource)
        player.prepare()
        player.play()
    }

    private fun handlePlaybackError(error: PlaybackException) {
        showError(getString(R.string.video_error))
        requireActivity().finish()
    }

    private fun showError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_LONG).show()
    }

    override fun onPause() {
        super.onPause()
        player?.pause()
    }

    override fun onResume() {
        super.onResume()
        player?.play()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        releasePlayer()
    }

    private fun releasePlayer() {
        player?.release()
        player = null
        transportControlGlue = null
    }
}

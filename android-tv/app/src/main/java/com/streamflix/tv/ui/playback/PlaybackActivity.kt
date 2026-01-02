package com.streamflix.tv.ui.playback

import android.os.Bundle
import android.view.WindowManager
import androidx.fragment.app.FragmentActivity
import com.streamflix.tv.R
import com.streamflix.tv.data.model.Movie

/**
 * Activity for video playback
 * Keeps screen on during playback to prevent sleep
 */
class PlaybackActivity : FragmentActivity() {

    companion object {
        const val EXTRA_MOVIE = "extra_movie"
        const val EXTRA_STREAM_URL = "extra_stream_url"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Keep screen on during video playback
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        
        setContentView(R.layout.activity_playback)

        if (savedInstanceState == null) {
            val movie = intent.getSerializableExtra(EXTRA_MOVIE) as? Movie
            val streamUrl = intent.getStringExtra(EXTRA_STREAM_URL)

            if (movie != null) {
                // streamUrl is optional - PlaybackFragment will fetch it if not provided
                supportFragmentManager.beginTransaction()
                    .replace(R.id.playback_fragment, PlaybackFragment.newInstance(movie, streamUrl))
                    .commit()
            } else {
                finish()
            }
        }
    }
}

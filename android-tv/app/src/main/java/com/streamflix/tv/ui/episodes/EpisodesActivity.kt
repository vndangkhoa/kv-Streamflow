package com.streamflix.tv.ui.episodes

import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import com.streamflix.tv.R
import com.streamflix.tv.data.model.EpisodeServer
import com.streamflix.tv.data.model.Movie

/**
 * Activity for displaying episodes of a TV series
 * Hosts EpisodesFragment
 */
class EpisodesActivity : FragmentActivity() {

    companion object {
        const val EXTRA_MOVIE = "extra_movie"
        const val EXTRA_EPISODES = "extra_episodes"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_episodes)

        if (savedInstanceState == null) {
            val movie = intent.getSerializableExtra(EXTRA_MOVIE) as? Movie
            @Suppress("UNCHECKED_CAST")
            val episodes = intent.getSerializableExtra(EXTRA_EPISODES) as? ArrayList<EpisodeServer>

            if (movie != null && episodes != null) {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.episodes_container, EpisodesFragment.newInstance(movie, episodes))
                    .commit()
            } else {
                finish()
            }
        }
    }
}

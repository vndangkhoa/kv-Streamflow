package com.streamflix.tv.ui.details

import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import com.streamflix.tv.R
import com.streamflix.tv.data.model.Movie

/**
 * Activity for displaying movie details
 */
class DetailsActivity : FragmentActivity() {

    companion object {
        const val EXTRA_MOVIE = "extra_movie"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_details)

        if (savedInstanceState == null) {
            val movie = intent.getSerializableExtra(EXTRA_MOVIE) as? Movie

            if (movie != null) {
                supportFragmentManager.beginTransaction()
                    .replace(R.id.details_fragment, DetailsFragment.newInstance(movie))
                    .commitNow()
            } else {
                finish()
            }
        }
    }
}

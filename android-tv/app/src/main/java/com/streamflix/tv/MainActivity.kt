package com.streamflix.tv

import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import com.streamflix.tv.data.MyListManager
import com.streamflix.tv.data.WatchHistoryManager
import com.streamflix.tv.ui.browse.MainFragment

/**
 * Main Activity for StreamFlix TV
 * Hosts the BrowseSupportFragment for the main browse interface
 */
class MainActivity : FragmentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize managers
        WatchHistoryManager.init(applicationContext)
        MyListManager.init(applicationContext)
        
        setContentView(R.layout.activity_main)

        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction()
                .replace(R.id.main_browse_fragment, com.streamflix.tv.ui.home.HomeFragment())
                .commit()
        }
    }
}

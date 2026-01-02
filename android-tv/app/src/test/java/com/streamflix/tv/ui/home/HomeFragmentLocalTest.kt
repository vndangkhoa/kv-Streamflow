package com.streamflix.tv.ui.home

import android.content.Intent
import android.widget.Button
import android.widget.TextView
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.streamflix.tv.MainActivity
import com.streamflix.tv.R
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import org.robolectric.shadows.ShadowLooper

@RunWith(AndroidJUnit4::class)
@Config(sdk = [33]) // Use a specific SDK version for stability
class HomeFragmentLocalTest {

    @Test
    fun testHomeFragmentStructure() {
        // Launch Activity
        val controller = Robolectric.buildActivity(MainActivity::class.java).setup()
        val activity = controller.get()

        // Wait for fragments to load
        ShadowLooper.runUiThreadTasksIncludingDelayedTasks()
        
        // Find HomeFragment
        val homeFragment = activity.supportFragmentManager.findFragmentById(R.id.main_browse_fragment) as? HomeFragment
        assertNotNull("HomeFragment should be loaded in MainActivity", homeFragment)
        
        val view = homeFragment?.view
        assertNotNull("HomeFragment view should not be null", view)

        // 1. Verify Sidebar
        val sidebarContainer = view?.findViewById<android.view.View>(R.id.sidebarContainer)
        assertNotNull("Sidebar container should be present", sidebarContainer)
        assertNotNull(view.findViewById(R.id.sidebarSearch))
        assertNotNull(view.findViewById(R.id.sidebarHome))
        assertNotNull(view.findViewById(R.id.sidebarSeries))
        assertNotNull(view.findViewById(R.id.sidebarMovies))
        assertNotNull(view.findViewById(R.id.sidebarUpdate))
        assertEquals("Sidebar should be visible", android.view.View.VISIBLE, sidebarContainer?.visibility)

        // 2. Verify Hero Section
        val heroTitle = view?.findViewById<TextView>(R.id.heroTitle)
        assertNotNull("Hero Title should be present", heroTitle)
        
        val heroPlayButton = view?.findViewById<Button>(R.id.heroPlayButton)
        assertNotNull("Hero Play Button should be present", heroPlayButton)
        assertEquals("Play Button text should match", "Play", heroPlayButton?.text)

        // 3. Verify Category Recycler
        val categoryRecycler = view?.findViewById<android.view.View>(R.id.categoryRowsRecycler)
        assertNotNull("Category Rows Recycler should be present", categoryRecycler)
        
        // Clean up
        controller.close()
    }
}

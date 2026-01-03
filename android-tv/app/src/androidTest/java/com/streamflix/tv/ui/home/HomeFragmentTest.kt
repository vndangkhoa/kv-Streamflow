package com.streamflix.tv.ui.home

import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.action.ViewActions.click
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.*
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.streamflix.tv.MainActivity
import com.streamflix.tv.R
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class HomeFragmentTest {

    @get:Rule
    val activityRule = ActivityScenarioRule(MainActivity::class.java)

    @Test
    fun testHomeFragmentNavigation() {
        // 1. Verify Home Fragment is loaded and Sidebar is visible
        onView(withId(R.id.sidebarContainer)).check(matches(isDisplayed()))
        onView(withId(R.id.sidebarSearch)).check(matches(isDisplayed()))

        // 2. Verify Hero Section is displayed
        onView(withId(R.id.heroTitle)).check(matches(isDisplayed()))
        onView(withId(R.id.heroPlayButton)).check(matches(isDisplayed()))

        // 3. Verify Category Rows are present
        onView(withId(R.id.categoryRowsRecycler)).check(matches(isDisplayed()))
    }
}

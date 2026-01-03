package com.streamflix.tv.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.streamflix.tv.data.model.Movie

/**
 * Manages watch history using SharedPreferences
 */
object WatchHistoryManager {
    private const val PREFS_NAME = "streamflix_history"
    private const val KEY_WATCH_HISTORY = "watch_history"
    private const val MAX_HISTORY_SIZE = 50
    
    private lateinit var prefs: SharedPreferences
    private val gson = Gson()
    
    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    /**
     * Add a movie to watch history
     */
    fun addToHistory(movie: Movie) {
        val history = getWatchHistory().toMutableList()
        
        // Remove if already exists (will be re-added at top)
        history.removeAll { it.slug == movie.slug }
        
        // Add to beginning
        history.add(0, movie)
        
        // Limit size
        while (history.size > MAX_HISTORY_SIZE) {
            history.removeAt(history.size - 1)
        }
        
        saveHistory(history)
    }
    
    /**
     * Get watch history list
     */
    fun getWatchHistory(): List<Movie> {
        val json = prefs.getString(KEY_WATCH_HISTORY, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<Movie>>() {}.type
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Check if there's any watch history
     */
    fun hasHistory(): Boolean = getWatchHistory().isNotEmpty()
    
    /**
     * Clear all watch history
     */
    fun clearHistory() {
        prefs.edit().remove(KEY_WATCH_HISTORY).apply()
    }
    
    private fun saveHistory(history: List<Movie>) {
        val json = gson.toJson(history)
        prefs.edit().putString(KEY_WATCH_HISTORY, json).apply()
    }
}

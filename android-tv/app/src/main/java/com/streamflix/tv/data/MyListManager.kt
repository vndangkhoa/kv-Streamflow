package com.streamflix.tv.data

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.streamflix.tv.data.model.Movie

/**
 * Manages user's "My List" (favorites) using SharedPreferences
 */
object MyListManager {
    private const val PREFS_NAME = "streamflix_mylist"
    private const val KEY_MY_LIST = "my_list"
    
    private lateinit var prefs: SharedPreferences
    private val gson = Gson()
    
    fun init(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    /**
     * Add a movie to My List
     */
    fun addToList(movie: Movie) {
        val list = getMyList().toMutableList()
        
        // Don't add duplicates
        if (list.none { it.slug == movie.slug }) {
            list.add(0, movie)
            saveList(list)
        }
    }
    
    /**
     * Remove a movie from My List
     */
    fun removeFromList(movie: Movie) {
        val list = getMyList().toMutableList()
        list.removeAll { it.slug == movie.slug }
        saveList(list)
    }
    
    /**
     * Check if a movie is in My List
     */
    fun isInList(movie: Movie): Boolean {
        return getMyList().any { it.slug == movie.slug }
    }
    
    /**
     * Toggle movie in/out of My List
     */
    fun toggle(movie: Movie): Boolean {
        return if (isInList(movie)) {
            removeFromList(movie)
            false
        } else {
            addToList(movie)
            true
        }
    }
    
    /**
     * Get My List
     */
    fun getMyList(): List<Movie> {
        val json = prefs.getString(KEY_MY_LIST, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<Movie>>() {}.type
            gson.fromJson(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * Check if My List has any items
     */
    fun hasItems(): Boolean = getMyList().isNotEmpty()
    
    private fun saveList(list: List<Movie>) {
        val json = gson.toJson(list)
        prefs.edit().putString(KEY_MY_LIST, json).apply()
    }
}

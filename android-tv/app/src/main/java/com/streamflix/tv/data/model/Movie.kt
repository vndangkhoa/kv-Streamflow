package com.streamflix.tv.data.model

import java.io.Serializable

/**
 * Movie data class matching the backend API response
 * Used for both catalog responses and list items
 */
data class Movie(
    val id: String? = null,
    val slug: String,
    val title: String? = null,           // Frontend uses 'title'
    val name: String? = null,            // Backend uses 'name'
    val original_title: String? = null,
    val origin_name: String? = null,
    val thumbnail: String? = null,
    val poster_url: String? = null,
    val year: Int? = null,
    val quality: String? = null,
    val lang: String? = null,
    val duration: String? = null,
    val time: String? = null,
    val episode_current: String? = null,
    val episode_total: String? = null,
    val type: String? = null,
    val status: String? = null,
    val content: String? = null,
    val rating: Double? = null,
    val tmdb_rating: Double? = null,
    val imdb_rating: Double? = null,
    val vote_count: Int? = null,
    val genres: List<String>? = null,
    val country: List<String>? = null,
    val director: List<String>? = null,
    val actor: List<String>? = null,
    val modified: String? = null,
    val category: String? = null         // Type: single/series
) : Serializable {
    
    /**
     * Get display title (handles both 'title' and 'name' fields)
     */
    fun getDisplayTitle(): String {
        return title ?: name ?: slug
    }
    
    /**
     * Get the best available image URL for the poster
     */
    fun getPosterImage(): String {
        return poster_url ?: thumbnail ?: ""
    }
    
    /**
     * Get the thumbnail image
     */
    fun getThumbImage(): String {
        return thumbnail ?: poster_url ?: ""
    }
    
    /**
     * Get formatted year display
     */
    fun getYearDisplay(): String {
        return year?.toString() ?: ""
    }
    
    /**
     * Get formatted duration
     */
    fun getDurationDisplay(): String {
        val dur = duration ?: time
        if (dur.isNullOrEmpty()) return ""
        return if (dur.contains("phút") || dur.contains("min")) {
            dur
        } else {
            "$dur phút"
        }
    }
    
    /**
     * Check if this is a TV series
     */
    fun isSeries(): Boolean {
        return type?.lowercase()?.contains("series") == true ||
               type?.lowercase()?.contains("hoathinh") == true ||
               category?.lowercase() == "series" ||
               (episode_total?.toIntOrNull() ?: 0) > 1
    }
    
    /**
     * Get director names as a single string
     */
    fun getDirectorNames(): String {
        return director?.joinToString(", ") ?: ""
    }
    
    /**
     * Get actor names as a single string
     */
    fun getActorNames(): String {
        return actor?.take(5)?.joinToString(", ") ?: ""
    }
    
    /**
     * Get genre names as a single string
     */
    fun getGenreNames(): String {
        return genres?.joinToString(", ") ?: ""
    }
    
    /**
     * Get country names as a single string
     */
    fun getCountryNames(): String {
        return country?.joinToString(", ") ?: ""
    }
    
    /**
     * Get rating display
     */
    fun getRatingDisplay(): String {
        val r = rating ?: tmdb_rating ?: imdb_rating
        return if (r != null && r > 0) {
            String.format("%.1f", r)
        } else ""
    }
    
    /**
     * Get quality badge text
     */
    fun getQualityBadge(): String {
        return quality ?: "HD"
    }
}

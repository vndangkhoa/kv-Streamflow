package com.streamflix.tv.data.api

import com.streamflix.tv.data.model.*
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * Retrofit API interface for StreamFlix backend
 * Matches actual /api/rophim/... endpoints
 */
interface StreamflixApi {

    /**
     * Get curated homepage sections (TOP RATED, NEW RELEASES, genres)
     */
    @GET("api/rophim/home/curated")
    suspend fun getHomeCurated(): CuratedHomeResponse

    /**
     * Get movie catalog with category filtering and sorting
     */
    @GET("api/rophim/catalog")
    suspend fun getCatalog(
        @Query("category") category: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 24,
        @Query("sort") sort: String = "modified"
    ): CatalogResponse

    /**
     * Get movie details by slug
     */
    @GET("api/rophim/movie/{slug}")
    suspend fun getMovieDetails(
        @Path("slug") slug: String
    ): MovieDetailResponse

    /**
     * Search movies by keyword (searches titles and actors)
     */
    @GET("api/rophim/search")
    suspend fun searchMovies(
        @Query("q") keyword: String,
        @Query("limit") limit: Int = 20
    ): SearchResponse

    /**
     * Get stream URL for a movie
     */
    @GET("api/rophim/stream/{slug}")
    suspend fun getStreamUrl(
        @Path("slug") slug: String,
        @Query("episode") episode: Int = 1
    ): StreamResponse

    /**
     * Health check
     */
    @GET("api/health")
    suspend fun healthCheck(): Map<String, Any>

    companion object {
        // Category slugs for quick access
        const val CATEGORY_MOVIES = "movies"
        const val CATEGORY_SERIES = "series"
        const val CATEGORY_ANIMATION = "animation"
        const val CATEGORY_PHIM_LE = "phim-le"
        const val CATEGORY_PHIM_BO = "phim-bo"
        const val CATEGORY_HOAT_HINH = "hoat-hinh"
        const val CATEGORY_PHIM_MOI = "phim-moi"
        
        // Sort options
        const val SORT_MODIFIED = "modified"
        const val SORT_YEAR = "year"
        const val SORT_RATING = "rating"
        const val SORT_VIEWS = "views"
    }
}

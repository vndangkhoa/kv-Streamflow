package com.streamflix.tv.data.model

/**
 * API Response wrappers matching the actual backend structure
 * Based on /api/rophim/... endpoints
 */

// Response for /api/rophim/catalog
data class CatalogResponse(
    val movies: List<Movie>? = null,
    val page: Int? = null,
    val category: String? = null,
    val sort: String? = null,
    val total: Int? = null
)

// Response for /api/rophim/home/curated
data class CuratedHomeResponse(
    val sections: List<HomeSection>? = null,
    val total: Int? = null
)

data class HomeSection(
    val title: String,
    val key: String,
    val movies: List<Movie>? = null
)

// Response for /api/rophim/search
data class SearchResponse(
    val movies: List<Movie>? = null,
    val total: Int? = null
)

// Response for /api/rophim/movie/{slug}
data class MovieDetailResponse(
    // Nested structure (some APIs)
    val movie: MovieDetail? = null,
    
    // Flat structure (this backend)
    val id: String? = null,
    val slug: String? = null,
    val name: String? = null,
    val title: String? = null,
    val origin_name: String? = null,
    val original_title: String? = null,
    val thumb_url: String? = null,
    val poster_url: String? = null,
    val year: Int? = null,
    val quality: String? = null,
    val content: String? = null,
    val description: String? = null,
    val director: Any? = null,
    val actor: Any? = null,
    val cast: Any? = null,
    val episodes: Any? = null // Can be list of servers or list of episodes
)

data class MovieDetail(
    val id: String? = null,
    val slug: String? = null,
    val name: String? = null,
    val title: String? = null,
    val origin_name: String? = null,
    val thumb_url: String? = null,
    val poster_url: String? = null,
    val year: Int? = null,
    val quality: String? = null,
    val lang: String? = null,
    val time: String? = null,
    val content: String? = null,
    val description: String? = null,
    val director: Any? = null,
    val actor: Any? = null,
    val cast: Any? = null
)

data class EpisodeServer(
    val server_name: String? = null,
    val server_data: List<EpisodeItem>? = null
) : java.io.Serializable

data class EpisodeItem(
    val name: String? = null,
    val slug: String? = null,
    val filename: String? = null,
    val link_embed: String? = null,
    val link_m3u8: String? = null
) : java.io.Serializable

data class CategoryItem(
    val id: String? = null,
    val name: String? = null,
    val slug: String? = null
)

data class CountryItem(
    val id: String? = null,
    val name: String? = null,
    val slug: String? = null
)

// Response for /api/rophim/stream/{slug}
data class StreamResponse(
    val stream_url: String? = null
)

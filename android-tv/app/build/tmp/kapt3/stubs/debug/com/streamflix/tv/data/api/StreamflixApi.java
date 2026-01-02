package com.streamflix.tv.data.api;

/**
 * Retrofit API interface for StreamFlix backend
 * Matches actual /api/rophim/... endpoints
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000F\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010\b\n\u0002\b\u0004\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010$\n\u0002\b\u0002\bf\u0018\u0000 \u001b2\u00020\u0001:\u0001\u001bJ\u000e\u0010\u0002\u001a\u00020\u0003H\u00a7@\u00a2\u0006\u0002\u0010\u0004J8\u0010\u0005\u001a\u00020\u00062\n\b\u0003\u0010\u0007\u001a\u0004\u0018\u00010\b2\b\b\u0003\u0010\t\u001a\u00020\n2\b\b\u0003\u0010\u000b\u001a\u00020\n2\b\b\u0003\u0010\f\u001a\u00020\bH\u00a7@\u00a2\u0006\u0002\u0010\rJ\u0018\u0010\u000e\u001a\u00020\u000f2\b\b\u0001\u0010\u0010\u001a\u00020\bH\u00a7@\u00a2\u0006\u0002\u0010\u0011J\"\u0010\u0012\u001a\u00020\u00132\b\b\u0001\u0010\u0014\u001a\u00020\b2\b\b\u0003\u0010\u000b\u001a\u00020\nH\u00a7@\u00a2\u0006\u0002\u0010\u0015J\"\u0010\u0016\u001a\u00020\u00172\b\b\u0001\u0010\u0010\u001a\u00020\b2\b\b\u0003\u0010\u0018\u001a\u00020\nH\u00a7@\u00a2\u0006\u0002\u0010\u0015J\u001a\u0010\u0019\u001a\u000e\u0012\u0004\u0012\u00020\b\u0012\u0004\u0012\u00020\u00010\u001aH\u00a7@\u00a2\u0006\u0002\u0010\u0004\u00a8\u0006\u001c\u00c0\u0006\u0003"}, d2 = {"Lcom/streamflix/tv/data/api/StreamflixApi;", "", "getHomeCurated", "Lcom/streamflix/tv/data/model/CuratedHomeResponse;", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getCatalog", "Lcom/streamflix/tv/data/model/CatalogResponse;", "category", "", "page", "", "limit", "sort", "(Ljava/lang/String;IILjava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getMovieDetails", "Lcom/streamflix/tv/data/model/MovieDetailResponse;", "slug", "(Ljava/lang/String;Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "searchMovies", "Lcom/streamflix/tv/data/model/SearchResponse;", "keyword", "(Ljava/lang/String;ILkotlin/coroutines/Continuation;)Ljava/lang/Object;", "getStreamUrl", "Lcom/streamflix/tv/data/model/StreamResponse;", "episode", "healthCheck", "", "Companion", "app_debug"})
public abstract interface StreamflixApi {
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String CATEGORY_MOVIES = "movies";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String CATEGORY_SERIES = "series";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String CATEGORY_ANIMATION = "animation";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String CATEGORY_PHIM_LE = "phim-le";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String CATEGORY_PHIM_BO = "phim-bo";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String CATEGORY_HOAT_HINH = "hoat-hinh";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String CATEGORY_PHIM_MOI = "phim-moi";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String SORT_MODIFIED = "modified";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String SORT_YEAR = "year";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String SORT_RATING = "rating";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String SORT_VIEWS = "views";
    @org.jetbrains.annotations.NotNull()
    public static final com.streamflix.tv.data.api.StreamflixApi.Companion Companion = null;
    
    /**
     * Get curated homepage sections (TOP RATED, NEW RELEASES, genres)
     */
    @retrofit2.http.GET(value = "api/rophim/home/curated")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getHomeCurated(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.streamflix.tv.data.model.CuratedHomeResponse> $completion);
    
    /**
     * Get movie catalog with category filtering and sorting
     */
    @retrofit2.http.GET(value = "api/rophim/catalog")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getCatalog(@retrofit2.http.Query(value = "category")
    @org.jetbrains.annotations.Nullable()
    java.lang.String category, @retrofit2.http.Query(value = "page")
    int page, @retrofit2.http.Query(value = "limit")
    int limit, @retrofit2.http.Query(value = "sort")
    @org.jetbrains.annotations.NotNull()
    java.lang.String sort, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.streamflix.tv.data.model.CatalogResponse> $completion);
    
    /**
     * Get movie details by slug
     */
    @retrofit2.http.GET(value = "api/rophim/movie/{slug}")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getMovieDetails(@retrofit2.http.Path(value = "slug")
    @org.jetbrains.annotations.NotNull()
    java.lang.String slug, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.streamflix.tv.data.model.MovieDetailResponse> $completion);
    
    /**
     * Search movies by keyword (searches titles and actors)
     */
    @retrofit2.http.GET(value = "api/rophim/search")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object searchMovies(@retrofit2.http.Query(value = "q")
    @org.jetbrains.annotations.NotNull()
    java.lang.String keyword, @retrofit2.http.Query(value = "limit")
    int limit, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.streamflix.tv.data.model.SearchResponse> $completion);
    
    /**
     * Get stream URL for a movie
     */
    @retrofit2.http.GET(value = "api/rophim/stream/{slug}")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object getStreamUrl(@retrofit2.http.Path(value = "slug")
    @org.jetbrains.annotations.NotNull()
    java.lang.String slug, @retrofit2.http.Query(value = "episode")
    int episode, @org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super com.streamflix.tv.data.model.StreamResponse> $completion);
    
    /**
     * Health check
     */
    @retrofit2.http.GET(value = "api/health")
    @org.jetbrains.annotations.Nullable()
    public abstract java.lang.Object healthCheck(@org.jetbrains.annotations.NotNull()
    kotlin.coroutines.Continuation<? super java.util.Map<java.lang.String, ? extends java.lang.Object>> $completion);
    
    @kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000\u0014\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u000b\b\u0086\u0003\u0018\u00002\u00020\u0001B\t\b\u0002\u00a2\u0006\u0004\b\u0002\u0010\u0003R\u000e\u0010\u0004\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\t\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\n\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u000b\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\f\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\r\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u000e\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u000f\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0010"}, d2 = {"Lcom/streamflix/tv/data/api/StreamflixApi$Companion;", "", "<init>", "()V", "CATEGORY_MOVIES", "", "CATEGORY_SERIES", "CATEGORY_ANIMATION", "CATEGORY_PHIM_LE", "CATEGORY_PHIM_BO", "CATEGORY_HOAT_HINH", "CATEGORY_PHIM_MOI", "SORT_MODIFIED", "SORT_YEAR", "SORT_RATING", "SORT_VIEWS", "app_debug"})
    public static final class Companion {
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String CATEGORY_MOVIES = "movies";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String CATEGORY_SERIES = "series";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String CATEGORY_ANIMATION = "animation";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String CATEGORY_PHIM_LE = "phim-le";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String CATEGORY_PHIM_BO = "phim-bo";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String CATEGORY_HOAT_HINH = "hoat-hinh";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String CATEGORY_PHIM_MOI = "phim-moi";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String SORT_MODIFIED = "modified";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String SORT_YEAR = "year";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String SORT_RATING = "rating";
        @org.jetbrains.annotations.NotNull()
        public static final java.lang.String SORT_VIEWS = "views";
        
        private Companion() {
            super();
        }
    }
    
    /**
     * Retrofit API interface for StreamFlix backend
     * Matches actual /api/rophim/... endpoints
     */
    @kotlin.Metadata(mv = {2, 3, 0}, k = 3, xi = 48)
    public static final class DefaultImpls {
    }
}
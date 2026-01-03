package com.streamflix.tv.data.model;

/**
 * Movie data class matching the backend API response
 * Used for both catalog responses and list items
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000:\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0002\b\b\n\u0002\u0010\b\n\u0002\b\n\n\u0002\u0010\u0006\n\u0002\b\u0004\n\u0002\u0010 \n\u0002\b/\n\u0002\u0010\u000b\n\u0002\b&\n\u0002\u0010\u0000\n\u0002\b\u0003\b\u0086\b\u0018\u00002\u00020\u0001B\u00eb\u0002\u0012\n\b\u0002\u0010\u0002\u001a\u0004\u0018\u00010\u0003\u0012\u0006\u0010\u0004\u001a\u00020\u0003\u0012\n\b\u0002\u0010\u0005\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0006\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0007\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\b\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\t\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\n\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u000b\u001a\u0004\u0018\u00010\f\u0012\n\b\u0002\u0010\r\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u000e\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u000f\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0010\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0011\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0012\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0013\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0014\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0015\u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010\u0016\u001a\u0004\u0018\u00010\u0017\u0012\n\b\u0002\u0010\u0018\u001a\u0004\u0018\u00010\u0017\u0012\n\b\u0002\u0010\u0019\u001a\u0004\u0018\u00010\u0017\u0012\n\b\u0002\u0010\u001a\u001a\u0004\u0018\u00010\f\u0012\u0010\b\u0002\u0010\u001b\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c\u0012\u0010\b\u0002\u0010\u001d\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c\u0012\u0010\b\u0002\u0010\u001e\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c\u0012\u0010\b\u0002\u0010\u001f\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c\u0012\n\b\u0002\u0010 \u001a\u0004\u0018\u00010\u0003\u0012\n\b\u0002\u0010!\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\u0004\b\"\u0010#J\u0006\u0010F\u001a\u00020\u0003J\u0006\u0010G\u001a\u00020\u0003J\u0006\u0010H\u001a\u00020\u0003J\u0006\u0010I\u001a\u00020\u0003J\u0006\u0010J\u001a\u00020\u0003J\u0006\u0010K\u001a\u00020LJ\u0006\u0010M\u001a\u00020\u0003J\u0006\u0010N\u001a\u00020\u0003J\u0006\u0010O\u001a\u00020\u0003J\u0006\u0010P\u001a\u00020\u0003J\u0006\u0010Q\u001a\u00020\u0003J\u0006\u0010R\u001a\u00020\u0003J\u000b\u0010S\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\t\u0010T\u001a\u00020\u0003H\u00c6\u0003J\u000b\u0010U\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010V\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010W\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010X\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010Y\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010Z\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u0010\u0010[\u001a\u0004\u0018\u00010\fH\u00c6\u0003\u00a2\u0006\u0002\u0010.J\u000b\u0010\\\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010]\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010^\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010_\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010`\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010a\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010b\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010c\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010d\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u0010\u0010e\u001a\u0004\u0018\u00010\u0017H\u00c6\u0003\u00a2\u0006\u0002\u0010:J\u0010\u0010f\u001a\u0004\u0018\u00010\u0017H\u00c6\u0003\u00a2\u0006\u0002\u0010:J\u0010\u0010g\u001a\u0004\u0018\u00010\u0017H\u00c6\u0003\u00a2\u0006\u0002\u0010:J\u0010\u0010h\u001a\u0004\u0018\u00010\fH\u00c6\u0003\u00a2\u0006\u0002\u0010.J\u0011\u0010i\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001cH\u00c6\u0003J\u0011\u0010j\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001cH\u00c6\u0003J\u0011\u0010k\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001cH\u00c6\u0003J\u0011\u0010l\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001cH\u00c6\u0003J\u000b\u0010m\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u000b\u0010n\u001a\u0004\u0018\u00010\u0003H\u00c6\u0003J\u00f4\u0002\u0010o\u001a\u00020\u00002\n\b\u0002\u0010\u0002\u001a\u0004\u0018\u00010\u00032\b\b\u0002\u0010\u0004\u001a\u00020\u00032\n\b\u0002\u0010\u0005\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0006\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0007\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\b\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\t\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\n\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u000b\u001a\u0004\u0018\u00010\f2\n\b\u0002\u0010\r\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u000e\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u000f\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0010\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0011\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0012\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0013\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0014\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0015\u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010\u0016\u001a\u0004\u0018\u00010\u00172\n\b\u0002\u0010\u0018\u001a\u0004\u0018\u00010\u00172\n\b\u0002\u0010\u0019\u001a\u0004\u0018\u00010\u00172\n\b\u0002\u0010\u001a\u001a\u0004\u0018\u00010\f2\u0010\b\u0002\u0010\u001b\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c2\u0010\b\u0002\u0010\u001d\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c2\u0010\b\u0002\u0010\u001e\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c2\u0010\b\u0002\u0010\u001f\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c2\n\b\u0002\u0010 \u001a\u0004\u0018\u00010\u00032\n\b\u0002\u0010!\u001a\u0004\u0018\u00010\u0003H\u00c6\u0001\u00a2\u0006\u0002\u0010pJ\u0014\u0010q\u001a\u00020L2\b\u0010r\u001a\u0004\u0018\u00010sH\u00d6\u0083\u0004J\n\u0010t\u001a\u00020\fH\u00d6\u0081\u0004J\n\u0010u\u001a\u00020\u0003H\u00d6\u0081\u0004R\u0013\u0010\u0002\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b$\u0010%R\u0011\u0010\u0004\u001a\u00020\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b&\u0010%R\u0013\u0010\u0005\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b\'\u0010%R\u0013\u0010\u0006\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b(\u0010%R\u0013\u0010\u0007\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b)\u0010%R\u0013\u0010\b\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b*\u0010%R\u0013\u0010\t\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b+\u0010%R\u0013\u0010\n\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b,\u0010%R\u0015\u0010\u000b\u001a\u0004\u0018\u00010\f\u00a2\u0006\n\n\u0002\u0010/\u001a\u0004\b-\u0010.R\u0013\u0010\r\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b0\u0010%R\u0013\u0010\u000e\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b1\u0010%R\u0013\u0010\u000f\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b2\u0010%R\u0013\u0010\u0010\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b3\u0010%R\u0013\u0010\u0011\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b4\u0010%R\u0013\u0010\u0012\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b5\u0010%R\u0013\u0010\u0013\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b6\u0010%R\u0013\u0010\u0014\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b7\u0010%R\u0013\u0010\u0015\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\b8\u0010%R\u0015\u0010\u0016\u001a\u0004\u0018\u00010\u0017\u00a2\u0006\n\n\u0002\u0010;\u001a\u0004\b9\u0010:R\u0015\u0010\u0018\u001a\u0004\u0018\u00010\u0017\u00a2\u0006\n\n\u0002\u0010;\u001a\u0004\b<\u0010:R\u0015\u0010\u0019\u001a\u0004\u0018\u00010\u0017\u00a2\u0006\n\n\u0002\u0010;\u001a\u0004\b=\u0010:R\u0015\u0010\u001a\u001a\u0004\u0018\u00010\f\u00a2\u0006\n\n\u0002\u0010/\u001a\u0004\b>\u0010.R\u0019\u0010\u001b\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c\u00a2\u0006\b\n\u0000\u001a\u0004\b?\u0010@R\u0019\u0010\u001d\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c\u00a2\u0006\b\n\u0000\u001a\u0004\bA\u0010@R\u0019\u0010\u001e\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c\u00a2\u0006\b\n\u0000\u001a\u0004\bB\u0010@R\u0019\u0010\u001f\u001a\n\u0012\u0004\u0012\u00020\u0003\u0018\u00010\u001c\u00a2\u0006\b\n\u0000\u001a\u0004\bC\u0010@R\u0013\u0010 \u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\bD\u0010%R\u0013\u0010!\u001a\u0004\u0018\u00010\u0003\u00a2\u0006\b\n\u0000\u001a\u0004\bE\u0010%\u00a8\u0006v"}, d2 = {"Lcom/streamflix/tv/data/model/Movie;", "Ljava/io/Serializable;", "id", "", "slug", "title", "name", "original_title", "origin_name", "thumbnail", "poster_url", "year", "", "quality", "lang", "duration", "time", "episode_current", "episode_total", "type", "status", "content", "rating", "", "tmdb_rating", "imdb_rating", "vote_count", "genres", "", "country", "director", "actor", "modified", "category", "<init>", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/Integer;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/Double;Ljava/lang/Double;Ljava/lang/Double;Ljava/lang/Integer;Ljava/util/List;Ljava/util/List;Ljava/util/List;Ljava/util/List;Ljava/lang/String;Ljava/lang/String;)V", "getId", "()Ljava/lang/String;", "getSlug", "getTitle", "getName", "getOriginal_title", "getOrigin_name", "getThumbnail", "getPoster_url", "getYear", "()Ljava/lang/Integer;", "Ljava/lang/Integer;", "getQuality", "getLang", "getDuration", "getTime", "getEpisode_current", "getEpisode_total", "getType", "getStatus", "getContent", "getRating", "()Ljava/lang/Double;", "Ljava/lang/Double;", "getTmdb_rating", "getImdb_rating", "getVote_count", "getGenres", "()Ljava/util/List;", "getCountry", "getDirector", "getActor", "getModified", "getCategory", "getDisplayTitle", "getPosterImage", "getThumbImage", "getYearDisplay", "getDurationDisplay", "isSeries", "", "getDirectorNames", "getActorNames", "getGenreNames", "getCountryNames", "getRatingDisplay", "getQualityBadge", "component1", "component2", "component3", "component4", "component5", "component6", "component7", "component8", "component9", "component10", "component11", "component12", "component13", "component14", "component15", "component16", "component17", "component18", "component19", "component20", "component21", "component22", "component23", "component24", "component25", "component26", "component27", "component28", "copy", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/Integer;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/Double;Ljava/lang/Double;Ljava/lang/Double;Ljava/lang/Integer;Ljava/util/List;Ljava/util/List;Ljava/util/List;Ljava/util/List;Ljava/lang/String;Ljava/lang/String;)Lcom/streamflix/tv/data/model/Movie;", "equals", "other", "", "hashCode", "toString", "app_debug"})
public final class Movie implements java.io.Serializable {
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String id = null;
    @org.jetbrains.annotations.NotNull()
    private final java.lang.String slug = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String title = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String name = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String original_title = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String origin_name = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String thumbnail = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String poster_url = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.Integer year = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String quality = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String lang = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String duration = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String time = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String episode_current = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String episode_total = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String type = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String status = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String content = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.Double rating = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.Double tmdb_rating = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.Double imdb_rating = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.Integer vote_count = null;
    @org.jetbrains.annotations.Nullable()
    private final java.util.List<java.lang.String> genres = null;
    @org.jetbrains.annotations.Nullable()
    private final java.util.List<java.lang.String> country = null;
    @org.jetbrains.annotations.Nullable()
    private final java.util.List<java.lang.String> director = null;
    @org.jetbrains.annotations.Nullable()
    private final java.util.List<java.lang.String> actor = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String modified = null;
    @org.jetbrains.annotations.Nullable()
    private final java.lang.String category = null;
    
    public Movie(@org.jetbrains.annotations.Nullable()
    java.lang.String id, @org.jetbrains.annotations.NotNull()
    java.lang.String slug, @org.jetbrains.annotations.Nullable()
    java.lang.String title, @org.jetbrains.annotations.Nullable()
    java.lang.String name, @org.jetbrains.annotations.Nullable()
    java.lang.String original_title, @org.jetbrains.annotations.Nullable()
    java.lang.String origin_name, @org.jetbrains.annotations.Nullable()
    java.lang.String thumbnail, @org.jetbrains.annotations.Nullable()
    java.lang.String poster_url, @org.jetbrains.annotations.Nullable()
    java.lang.Integer year, @org.jetbrains.annotations.Nullable()
    java.lang.String quality, @org.jetbrains.annotations.Nullable()
    java.lang.String lang, @org.jetbrains.annotations.Nullable()
    java.lang.String duration, @org.jetbrains.annotations.Nullable()
    java.lang.String time, @org.jetbrains.annotations.Nullable()
    java.lang.String episode_current, @org.jetbrains.annotations.Nullable()
    java.lang.String episode_total, @org.jetbrains.annotations.Nullable()
    java.lang.String type, @org.jetbrains.annotations.Nullable()
    java.lang.String status, @org.jetbrains.annotations.Nullable()
    java.lang.String content, @org.jetbrains.annotations.Nullable()
    java.lang.Double rating, @org.jetbrains.annotations.Nullable()
    java.lang.Double tmdb_rating, @org.jetbrains.annotations.Nullable()
    java.lang.Double imdb_rating, @org.jetbrains.annotations.Nullable()
    java.lang.Integer vote_count, @org.jetbrains.annotations.Nullable()
    java.util.List<java.lang.String> genres, @org.jetbrains.annotations.Nullable()
    java.util.List<java.lang.String> country, @org.jetbrains.annotations.Nullable()
    java.util.List<java.lang.String> director, @org.jetbrains.annotations.Nullable()
    java.util.List<java.lang.String> actor, @org.jetbrains.annotations.Nullable()
    java.lang.String modified, @org.jetbrains.annotations.Nullable()
    java.lang.String category) {
        super();
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getId() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getSlug() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getTitle() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getName() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getOriginal_title() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getOrigin_name() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getThumbnail() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getPoster_url() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Integer getYear() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getQuality() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getLang() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getDuration() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getTime() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getEpisode_current() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getEpisode_total() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getType() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getStatus() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getContent() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double getRating() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double getTmdb_rating() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double getImdb_rating() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Integer getVote_count() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.util.List<java.lang.String> getGenres() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.util.List<java.lang.String> getCountry() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.util.List<java.lang.String> getDirector() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.util.List<java.lang.String> getActor() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getModified() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String getCategory() {
        return null;
    }
    
    /**
     * Get display title (handles both 'title' and 'name' fields)
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getDisplayTitle() {
        return null;
    }
    
    /**
     * Get the best available image URL for the poster
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getPosterImage() {
        return null;
    }
    
    /**
     * Get the thumbnail image
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getThumbImage() {
        return null;
    }
    
    /**
     * Get formatted year display
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getYearDisplay() {
        return null;
    }
    
    /**
     * Get formatted duration
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getDurationDisplay() {
        return null;
    }
    
    /**
     * Check if this is a TV series
     */
    public final boolean isSeries() {
        return false;
    }
    
    /**
     * Get director names as a single string
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getDirectorNames() {
        return null;
    }
    
    /**
     * Get actor names as a single string
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getActorNames() {
        return null;
    }
    
    /**
     * Get genre names as a single string
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getGenreNames() {
        return null;
    }
    
    /**
     * Get country names as a single string
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getCountryNames() {
        return null;
    }
    
    /**
     * Get rating display
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getRatingDisplay() {
        return null;
    }
    
    /**
     * Get quality badge text
     */
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String getQualityBadge() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component1() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component10() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component11() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component12() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component13() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component14() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component15() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component16() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component17() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component18() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double component19() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final java.lang.String component2() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double component20() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Double component21() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Integer component22() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.util.List<java.lang.String> component23() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.util.List<java.lang.String> component24() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.util.List<java.lang.String> component25() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.util.List<java.lang.String> component26() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component27() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component28() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component3() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component4() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component5() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component6() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component7() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.String component8() {
        return null;
    }
    
    @org.jetbrains.annotations.Nullable()
    public final java.lang.Integer component9() {
        return null;
    }
    
    @org.jetbrains.annotations.NotNull()
    public final com.streamflix.tv.data.model.Movie copy(@org.jetbrains.annotations.Nullable()
    java.lang.String id, @org.jetbrains.annotations.NotNull()
    java.lang.String slug, @org.jetbrains.annotations.Nullable()
    java.lang.String title, @org.jetbrains.annotations.Nullable()
    java.lang.String name, @org.jetbrains.annotations.Nullable()
    java.lang.String original_title, @org.jetbrains.annotations.Nullable()
    java.lang.String origin_name, @org.jetbrains.annotations.Nullable()
    java.lang.String thumbnail, @org.jetbrains.annotations.Nullable()
    java.lang.String poster_url, @org.jetbrains.annotations.Nullable()
    java.lang.Integer year, @org.jetbrains.annotations.Nullable()
    java.lang.String quality, @org.jetbrains.annotations.Nullable()
    java.lang.String lang, @org.jetbrains.annotations.Nullable()
    java.lang.String duration, @org.jetbrains.annotations.Nullable()
    java.lang.String time, @org.jetbrains.annotations.Nullable()
    java.lang.String episode_current, @org.jetbrains.annotations.Nullable()
    java.lang.String episode_total, @org.jetbrains.annotations.Nullable()
    java.lang.String type, @org.jetbrains.annotations.Nullable()
    java.lang.String status, @org.jetbrains.annotations.Nullable()
    java.lang.String content, @org.jetbrains.annotations.Nullable()
    java.lang.Double rating, @org.jetbrains.annotations.Nullable()
    java.lang.Double tmdb_rating, @org.jetbrains.annotations.Nullable()
    java.lang.Double imdb_rating, @org.jetbrains.annotations.Nullable()
    java.lang.Integer vote_count, @org.jetbrains.annotations.Nullable()
    java.util.List<java.lang.String> genres, @org.jetbrains.annotations.Nullable()
    java.util.List<java.lang.String> country, @org.jetbrains.annotations.Nullable()
    java.util.List<java.lang.String> director, @org.jetbrains.annotations.Nullable()
    java.util.List<java.lang.String> actor, @org.jetbrains.annotations.Nullable()
    java.lang.String modified, @org.jetbrains.annotations.Nullable()
    java.lang.String category) {
        return null;
    }
    
    @java.lang.Override()
    public boolean equals(@org.jetbrains.annotations.Nullable()
    java.lang.Object other) {
        return false;
    }
    
    @java.lang.Override()
    public int hashCode() {
        return 0;
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public java.lang.String toString() {
        return null;
    }
}
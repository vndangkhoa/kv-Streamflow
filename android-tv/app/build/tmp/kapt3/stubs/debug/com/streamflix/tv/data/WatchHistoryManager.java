package com.streamflix.tv.data;

/**
 * Manages watch history using SharedPreferences
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000H\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0010\b\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010 \n\u0000\n\u0002\u0010\u000b\n\u0002\b\u0004\b\u00c6\u0002\u0018\u00002\u00020\u0001B\t\b\u0002\u00a2\u0006\u0004\b\u0002\u0010\u0003J\u000e\u0010\r\u001a\u00020\u000e2\u0006\u0010\u000f\u001a\u00020\u0010J\u000e\u0010\u0011\u001a\u00020\u000e2\u0006\u0010\u0012\u001a\u00020\u0013J\f\u0010\u0014\u001a\b\u0012\u0004\u0012\u00020\u00130\u0015J\u0006\u0010\u0016\u001a\u00020\u0017J\u0006\u0010\u0018\u001a\u00020\u000eJ\u0016\u0010\u0019\u001a\u00020\u000e2\f\u0010\u001a\u001a\b\u0012\u0004\u0012\u00020\u00130\u0015H\u0002R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\bX\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\t\u001a\u00020\nX\u0082.\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u000b\u001a\u00020\fX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u001b"}, d2 = {"Lcom/streamflix/tv/data/WatchHistoryManager;", "", "<init>", "()V", "PREFS_NAME", "", "KEY_WATCH_HISTORY", "MAX_HISTORY_SIZE", "", "prefs", "Landroid/content/SharedPreferences;", "gson", "Lcom/google/gson/Gson;", "init", "", "context", "Landroid/content/Context;", "addToHistory", "movie", "Lcom/streamflix/tv/data/model/Movie;", "getWatchHistory", "", "hasHistory", "", "clearHistory", "saveHistory", "history", "app_debug"})
public final class WatchHistoryManager {
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String PREFS_NAME = "streamflix_history";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String KEY_WATCH_HISTORY = "watch_history";
    private static final int MAX_HISTORY_SIZE = 50;
    private static android.content.SharedPreferences prefs;
    @org.jetbrains.annotations.NotNull()
    private static final com.google.gson.Gson gson = null;
    @org.jetbrains.annotations.NotNull()
    public static final com.streamflix.tv.data.WatchHistoryManager INSTANCE = null;
    
    private WatchHistoryManager() {
        super();
    }
    
    public final void init(@org.jetbrains.annotations.NotNull()
    android.content.Context context) {
    }
    
    /**
     * Add a movie to watch history
     */
    public final void addToHistory(@org.jetbrains.annotations.NotNull()
    com.streamflix.tv.data.model.Movie movie) {
    }
    
    /**
     * Get watch history list
     */
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.streamflix.tv.data.model.Movie> getWatchHistory() {
        return null;
    }
    
    /**
     * Check if there's any watch history
     */
    public final boolean hasHistory() {
        return false;
    }
    
    /**
     * Clear all watch history
     */
    public final void clearHistory() {
    }
    
    private final void saveHistory(java.util.List<com.streamflix.tv.data.model.Movie> history) {
    }
}
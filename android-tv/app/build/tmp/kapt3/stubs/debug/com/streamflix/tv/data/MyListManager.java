package com.streamflix.tv.data;

/**
 * Manages user's "My List" (favorites) using SharedPreferences
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000F\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0010\u000b\n\u0002\b\u0002\n\u0002\u0010 \n\u0002\b\u0004\b\u00c6\u0002\u0018\u00002\u00020\u0001B\t\b\u0002\u00a2\u0006\u0004\b\u0002\u0010\u0003J\u000e\u0010\u000b\u001a\u00020\f2\u0006\u0010\r\u001a\u00020\u000eJ\u000e\u0010\u000f\u001a\u00020\f2\u0006\u0010\u0010\u001a\u00020\u0011J\u000e\u0010\u0012\u001a\u00020\f2\u0006\u0010\u0010\u001a\u00020\u0011J\u000e\u0010\u0013\u001a\u00020\u00142\u0006\u0010\u0010\u001a\u00020\u0011J\u000e\u0010\u0015\u001a\u00020\u00142\u0006\u0010\u0010\u001a\u00020\u0011J\f\u0010\u0016\u001a\b\u0012\u0004\u0012\u00020\u00110\u0017J\u0006\u0010\u0018\u001a\u00020\u0014J\u0016\u0010\u0019\u001a\u00020\f2\f\u0010\u001a\u001a\b\u0012\u0004\u0012\u00020\u00110\u0017H\u0002R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\bX\u0082.\u00a2\u0006\u0002\n\u0000R\u000e\u0010\t\u001a\u00020\nX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u001b"}, d2 = {"Lcom/streamflix/tv/data/MyListManager;", "", "<init>", "()V", "PREFS_NAME", "", "KEY_MY_LIST", "prefs", "Landroid/content/SharedPreferences;", "gson", "Lcom/google/gson/Gson;", "init", "", "context", "Landroid/content/Context;", "addToList", "movie", "Lcom/streamflix/tv/data/model/Movie;", "removeFromList", "isInList", "", "toggle", "getMyList", "", "hasItems", "saveList", "list", "app_debug"})
public final class MyListManager {
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String PREFS_NAME = "streamflix_mylist";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String KEY_MY_LIST = "my_list";
    private static android.content.SharedPreferences prefs;
    @org.jetbrains.annotations.NotNull()
    private static final com.google.gson.Gson gson = null;
    @org.jetbrains.annotations.NotNull()
    public static final com.streamflix.tv.data.MyListManager INSTANCE = null;
    
    private MyListManager() {
        super();
    }
    
    public final void init(@org.jetbrains.annotations.NotNull()
    android.content.Context context) {
    }
    
    /**
     * Add a movie to My List
     */
    public final void addToList(@org.jetbrains.annotations.NotNull()
    com.streamflix.tv.data.model.Movie movie) {
    }
    
    /**
     * Remove a movie from My List
     */
    public final void removeFromList(@org.jetbrains.annotations.NotNull()
    com.streamflix.tv.data.model.Movie movie) {
    }
    
    /**
     * Check if a movie is in My List
     */
    public final boolean isInList(@org.jetbrains.annotations.NotNull()
    com.streamflix.tv.data.model.Movie movie) {
        return false;
    }
    
    /**
     * Toggle movie in/out of My List
     */
    public final boolean toggle(@org.jetbrains.annotations.NotNull()
    com.streamflix.tv.data.model.Movie movie) {
        return false;
    }
    
    /**
     * Get My List
     */
    @org.jetbrains.annotations.NotNull()
    public final java.util.List<com.streamflix.tv.data.model.Movie> getMyList() {
        return null;
    }
    
    /**
     * Check if My List has any items
     */
    public final boolean hasItems() {
        return false;
    }
    
    private final void saveList(java.util.List<com.streamflix.tv.data.model.Movie> list) {
    }
}
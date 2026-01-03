package com.streamflix.tv.ui.search;

/**
 * Search Fragment using Leanback SearchSupportFragment
 * Supports both voice and text search with debouncing
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000P\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000b\n\u0000\n\u0002\u0010\u000e\n\u0002\b\u0005\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0005\u0018\u0000  2\u00020\u00012\u00020\u0002:\u0001 B\u0007\u00a2\u0006\u0004\b\u0003\u0010\u0004J\u0012\u0010\u000b\u001a\u00020\f2\b\u0010\r\u001a\u0004\u0018\u00010\u000eH\u0016J\b\u0010\u000f\u001a\u00020\fH\u0002J\b\u0010\u0010\u001a\u00020\u0011H\u0016J\u0010\u0010\u0012\u001a\u00020\u00132\u0006\u0010\u0014\u001a\u00020\u0015H\u0016J\u0010\u0010\u0016\u001a\u00020\u00132\u0006\u0010\u0017\u001a\u00020\u0015H\u0016J\u0010\u0010\u0018\u001a\u00020\f2\u0006\u0010\u0017\u001a\u00020\u0015H\u0002J\u001e\u0010\u0019\u001a\u00020\f2\f\u0010\u001a\u001a\b\u0012\u0004\u0012\u00020\u001c0\u001b2\u0006\u0010\u0017\u001a\u00020\u0015H\u0002J\u0010\u0010\u001d\u001a\u00020\f2\u0006\u0010\u0017\u001a\u00020\u0015H\u0002J\b\u0010\u001e\u001a\u00020\fH\u0002J\b\u0010\u001f\u001a\u00020\fH\u0016R\u000e\u0010\u0005\u001a\u00020\u0006X\u0082\u0004\u00a2\u0006\u0002\n\u0000R\u0010\u0010\u0007\u001a\u0004\u0018\u00010\bX\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u000e\u0010\t\u001a\u00020\nX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006!"}, d2 = {"Lcom/streamflix/tv/ui/search/SearchFragment;", "Landroidx/leanback/app/SearchSupportFragment;", "Landroidx/leanback/app/SearchSupportFragment$SearchResultProvider;", "<init>", "()V", "handler", "Landroid/os/Handler;", "searchRunnable", "Ljava/lang/Runnable;", "rowsAdapter", "Landroidx/leanback/widget/ArrayObjectAdapter;", "onCreate", "", "savedInstanceState", "Landroid/os/Bundle;", "setupEventListeners", "getResultsAdapter", "Landroidx/leanback/widget/ObjectAdapter;", "onQueryTextChange", "", "newQuery", "", "onQueryTextSubmit", "query", "performSearch", "displayResults", "movies", "", "Lcom/streamflix/tv/data/model/Movie;", "showNoResults", "showError", "onDestroyView", "Companion", "app_debug"})
public final class SearchFragment extends androidx.leanback.app.SearchSupportFragment implements androidx.leanback.app.SearchSupportFragment.SearchResultProvider {
    @org.jetbrains.annotations.NotNull()
    private final android.os.Handler handler = null;
    @org.jetbrains.annotations.Nullable()
    private java.lang.Runnable searchRunnable;
    @org.jetbrains.annotations.NotNull()
    private final androidx.leanback.widget.ArrayObjectAdapter rowsAdapter = null;
    private static final long SEARCH_DELAY_MS = 400L;
    @org.jetbrains.annotations.NotNull()
    public static final com.streamflix.tv.ui.search.SearchFragment.Companion Companion = null;
    
    public SearchFragment() {
        super();
    }
    
    @java.lang.Override()
    public void onCreate(@org.jetbrains.annotations.Nullable()
    android.os.Bundle savedInstanceState) {
    }
    
    private final void setupEventListeners() {
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public androidx.leanback.widget.ObjectAdapter getResultsAdapter() {
        return null;
    }
    
    @java.lang.Override()
    public boolean onQueryTextChange(@org.jetbrains.annotations.NotNull()
    java.lang.String newQuery) {
        return false;
    }
    
    @java.lang.Override()
    public boolean onQueryTextSubmit(@org.jetbrains.annotations.NotNull()
    java.lang.String query) {
        return false;
    }
    
    private final void performSearch(java.lang.String query) {
    }
    
    private final void displayResults(java.util.List<com.streamflix.tv.data.model.Movie> movies, java.lang.String query) {
    }
    
    private final void showNoResults(java.lang.String query) {
    }
    
    private final void showError() {
    }
    
    @java.lang.Override()
    public void onDestroyView() {
    }
    
    @kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000\u0012\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\n\u0002\u0010\t\n\u0000\b\u0086\u0003\u0018\u00002\u00020\u0001B\t\b\u0002\u00a2\u0006\u0004\b\u0002\u0010\u0003R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0006"}, d2 = {"Lcom/streamflix/tv/ui/search/SearchFragment$Companion;", "", "<init>", "()V", "SEARCH_DELAY_MS", "", "app_debug"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
    }
}
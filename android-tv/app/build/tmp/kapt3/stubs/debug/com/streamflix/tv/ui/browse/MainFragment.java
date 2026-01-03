package com.streamflix.tv.ui.browse;

/**
 * Main Browse Fragment using Leanback BrowseSupportFragment
 * Displays movie categories in horizontal rows from /api/rophim/home/curated
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000F\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\t\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\u0018\u00002\u00020\u0001B\u0007\u00a2\u0006\u0004\b\u0002\u0010\u0003J\u001a\u0010\n\u001a\u00020\u000b2\u0006\u0010\f\u001a\u00020\r2\b\u0010\u000e\u001a\u0004\u0018\u00010\u000fH\u0016J\b\u0010\u0010\u001a\u00020\u000bH\u0016J\b\u0010\u0011\u001a\u00020\u000bH\u0002J\b\u0010\u0012\u001a\u00020\u000bH\u0002J\b\u0010\u0013\u001a\u00020\u000bH\u0002J\b\u0010\u0014\u001a\u00020\u000bH\u0002J\u000e\u0010\u0015\u001a\u00020\u000bH\u0082@\u00a2\u0006\u0002\u0010\u0016J\u0016\u0010\u0017\u001a\u00020\u000b2\f\u0010\u0018\u001a\b\u0012\u0004\u0012\u00020\u001a0\u0019H\u0002J\u0010\u0010\u001b\u001a\u00020\u000b2\u0006\u0010\u001c\u001a\u00020\u001dH\u0002J\b\u0010\u001e\u001a\u00020\u000bH\u0002J\b\u0010\u001f\u001a\u00020\u000bH\u0016R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082.\u00a2\u0006\u0002\n\u0000R\u0010\u0010\u0006\u001a\u0004\u0018\u00010\u0007X\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\tX\u0082\u0004\u00a2\u0006\u0002\n\u0000\u00a8\u0006 "}, d2 = {"Lcom/streamflix/tv/ui/browse/MainFragment;", "Landroidx/leanback/app/BrowseSupportFragment;", "<init>", "()V", "backgroundManager", "Landroidx/leanback/app/BackgroundManager;", "defaultBackground", "Landroid/graphics/drawable/Drawable;", "rowsAdapter", "Landroidx/leanback/widget/ArrayObjectAdapter;", "onViewCreated", "", "view", "Landroid/view/View;", "savedInstanceState", "Landroid/os/Bundle;", "onResume", "setupUI", "setupBackgroundManager", "setupEventListeners", "loadCategories", "loadFallbackCatalog", "(Lkotlin/coroutines/Continuation;)Ljava/lang/Object;", "populateRows", "sections", "", "Lcom/streamflix/tv/data/model/HomeSection;", "updateBackground", "movie", "Lcom/streamflix/tv/data/model/Movie;", "showError", "onDestroy", "app_debug"})
public final class MainFragment extends androidx.leanback.app.BrowseSupportFragment {
    private androidx.leanback.app.BackgroundManager backgroundManager;
    @org.jetbrains.annotations.Nullable()
    private android.graphics.drawable.Drawable defaultBackground;
    @org.jetbrains.annotations.NotNull()
    private final androidx.leanback.widget.ArrayObjectAdapter rowsAdapter = null;
    
    public MainFragment() {
        super();
    }
    
    @java.lang.Override()
    public void onViewCreated(@org.jetbrains.annotations.NotNull()
    android.view.View view, @org.jetbrains.annotations.Nullable()
    android.os.Bundle savedInstanceState) {
    }
    
    @java.lang.Override()
    public void onResume() {
    }
    
    private final void setupUI() {
    }
    
    private final void setupBackgroundManager() {
    }
    
    private final void setupEventListeners() {
    }
    
    private final void loadCategories() {
    }
    
    private final java.lang.Object loadFallbackCatalog(kotlin.coroutines.Continuation<? super kotlin.Unit> $completion) {
        return null;
    }
    
    private final void populateRows(java.util.List<com.streamflix.tv.data.model.HomeSection> sections) {
    }
    
    private final void updateBackground(com.streamflix.tv.data.model.Movie movie) {
    }
    
    private final void showError() {
    }
    
    @java.lang.Override()
    public void onDestroy() {
    }
}
package com.streamflix.tv.ui.details;

/**
 * Details Fragment using Leanback DetailsSupportFragment
 * Shows movie details with play button and related movies
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000R\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010 \n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0005\n\u0002\u0010\u0000\n\u0002\b\b\n\u0002\u0010\u000e\n\u0002\b\u0003\u0018\u0000 %2\u00020\u0001:\u0001%B\u0007\u00a2\u0006\u0004\b\u0002\u0010\u0003J\u001a\u0010\u000f\u001a\u00020\u00102\u0006\u0010\u0011\u001a\u00020\u00122\b\u0010\u0013\u001a\u0004\u0018\u00010\u0014H\u0016J\b\u0010\u0015\u001a\u00020\u0010H\u0002J\b\u0010\u0016\u001a\u00020\u0010H\u0002J\b\u0010\u0017\u001a\u00020\u0010H\u0002J\u0012\u0010\u0018\u001a\u00020\u00102\b\u0010\u0019\u001a\u0004\u0018\u00010\u001aH\u0002J\b\u0010\u001b\u001a\u00020\u0010H\u0002J\b\u0010\u001c\u001a\u00020\u0010H\u0002J\b\u0010\u001d\u001a\u00020\u0010H\u0002J\b\u0010\u001e\u001a\u00020\u0010H\u0002J\b\u0010\u001f\u001a\u00020\u0010H\u0002J\b\u0010 \u001a\u00020\u0010H\u0002J\b\u0010!\u001a\u00020\u0010H\u0002J\u001a\u0010\"\u001a\n\u0012\u0004\u0012\u00020#\u0018\u00010\r2\b\u0010$\u001a\u0004\u0018\u00010\u001aH\u0002R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082.\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082.\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\tX\u0082.\u00a2\u0006\u0002\n\u0000R\u000e\u0010\n\u001a\u00020\u000bX\u0082.\u00a2\u0006\u0002\n\u0000R\u0014\u0010\f\u001a\b\u0012\u0004\u0012\u00020\u000e0\rX\u0082\u000e\u00a2\u0006\u0002\n\u0000\u00a8\u0006&"}, d2 = {"Lcom/streamflix/tv/ui/details/DetailsFragment;", "Landroidx/leanback/app/DetailsSupportFragment;", "<init>", "()V", "movie", "Lcom/streamflix/tv/data/model/Movie;", "backgroundController", "Landroidx/leanback/app/DetailsSupportFragmentBackgroundController;", "presenterSelector", "Landroidx/leanback/widget/ClassPresenterSelector;", "rowsAdapter", "Landroidx/leanback/widget/ArrayObjectAdapter;", "episodeServers", "", "Lcom/streamflix/tv/data/model/EpisodeServer;", "onViewCreated", "", "view", "Landroid/view/View;", "savedInstanceState", "Landroid/os/Bundle;", "setupBackgroundController", "setupAdapter", "loadMovieDetails", "parseEpisodeData", "episodesData", "", "setupDetailsOverviewRow", "setupSuggestedRow", "setupForYouRow", "loadBackgroundImage", "playMovie", "addToList", "showEpisodes", "parseAnyToList", "", "any", "Companion", "app_debug"})
public final class DetailsFragment extends androidx.leanback.app.DetailsSupportFragment {
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String EXTRA_MOVIE = "extra_movie";
    private static final long ACTION_PLAY = 1L;
    private static final long ACTION_ADD_LIST = 2L;
    private static final long ACTION_EPISODES = 3L;
    private com.streamflix.tv.data.model.Movie movie;
    private androidx.leanback.app.DetailsSupportFragmentBackgroundController backgroundController;
    private androidx.leanback.widget.ClassPresenterSelector presenterSelector;
    private androidx.leanback.widget.ArrayObjectAdapter rowsAdapter;
    @org.jetbrains.annotations.NotNull()
    private java.util.List<com.streamflix.tv.data.model.EpisodeServer> episodeServers;
    @org.jetbrains.annotations.NotNull()
    public static final com.streamflix.tv.ui.details.DetailsFragment.Companion Companion = null;
    
    public DetailsFragment() {
        super();
    }
    
    @java.lang.Override()
    public void onViewCreated(@org.jetbrains.annotations.NotNull()
    android.view.View view, @org.jetbrains.annotations.Nullable()
    android.os.Bundle savedInstanceState) {
    }
    
    private final void setupBackgroundController() {
    }
    
    private final void setupAdapter() {
    }
    
    private final void loadMovieDetails() {
    }
    
    private final void parseEpisodeData(java.lang.Object episodesData) {
    }
    
    private final void setupDetailsOverviewRow() {
    }
    
    private final void setupSuggestedRow() {
    }
    
    private final void setupForYouRow() {
    }
    
    private final void loadBackgroundImage() {
    }
    
    private final void playMovie() {
    }
    
    private final void addToList() {
    }
    
    private final void showEpisodes() {
    }
    
    private final java.util.List<java.lang.String> parseAnyToList(java.lang.Object any) {
        return null;
    }
    
    @kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000&\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0000\n\u0002\u0010\t\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\b\u0086\u0003\u0018\u00002\u00020\u0001B\t\b\u0002\u00a2\u0006\u0004\b\u0002\u0010\u0003J\u000e\u0010\n\u001a\u00020\u000b2\u0006\u0010\f\u001a\u00020\rR\u000e\u0010\u0004\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0007X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\b\u001a\u00020\u0007X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\t\u001a\u00020\u0007X\u0082T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u000e"}, d2 = {"Lcom/streamflix/tv/ui/details/DetailsFragment$Companion;", "", "<init>", "()V", "EXTRA_MOVIE", "", "ACTION_PLAY", "", "ACTION_ADD_LIST", "ACTION_EPISODES", "newInstance", "Lcom/streamflix/tv/ui/details/DetailsFragment;", "movie", "Lcom/streamflix/tv/data/model/Movie;", "app_debug"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
        
        @org.jetbrains.annotations.NotNull()
        public final com.streamflix.tv.ui.details.DetailsFragment newInstance(@org.jetbrains.annotations.NotNull()
        com.streamflix.tv.data.model.Movie movie) {
            return null;
        }
    }
}
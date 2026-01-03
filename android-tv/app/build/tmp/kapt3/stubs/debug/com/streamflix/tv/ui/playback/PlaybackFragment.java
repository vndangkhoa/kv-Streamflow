package com.streamflix.tv.ui.playback;

/**
 * Video playback fragment using ExoPlayer with HLS support
 * Uses Media3 LeanbackPlayerAdapter for native TV transport controls
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000F\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u000e\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\n\u0002\u0018\u0002\n\u0002\b\u0006\n\u0002\u0018\u0002\n\u0002\b\b\u0018\u0000 !2\u00020\u0001:\u0001!B\u0007\u00a2\u0006\u0004\b\u0002\u0010\u0003J\u0012\u0010\r\u001a\u00020\u000e2\b\u0010\u000f\u001a\u0004\u0018\u00010\u0010H\u0016J\u001a\u0010\u0011\u001a\u00020\u000e2\u0006\u0010\u0012\u001a\u00020\u00132\b\u0010\u000f\u001a\u0004\u0018\u00010\u0010H\u0016J\b\u0010\u0014\u001a\u00020\u000eH\u0002J\u0010\u0010\u0015\u001a\u00020\u000e2\u0006\u0010\u0016\u001a\u00020\u0007H\u0002J\u0010\u0010\u0017\u001a\u00020\u000e2\u0006\u0010\u0016\u001a\u00020\u0007H\u0002J\u0010\u0010\u0018\u001a\u00020\u000e2\u0006\u0010\u0019\u001a\u00020\u001aH\u0002J\u0010\u0010\u001b\u001a\u00020\u000e2\u0006\u0010\u001c\u001a\u00020\u0007H\u0002J\b\u0010\u001d\u001a\u00020\u000eH\u0016J\b\u0010\u001e\u001a\u00020\u000eH\u0016J\b\u0010\u001f\u001a\u00020\u000eH\u0016J\b\u0010 \u001a\u00020\u000eH\u0002R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082.\u00a2\u0006\u0002\n\u0000R\u0010\u0010\u0006\u001a\u0004\u0018\u00010\u0007X\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u0010\u0010\b\u001a\u0004\u0018\u00010\tX\u0082\u000e\u00a2\u0006\u0002\n\u0000R\u0016\u0010\n\u001a\n\u0012\u0004\u0012\u00020\f\u0018\u00010\u000bX\u0082\u000e\u00a2\u0006\u0002\n\u0000\u00a8\u0006\""}, d2 = {"Lcom/streamflix/tv/ui/playback/PlaybackFragment;", "Landroidx/leanback/app/VideoSupportFragment;", "<init>", "()V", "movie", "Lcom/streamflix/tv/data/model/Movie;", "streamUrl", "", "player", "Landroidx/media3/exoplayer/ExoPlayer;", "transportControlGlue", "Landroidx/leanback/media/PlaybackTransportControlGlue;", "Landroidx/media3/ui/leanback/LeanbackPlayerAdapter;", "onCreate", "", "savedInstanceState", "Landroid/os/Bundle;", "onViewCreated", "view", "Landroid/view/View;", "fetchStreamUrl", "initializePlayer", "mediaUrl", "prepareMediaSource", "handlePlaybackError", "error", "Landroidx/media3/common/PlaybackException;", "showError", "message", "onPause", "onResume", "onDestroyView", "releasePlayer", "Companion", "app_debug"})
public final class PlaybackFragment extends androidx.leanback.app.VideoSupportFragment {
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String EXTRA_MOVIE = "extra_movie";
    @org.jetbrains.annotations.NotNull()
    private static final java.lang.String EXTRA_STREAM_URL = "extra_stream_url";
    private static final int UPDATE_DELAY_MS = 16;
    private com.streamflix.tv.data.model.Movie movie;
    @org.jetbrains.annotations.Nullable()
    private java.lang.String streamUrl;
    @org.jetbrains.annotations.Nullable()
    private androidx.media3.exoplayer.ExoPlayer player;
    @org.jetbrains.annotations.Nullable()
    private androidx.leanback.media.PlaybackTransportControlGlue<androidx.media3.ui.leanback.LeanbackPlayerAdapter> transportControlGlue;
    @org.jetbrains.annotations.NotNull()
    public static final com.streamflix.tv.ui.playback.PlaybackFragment.Companion Companion = null;
    
    public PlaybackFragment() {
        super();
    }
    
    @java.lang.Override()
    public void onCreate(@org.jetbrains.annotations.Nullable()
    android.os.Bundle savedInstanceState) {
    }
    
    @java.lang.Override()
    public void onViewCreated(@org.jetbrains.annotations.NotNull()
    android.view.View view, @org.jetbrains.annotations.Nullable()
    android.os.Bundle savedInstanceState) {
    }
    
    private final void fetchStreamUrl() {
    }
    
    private final void initializePlayer(java.lang.String mediaUrl) {
    }
    
    private final void prepareMediaSource(java.lang.String mediaUrl) {
    }
    
    private final void handlePlaybackError(androidx.media3.common.PlaybackException error) {
    }
    
    private final void showError(java.lang.String message) {
    }
    
    @java.lang.Override()
    public void onPause() {
    }
    
    @java.lang.Override()
    public void onResume() {
    }
    
    @java.lang.Override()
    public void onDestroyView() {
    }
    
    private final void releasePlayer() {
    }
    
    @kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000(\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u0002\n\u0002\u0010\b\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\b\u0086\u0003\u0018\u00002\u00020\u0001B\t\b\u0002\u00a2\u0006\u0004\b\u0002\u0010\u0003J\u0018\u0010\t\u001a\u00020\n2\u0006\u0010\u000b\u001a\u00020\f2\b\u0010\r\u001a\u0004\u0018\u00010\u0005R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0007\u001a\u00020\bX\u0082T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u000e"}, d2 = {"Lcom/streamflix/tv/ui/playback/PlaybackFragment$Companion;", "", "<init>", "()V", "EXTRA_MOVIE", "", "EXTRA_STREAM_URL", "UPDATE_DELAY_MS", "", "newInstance", "Lcom/streamflix/tv/ui/playback/PlaybackFragment;", "movie", "Lcom/streamflix/tv/data/model/Movie;", "streamUrl", "app_debug"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
        
        @org.jetbrains.annotations.NotNull()
        public final com.streamflix.tv.ui.playback.PlaybackFragment newInstance(@org.jetbrains.annotations.NotNull()
        com.streamflix.tv.data.model.Movie movie, @org.jetbrains.annotations.Nullable()
        java.lang.String streamUrl) {
            return null;
        }
    }
}
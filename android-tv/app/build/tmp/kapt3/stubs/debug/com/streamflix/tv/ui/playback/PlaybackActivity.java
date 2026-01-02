package com.streamflix.tv.ui.playback;

/**
 * Activity for video playback
 * Keeps screen on during playback to prevent sleep
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000\u001a\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0010\u0002\n\u0000\n\u0002\u0018\u0002\n\u0002\b\u0002\u0018\u0000 \b2\u00020\u0001:\u0001\bB\u0007\u00a2\u0006\u0004\b\u0002\u0010\u0003J\u0012\u0010\u0004\u001a\u00020\u00052\b\u0010\u0006\u001a\u0004\u0018\u00010\u0007H\u0014\u00a8\u0006\t"}, d2 = {"Lcom/streamflix/tv/ui/playback/PlaybackActivity;", "Landroidx/fragment/app/FragmentActivity;", "<init>", "()V", "onCreate", "", "savedInstanceState", "Landroid/os/Bundle;", "Companion", "app_debug"})
public final class PlaybackActivity extends androidx.fragment.app.FragmentActivity {
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String EXTRA_MOVIE = "extra_movie";
    @org.jetbrains.annotations.NotNull()
    public static final java.lang.String EXTRA_STREAM_URL = "extra_stream_url";
    @org.jetbrains.annotations.NotNull()
    public static final com.streamflix.tv.ui.playback.PlaybackActivity.Companion Companion = null;
    
    public PlaybackActivity() {
        super();
    }
    
    @java.lang.Override()
    protected void onCreate(@org.jetbrains.annotations.Nullable()
    android.os.Bundle savedInstanceState) {
    }
    
    @kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000\u0014\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\n\u0002\u0010\u000e\n\u0002\b\u0002\b\u0086\u0003\u0018\u00002\u00020\u0001B\t\b\u0002\u00a2\u0006\u0004\b\u0002\u0010\u0003R\u000e\u0010\u0004\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0005X\u0086T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0007"}, d2 = {"Lcom/streamflix/tv/ui/playback/PlaybackActivity$Companion;", "", "<init>", "()V", "EXTRA_MOVIE", "", "EXTRA_STREAM_URL", "app_debug"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
    }
}
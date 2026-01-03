package com.streamflix.tv.ui.browse;

/**
 * Presenter for movie cards in the browse grid
 * Shows poster image, title, and quality badge
 */
@kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000(\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0003\n\u0002\u0018\u0002\n\u0000\n\u0002\u0018\u0002\n\u0000\n\u0002\u0010\u0002\n\u0002\b\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\u0018\u0000 \u000e2\u00020\u0001:\u0001\u000eB\u0007\u00a2\u0006\u0004\b\u0002\u0010\u0003J\u0010\u0010\u0004\u001a\u00020\u00052\u0006\u0010\u0006\u001a\u00020\u0007H\u0016J\u001a\u0010\b\u001a\u00020\t2\u0006\u0010\n\u001a\u00020\u00052\b\u0010\u000b\u001a\u0004\u0018\u00010\fH\u0016J\u0010\u0010\r\u001a\u00020\t2\u0006\u0010\n\u001a\u00020\u0005H\u0016\u00a8\u0006\u000f"}, d2 = {"Lcom/streamflix/tv/ui/browse/CardPresenter;", "Landroidx/leanback/widget/Presenter;", "<init>", "()V", "onCreateViewHolder", "Landroidx/leanback/widget/Presenter$ViewHolder;", "parent", "Landroid/view/ViewGroup;", "onBindViewHolder", "", "viewHolder", "item", "", "onUnbindViewHolder", "Companion", "app_debug"})
public final class CardPresenter extends androidx.leanback.widget.Presenter {
    private static final int CARD_WIDTH = 200;
    private static final int CARD_HEIGHT = 300;
    @org.jetbrains.annotations.NotNull()
    public static final com.streamflix.tv.ui.browse.CardPresenter.Companion Companion = null;
    
    public CardPresenter() {
        super();
    }
    
    @java.lang.Override()
    @org.jetbrains.annotations.NotNull()
    public androidx.leanback.widget.Presenter.ViewHolder onCreateViewHolder(@org.jetbrains.annotations.NotNull()
    android.view.ViewGroup parent) {
        return null;
    }
    
    @java.lang.Override()
    public void onBindViewHolder(@org.jetbrains.annotations.NotNull()
    androidx.leanback.widget.Presenter.ViewHolder viewHolder, @org.jetbrains.annotations.Nullable()
    java.lang.Object item) {
    }
    
    @java.lang.Override()
    public void onUnbindViewHolder(@org.jetbrains.annotations.NotNull()
    androidx.leanback.widget.Presenter.ViewHolder viewHolder) {
    }
    
    @kotlin.Metadata(mv = {2, 3, 0}, k = 1, xi = 48, d1 = {"\u0000\u0014\n\u0002\u0018\u0002\n\u0002\u0010\u0000\n\u0002\b\u0003\n\u0002\u0010\b\n\u0002\b\u0002\b\u0086\u0003\u0018\u00002\u00020\u0001B\t\b\u0002\u00a2\u0006\u0004\b\u0002\u0010\u0003R\u000e\u0010\u0004\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000R\u000e\u0010\u0006\u001a\u00020\u0005X\u0082T\u00a2\u0006\u0002\n\u0000\u00a8\u0006\u0007"}, d2 = {"Lcom/streamflix/tv/ui/browse/CardPresenter$Companion;", "", "<init>", "()V", "CARD_WIDTH", "", "CARD_HEIGHT", "app_debug"})
    public static final class Companion {
        
        private Companion() {
            super();
        }
    }
}
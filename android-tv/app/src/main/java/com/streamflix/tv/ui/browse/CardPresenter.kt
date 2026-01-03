package com.streamflix.tv.ui.browse

import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.leanback.widget.ImageCardView
import androidx.leanback.widget.Presenter
import com.bumptech.glide.Glide
import com.streamflix.tv.R
import com.streamflix.tv.data.model.Movie

/**
 * Presenter for movie cards in the browse grid
 * Shows poster image, title, and quality badge
 */
class CardPresenter : Presenter() {

    companion object {
        private const val CARD_WIDTH = 200
        private const val CARD_HEIGHT = 300
    }

    override fun onCreateViewHolder(parent: ViewGroup): ViewHolder {
        val cardView = ImageCardView(parent.context).apply {
            isFocusable = true
            isFocusableInTouchMode = true
            setMainImageDimensions(CARD_WIDTH, CARD_HEIGHT)
            
            // Card styling
            setBackgroundColor(ContextCompat.getColor(context, R.color.card_background))
            
            // Focus animation
            setOnFocusChangeListener { _, hasFocus ->
                if (hasFocus) {
                    animate().scaleX(1.1f).scaleY(1.1f).setDuration(150).start()
                } else {
                    animate().scaleX(1.0f).scaleY(1.0f).setDuration(150).start()
                }
            }
        }

        return ViewHolder(cardView)
    }

    override fun onBindViewHolder(viewHolder: ViewHolder, item: Any?) {
        val movie = item as? Movie ?: return
        val cardView = viewHolder.view as ImageCardView

        // Set title and content
        cardView.titleText = movie.getDisplayTitle()
        
        // Show quality badge or year as content text
        val contentText = buildString {
            movie.getQualityBadge().let { if (it.isNotEmpty()) append(it) }
            movie.getYearDisplay().let { 
                if (it.isNotEmpty()) {
                    if (isNotEmpty()) append(" • ")
                    append(it)
                }
            }
        }
        cardView.contentText = contentText

        // Load poster image
        val imageUrl = movie.getPosterImage()
        if (imageUrl.isNotEmpty()) {
            cardView.mainImageView?.let { mainImage ->
                Glide.with(cardView.context)
                    .load(imageUrl)
                    .centerCrop()
                    .placeholder(R.drawable.default_movie_poster)
                    .error(R.drawable.default_movie_poster)
                    .into(mainImage)
            }
        } else {
            cardView.mainImage = ContextCompat.getDrawable(
                cardView.context, 
                R.drawable.default_movie_poster
            )
        }
    }

    override fun onUnbindViewHolder(viewHolder: ViewHolder) {
        val cardView = viewHolder.view as? ImageCardView
        cardView?.mainImage = null
        cardView?.badgeImage = null
    }
}

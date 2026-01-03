package com.streamflix.tv.ui.details

import androidx.leanback.widget.AbstractDetailsDescriptionPresenter
import com.streamflix.tv.data.model.Movie

/**
 * Presenter for movie description in the details screen
 * Shows title, subtitle with metadata, and description
 */
class DetailsDescriptionPresenter : AbstractDetailsDescriptionPresenter() {

    override fun onBindDescription(viewHolder: ViewHolder, item: Any) {
        val movie = item as Movie

        viewHolder.title.text = movie.getDisplayTitle()
        
        // Build subtitle with available metadata
        val subtitleParts = mutableListOf<String>()
        
        movie.getYearDisplay().let { if (it.isNotEmpty()) subtitleParts.add(it) }
        movie.getQualityBadge().let { if (it.isNotEmpty()) subtitleParts.add(it) }
        movie.getDurationDisplay().let { if (it.isNotEmpty()) subtitleParts.add(it) }
        movie.getRatingDisplay().let { if (it.isNotEmpty()) subtitleParts.add("⭐ $it") }
        movie.getGenreNames().let { if (it.isNotEmpty()) subtitleParts.add(it) }
        
        viewHolder.subtitle.text = subtitleParts.joinToString(" • ")
        
        // Description with additional info
        val description = buildString {
            movie.content?.let { 
                append(it.trim())
                append("\n\n")
            }
            movie.getDirectorNames().let {
                if (it.isNotEmpty()) {
                    append("Director: $it\n")
                }
            }
            movie.getActorNames().let {
                if (it.isNotEmpty()) {
                    append("Cast: $it\n")
                }
            }
            movie.getCountryNames().let {
                if (it.isNotEmpty()) {
                    append("Country: $it")
                }
            }
        }
        
        viewHolder.body.text = description.trim()
    }
}

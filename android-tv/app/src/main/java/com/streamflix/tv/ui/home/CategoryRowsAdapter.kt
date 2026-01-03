package com.streamflix.tv.ui.home

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.streamflix.tv.R
import com.streamflix.tv.data.model.HomeSection
import com.streamflix.tv.data.model.Movie

/**
 * Adapter for category rows - each row shows a section title and horizontal movie cards
 */
class CategoryRowsAdapter(
    private val sections: List<HomeSection>,
    private val onMovieClick: (Movie) -> Unit
) : RecyclerView.Adapter<CategoryRowsAdapter.RowViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RowViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_category_row, parent, false)
        return RowViewHolder(view)
    }

    override fun onBindViewHolder(holder: RowViewHolder, position: Int) {
        holder.bind(sections[position])
    }

    override fun getItemCount() = sections.size

    inner class RowViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val rowTitle: TextView = itemView.findViewById(R.id.rowTitle)
        private val rowRecycler: RecyclerView = itemView.findViewById(R.id.rowRecycler)

        fun bind(section: HomeSection) {
            rowTitle.text = section.title
            
            rowRecycler.layoutManager = LinearLayoutManager(
                itemView.context, 
                LinearLayoutManager.HORIZONTAL, 
                false
            )
            
            section.movies?.let { movies ->
                rowRecycler.adapter = MovieCardAdapter(movies, onMovieClick)
            }
        }
    }
}

/**
 * Adapter for movie cards within a row
 */
class MovieCardAdapter(
    private val movies: List<Movie>,
    private val onMovieClick: (Movie) -> Unit
) : RecyclerView.Adapter<MovieCardAdapter.CardViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CardViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_movie_card, parent, false)
        return CardViewHolder(view)
    }

    override fun onBindViewHolder(holder: CardViewHolder, position: Int) {
        holder.bind(movies[position])
    }

    override fun getItemCount() = movies.size

    inner class CardViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val cardImage: ImageView = itemView.findViewById(R.id.cardImage)
        private val cardTitle: TextView = itemView.findViewById(R.id.cardTitle)

        fun bind(movie: Movie) {
            val imageUrl = movie.getThumbImage().takeIf { it.isNotEmpty() } ?: movie.getPosterImage()
            if (imageUrl.isNotEmpty()) {
                Glide.with(itemView.context)
                    .load(imageUrl)
                    .centerCrop()
                    .placeholder(R.drawable.card_placeholder)
                    .into(cardImage)
            }
            
            cardTitle.text = movie.getDisplayTitle()
            
            // Focus handling for D-pad navigation
            itemView.isFocusable = true
            itemView.isFocusableInTouchMode = true
            
            // Focus animation is handled by stateListAnimator in XML
            
            itemView.setOnClickListener {
                onMovieClick(movie)
            }
        }
    }
}

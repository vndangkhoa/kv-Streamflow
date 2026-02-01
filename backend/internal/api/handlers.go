package api

import (
	"encoding/json"
	"net/http"
	"strconv"

	"streamflow-backend/internal/database"
	"streamflow-backend/internal/scraper"
	"streamflow-backend/internal/service"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	Repo      *database.VideoRepository
	Scraper   *scraper.OphimScraper
	TMDB      *service.TMDBService
	Extractor *service.VideoExtractor
	Image     *service.ImageService
}

func NewHandler(
	repo *database.VideoRepository,
	scraper *scraper.OphimScraper,
	tmdb *service.TMDBService,
	extractor *service.VideoExtractor,
	image *service.ImageService,
) *Handler {
	return &Handler{
		Repo:      repo,
		Scraper:   scraper,
		TMDB:      tmdb,
		Extractor: extractor,
		Image:     image,
	}
}

func (h *Handler) GetHomeVideos(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	category := r.URL.Query().Get("category")

	movies, err := h.Scraper.GetMoviesByCategory(category, page)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(movies)
}

func (h *Handler) SearchVideos(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "query parameter required", http.StatusBadRequest)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}

	movies, err := h.Scraper.Search(query, page)
	if err != nil {
		// If search is not implemented, return empty list or error
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(movies)
}

func (h *Handler) ExtractVideo(w http.ResponseWriter, r *http.Request) {
	var req struct {
		URL string `json:"url"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Direct HLS check: if URL ends with .m3u8, just return it as source
	// But the frontend usually calls this if it needs to extract.
	// If frontend handles m3u8 directly (as planned), this is fallback.

	info, err := h.Extractor.Extract(req.URL, "1080p")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(info)
}

func (h *Handler) ProxyImage(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	width, _ := strconv.Atoi(r.URL.Query().Get("width"))

	if url == "" {
		http.Error(w, "url parameter required", http.StatusBadRequest)
		return
	}

	data, contentType, err := h.Image.GetProxiedImage(url, width)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", contentType)
	w.Write(data)
}

func (h *Handler) GetMovieDetail(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		http.Error(w, "slug required", http.StatusBadRequest)
		return
	}

	movie, err := h.Scraper.GetMovieDetail(slug)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(movie)
}

func (h *Handler) GetGenres(w http.ResponseWriter, r *http.Request) {
	genres, err := h.Scraper.GetGenres()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(genres)
}

func (h *Handler) GetCountries(w http.ResponseWriter, r *http.Request) {
	countries, err := h.Scraper.GetCountries()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(countries)
}

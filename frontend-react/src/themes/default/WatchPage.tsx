import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { useWatchMovie } from '../../hooks/useWatchMovie';
import MovieRow from '../../components/MovieRow';

export const WatchPage = ({ slug, episode }: { slug: string, episode: string }) => {
    const navigate = useNavigate();
    const { movie, loading, currentEpisode, setCurrentEpisode, videoRef } = useWatchMovie(slug, episode);
    const [expanded, setExpanded] = useState(false);

    if (!movie) return (
        <div className="h-screen w-full flex items-center justify-center bg-[#141414] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 animate-pulse">Loading StreamFlow...</p>
            </div>
        </div>
    );

    // Helper for URL safety (same as Hero)
    const getImageUrl = (url: string | undefined, width: number) => {
        if (!url) return '';
        const cleanUrl = url.replace('img.ophim1.com', 'ssl:img.ophim1.com');
        return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&output=webp`;
    };

    const episodes = movie.episodes || [];
    const visibleEpisodes = expanded ? episodes : episodes.slice(0, 20);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#000000] text-white font-sans selection:bg-cyan-500/30">
            {/* Header / Navigation Overlay */}
            <div className="absolute top-0 left-0 right-0 p-6 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <button
                    onClick={() => navigate('/')}
                    className="pointer-events-auto flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/20 transition-all border border-white/5 group"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-200 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Back to Home</span>
                </button>
            </div>

            {/* Main Layout Container */}
            <div className="flex-1 flex flex-col-reverse lg:flex-row h-full overflow-hidden">
                {/* Sidebar / Metadata Panel */}
                <div className="w-full lg:w-[400px] h-[60vh] lg:h-full bg-[#141414] border-r border-white/5 overflow-y-auto custom-scrollbar flex flex-col z-30 shadow-2xl">
                    <div className="p-6 md:p-8 space-y-8 pb-20">
                        {/* Movie Header */}
                        <div className="space-y-4">
                            <h1 className="text-2xl md:text-3xl font-bold leading-tight text-white tracking-tight">{movie.title}</h1>
                            <div className="flex items-center flex-wrap gap-3 text-sm">
                                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                    {movie.quality || 'HD'}
                                </span>
                                <span className="text-gray-400">{movie.year || '2024'}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                <span className="text-green-400 font-medium">98% Match</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                                <span className="text-gray-400 truncate max-w-[150px]">{movie.original_title}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Synopsis</h3>
                            <div
                                className="text-gray-300 leading-relaxed text-sm font-light"
                                dangerouslySetInnerHTML={{ __html: movie.description }}
                            />
                        </div>

                        {/* Episodes Grid */}
                        {episodes.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                                        <Play className="w-5 h-5 text-cyan-500 fill-current" />
                                        Episodes
                                    </h3>
                                    <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                        {episodes.length} Items
                                    </span>
                                </div>

                                <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                                    {visibleEpisodes.map((ep) => (
                                        <button
                                            key={ep.number}
                                            onClick={() => {
                                                setCurrentEpisode(ep.number);
                                                navigate(`/watch/${slug}/${ep.number}`);
                                            }}
                                            className={`group relative flex items-center justify-center lg:justify-start gap-4 p-2 lg:p-4 rounded-xl transition-all duration-300 border ${currentEpisode === ep.number
                                                ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-cyan-500/20'
                                                : 'bg-[#1a1a1a] border-transparent hover:bg-[#222] hover:border-white/10'
                                                }`}
                                        >
                                            {/* Episode Number/Status */}
                                            <div className="relative">
                                                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs lg:text-sm font-bold transition-colors ${currentEpisode === ep.number ? 'bg-cyan-500 text-black' : 'bg-black/40 text-gray-500 group-hover:text-white'
                                                    }`}>
                                                    {currentEpisode === ep.number ? <Play className="w-3 h-3 lg:w-4 lg:h-4 fill-current ml-0.5" /> : ep.number}
                                                </div>
                                            </div>

                                            {/* Episode Info - Show only on Desktop */}
                                            <div className="hidden lg:block flex-1 text-left">
                                                <h4 className={`font-medium text-sm transition-colors ${currentEpisode === ep.number ? 'text-cyan-400' : 'text-gray-200 group-hover:text-white'}`}>
                                                    {ep.title || `Episode ${ep.number}`}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Server VIP</span>
                                                </div>
                                            </div>

                                            {/* Active Indicator - Desktop Only (rely on color for mobile) */}
                                            {currentEpisode === ep.number && (
                                                <div className="hidden lg:block absolute right-4 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {episodes.length > 20 && (
                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                        {expanded ? (
                                            <>Show Less <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>Show All Episodes ({episodes.length}) <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Related Content Section */}
                        <div className="py-6 border-t border-white/5 w-full space-y-8">
                            {/* More Like This */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Có thể bạn sẽ thích</h3>
                                <MovieRow
                                    title=""
                                    category={movie.category || 'phim-le'}
                                    limit={10}
                                    key={`related-${movie.slug}`}
                                />
                            </div>

                            {/* Trending */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Phim Mới Cập Nhật</h3>
                                <MovieRow
                                    title=""
                                    category="home"
                                    limit={10}
                                    key="trending"
                                />
                            </div>

                            {/* Top Movies */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Top Phim Lẻ</h3>
                                <MovieRow
                                    title=""
                                    category="phim-le"
                                    limit={10}
                                    key="top-movies"
                                />
                            </div>

                            {/* Top Series */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Top Phim Bộ</h3>
                                <MovieRow
                                    title=""
                                    category="phim-bo"
                                    limit={10}
                                    key="top-series"
                                />
                            </div>

                            {/* Animation */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">Hoạt Hình Hot</h3>
                                <MovieRow
                                    title=""
                                    category="hoat-hinh"
                                    limit={10}
                                    key="animation"
                                />
                            </div>

                            {/* TV Shows */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white">TV Shows</h3>
                                <MovieRow
                                    title=""
                                    category="tv-shows"
                                    limit={10}
                                    key="tv-shows"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area (Player) */}
                <div className="flex-1 relative flex items-center justify-center bg-black group/player z-10">
                    {/* Ambient Background Gradient behind player */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 to-blue-900/10 opacity-50" />

                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>
                        </div>
                    )}

                    {(() => {
                        const activeEpisode = movie.episodes?.find(e => e.number === currentEpisode);
                        if (!activeEpisode?.url) {
                            return (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md w-full h-full">
                                    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center max-w-md mx-auto">
                                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Play className="w-8 h-8 text-white/20 ml-1" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            The server is currently processing the movie "<strong>{movie.title}</strong>". Please check back later for the upload.
                                        </p>
                                    </div>
                                    {/* Ambient background from poster */}
                                    <div className="absolute inset-0 -z-10 opacity-20 bg-cover bg-center blur-3xl" style={{ backgroundImage: `url(${getImageUrl(movie.backdrop || movie.thumbnail, 400)})` }} />
                                </div>
                            );
                        }

                        return (
                            <video
                                ref={videoRef}
                                controls
                                className="relative w-full h-full max-h-screen object-contain z-10 focus:outline-none"
                                poster={getImageUrl(movie.backdrop || movie.thumbnail, 1280)}
                            />
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { Layout } from './Layout';
import { useWatchMovie } from '../../hooks/useWatchMovie';
import MovieRow from '../../components/MovieRow';

export const WatchPage = ({ slug, episode }: { slug: string, episode: string }) => {
    const navigate = useNavigate();
    const { movie, loading, currentEpisode, setCurrentEpisode, videoRef } = useWatchMovie(slug, episode);
    const [expanded, setExpanded] = useState(false);

    if (!movie) return <div className="text-white p-10">Loading...</div>;

    const episodes = movie.episodes || [];
    const visibleEpisodes = expanded ? episodes : episodes.slice(0, 20);

    return (
        <Layout>
            <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
                {/* Back Button Overlay */}
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-6 left-6 z-50 bg-black/50 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>

                <div className="flex-1 flex flex-col-reverse lg:flex-row h-full overflow-hidden">
                    {/* Sidebar / Metadata Panel */}
                    <div className="w-full lg:w-[400px] h-[60vh] lg:h-full bg-[#181818] border-r border-white/5 overflow-y-auto custom-scrollbar flex flex-col z-30 shadow-2xl">
                        <div className="p-6 md:p-8 space-y-8 pb-20">
                            {/* Movie Header */}
                            <div className="space-y-4">
                                <h1 className="text-2xl md:text-3xl font-bold leading-tight text-white tracking-tight">{movie.title}</h1>
                                <div className="flex items-center flex-wrap gap-3 text-sm">
                                    <span className="text-green-500 font-bold">98% Match</span>
                                    <span className="text-gray-400">{movie.year || '2024'}</span>
                                    <span className="border border-gray-600 px-1.5 py-0.5 rounded text-xs">HD</span>
                                    <span className="text-gray-400 truncate max-w-[150px]">{movie.original_title}</span>
                                </div>
                            </div>

                            <p className="text-gray-300 leading-relaxed text-sm">
                                {movie.description}
                            </p>

                            {/* Episodes Grid */}
                            {episodes.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-lg text-white">Episodes</h3>
                                        <span className="text-xs text-gray-500">
                                            {episodes.length} Episodes
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
                                                className={`group relative flex items-center justify-center lg:justify-start gap-4 p-2 lg:p-4 rounded-md transition-all duration-300 ${currentEpisode === ep.number
                                                    ? 'bg-[#333] border-l-2 border-red-600'
                                                    : 'bg-[#222] hover:bg-[#333]'
                                                    }`}
                                            >
                                                {/* Episode Number/Status */}
                                                <div className="relative">
                                                    <div className={`w-8 h-8 lg:w-8 lg:h-8 flex items-center justify-center text-sm font-bold ${currentEpisode === ep.number ? 'text-red-500' : 'text-gray-400 group-hover:text-white'
                                                        }`}>
                                                        {currentEpisode === ep.number ? <Play className="w-4 h-4 fill-current ml-0.5" /> : ep.number}
                                                    </div>
                                                </div>

                                                {/* Episode Info - Show only on Desktop */}
                                                <div className="hidden lg:block flex-1 text-left">
                                                    <h4 className={`font-medium text-sm ${currentEpisode === ep.number ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                        {ep.title || `Episode ${ep.number}`}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] text-gray-500">45m</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {episodes.length > 20 && (
                                        <button
                                            onClick={() => setExpanded(!expanded)}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#222] hover:bg-[#333] rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors border border-white/10"
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
                            <div className="py-6 border-t border-white/10 w-full space-y-8">
                                {/* More Like This */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">More Like This</h3>
                                    <MovieRow
                                        title=""
                                        category={movie.category || 'phim-le'}
                                        limit={10}
                                        key={`related-${movie.slug}`}
                                    />
                                </div>

                                {/* Trending */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">New Releases</h3>
                                    <MovieRow
                                        title=""
                                        category="home"
                                        limit={10}
                                        key="trending"
                                    />
                                </div>

                                {/* Top Movies */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">Top Movies</h3>
                                    <MovieRow
                                        title=""
                                        category="phim-le"
                                        limit={10}
                                        key="top-movies"
                                    />
                                </div>

                                {/* Top Series */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">Top Series</h3>
                                    <MovieRow
                                        title=""
                                        category="phim-bo"
                                        limit={10}
                                        key="top-series"
                                    />
                                </div>

                                {/* Animation */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white">Animation</h3>
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
                    <div className="flex-1 relative bg-black flex items-center justify-center z-10">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                            </div>
                        )}
                        {(() => {
                            const activeEpisode = movie.episodes?.find(e => e.number === currentEpisode);
                            if (!activeEpisode?.url) {
                                return (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90">
                                        <div className="text-center px-6 max-w-lg">
                                            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon</h2>
                                            <p className="text-gray-400 text-lg mb-6">
                                                We're busy uploading the best quality version of this movie.
                                            </p>
                                        </div>
                                        <div
                                            className="absolute inset-0 -z-10 opacity-30 bg-cover bg-center blur-2xl grayscale"
                                            style={{
                                                backgroundImage: `url(https://wsrv.nl/?url=${encodeURIComponent(movie.thumbnail?.replace(/^https?:\/\//, '').replace('img.ophim1.com', 'ssl:img.ophim1.com') || '')}&w=400&output=webp)`
                                            }}
                                        />
                                    </div>
                                );
                            }

                            return (
                                <video
                                    ref={videoRef}
                                    controls
                                    className="w-full h-full max-h-screen object-contain"
                                    poster={`https://wsrv.nl/?url=${encodeURIComponent(movie.thumbnail?.replace(/^https?:\/\//, '').replace('img.ophim1.com', 'ssl:img.ophim1.com') || '')}&w=1280&output=webp`}
                                />
                            );
                        })()}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

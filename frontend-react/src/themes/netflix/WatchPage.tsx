import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ChevronDown, ChevronUp } from 'lucide-react';

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

        <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-red-600 selection:text-white pb-20">
            {/* Back Navigation */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <button
                    onClick={() => navigate('/')}
                    className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-white/20 backdrop-blur-md rounded-full transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 text-white group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Home</span>
                </button>
            </div>

            {/* 1. Cinema Player Section */}
            <div className="w-full h-[50vh] md:h-[80vh] bg-black relative shadow-2xl z-40">
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

            {/* 2. Content Info & Rows */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-12 py-8 space-y-12">
                {/* Glass Info Card */}
                <div className="bg-[#181818]/90 backdrop-blur-xl rounded-xl p-6 md:p-10 shadow-2xl border border-white/5 mx-2 md:mx-0">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{movie.title}</h1>

                    {/* Meta Tags */}
                    <div className="flex items-center gap-4 text-sm md:text-base mb-6">
                        <span className="text-green-500 font-bold">98% Match</span>
                        <span className="text-gray-400">{movie.year || '2024'}</span>
                        <span className="border border-gray-600 px-2 py-0.5 rounded text-xs bg-black/40">HD</span>
                        <span className="text-gray-400">{movie.original_title}</span>
                    </div>

                    <div
                        className="text-gray-300 leading-relaxed max-w-4xl text-base md:text-lg"
                        dangerouslySetInnerHTML={{ __html: movie.description }}
                    />
                </div>

                {/* Episodes Section - Compact Grid */}
                {episodes.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold border-l-4 border-red-600 pl-4">Episodes</h3>
                            <div className="text-gray-400 text-sm font-medium">{episodes.length} Items</div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                            {visibleEpisodes.map((ep) => (
                                <button
                                    key={ep.number}
                                    onClick={() => {
                                        setCurrentEpisode(ep.number);
                                        navigate(`/watch/${slug}/${ep.number}`);
                                    }}
                                    className={`group relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${currentEpisode === ep.number ? 'border-red-600' : 'border-transparent hover:border-white/50 bg-[#222]'}`}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className={`font-bold text-lg ${currentEpisode === ep.number ? 'text-red-500' : 'text-gray-400 group-hover:text-white'}`}>
                                            {ep.number}
                                        </span>
                                    </div>
                                    {currentEpisode === ep.number && (
                                        <div className="absolute bottom-1 right-1">
                                            <Play className="w-3 h-3 text-red-500 fill-current" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {episodes.length > 20 && (
                            <button
                                onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors mt-4"
                            >
                                {expanded ? (
                                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                                ) : (
                                    <>Show All Episodes <ChevronDown className="w-4 h-4" /></>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* Related Content Section */}
                <div className="space-y-12 pt-8 border-t border-white/10">
                    <MovieRow title="More Like This" category={movie.category || 'phim-le'} limit={10} key={`related-${movie.slug}`} />
                    <MovieRow title="New Releases" category="home" limit={10} key="trending" />
                    <MovieRow title="Top Movies" category="phim-le" limit={10} key="top-movies" />
                    <MovieRow title="Animation" category="hoat-hinh" limit={10} key="animation" />
                </div>
            </div>
        </div>
    );
};

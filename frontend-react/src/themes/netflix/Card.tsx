import { Play } from 'lucide-react';
import type { Movie } from '../../types';

export const Card = ({ movie }: { movie: Movie }) => {
    return (
        <div className="group relative bg-[#181818] rounded-md overflow-hidden transition-all duration-300 hover:z-20 hover:scale-105 hover:shadow-lg">
            <a href={`/watch/${movie.slug}`} className="block relative aspect-[2/3]">
                <img
                    src={`https://wsrv.nl/?url=${encodeURIComponent(movie.thumbnail)}&w=500&output=webp`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />

                {/* Netflix Style Quality Badge */}
                {movie.quality && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/20 uppercase tracking-wider">
                        {movie.quality}
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white rounded-full p-3 hover:bg-gray-200 transition-colors">
                        <Play className="w-5 h-5 text-black fill-current ml-1" />
                    </div>
                </div>
            </a>

            <div className="p-3">
                <h3 className="font-medium text-white text-sm truncate group-hover:text-white">
                    {movie.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="text-green-500 font-semibold">98% Match</span>
                    <span>{movie.year || '2024'}</span>
                </div>
            </div>
        </div>
    );
};

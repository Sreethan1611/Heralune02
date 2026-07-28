import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AvatarCarouselProps {
  currentSeed: string;
  onSelectSeed: (seed: string) => void;
}

const AVATAR_SEEDS = ['heralune', 'explorer', 'dreamer', 'creator', 'thinker', 'seeker', 'guide', 'star', 'luna', 'nova', 'atlas', 'orion'];

export const AvatarCarousel: React.FC<AvatarCarouselProps> = ({ currentSeed, onSelectSeed }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="block text-white/70 text-sm">Choose Your Avatar</label>
      
      <div className="relative flex items-center">
        {/* Left Nav Button */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-all -translate-x-3 shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scroll Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-hidden scroll-smooth py-4 px-2 w-full select-none"
        >
          {AVATAR_SEEDS.map((seed) => (
            <img 
              key={seed}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
              alt={seed}
              onClick={() => onSelectSeed(seed)}
              className={`w-16 h-16 rounded-full border-2 bg-black/20 cursor-pointer transition-all flex-shrink-0 ${
                currentSeed === seed 
                  ? 'border-[var(--color-accent-purple)] scale-110 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                  : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            />
          ))}
        </div>

        {/* Right Nav Button */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-black/60 transition-all translate-x-3 shadow-lg"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

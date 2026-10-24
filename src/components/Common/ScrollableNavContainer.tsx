import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollableNavContainerProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  scrollAmount?: number;
  showGradientMasks?: boolean;
}

export const ScrollableNavContainer: React.FC<ScrollableNavContainerProps> = ({
  children,
  className = '',
  innerClassName = 'flex items-center gap-1.5',
  scrollAmount = 240,
  showGradientMasks = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // 4px tolerance
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      checkScroll();
    });
    resizeObserver.observe(el);
    window.addEventListener('resize', checkScroll);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, children]);

  const handleScrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 320);
    }
  };

  const handleScrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScroll, 320);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Left Scroll Indicator & Button */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-1 pr-3 bg-gradient-to-r from-white via-white/95 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={handleScrollLeft}
            aria-label="Scroll left"
            className="p-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition pointer-events-auto cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Scrollable Area */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className={`overflow-x-auto scrollbar-none scroll-smooth ${innerClassName}`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Right Scroll Indicator & Button */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center pr-1 pl-3 bg-gradient-to-l from-white via-white/95 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={handleScrollRight}
            aria-label="Scroll right"
            className="p-1 rounded-md bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs transition pointer-events-auto cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

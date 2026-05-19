import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { SiteProvider, useSite } from './context/SiteContext';
import { ChevronLeft, ChevronRight, Settings, ExternalLink } from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { CustomCursor } from './components/CustomCursor';

function MainContent() {
  const { config } = useSite();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const totalPages = config.pages.length;

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <div 
      className="relative h-screen w-full overflow-hidden transition-colors duration-500 cursor-none"
      style={{ backgroundColor: config.backgroundColor }}
    >
      <CustomCursor />
      
      {/* Logo */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <button 
          onClick={() => setCurrentPage(0)}
          className="group focus:outline-none cursor-none"
        >
          <img 
            src={config.logoUrl} 
            alt="Logo" 
            className="h-10 md:h-20 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </button>
      </div>

      {/* Admin Trigger */}
      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50">
        <button 
          onClick={() => setIsAdminOpen(true)}
          className="p-4 opacity-0 hover:opacity-40 transition-all duration-500 cursor-none rounded-full"
          style={{ color: 'inherit' }}
          title="Admin Settings"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Navigation Arrows */}
      <AnimatePresence>
        {currentPage > 0 && (
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handlePrev}
            className="nav-arrow absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-40 p-2 md:p-4 hover:scale-110 transition-transform focus:outline-none cursor-none bg-white/10 md:bg-transparent rounded-full backdrop-blur-sm md:backdrop-blur-none"
            aria-label="Previous page"
          >
            <ChevronLeft size={32} className="md:w-12 md:h-12" strokeWidth={1} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentPage < totalPages - 1 && (
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleNext}
            className="nav-arrow absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-40 p-2 md:p-4 hover:scale-110 transition-transform focus:outline-none cursor-none bg-white/10 md:bg-transparent rounded-full backdrop-blur-sm md:backdrop-blur-none"
            aria-label="Next page"
          >
            <ChevronRight size={32} className="md:w-12 md:h-12" strokeWidth={1} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Pages Container */}
      <div className="h-full w-full relative overflow-hidden">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%' }),
              center: { x: 0 },
              exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%' })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ 
              x: { type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.8 },
              opacity: { duration: 0.4 }
            }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-8 text-center"
          >
            <div className="max-w-7xl w-full flex flex-col items-center gap-6 md:gap-12">
              {/* Media Section */}
              <motion.div 
                className={`relative overflow-hidden group orange-hover flex items-center justify-center
                  ${config.pages[currentPage].id === 1 ? 'w-[70%] md:w-[33%] shadow-none' : ''}
                  ${config.pages[currentPage].id === 2 ? 'w-[60%] md:w-[25%] rounded-lg shadow-2xl' : ''}
                  ${config.pages[currentPage].id === 3 ? 'w-fit max-w-[95vw] md:max-w-4xl rounded-lg shadow-2xl' : ''}
                  ${config.pages[currentPage].id === 4 ? 'w-[95%] md:w-[80%] rounded-lg shadow-2xl' : ''}
                  ${config.pages[currentPage].id === 5 ? 'w-[50%] md:w-[20%] rounded-lg shadow-2xl' : ''}
                  ${[2, 3, 4, 5].includes(config.pages[currentPage].id) ? 'h-auto max-h-[50vh] md:max-h-[60vh]' : ''}
                `}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  if (config.pages[currentPage].externalLink) {
                    window.open(config.pages[currentPage].externalLink, '_blank');
                  }
                }}
              >
                {config.pages[currentPage].mediaType === 'image' ? (
                  <img 
                    src={config.pages[currentPage].mediaUrl} 
                    alt={config.pages[currentPage].title}
                    className={`max-w-full max-h-full object-contain transition-transform duration-700 
                      ${config.pages[currentPage].id === 1 ? '' : 'group-hover:scale-105'}
                      ${config.pages[currentPage].id === 3 ? 'block w-auto h-auto' : ''}
                    `}
                  />
                ) : (
                  <div className="aspect-video w-[90vw] max-w-6xl relative">
                    {config.pages[currentPage].mediaUrl.includes('drive.google.com') ? (
                      <iframe
                        src={`${config.pages[currentPage].mediaUrl.replace('/view', '/preview')}&vq=hd1080`}
                        className="w-full h-full border-none"
                        allow="autoplay"
                      />
                    ) : (
                      <video 
                        src={config.pages[currentPage].mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Overlay for mouse capture on video/iframe */}
                    <div className="absolute inset-0 z-10 cursor-none" />
                  </div>
                )}
                
                {config.pages[currentPage].externalLink && (
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />
                )}
              </motion.div>

              {/* Text Section */}
              <div className="space-y-4 w-full">
                {config.pages[currentPage].title && (
                  <motion.h1 
                    className={`${config.pages[currentPage].styles.titleSize} ${config.pages[currentPage].styles.fontFamily} font-bold tracking-tighter whitespace-pre-wrap break-words`}
                    style={{ color: config.pages[currentPage].styles.titleColor }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {config.pages[currentPage].title}
                  </motion.h1>
                )}
                {config.pages[currentPage].description && (
                  <motion.p 
                    className={`${config.pages[currentPage].styles.descriptionSize} ${config.pages[currentPage].styles.fontFamily} ${config.pages[currentPage].id === 2 ? 'max-w-5xl' : 'max-w-2xl'} mx-auto whitespace-pre-wrap break-words`}
                    style={{ color: config.pages[currentPage].styles.descriptionColor }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {config.pages[currentPage].description}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

              {/* Pagination Dots */}
      <div className="absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 flex gap-3 md:gap-4 z-40">
        {config.pages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (idx !== currentPage) {
                setDirection(idx > currentPage ? 1 : -1);
                setCurrentPage(idx);
              }
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-none ${
              currentPage === idx ? 'bg-black scale-125' : 'bg-black/20 hover:bg-black/40'
            }`}
            aria-label={`Go to page ${idx + 1}`}
          />
        ))}
      </div>

      {/* Admin Panel Modal */}
      <AnimatePresence>
        {isAdminOpen && (
          <AdminPanel onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>
      
      <style>{`
        .cursor-none * {
          cursor: none !important;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <SiteProvider>
      <MainContent />
    </SiteProvider>
  );
}

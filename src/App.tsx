import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { SiteProvider, useSite } from './context/SiteContext';
import { ChevronLeft, ChevronRight, Settings, ExternalLink } from 'lucide-react';
import { AdminPanel } from './components/AdminPanel';
import { CustomCursor } from './components/CustomCursor';

function MainContent() {
  const { config } = useSite();
  const [currentPage, setCurrentPage] = useState(0);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const totalPages = config.pages.length;

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
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
      <div className="absolute top-8 left-8 z-50">
        <button 
          onClick={() => setCurrentPage(0)}
          className="group focus:outline-none cursor-none"
        >
          <img 
            src={config.logoUrl} 
            alt="Logo" 
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
        </button>
      </div>

      {/* Admin Trigger */}
      <div className="absolute top-8 right-8 z-50">
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
            className="absolute left-8 top-1/2 -translate-y-1/2 z-40 p-4 hover:scale-110 transition-transform focus:outline-none cursor-none"
            aria-label="Previous page"
          >
            <ChevronLeft size={48} strokeWidth={1} />
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
            className="absolute right-8 top-1/2 -translate-y-1/2 z-40 p-4 hover:scale-110 transition-transform focus:outline-none cursor-none"
            aria-label="Next page"
          >
            <ChevronRight size={48} strokeWidth={1} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Pages Container */}
      <div className="h-full w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="h-full w-full flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="max-w-6xl w-full flex flex-col items-center gap-12">
              {/* Media Section */}
              <motion.div 
                className={`relative max-w-full max-h-[65vh] rounded-lg overflow-hidden shadow-2xl group ${config.pages[currentPage].id === 3 ? 'orange-hover' : ''}`}
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
                    className="max-w-full max-h-[65vh] object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="aspect-video w-[80vw] max-w-4xl">
                    {config.pages[currentPage].mediaUrl.includes('drive.google.com') ? (
                      <iframe
                        src={config.pages[currentPage].mediaUrl.replace('/view', '/preview')}
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
                  </div>
                )}
                
                {config.pages[currentPage].externalLink && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <ExternalLink size={48} className="text-white" />
                  </div>
                )}
              </motion.div>

              {/* Text Section */}
              <div className="space-y-4">
                <motion.h1 
                  className={`${config.pages[currentPage].styles.titleSize} ${config.pages[currentPage].styles.fontFamily} font-bold tracking-tighter`}
                  style={{ color: config.pages[currentPage].styles.titleColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {config.pages[currentPage].title}
                </motion.h1>
                <motion.p 
                  className={`${config.pages[currentPage].styles.descriptionSize} max-w-2xl mx-auto`}
                  style={{ color: config.pages[currentPage].styles.descriptionColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {config.pages[currentPage].description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-40">
        {config.pages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx)}
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

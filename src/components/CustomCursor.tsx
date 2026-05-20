import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, AnimatePresence, useSpring } from 'motion/react';

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isNavArrow, setIsNavArrow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // For trailing effect (10 dots for a denser trail)
  const dotConfigs = [
    { s: 120, d: 20 }, { s: 115, d: 21 }, { s: 110, d: 22 }, { s: 105, d: 23 }, { s: 100, d: 24 },
    { s: 95, d: 25 }, { s: 90, d: 26 }, { s: 85, d: 27 }, { s: 80, d: 28 }, { s: 75, d: 29 }
  ];

  const trailingX1 = useSpring(cursorX, dotConfigs[0]); const trailingY1 = useSpring(cursorY, dotConfigs[0]);
  const trailingX2 = useSpring(cursorX, dotConfigs[1]); const trailingY2 = useSpring(cursorY, dotConfigs[1]);
  const trailingX3 = useSpring(cursorX, dotConfigs[2]); const trailingY3 = useSpring(cursorY, dotConfigs[2]);
  const trailingX4 = useSpring(cursorX, dotConfigs[3]); const trailingY4 = useSpring(cursorY, dotConfigs[3]);
  const trailingX5 = useSpring(cursorX, dotConfigs[4]); const trailingY5 = useSpring(cursorY, dotConfigs[4]);
  const trailingX6 = useSpring(cursorX, dotConfigs[5]); const trailingY6 = useSpring(cursorY, dotConfigs[5]);
  const trailingX7 = useSpring(cursorX, dotConfigs[6]); const trailingY7 = useSpring(cursorY, dotConfigs[6]);
  const trailingX8 = useSpring(cursorX, dotConfigs[7]); const trailingY8 = useSpring(cursorY, dotConfigs[7]);
  const trailingX9 = useSpring(cursorX, dotConfigs[8]); const trailingY9 = useSpring(cursorY, dotConfigs[8]);
  const trailingX10 = useSpring(cursorX, dotConfigs[9]); const trailingY10 = useSpring(cursorY, dotConfigs[9]);

  const trailingDots = [
    { x: trailingX1, y: trailingY1, size: 6, opacity: 0.2 },
    { x: trailingX2, y: trailingY2, size: 5.5, opacity: 0.18 },
    { x: trailingX3, y: trailingY3, size: 5, opacity: 0.15 },
    { x: trailingX4, y: trailingY4, size: 4.5, opacity: 0.12 },
    { x: trailingX5, y: trailingY5, size: 4, opacity: 0.1 },
    { x: trailingX6, y: trailingY6, size: 3.5, opacity: 0.08 },
    { x: trailingX7, y: trailingY7, size: 3, opacity: 0.06 },
    { x: trailingX8, y: trailingY8, size: 2.5, opacity: 0.04 },
    { x: trailingX9, y: trailingY9, size: 2, opacity: 0.03 },
    { x: trailingX10, y: trailingY10, size: 1.5, opacity: 0.02 },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const moveTouch = (e: TouchEvent) => {
      if (e.touches[0]) {
        cursorX.set(e.touches[0].clientX);
        cursorY.set(e.touches[0].clientY);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, .orange-hover, .nav-arrow');
      const navArrow = target.closest('.nav-arrow');
      setIsHovering(!!clickable);
      setIsNavArrow(!!navArrow);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, .orange-hover, .nav-arrow');
      const navArrow = target.closest('.nav-arrow');
      setIsHovering(!!clickable);
      setIsNavArrow(!!navArrow);
      if (e.touches[0]) {
        cursorX.set(e.touches[0].clientX);
        cursorY.set(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        cursorX.set(e.touches[0].clientX);
        cursorY.set(e.touches[0].clientY);
        
        const target = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) as HTMLElement;
        if (target) {
          const clickable = target.closest('button, a, .orange-hover, .nav-arrow');
          const navArrow = target.closest('.nav-arrow');
          setIsHovering(!!clickable);
          setIsNavArrow(!!navArrow);
        }
      }
    };

    const handleTouchEnd = () => {
      setIsHovering(false);
      setIsNavArrow(false);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Trailing Dots (Only on Mobile) */}
      {isMobile && trailingDots.map((dot, index) => (
        <motion.div
          key={index}
          className="fixed top-0 left-0 z-[9998] pointer-events-none rounded-full bg-blue-500"
          style={{ 
            x: dot.x, 
            y: dot.y, 
            width: dot.size * 4, 
            height: dot.size * 4, 
            opacity: dot.opacity,
            translateX: '-50%', 
            translateY: '-50%' 
          }}
        />
      ))}

      <motion.div
        className="cursor-fixed-dot fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <AnimatePresence mode="wait">
          {isHovering ? (
            <motion.div 
              key="orange-cursor"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: isNavArrow ? (isMobile ? 0.3 : 0.5) : 0.7, 
                opacity: 1 
              }}
              exit={{ scale: 0, opacity: 0 }}
              className={`${isMobile ? 'w-12 h-12' : 'w-24 h-24'} rounded-full bg-orange-500/90 mix-blend-difference flex items-center justify-center`}
            >
              {!isNavArrow && (
                <span className={`${isMobile ? 'text-xs' : 'text-lg'} text-white font-bold uppercase tracking-widest`}>go</span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="dot-cursor"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`${isMobile ? 'w-8 h-8 bg-blue-500 opacity-80' : 'w-3 h-3 bg-black opacity-60'} rounded-full`}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

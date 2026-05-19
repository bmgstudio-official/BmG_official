import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, AnimatePresence, useSpring } from 'motion/react';

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isNavArrow, setIsNavArrow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // For trailing effect
  const trailing1X = useSpring(cursorX, { stiffness: 120, damping: 20 });
  const trailing1Y = useSpring(cursorY, { stiffness: 120, damping: 20 });
  const trailing2X = useSpring(cursorX, { stiffness: 100, damping: 22 });
  const trailing2Y = useSpring(cursorY, { stiffness: 100, damping: 22 });
  const trailing3X = useSpring(cursorX, { stiffness: 80, damping: 24 });
  const trailing3Y = useSpring(cursorY, { stiffness: 80, damping: 24 });
  const trailing4X = useSpring(cursorX, { stiffness: 60, damping: 26 });
  const trailing4Y = useSpring(cursorY, { stiffness: 60, damping: 26 });
  const trailing5X = useSpring(cursorX, { stiffness: 40, damping: 28 });
  const trailing5Y = useSpring(cursorY, { stiffness: 40, damping: 28 });

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
      {isMobile && (
        <>
          <motion.div
            className="fixed top-0 left-0 z-[9998] pointer-events-none w-6 h-6 rounded-full bg-blue-400 opacity-20"
            style={{ x: trailing1X, y: trailing1Y, translateX: '-50%', translateY: '-50%' }}
          />
          <motion.div
            className="fixed top-0 left-0 z-[9997] pointer-events-none w-5 h-5 rounded-full bg-blue-400 opacity-15"
            style={{ x: trailing2X, y: trailing2Y, translateX: '-50%', translateY: '-50%' }}
          />
          <motion.div
            className="fixed top-0 left-0 z-[9996] pointer-events-none w-4 h-4 rounded-full bg-blue-300 opacity-10"
            style={{ x: trailing3X, y: trailing3Y, translateX: '-50%', translateY: '-50%' }}
          />
          <motion.div
            className="fixed top-0 left-0 z-[9995] pointer-events-none w-3.5 h-3.5 rounded-full bg-blue-300 opacity-5"
            style={{ x: trailing4X, y: trailing4Y, translateX: '-50%', translateY: '-50%' }}
          />
          <motion.div
            className="fixed top-0 left-0 z-[9994] pointer-events-none w-3 h-3 rounded-full bg-blue-200 opacity-5"
            style={{ x: trailing5X, y: trailing5Y, translateX: '-50%', translateY: '-50%' }}
          />
        </>
      )}

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
                scale: isNavArrow ? (isMobile ? 0.3 : 0.5) : 0.8, 
                opacity: 1 
              }}
              exit={{ scale: 0, opacity: 0 }}
              className={`${isMobile ? 'w-16 h-16' : 'w-24 h-24'} rounded-full bg-orange-500/90 mix-blend-difference flex items-center justify-center`}
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

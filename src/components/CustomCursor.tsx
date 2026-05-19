import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'motion/react';

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isOrange, setIsOrange] = useState(false);
  const [isNavArrow, setIsNavArrow] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('button, a, .orange-hover, .nav-arrow');
      const navArrow = target.closest('.nav-arrow');
      setIsHovering(!!clickable);
      setIsNavArrow(!!navArrow);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="cursor-fixed-dot fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center sm:flex hidden"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <AnimatePresence>
        {isHovering ? (
          <motion.div 
            key="orange-cursor"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isNavArrow ? 0.6 : 1, 
              opacity: 1 
            }}
            exit={{ scale: 0, opacity: 0 }}
            className="w-32 h-32 rounded-full bg-orange-500/90 mix-blend-difference flex items-center justify-center"
          >
            {!isNavArrow && (
              <span className="text-white font-bold text-xl uppercase tracking-widest">go</span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dot-cursor"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 rounded-full bg-black opacity-60"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

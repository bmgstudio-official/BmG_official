import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, AnimatePresence, useSpring } from 'motion/react';

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isNavArrow, setIsNavArrow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // For trailing effect (6 dots for a denser, tighter trail on mobile)
  const dotConfigs = [
    { stiffness: 200, damping: 24 },
    { stiffness: 180, damping: 23 },
    { stiffness: 160, damping: 22 },
    { stiffness: 140, damping: 21 },
    { stiffness: 120, damping: 20 },
    { stiffness: 100, damping: 19 }
  ];

  const trailingX1 = useSpring(cursorX, dotConfigs[0]); const trailingY1 = useSpring(cursorY, dotConfigs[0]);
  const trailingX2 = useSpring(cursorX, dotConfigs[1]); const trailingY2 = useSpring(cursorY, dotConfigs[1]);
  const trailingX3 = useSpring(cursorX, dotConfigs[2]); const trailingY3 = useSpring(cursorY, dotConfigs[2]);
  const trailingX4 = useSpring(cursorX, dotConfigs[3]); const trailingY4 = useSpring(cursorY, dotConfigs[3]);
  const trailingX5 = useSpring(cursorX, dotConfigs[4]); const trailingY5 = useSpring(cursorY, dotConfigs[4]);
  const trailingX6 = useSpring(cursorX, dotConfigs[5]); const trailingY6 = useSpring(cursorY, dotConfigs[5]);

  const trailingDots = [
    { x: trailingX1, y: trailingY1, size: 6, opacity: 0.25 },
    { x: trailingX2, y: trailingY2, size: 5.2, opacity: 0.20 },
    { x: trailingX3, y: trailingY3, size: 4.4, opacity: 0.16 },
    { x: trailingX4, y: trailingY4, size: 3.6, opacity: 0.12 },
    { x: trailingX5, y: trailingY5, size: 2.8, opacity: 0.08 },
    { x: trailingX6, y: trailingY6, size: 2.0, opacity: 0.04 },
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const isInsideMedia = (x: number, y: number) => {
      const element = document.querySelector('.main-media-container.hover-enabled');
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      );
    };

    const handlePointerMove = (e: PointerEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const isInside = isInsideMedia(e.clientX, e.clientY);
      
      // On mobile, if touch-drag is occurring, force showing the orange circular cursor
      if (isMobile && e.pointerType === 'touch') {
        setIsHovering(true);
        setIsNavArrow(false);
        return;
      }

      if (isInside) {
        setIsHovering(true);
        setIsNavArrow(false);
        return;
      }

      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (target) {
        const clickable = target.closest('button, a, .orange-hover, .main-media-container.hover-enabled, .nav-arrow');
        const navArrow = target.closest('.nav-arrow');
        setIsHovering(!!clickable);
        setIsNavArrow(!!navArrow);
      } else {
        setIsHovering(false);
        setIsNavArrow(false);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const isInside = isInsideMedia(e.clientX, e.clientY);

      // On mobile, touch-drag anywhere shows the orange circle cursor
      if (isMobile) {
        setIsHovering(true);
        setIsNavArrow(false);
        return;
      }

      if (isInside) {
        setIsHovering(true);
        setIsNavArrow(false);
        return;
      }

      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (target) {
        const clickable = target.closest('button, a, .orange-hover, .main-media-container.hover-enabled, .nav-arrow');
        const navArrow = target.closest('.nav-arrow');
        setIsHovering(!!clickable);
        setIsNavArrow(!!navArrow);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const isInside = isInsideMedia(e.clientX, e.clientY);
      if (isInside) {
        setIsHovering(true);
        setIsNavArrow(false);
        return;
      }
      setIsHovering(false);
      setIsNavArrow(false);
    };

    window.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
    window.addEventListener('pointermove', handlePointerMove, { capture: true, passive: true });
    window.addEventListener('pointerup', handlePointerUp, { capture: true, passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { capture: true, passive: true });
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      window.removeEventListener('pointermove', handlePointerMove, { capture: true });
      window.removeEventListener('pointerup', handlePointerUp, { capture: true });
      window.removeEventListener('pointercancel', handlePointerUp, { capture: true });
    };
  }, [cursorX, cursorY, isMobile]);

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
                scale: isNavArrow ? (isMobile ? 0.4 : 0.5) : 1, 
                opacity: 1 
              }}
              exit={{ scale: 0, opacity: 0 }}
              className={`${isMobile ? 'w-[72px] h-[72px]' : 'w-[84px] h-[84px]'} rounded-full bg-orange-500/90 mix-blend-difference flex items-center justify-center`}
            >
              {!isNavArrow && (
                <span className={`${isMobile ? 'text-sm' : 'text-base'} text-white font-bold uppercase tracking-widest`}>go</span>
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

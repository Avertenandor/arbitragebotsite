'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  // Основная позиция курсора (быстрая)
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  // Плавная позиция для внешнего кольца (с задержкой)
  const springConfig = { stiffness: 300, damping: 25 };
  const cursorXDelayed = useSpring(cursorX, springConfig);
  const cursorYDelayed = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Проверка на сенсорное устройство
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (hasCoarsePointer) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Проверка на интерактивный элемент
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button' ||
        target.style.cursor === 'pointer';

      setIsHovering(!!isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Скрываем стандартный курсор
    document.body.style.cursor = 'none';
    document.querySelectorAll('*').forEach((el) => {
      (el as HTMLElement).style.cursor = 'none';
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = 'auto';
      document.querySelectorAll('*').forEach((el) => {
        (el as HTMLElement).style.cursor = '';
      });
    };
  }, [cursorX, cursorY]);

  if (!isVisible) return null;

  return (
    <>
      {/* Внешнее кольцо (с задержкой) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: cursorXDelayed,
          y: cursorYDelayed,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          animate={{
            scale: isClicking ? 0.7 : isHovering ? 1.8 : 1,
            opacity: isClicking ? 0.5 : isHovering ? 1 : 0.6,
          }}
          transition={{ 
            type: 'spring',
            stiffness: 400,
            damping: 25
          }}
          className="w-8 h-8 rounded-full border-2"
          style={{
            borderColor: isHovering 
              ? 'rgba(0, 217, 255, 0.9)' 
              : 'rgba(255, 255, 255, 0.4)',
            boxShadow: isHovering
              ? '0 0 24px rgba(0, 217, 255, 0.6), 0 0 48px rgba(0, 217, 255, 0.3)'
              : '0 0 8px rgba(255, 255, 255, 0.2)',
          }}
        />
      </motion.div>

      {/* Центральная точка (быстрая) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          animate={{
            scale: isClicking ? 0.5 : isHovering ? 1.2 : 1,
            opacity: isClicking ? 0.8 : 1,
          }}
          transition={{ 
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: isHovering 
              ? 'rgba(0, 217, 255, 1)' 
              : 'rgba(255, 255, 255, 0.95)',
            boxShadow: isHovering
              ? '0 0 12px rgba(0, 217, 255, 1), 0 0 24px rgba(0, 217, 255, 0.5)'
              : '0 0 8px rgba(255, 255, 255, 0.8)',
          }}
        />
      </motion.div>

      {/* Эффект при наведении (упрощённый) */}
      {isHovering && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9997]"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: '-50%',
            translateY: '-50%',
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: 2.5, 
              opacity: 0 
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className="w-8 h-8 rounded-full border-2"
            style={{
              borderColor: 'rgba(0, 217, 255, 0.4)',
            }}
          />
        </motion.div>
      )}
    </>
  );
}

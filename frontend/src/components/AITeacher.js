import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const AITeacher = ({ tip, mbtiType }) => {
  const [showTip, setShowTip] = useState(false);
  
  // Mouse follow effect
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate relative position (within a limited range)
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Limit movement range
      const maxMove = 20;
      const moveX = ((e.clientX - centerX) / centerX) * maxMove;
      const moveY = ((e.clientY - centerY) / centerY) * maxMove;
      
      cursorX.set(moveX);
      cursorY.set(moveY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (tip) {
      setShowTip(true);
      const timer = setTimeout(() => setShowTip(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [tip]);

  return (
    <div className="relative" data-testid="ai-teacher-component">
      {/* AI Teacher Avatar */}
      <motion.div
        style={{ x, y }}
        className="relative"
        data-testid="ai-teacher-avatar"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 via-cyan-500 to-lime-500 p-1"
        >
          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <span className="text-4xl">🤖</span>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Sparkle effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles size={16} className="text-cyan-400" />
        </motion.div>
      </motion.div>

      {/* Speech Bubble */}
      {showTip && tip && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-80 max-w-[90vw]"
          data-testid="ai-teacher-tip-bubble"
        >
          <div className="glass-strong p-4 rounded-2xl border border-cyan-500/30 relative">
            {/* Arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/10 backdrop-blur-lg rotate-45 border-l border-t border-cyan-500/30"></div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <p className="text-xs text-cyan-400 font-medium mb-1" data-testid="ai-teacher-mbti">
                  {mbtiType} AI Teacher
                </p>
                <p className="text-sm text-white leading-relaxed" data-testid="ai-teacher-tip-text">
                  {tip}
                </p>
              </div>
              <button
                onClick={() => setShowTip(false)}
                data-testid="ai-teacher-close-tip"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AITeacher;

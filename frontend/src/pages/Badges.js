import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

const Badges = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const res = await api.get('/badges');
      setBadges(res.data);
    } catch (error) {
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;
  const progressPercent = (unlockedCount / totalCount) * 100;

  if (loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center pt-24" data-testid="badges-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-lime-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg pt-24 pb-12" data-testid="badges-page">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Award className="text-lime-400" size={40} />
            <h1 className="text-4xl md:text-5xl font-bold neon-lime" data-testid="badges-title">Badges</h1>
          </div>
          <p className="text-gray-400" data-testid="badges-subtitle">Collect achievements as you progress</p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card mb-12"
          data-testid="badges-progress-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Collection Progress</p>
              <p className="text-3xl font-bold neon-lime" data-testid="badges-count">
                {unlockedCount} / {totalCount}
              </p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl"
            >
              🏆
            </motion.div>
          </div>
          
          <div className="xp-bar">
            <motion.div
              className="xp-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              data-testid="badges-progress-bar"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{progressPercent.toFixed(0)}% Complete</p>
        </motion.div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: badge.unlocked ? 1.1 : 1.05, y: -8 }}
              data-testid={`badge-${index}`}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={`cyber-card p-6 text-center cursor-pointer transition-all ${
                        badge.unlocked
                          ? 'border-2 border-lime-500/50 bg-lime-500/5 badge-unlocked'
                          : 'badge-locked'
                      }`}
                    >
                      <div className="relative inline-block">
                        <div className="text-6xl mb-3" data-testid={`badge-icon-${index}`}>{badge.icon}</div>
                        {!badge.unlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="text-gray-600" size={32} />
                          </div>
                        )}
                      </div>
                      <h3 className={`font-bold mb-1 ${
                        badge.unlocked ? 'text-lime-400' : 'text-gray-600'
                      }`} data-testid={`badge-name-${index}`}>
                        {badge.name}
                      </h3>
                      <p className={`text-xs ${
                        badge.unlocked ? 'text-gray-400' : 'text-gray-700'
                      }`} data-testid={`badge-description-${index}`}>
                        {badge.description}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent data-testid={`badge-tooltip-${index}`}>
                    <p className="font-semibold mb-1">{badge.name}</p>
                    <p className="text-sm text-gray-400">{badge.requirement}</p>
                    {badge.unlocked && (
                      <p className="text-xs text-lime-400 mt-1">✓ Unlocked!</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-gray-400"
          data-testid="badges-footer"
        >
          🎯 Keep completing quizzes and challenges to unlock more badges!
        </motion.div>
      </div>
    </div>
  );
};

export default Badges;

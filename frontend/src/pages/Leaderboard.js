import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/leaderboard');
      setLeaderboard(res.data.leaderboard);
      setMyRank(res.data.myRank);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-amber-600 to-amber-700';
    return 'from-cyan-500 to-purple-500';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  if (loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center pt-24" data-testid="leaderboard-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg pt-24 pb-12" data-testid="leaderboard-page">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-3 mb-8"
        >
          <Trophy className="text-purple-400" size={40} />
          <h1 className="text-4xl md:text-5xl font-bold neon-purple" data-testid="leaderboard-title">Leaderboard</h1>
        </motion.div>

        {/* My Rank Card */}
        {myRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card mb-8 border-2 border-cyan-500/50"
            data-testid="my-rank-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-gray-900" data-testid="my-rank">
                  {myRank}
                </div>
                <div>
                  <p className="font-semibold text-cyan-400">Your Rank</p>
                  <p className="text-sm text-gray-400">Keep climbing!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold neon-lime" data-testid="my-xp">{user?.xp || 0}</p>
                <p className="text-xs text-gray-400">XP</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaderboard.map((student, index) => {
            const isMe = student.id === user?.id;
            
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`cyber-card flex items-center justify-between ${
                  isMe ? 'border-2 border-cyan-500/50 bg-cyan-500/10' : ''
                }`}
                data-testid={`leaderboard-rank-${index + 1}`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  {/* Rank */}
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(student.rank)} flex items-center justify-center font-bold text-gray-900 text-lg`}
                    data-testid={`rank-badge-${index + 1}`}
                  >
                    {getRankIcon(student.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <p className={`font-semibold ${isMe ? 'text-cyan-400' : 'text-white'}`} data-testid={`username-${index + 1}`}>
                      {student.username} {isMe && '(You)'}
                    </p>
                    <p className="text-sm text-gray-400" data-testid={`level-${index + 1}`}>Level {student.level}</p>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <p className="text-xl font-bold neon-lime" data-testid={`xp-${index + 1}`}>{student.xp}</p>
                    <p className="text-xs text-gray-400">XP</p>
                  </div>
                </div>

                {/* Top 3 Badges */}
                {student.rank <= 3 && (
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="ml-4"
                  >
                    {student.rank === 1 && <Trophy className="text-yellow-400" size={28} />}
                    {student.rank === 2 && <Medal className="text-gray-300" size={28} />}
                    {student.rank === 3 && <Medal className="text-amber-600" size={28} />}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-gray-400"
        >
          <TrendingUp className="inline-block mr-2 text-cyan-400" size={20} />
          <span data-testid="leaderboard-footer">Complete quizzes to climb the ranks!</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;

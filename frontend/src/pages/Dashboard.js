import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import AITeacher from '../components/AITeacher';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Progress } from '../components/ui/progress';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [aiTip, setAiTip] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    fetchAITip();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
      
      // Update user context with latest XP/Level
      updateUser({ xp: res.data.xp, level: res.data.level, streak: res.data.streak });
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAITip = async () => {
    try {
      const res = await api.post('/ai-teacher/tip', {});
      setAiTip(res.data.tip);
    } catch (error) {
      console.error('Failed to fetch AI tip');
    }
  };

  const xpForNextLevel = (stats?.level || 1) * 1000;
  const xpProgress = ((stats?.xp || 0) % 1000) / 10; // Percentage

  if (loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center" data-testid="dashboard-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg pt-24 pb-12" data-testid="dashboard-page">
      <div className="container mx-auto px-4">
        {/* Header with AI Teacher */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-2"
              data-testid="dashboard-welcome-title"
            >
              Welcome back, <span className="neon-cyan">{user?.username}</span>!
            </motion.h1>
            <p className="text-gray-400" data-testid="dashboard-subtitle">Ready to level up today?</p>
          </div>

          <AITeacher tip={aiTip} mbtiType={user?.mbtiType || 'ENFP'} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* XP & Level Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card col-span-1 md:col-span-2"
            data-testid="dashboard-xp-card"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Level</p>
                <p className="text-3xl font-bold neon-cyan" data-testid="dashboard-level">{stats?.level || 1}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">XP</p>
                <p className="text-2xl font-bold text-lime-400" data-testid="dashboard-xp">{stats?.xp || 0}</p>
                <p className="text-xs text-gray-500">/ {xpForNextLevel} to next level</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="xp-bar">
                <motion.div
                  className="xp-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  data-testid="dashboard-xp-bar"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">{xpProgress.toFixed(0)}% to Level {(stats?.level || 1) + 1}</p>
            </div>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cyber-card flex flex-col items-center justify-center"
            data-testid="dashboard-streak-card"
          >
            <div className="streak-ring mb-3" style={{ '--progress': `${Math.min((stats?.streak || 0) / 7 * 100, 100)}%` }}>
              <div className="relative z-10 flex flex-col items-center">
                <Zap className="text-lime-400 mb-1" size={32} />
                <p className="text-3xl font-bold neon-lime" data-testid="dashboard-streak-count">{stats?.streak || 0}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">Day Streak 🔥</p>
          </motion.div>
        </div>

        {/* Daily Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-card mb-8"
          data-testid="dashboard-daily-quests"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Target className="text-purple-400" size={24} />
            <h2 className="text-2xl font-bold">Daily Quests</h2>
          </div>
          
          <div className="space-y-4">
            {stats?.dailyQuests?.map((quest, idx) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className={`p-4 rounded-xl border transition-all ${
                  quest.completed
                    ? 'bg-lime-500/10 border-lime-500/50'
                    : 'bg-white/5 border-white/10'
                }`}
                data-testid={`daily-quest-${idx}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      quest.completed ? 'border-lime-400 bg-lime-400' : 'border-gray-600'
                    }`}>
                      {quest.completed && <span className="text-gray-900 text-sm">✓</span>}
                    </div>
                    <p className="font-medium" data-testid={`quest-description-${idx}`}>{quest.description}</p>
                  </div>
                  <p className="text-lime-400 font-semibold" data-testid={`quest-reward-${idx}`}>+{quest.xpReward} XP</p>
                </div>
                <Progress value={(quest.progress / quest.target) * 100} className="h-2" />
                <p className="text-xs text-gray-400 mt-1" data-testid={`quest-progress-${idx}`}>
                  {quest.progress} / {quest.target}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Target, label: 'Start Quiz', color: 'cyan', path: '/quizzes', testId: 'quick-action-quizzes' },
            { icon: TrendingUp, label: 'Leaderboard', color: 'purple', path: '/leaderboard', testId: 'quick-action-leaderboard' },
            { icon: Sparkles, label: 'MBTI Tips', color: 'lime', path: '/mbti', testId: 'quick-action-mbti' }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(action.path)}
                data-testid={action.testId}
                className={`cyber-card p-6 flex flex-col items-center space-y-3 cursor-pointer border-${action.color}-500/30 hover:border-${action.color}-500/70 transition-all`}
              >
                <Icon className={`text-${action.color}-400`} size={40} />
                <p className="font-semibold">{action.label}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

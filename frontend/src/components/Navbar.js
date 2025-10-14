import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Trophy, Brain, Award, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', testId: 'nav-dashboard' },
    { path: '/quizzes', icon: BookOpen, label: 'Quizzes', testId: 'nav-quizzes' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard', testId: 'nav-leaderboard' },
    { path: '/mbti', icon: Brain, label: 'MBTI', testId: 'nav-mbti' },
    { path: '/badges', icon: Award, label: 'Badges', testId: 'nav-badges' },
    { path: '/profile', icon: User, label: 'Profile', testId: 'nav-profile' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-cyan-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" data-testid="nav-logo" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-lime-400 flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-gray-900">🎯</span>
            </motion.div>
            <span className="text-xl font-bold neon-cyan hidden sm:block">ExamQuest</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path} data-testid={item.testId}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'text-gray-400 hover:text-cyan-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white" data-testid="nav-username">{user?.username}</p>
              <p className="text-xs text-cyan-400" data-testid="nav-level">Level {user?.level || 1}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              data-testid="nav-logout-btn"
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex justify-around pb-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link key={item.path} to={item.path} data-testid={`${item.testId}-mobile`}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-lg ${
                    isActive ? 'text-cyan-400' : 'text-gray-500'
                  }`}
                >
                  <Icon size={20} />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

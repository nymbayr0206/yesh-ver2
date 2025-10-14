import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Trophy, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Landing = () => {
  const { register, login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    grade: 11
  });
  const [loading, setLoading] = useState(false);

  // Floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        toast.success('Welcome back! 🎮');
      } else {
        await register(formData.email, formData.username, formData.password, formData.grade);
        toast.success('Account created! Let\'s start your journey! 🚀');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-bg overflow-hidden relative" data-testid="landing-page">
      {/* Animated Background Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="particle"
          initial={{ x: `${particle.x}vw`, y: `${particle.y}vh`, opacity: 0 }}
          animate={{
            y: [`${particle.y}vh`, `${particle.y - 20}vh`, `${particle.y}vh`],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut'
          }}
          style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
        />
      ))}

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Side - Hero */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-4" data-testid="landing-title">
                <span className="neon-cyan">Exam</span>
                <span className="neon-lime">Quest</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-6" data-testid="landing-subtitle">
                Level Up Your <span className="neon-purple font-semibold">Entrance Exam</span> Skills
              </p>
            </motion.div>

            <div className="flex items-center space-x-6 text-gray-400">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-2"
              >
                <Zap className="text-lime-400" size={24} />
                <span>Gamified Learning</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-2"
              >
                <Brain className="text-purple-400" size={24} />
                <span>AI Teacher</span>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center space-x-2"
              >
                <Trophy className="text-cyan-400" size={24} />
                <span>Leaderboards</span>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-8">
              {[
                { icon: '🎯', text: 'Daily Quests' },
                { icon: '⭐', text: 'XP & Levels' },
                { icon: '🏆', text: 'Badges' }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="cyber-card text-center p-4"
                >
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <p className="text-sm text-gray-400">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-strong p-8 rounded-3xl border-2 border-cyan-500/30"
            data-testid="auth-form-container"
          >
            <div className="flex items-center justify-center mb-6">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-lime-400 flex items-center justify-center"
              >
                <Sparkles className="text-gray-900" size={32} />
              </motion.div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2 neon-cyan" data-testid="auth-form-title">
              {isLogin ? 'Welcome Back!' : 'Start Your Journey'}
            </h2>
            <p className="text-center text-gray-400 mb-6">
              {isLogin ? 'Log in to continue your quest' : 'Create your account and level up'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="auth-email-input"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-cyan-500/30 text-white mt-1"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  data-testid="auth-username-input"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="bg-white/5 border-cyan-500/30 text-white mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  data-testid="auth-password-input"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="bg-white/5 border-cyan-500/30 text-white mt-1"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="grade" className="text-gray-300">Grade</Label>
                  <Select
                    value={formData.grade.toString()}
                    onValueChange={(value) => setFormData({ ...formData, grade: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-white/5 border-cyan-500/30 text-white mt-1" data-testid="auth-grade-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="11">Grade 11</SelectItem>
                      <SelectItem value="12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                data-testid="auth-submit-btn"
                className="w-full btn-cyber h-12 text-base font-semibold"
              >
                {loading ? 'Loading...' : (isLogin ? 'Log In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                data-testid="auth-toggle-btn"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

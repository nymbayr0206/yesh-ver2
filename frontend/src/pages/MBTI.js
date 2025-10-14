import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Star } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const MBTI = () => {
  const { user, updateUser } = useAuth();
  const [mbtiTypes, setMbtiTypes] = useState([]);
  const [selectedMBTI, setSelectedMBTI] = useState(user?.mbtiType || '');
  const [currentType, setCurrentType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMBTITypes();
  }, []);

  useEffect(() => {
    if (selectedMBTI) {
      fetchMBTIDetails(selectedMBTI);
    }
  }, [selectedMBTI]);

  const fetchMBTITypes = async () => {
    try {
      const res = await api.get('/mbti/types');
      setMbtiTypes(res.data);
      
      if (user?.mbtiType) {
        setSelectedMBTI(user.mbtiType);
      }
    } catch (error) {
      toast.error('Failed to load MBTI types');
    } finally {
      setLoading(false);
    }
  };

  const fetchMBTIDetails = async (code) => {
    try {
      const res = await api.get(`/mbti/${code}`);
      setCurrentType(res.data);
    } catch (error) {
      console.error('Failed to fetch MBTI details');
    }
  };

  const handleSaveMBTI = async () => {
    if (!selectedMBTI) {
      toast.error('Please select an MBTI type');
      return;
    }

    try {
      await api.put('/student/mbti', null, { params: { mbti_code: selectedMBTI } });
      updateUser({ mbtiType: selectedMBTI });
      toast.success('MBTI type updated!');
    } catch (error) {
      toast.error('Failed to update MBTI type');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center pt-24" data-testid="mbti-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg pt-24 pb-12" data-testid="mbti-page">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Brain className="text-purple-400" size={40} />
            <h1 className="text-4xl md:text-5xl font-bold neon-purple" data-testid="mbti-title">MBTI Types</h1>
          </div>
          <p className="text-gray-400" data-testid="mbti-subtitle">
            Discover your personality type and get personalized study tips
          </p>
        </motion.div>

        {/* MBTI Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card mb-8"
          data-testid="mbti-selector-card"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="text-sm text-gray-400 mb-2 block">Select Your MBTI Type</label>
              <Select value={selectedMBTI} onValueChange={setSelectedMBTI}>
                <SelectTrigger className="w-full bg-white/5 border-purple-500/30 text-white" data-testid="mbti-select">
                  <SelectValue placeholder="Choose MBTI Type" />
                </SelectTrigger>
                <SelectContent>
                  {mbtiTypes.map(type => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.code} - {type.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSaveMBTI}
              data-testid="mbti-save-btn"
              className="btn-cyber h-12 px-8"
              disabled={selectedMBTI === user?.mbtiType}
            >
              Save
            </Button>
          </div>
        </motion.div>

        {/* MBTI Details */}
        {currentType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Type Info Card */}
            <div className="cyber-card" data-testid="mbti-details-card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold neon-cyan mb-1" data-testid="mbti-code">{currentType.code}</h2>
                  <p className="text-xl text-purple-400" data-testid="mbti-type-title">{currentType.title}</p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="text-lime-400" size={32} />
                </motion.div>
              </div>
              <p className="text-gray-300 leading-relaxed" data-testid="mbti-description">{currentType.description}</p>
            </div>

            {/* Study Tips Card */}
            <div className="cyber-card border-2 border-lime-500/30" data-testid="mbti-tips-card">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="text-lime-400" size={24} />
                <h3 className="text-2xl font-bold neon-lime">Personalized Study Tips</h3>
              </div>
              <p className="text-white leading-relaxed" data-testid="mbti-tips">{currentType.tips}</p>
            </div>

            {/* Traits Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentType.code.split('').map((trait, idx) => {
                const traitNames = {
                  'E': 'Extrovert', 'I': 'Introvert',
                  'N': 'Intuitive', 'S': 'Sensing',
                  'F': 'Feeling', 'T': 'Thinking',
                  'J': 'Judging', 'P': 'Perceiving'
                };
                
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="cyber-card text-center p-4"
                    data-testid={`mbti-trait-${idx}`}
                  >
                    <div className="text-3xl font-bold neon-cyan mb-1">{trait}</div>
                    <div className="text-xs text-gray-400">{traitNames[trait]}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* All Types Overview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">All MBTI Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mbtiTypes.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMBTI(type.code)}
                data-testid={`mbti-type-${type.code}`}
                className={`cyber-card p-4 text-center transition-all ${
                  selectedMBTI === type.code
                    ? 'border-2 border-purple-500/70 bg-purple-500/10'
                    : 'hover:border-purple-500/50'
                }`}
              >
                <p className="font-bold text-lg neon-cyan">{type.code}</p>
                <p className="text-xs text-gray-400 mt-1">{type.title}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MBTI;

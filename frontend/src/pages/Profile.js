import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, GraduationCap, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    grade: user?.grade || 11
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/profile', formData);
      updateUser(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-bg pt-24 pb-12" data-testid="profile-page">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-3">
            <User className="text-cyan-400" size={40} />
            <h1 className="text-4xl md:text-5xl font-bold neon-cyan" data-testid="profile-title">Profile</h1>
          </div>
          <p className="text-gray-400" data-testid="profile-subtitle">Manage your account settings</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card"
          data-testid="profile-card"
        >
          {/* Avatar Section */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="inline-block"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-lime-400 p-1 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <User className="text-white" size={64} />
                </div>
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold neon-cyan mb-1" data-testid="profile-username-display">{user?.username}</h2>
            <p className="text-purple-400" data-testid="profile-mbti-display">{user?.mbtiType || 'No MBTI set'}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center cyber-card p-4">
              <p className="text-3xl font-bold neon-lime" data-testid="profile-level-stat">{user?.level || 1}</p>
              <p className="text-xs text-gray-400">Level</p>
            </div>
            <div className="text-center cyber-card p-4">
              <p className="text-3xl font-bold neon-cyan" data-testid="profile-xp-stat">{user?.xp || 0}</p>
              <p className="text-xs text-gray-400">XP</p>
            </div>
            <div className="text-center cyber-card p-4">
              <p className="text-3xl font-bold neon-purple" data-testid="profile-streak-stat">{user?.streak || 0}</p>
              <p className="text-xs text-gray-400">Streak</p>
            </div>
          </div>

          {/* Edit Toggle */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              data-testid="profile-edit-toggle-btn"
              variant="outline"
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Edit2 size={16} className="mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {/* Profile Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300 flex items-center space-x-2 mb-2">
                <User size={16} />
                <span>Username</span>
              </Label>
              <Input
                id="username"
                data-testid="profile-username-input"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                disabled={!isEditing}
                className="bg-white/5 border-cyan-500/30 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300 flex items-center space-x-2 mb-2">
                <Mail size={16} />
                <span>Email</span>
              </Label>
              <Input
                id="email"
                type="email"
                data-testid="profile-email-input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="bg-white/5 border-cyan-500/30 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <Label htmlFor="grade" className="text-gray-300 flex items-center space-x-2 mb-2">
                <GraduationCap size={16} />
                <span>Grade</span>
              </Label>
              <Select
                value={formData.grade.toString()}
                onValueChange={(value) => setFormData({ ...formData, grade: parseInt(value) })}
                disabled={!isEditing}
              >
                <SelectTrigger 
                  className="bg-white/5 border-cyan-500/30 text-white disabled:opacity-50" 
                  data-testid="profile-grade-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  data-testid="profile-save-btn"
                  className="w-full btn-cyber h-12 text-base font-semibold"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="cyber-card mt-6"
          data-testid="profile-account-info"
        >
          <h3 className="font-bold mb-3">Account Information</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <p data-testid="profile-created-at">Member since: {new Date(user?.createdAt).toLocaleDateString()}</p>
            <p data-testid="profile-grade-display">Current Grade: {user?.grade}</p>
            <p data-testid="profile-mbti-info">MBTI Type: {user?.mbtiType || 'Not set'}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

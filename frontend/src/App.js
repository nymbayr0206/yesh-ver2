import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Quizzes from './pages/Quizzes';
import Leaderboard from './pages/Leaderboard';
import MBTI from './pages/MBTI';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <><Navbar /><Dashboard /></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <><Navbar /><Quizzes /></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <><Navbar /><Leaderboard /></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mbti"
          element={
            <ProtectedRoute>
              <><Navbar /><MBTI /></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/badges"
          element={
            <ProtectedRoute>
              <><Navbar /><Badges /></>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <><Navbar /><Profile /></>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

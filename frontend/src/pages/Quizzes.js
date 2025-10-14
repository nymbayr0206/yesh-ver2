import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle, Zap } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Quizzes = () => {
  const { user, updateUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
    fetchQuizzes();
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (error) {
      console.error('Failed to fetch subjects');
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const params = selectedSubject !== 'all' ? `?subject=${selectedSubject}` : '';
      const res = await api.get(`/quizzes${params}`);
      setQuizzes(res.data);
      if (res.data.length > 0 && !currentQuiz) {
        setCurrentQuiz(res.data[0]);
      }
    } catch (error) {
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index) => {
    if (!showResult) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }

    try {
      const res = await api.post('/quizzes/attempt', {
        quizId: currentQuiz.id,
        selectedAnswer
      });

      setResult(res.data);
      setShowResult(true);

      if (res.data.isCorrect) {
        toast.success(`Correct! +${res.data.xpEarned} XP`);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        toast.error('Incorrect answer');
      }

      if (res.data.leveledUp) {
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 }
          });
          toast.success(`🎉 Level Up! You're now Level ${res.data.newLevel}!`);
        }, 500);
      }

      // Update user context
      updateUser({ xp: res.data.newXp, level: res.data.newLevel });

    } catch (error) {
      toast.error('Failed to submit answer');
    }
  };

  const handleNextQuiz = () => {
    const currentIndex = quizzes.findIndex(q => q.id === currentQuiz.id);
    const nextIndex = (currentIndex + 1) % quizzes.length;
    
    setCurrentQuiz(quizzes[nextIndex]);
    setSelectedAnswer(null);
    setShowResult(false);
    setResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center pt-24" data-testid="quizzes-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-bg pt-24 pb-12" data-testid="quizzes-page">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="text-cyan-400" size={32} />
            <h1 className="text-4xl font-bold neon-cyan" data-testid="quizzes-title">Quizzes</h1>
          </div>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-48 bg-white/5 border-cyan-500/30 text-white" data-testid="subject-filter">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.name}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Quiz Card */}
        {currentQuiz && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card p-8"
            data-testid="quiz-card"
          >
            <div className="flex justify-between items-center mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                currentQuiz.difficulty === 'easy' ? 'bg-lime-500/20 text-lime-400' :
                currentQuiz.difficulty === 'medium' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-purple-500/20 text-purple-400'
              }`} data-testid="quiz-difficulty">
                {currentQuiz.difficulty}
              </span>
              <div className="flex items-center space-x-2 text-lime-400">
                <Zap size={16} />
                <span className="font-semibold" data-testid="quiz-xp-reward">{currentQuiz.xp} XP</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-8 leading-relaxed" data-testid="quiz-question">
              {currentQuiz.question}
            </h2>

            <div className="space-y-4 mb-8">
              {currentQuiz.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = result && result.correctAnswer === index;
                const isWrong = result && selectedAnswer === index && !result.isCorrect;

                return (
                  <motion.button
                    key={index}
                    whileHover={{ scale: showResult ? 1 : 1.02 }}
                    whileTap={{ scale: showResult ? 1 : 0.98 }}
                    onClick={() => handleAnswerSelect(index)}
                    data-testid={`quiz-option-${index}`}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isCorrect ? 'bg-lime-500/20 border-lime-500 text-lime-400' :
                      isWrong ? 'bg-red-500/20 border-red-500 text-red-400' :
                      isSelected ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' :
                      'bg-white/5 border-white/10 text-white hover:border-cyan-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex-1">{option}</span>
                      {isCorrect && <CheckCircle size={20} />}
                      {isWrong && <XCircle size={20} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {!showResult ? (
                <motion.div
                  key="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    onClick={handleSubmitAnswer}
                    data-testid="quiz-submit-btn"
                    disabled={selectedAnswer === null}
                    className="w-full btn-cyber h-12 text-base font-semibold"
                  >
                    Submit Answer
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className={`p-4 rounded-xl ${
                    result.isCorrect ? 'bg-lime-500/20 border border-lime-500/50' : 'bg-red-500/20 border border-red-500/50'
                  }`}>
                    <p className={`font-semibold mb-2 ${result.isCorrect ? 'text-lime-400' : 'text-red-400'}`} data-testid="quiz-result">
                      {result.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                    </p>
                    <p className="text-sm text-gray-300" data-testid="quiz-xp-earned">
                      {result.isCorrect ? `You earned ${result.xpEarned} XP!` : 'Keep trying! You'll get it next time.'}\n                    </p>
                    {result.leveledUp && (
                      <p className="text-sm text-cyan-400 font-semibold mt-2" data-testid="quiz-level-up">
                        🎉 Level Up! You're now Level {result.newLevel}!
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleNextQuiz}
                    data-testid="quiz-next-btn"
                    className="w-full btn-cyber h-12 text-base font-semibold"
                  >
                    Next Quiz
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Quiz Counter */}
        <div className="text-center mt-6 text-gray-400" data-testid="quiz-counter">
          Quiz {quizzes.findIndex(q => q.id === currentQuiz?.id) + 1} of {quizzes.length}
        </div>
      </div>
    </div>
  );
};

export default Quizzes;

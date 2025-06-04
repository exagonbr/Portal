'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Clock,
  Trophy,
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Star,
  Target,
  Zap,
  Brain,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Quiz {
  id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: number;
  timeLimit: number; // em minutos
  xpReward: number;
  description: string;
  completed: boolean;
  bestScore?: number;
  attempts: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function StudentQuizPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      finishQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isPlaying]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      
      // Dados simulados
      const mockQuizzes: Quiz[] = [
        {
          id: '1',
          title: 'Frações e Decimais',
          subject: 'Matemática',
          difficulty: 'easy',
          questions: 10,
          timeLimit: 15,
          xpReward: 50,
          description: 'Teste seus conhecimentos sobre frações e conversões para decimais',
          completed: false,
          attempts: 0
        },
        {
          id: '2',
          title: 'Verbos e Conjugações',
          subject: 'Português',
          difficulty: 'medium',
          questions: 15,
          timeLimit: 20,
          xpReward: 75,
          description: 'Quiz sobre conjugação verbal e tempos verbais',
          completed: true,
          bestScore: 85,
          attempts: 2
        },
        {
          id: '3',
          title: 'Sistema Solar',
          subject: 'Ciências',
          difficulty: 'easy',
          questions: 12,
          timeLimit: 18,
          xpReward: 60,
          description: 'Explore seus conhecimentos sobre planetas e astronomia',
          completed: false,
          attempts: 1
        },
        {
          id: '4',
          title: 'Brasil Colonial',
          subject: 'História',
          difficulty: 'hard',
          questions: 20,
          timeLimit: 30,
          xpReward: 100,
          description: 'Desafio sobre o período colonial brasileiro',
          completed: false,
          attempts: 0
        }
      ];

      setQuizzes(mockQuizzes);
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: Quiz['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getDifficultyText = (difficulty: Quiz['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Médio';
      case 'hard':
        return 'Difícil';
      default:
        return 'Desconhecido';
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsPlaying(true);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(quiz.timeLimit * 60);
    setAnswers([]);
    setShowResult(false);
    
    // Gerar questões simuladas
    const mockQuestions: Question[] = Array.from({ length: quiz.questions }, (_, i) => ({
      id: `q${i + 1}`,
      question: `Questão ${i + 1} sobre ${quiz.subject}: Esta é uma pergunta de exemplo para testar seus conhecimentos.`,
      options: [
        'Opção A - Primeira alternativa',
        'Opção B - Segunda alternativa',
        'Opção C - Terceira alternativa',
        'Opção D - Quarta alternativa'
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: 'Esta é a explicação da resposta correta para esta questão.'
    }));
    
    setQuestions(mockQuestions);
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      
      if (selectedAnswer === questions[currentQuestion].correctAnswer) {
        setScore(score + 1);
      }
      
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        finishQuiz();
      }
    }
  };

  const finishQuiz = () => {
    setIsPlaying(false);
    setShowResult(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showResult && selectedQuiz) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            {percentage >= 80 ? (
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            ) : percentage >= 60 ? (
              <Award className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            ) : (
              <Target className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            )}
            
            <h1 className="text-3xl font-bold text-gray-700 mb-2">Quiz Finalizado!</h1>
            <p className="text-gray-600">{selectedQuiz.title}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Pontuação</p>
              <p className={`text-3xl font-bold ${getScoreColor(percentage)}`}>
                {score}/{questions.length}
              </p>
              <p className="text-sm text-gray-500">{percentage}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">XP Ganho</p>
              <p className="text-3xl font-bold text-purple-600">
                +{Math.round((selectedQuiz.xpReward * percentage) / 100)}
              </p>
              <p className="text-sm text-gray-500">de {selectedQuiz.xpReward} XP</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Tempo</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatTime((selectedQuiz.timeLimit * 60) - timeLeft)}
              </p>
              <p className="text-sm text-gray-500">de {selectedQuiz.timeLimit} min</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => startQuiz(selectedQuiz)}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Tentar Novamente
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isPlaying && selectedQuiz) {
    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header do Quiz */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-700">{selectedQuiz.title}</h1>
              <p className="text-gray-600">Questão {currentQuestion + 1} de {questions.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-red-600">
                <Clock className="w-5 h-5" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Questão */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            {currentQ.question}
          </h2>

          <div className="space-y-3 mb-8">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectAnswer(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                  selectedAnswer === index
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setIsPlaying(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sair do Quiz
            </button>
            <button
              onClick={nextQuestion}
              disabled={selectedAnswer === null}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion + 1 === questions.length ? 'Finalizar' : 'Próxima'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Dashboard
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-700 mb-2 flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-primary" />
          Quiz Interativo
        </h1>
        <p className="text-gray-600">
          Teste seus conhecimentos e ganhe XP com nossos quizzes educativos
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quizzes Disponíveis</p>
              <p className="text-2xl font-bold text-gray-700">{quizzes.length}</p>
            </div>
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">
                {quizzes.filter(q => q.completed).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">XP Total Possível</p>
              <p className="text-2xl font-bold text-purple-600">
                {quizzes.reduce((sum, q) => sum + q.xpReward, 0)}
              </p>
            </div>
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Melhor Pontuação</p>
              <p className="text-2xl font-bold text-yellow-600">
                {Math.max(...quizzes.filter(q => q.bestScore).map(q => q.bestScore!), 0)}%
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Lista de Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(quiz.difficulty)}`}>
                    {getDifficultyText(quiz.difficulty)}
                  </span>
                </div>
              </div>
              {quiz.completed && (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-700 mb-2">{quiz.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>

            <div className="space-y-2 mb-4 text-sm text-gray-500">
              <div className="flex items-center justify-between">
                <span>Matéria:</span>
                <span className="font-medium text-primary">{quiz.subject}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Questões:</span>
                <span className="font-medium">{quiz.questions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tempo:</span>
                <span className="font-medium">{quiz.timeLimit} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span>XP:</span>
                <span className="font-medium text-purple-600">+{quiz.xpReward}</span>
              </div>
              {quiz.bestScore && (
                <div className="flex items-center justify-between">
                  <span>Melhor nota:</span>
                  <span className="font-medium text-green-600">{quiz.bestScore}%</span>
                </div>
              )}
            </div>

            <button
              onClick={() => startQuiz(quiz)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Play className="w-4 h-4" />
              {quiz.completed ? 'Jogar Novamente' : 'Iniciar Quiz'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 
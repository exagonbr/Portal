'use client'

import { useState } from 'react'

type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer'

interface Question {
  id: string
  type: QuestionType
  text: string
  options?: string[]
  correctAnswer: string | string[]
  points: number
  explanation?: string
}

interface Quiz {
  id: string
  title: string
  description: string
  timeLimit?: number // in minutes
  passingScore: number
  questions: Question[]
  attempts: number
  isGraded: boolean
}

// Mock data - In a real app, this would come from an API
const MOCK_QUIZ: Quiz = {
  id: '1',
  title: 'Avaliação: Números Naturais',
  description: 'Teste seus conhecimentos sobre números naturais e suas propriedades',
  timeLimit: 30,
  passingScore: 70,
  attempts: 2,
  isGraded: true,
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      text: 'Qual dos seguintes números NÃO é um número natural?',
      options: ['0', '-1', '1', '2'],
      correctAnswer: '-1',
      points: 2,
      explanation: 'Números naturais são inteiros não negativos (0, 1, 2, 3, ...)'
    },
    {
      id: 'q2',
      type: 'true-false',
      text: 'Todo número natural tem um sucessor.',
      options: ['Verdadeiro', 'Falso'],
      correctAnswer: 'Verdadeiro',
      points: 1,
      explanation: 'Para qualquer número natural n, seu sucessor é n + 1'
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      text: 'Quais das seguintes propriedades se aplicam à adição de números naturais?',
      options: [
        'Comutativa e Associativa',
        'Apenas Comutativa',
        'Apenas Associativa',
        'Nenhuma das anteriores'
      ],
      correctAnswer: 'Comutativa e Associativa',
      points: 2,
      explanation: 'A adição de números naturais é tanto comutativa (a + b = b + a) quanto associativa ((a + b) + c = a + (b + c))'
    },
    {
      id: 'q4',
      type: 'short-answer',
      text: 'Qual é o menor número natural?',
      correctAnswer: ['0', 'zero'],
      points: 1,
      explanation: 'O conjunto dos números naturais começa em zero'
    }
  ]
}

export default function CourseQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(MOCK_QUIZ.timeLimit ? MOCK_QUIZ.timeLimit * 60 : 0)
  const [quizStarted, setQuizStarted] = useState(false)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const calculateScore = () => {
    let totalPoints = 0
    let earnedPoints = 0

    MOCK_QUIZ.questions.forEach(question => {
      totalPoints += question.points
      if (question.type === 'short-answer') {
        const correctAnswers = question.correctAnswer as string[]
        if (correctAnswers.includes(answers[question.id]?.toLowerCase())) {
          earnedPoints += question.points
        }
      } else {
        if (answers[question.id] === question.correctAnswer) {
          earnedPoints += question.points
        }
      }
    })

    return {
      score: Math.round((earnedPoints / totalPoints) * 100),
      earnedPoints,
      totalPoints
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    if (MOCK_QUIZ.timeLimit) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setShowResults(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < MOCK_QUIZ.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  if (!quizStarted) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">{MOCK_QUIZ.title}</h2>
        <p className="mt-2 text-gray-600">{MOCK_QUIZ.description}</p>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center text-sm text-gray-500">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tempo limite: {MOCK_QUIZ.timeLimit} minutos
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Nota mínima para aprovação: {MOCK_QUIZ.passingScore}%
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Tentativas permitidas: {MOCK_QUIZ.attempts}
          </div>
        </div>

        <button
          onClick={handleStartQuiz}
          className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Iniciar Avaliação
        </button>
      </div>
    )
  }

  if (showResults) {
    const { score, earnedPoints, totalPoints } = calculateScore()
    const passed = score >= MOCK_QUIZ.passingScore

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {passed ? (
              <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {passed ? 'Parabéns!' : 'Continue Tentando!'}
          </h2>
          
          <p className="mt-2 text-sm text-gray-500">
            Você obteve {earnedPoints} de {totalPoints} pontos ({score}%)
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Revisão das Questões</h3>
          <div className="mt-4 space-y-6">
            {MOCK_QUIZ.questions.map((question, index) => {
              const isCorrect = question.type === 'short-answer'
                ? (question.correctAnswer as string[]).includes(answers[question.id]?.toLowerCase())
                : answers[question.id] === question.correctAnswer

              return (
                <div key={question.id} className="border-t border-gray-200 pt-4">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{question.text}</p>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Sua resposta: {answers[question.id] || 'Não respondida'}
                        </p>
                        <p className={`mt-1 text-sm ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          Resposta correta: {Array.isArray(question.correctAnswer) 
                            ? question.correctAnswer.join(' ou ') 
                            : question.correctAnswer}
                        </p>
                        {question.explanation && (
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Explicação:</span> {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  const currentQ = MOCK_QUIZ.questions[currentQuestion]

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">{MOCK_QUIZ.title}</h2>
        {MOCK_QUIZ.timeLimit && (
          <div className={`text-sm font-medium ${
            timeRemaining < 300 ? 'text-red-600' : 'text-gray-500'
          }`}>
            Tempo restante: {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Progresso
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {currentQuestion + 1}/{MOCK_QUIZ.questions.length}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${((currentQuestion + 1) / MOCK_QUIZ.questions.length) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900">
          Questão {currentQuestion + 1}
        </h3>
        <p className="mt-2 text-gray-600">{currentQ.text}</p>

        {/* Answer Options */}
        <div className="mt-4 space-y-4">
          {currentQ.type === 'short-answer' ? (
            <input
              type="text"
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite sua resposta..."
            />
          ) : (
            <div className="space-y-2">
              {currentQ.options?.map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    answers[currentQ.id] === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQ.id}
                    value={option}
                    checked={answers[currentQ.id] === option}
                    onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
            currentQuestion === 0
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <button
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {currentQuestion === MOCK_QUIZ.questions.length - 1 ? 'Finalizar' : 'Próxima'}
          <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

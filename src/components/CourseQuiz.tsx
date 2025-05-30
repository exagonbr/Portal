'use client'

import { useState } from 'react'
import { mockQuiz, Quiz, Question, QuestionType } from '@/constants/mockData'

export default function CourseQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(mockQuiz.timeLimit ? mockQuiz.timeLimit * 60 : 0)
  const [quizStarted, setQuizStarted] = useState(false)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const calculateScore = () => {
    let totalPoints = 0
    let earnedPoints = 0

    mockQuiz.questions.forEach(question => {
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

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    return {
      score,
      earnedPoints,
      totalPoints
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
    if (mockQuiz.timeLimit) {
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
    if (currentQuestion < mockQuiz.questions.length - 1) {
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
      <div className="bg-background-primary shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-text-primary">{mockQuiz.title}</h2>
        <p className="mt-2 text-text-secondary">{mockQuiz.description}</p>

        <div className="mt-6 space-y-4">
          <div className="flex items-center text-sm text-text-tertiary">
            <svg className="h-5 w-5 mr-2 text-secondary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tempo limite: {mockQuiz.timeLimit} minutos
          </div>

          <div className="flex items-center text-sm text-text-tertiary">
            <svg className="h-5 w-5 mr-2 text-secondary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Nota mínima para aprovação: {mockQuiz.passingScore}%
          </div>

          <div className="flex items-center text-sm text-text-tertiary">
            <svg className="h-5 w-5 mr-2 text-secondary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Tentativas permitidas: {mockQuiz.attempts}
          </div>
        </div>

        <button
          onClick={handleStartQuiz}
          className="mt-8 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
        >
          Iniciar Avaliação
        </button>
      </div>
    )
  }

  if (showResults) {
    const { score, earnedPoints, totalPoints } = calculateScore()
    const passed = score >= mockQuiz.passingScore

    return (
      <div className="bg-background-primary shadow rounded-lg p-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center h-24 w-24 rounded-full ${
            passed ? 'bg-success-light/20' : 'bg-error-light/20'
          }`}>
            {passed ? (
              <svg className="h-12 w-12 text-success-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-12 w-12 text-error-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-bold text-text-primary">
            {passed ? 'Parabéns!' : 'Continue Tentando!'}
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            Você obteve {earnedPoints} de {totalPoints} pontos ({score}%)
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-text-primary">Revisão das Questões</h3>
          <div className="mt-4 space-y-6">
            {mockQuiz.questions.map((question, index) => {
              const isCorrect = question.type === 'short-answer'
                ? (question.correctAnswer as string[]).includes(answers[question.id]?.toLowerCase())
                : answers[question.id] === question.correctAnswer

              return (
                <div key={question.id} className="border-t border-border-light pt-4">
                  <div className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-secondary-light text-text-secondary flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-text-primary">{question.text}</p>
                      <div className="mt-2">
                        <p className="text-sm text-text-secondary">
                          Sua resposta: {answers[question.id] || 'Não respondida'}
                        </p>
                        <p className={`mt-1 text-sm ${isCorrect ? 'text-success-text' : 'text-error-text'}`}>
                          Resposta correta: {Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.join(' ou ')
                            : question.correctAnswer}
                        </p>
                        {question.explanation && (
                          <p className="mt-2 text-sm text-text-secondary">
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
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  const currentQ = mockQuiz.questions[currentQuestion]

  return (
    <div className="bg-background-primary shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text-primary">{mockQuiz.title}</h2>
        {mockQuiz.timeLimit && (
          <div className={`text-sm font-medium ${
            timeRemaining < 300 ? 'text-error-DEFAULT' : 'text-text-tertiary'
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
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-dark bg-primary-light/30">
                Progresso
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-primary-dark">
                {currentQuestion + 1}/{mockQuiz.questions.length}
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-light/30">
            <div
              style={{ width: `${((currentQuestion + 1) / mockQuiz.questions.length) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-DEFAULT"
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-text-primary">
          Questão {currentQuestion + 1}
        </h3>
        <p className="mt-2 text-text-secondary">{currentQ.text}</p>

        {/* Answer Options */}
        <div className="mt-4 space-y-4">
          {currentQ.type === 'short-answer' ? (
            <input
              type="text"
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              className="block w-full px-4 py-2 border border-border-DEFAULT rounded-md shadow-sm focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
              placeholder="Digite sua resposta..."
            />
          ) : (
            <div className="space-y-2">
              {currentQ.options?.map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    answers[currentQ.id] === option
                      ? 'border-primary-DEFAULT bg-primary-light/10'
                      : 'border-border-DEFAULT hover:bg-background-secondary'
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQ.id}
                    value={option}
                    checked={answers[currentQ.id] === option}
                    onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                    className="h-4 w-4 text-primary-DEFAULT focus:ring-primary-light border-border-dark"
                  />
                  <span className="ml-3 text-text-primary">{option}</span>
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
              ? 'border-border-DEFAULT text-text-disabled cursor-not-allowed'
              : 'border-border-DEFAULT text-text-secondary hover:bg-background-tertiary'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>

        <button
          onClick={handleNext}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-DEFAULT hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
        >
          {currentQuestion === mockQuiz.questions.length - 1 ? 'Finalizar' : 'Próxima'}
          <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

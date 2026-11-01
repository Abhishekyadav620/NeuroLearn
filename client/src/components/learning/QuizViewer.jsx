import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import apiClient from '../../services/api.js';
import useLearningTracking from '../../hooks/useLearningTracking.js';

/**
 * QuizViewer Component
 * Renders an interactive quiz, tracks per-question response times,
 * and delegates scoring to the server to guarantee tamper-proof evaluation.
 */
export const QuizViewer = ({
  quizTitle = 'Knowledge Check',
  questions = [],
  courseId,
  lessonId,
  sessionId,
  onCompleted,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

  // Time telemetry refs
  const questionStartTimeRef = useRef(Date.now());
  const quizStartTimeRef = useRef(Date.now());

  const { trackQuizActivity } = useLearningTracking({
    courseId,
    lessonId,
    sessionId,
    autoTrackReading: false,
  });

  // Track quiz started on mount
  useEffect(() => {
    quizStartTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
    trackQuizActivity({
      eventType: 'quiz_started',
      attemptNumber,
      immediate: true,
    });
  }, [attemptNumber, trackQuizActivity]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    // Record question_answered telemetry with time taken
    const durationSeconds = (Date.now() - questionStartTimeRef.current) / 1000;
    trackQuizActivity({
      eventType: 'question_answered',
      questionId: currentQuestion?._id || String(currentQuestionIndex),
      durationSeconds,
      attemptNumber,
    });

    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    const totalDurationSeconds = Math.round((Date.now() - quizStartTimeRef.current) / 1000);

    // Track final question duration
    const finalQuestionDuration = (Date.now() - questionStartTimeRef.current) / 1000;
    trackQuizActivity({
      eventType: 'question_answered',
      questionId: currentQuestion?._id || String(currentQuestionIndex),
      durationSeconds: finalQuestionDuration,
      attemptNumber,
    });

    // Format answers array for server verification
    const formattedAnswers = questions.map((q, idx) => ({
      questionId: q._id ? String(q._id) : String(idx),
      questionIndex: idx,
      selectedOption: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1,
    }));

    try {
      // Server-side scoring (never trust client)
      const response = await apiClient.post('/behaviour/quiz/evaluate', {
        courseId,
        lessonId,
        answers: formattedAnswers,
        durationSeconds: totalDurationSeconds,
        attemptNumber,
      });

      if (response.data?.success) {
        setResult(response.data.data);
        if (onCompleted) {
          onCompleted(response.data.data);
        }
      }
    } catch (err) {
      // In degraded/fallback mode, calculate simple local preview
      console.warn('[QuizViewer] Server evaluation fallback:', err?.message);
      let localCorrect = 0;
      questions.forEach((q, idx) => {
        if (q.correctAnswer !== undefined && selectedAnswers[idx] === q.correctAnswer) {
          localCorrect++;
        }
      });
      const localScore = Math.round((localCorrect / (questions.length || 1)) * 100);
      setResult({
        score: localScore,
        totalQuestions: questions.length,
        correctCount: localCorrect,
        incorrectCount: questions.length - localCorrect,
        passed: localScore >= 70,
        results: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAttemptNumber((prev) => prev + 1);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);

    trackQuizActivity({
      eventType: 'quiz_retried',
      attemptNumber: attemptNumber + 1,
      immediate: true,
    });
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-2xl border border-neuro-border text-center text-xs text-neuro-textMuted">
        No assessment questions configured for this module.
      </div>
    );
  }

  // Result State View
  if (result) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neuro-border shadow-card text-center space-y-6">
        <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center border ${
          result.passed
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
            : 'bg-amber-50 text-amber-600 border-amber-200'
        }`}>
          {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <Award className="w-8 h-8" />}
        </div>

        <div>
          <span className="text-xs font-semibold text-neuro-textMuted uppercase tracking-wider">
            Quiz Evaluation (Attempt #{attemptNumber})
          </span>
          <h3 className="text-2xl font-bold text-neuro-text mt-1">
            {result.passed ? 'Great Job! Assessment Passed' : 'Assessment Completed'}
          </h3>
          <p className="text-xs text-neuro-textMuted mt-1">
            {result.passed
              ? 'You have demonstrated mastery in this section.'
              : 'Review the lecture materials and try again to improve your score.'}
          </p>
        </div>

        {/* Score Stats */}
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          <div className="p-3 rounded-2xl bg-slate-50 border border-neuro-border">
            <span className="text-[10px] text-neuro-textMuted uppercase font-semibold block">Score</span>
            <span className="text-lg font-bold text-neuro-purple">{result.score}%</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Correct</span>
            <span className="text-lg font-bold text-emerald-600">{result.correctCount}</span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200">
            <span className="text-[10px] text-rose-700 uppercase font-semibold block">Incorrect</span>
            <span className="text-lg font-bold text-rose-600">{result.incorrectCount}</span>
          </div>
        </div>

        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neuro-lavender text-neuro-purple hover:bg-neuro-purple hover:text-white text-xs font-semibold transition-all shadow-subtle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retake Quiz</span>
        </button>
      </div>
    );
  }

  // Active Question View
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neuro-border shadow-card space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neuro-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neuro-lavender flex items-center justify-center text-neuro-purple border border-neuro-purple/15">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neuro-text">{quizTitle}</h4>
            <p className="text-xs text-neuro-textMuted">
              Question {currentQuestionIndex + 1} of {questions.length} • Attempt #{attemptNumber}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-100 overflow-hidden border border-neuro-border">
          <div
            className="h-full bg-neuro-purple rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Text */}
      <div>
        <span className="text-[11px] font-bold text-neuro-purple uppercase tracking-wider">
          Question {currentQuestionIndex + 1}
        </span>
        <h3 className="text-base font-bold text-neuro-text mt-1">
          {currentQuestion?.questionText || 'Question prompt'}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {(currentQuestion?.options || []).map((option, optIdx) => {
          const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
          return (
            <button
              key={optIdx}
              type="button"
              onClick={() => handleSelectOption(optIdx)}
              className={`w-full text-left p-4 rounded-2xl border text-xs font-medium transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-neuro-purple bg-neuro-lavender/50 text-neuro-text shadow-sm'
                  : 'border-neuro-border bg-slate-50/50 hover:bg-slate-50 text-neuro-text'
              }`}
            >
              <div className="flex items-center gap-3 pr-4">
                <span className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center border ${
                  isSelected
                    ? 'bg-neuro-purple text-white border-neuro-purple'
                    : 'bg-white text-neuro-textMuted border-neuro-border'
                }`}>
                  {String.fromCharCode(65 + optIdx)}
                </span>
                <span>{option}</span>
              </div>

              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                isSelected ? 'border-neuro-purple bg-neuro-purple' : 'border-slate-300'
              }`}>
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="pt-4 border-t border-neuro-border flex items-center justify-between">
        <span className="text-[11px] text-neuro-textMuted">
          {selectedAnswers[currentQuestionIndex] !== undefined ? 'Answer recorded' : 'Select an answer to proceed'}
        </span>

        {isLastQuestion ? (
          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={isSubmitting || selectedAnswers[currentQuestionIndex] === undefined}
            className="px-5 py-2.5 rounded-xl bg-neuro-purple hover:bg-neuro-purpleHover text-white text-xs font-semibold shadow-purple-btn transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                Submit Quiz
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="px-5 py-2.5 rounded-xl bg-neuro-purple hover:bg-neuro-purpleHover text-white text-xs font-semibold shadow-purple-btn transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizViewer;

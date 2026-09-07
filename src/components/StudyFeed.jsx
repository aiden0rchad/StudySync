import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  RotateCw, 
  Check, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Award, 
  ArrowRight,
  Flame,
  Brain,
  Layers,
  Clock,
  Plus
} from 'lucide-react';
import { 
  fetchStudyCardsAPI, 
  reviewStudyCardAPI, 
  generateStudyCardsAPI 
} from '../utils/api';
import { audioFX } from '../utils/audioFX';
import { triggerTaskConfetti, triggerMiniConfetti } from '../utils/confetti';

export default function StudyFeed({ 
  courses = [], 
  onActionReward,
  selectedCourseId = 'all',
  onSelectCourse
}) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizState, setQuizState] = useState(null); // 'correct' | 'incorrect'
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(0);
  const [courseFilter, setCourseFilter] = useState(selectedCourseId);

  // Fetch study cards on mount and when filter changes
  useEffect(() => {
    loadCards();
  }, [courseFilter]);

  const loadCards = async () => {
    setLoading(true);
    const data = await fetchStudyCardsAPI(courseFilter, 40);
    setCards(data || []);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSelectedOption(null);
    setQuizState(null);
    setLoading(false);
  };

  // Keyboard navigation: ArrowUp / ArrowDown, Space to flip, 1-4 for quiz options
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const currentCard = cards[currentIndex];
        if (currentCard && (currentCard.type === 'quiz' || currentCard.type === 'micro_task')) {
          const idx = parseInt(e.key, 10) - 1;
          if (currentCard.options && currentCard.options[idx] !== undefined) {
            handleSelectOption(idx);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards, isFlipped, selectedOption]);

  const currentCard = cards[currentIndex];

  const handleFlip = () => {
    audioFX.playCardFlip();
    setIsFlipped(prev => !prev);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      audioFX.playClick();
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
      setSelectedOption(null);
      setQuizState(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      audioFX.playClick();
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
      setSelectedOption(null);
      setQuizState(null);
    }
  };

  const handleSelectOption = async (optionIdx) => {
    if (selectedOption !== null || !currentCard) return;

    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentCard.correctAnswer;

    if (isCorrect) {
      setQuizState('correct');
      audioFX.playQuizCorrect();
      triggerMiniConfetti();
      if (onActionReward) onActionReward(30, '⚡ Quiz Solved! +30 XP');
    } else {
      setQuizState('incorrect');
      audioFX.playQuizWrong();
      if (onActionReward) onActionReward(10, 'Review Practice +10 XP');
    }

    setSessionReviewed(prev => prev + 1);

    // Report to backend
    try {
      await reviewStudyCardAPI(currentCard.id, isCorrect);
    } catch (e) {
      console.warn('Failed to record card review:', e);
    }
  };

  const handleFlashcardResult = async (isCorrect) => {
    if (!currentCard) return;

    if (isCorrect) {
      audioFX.playTaskComplete();
      triggerMiniConfetti();
      if (onActionReward) onActionReward(20, '🧠 Active Recall Mastered! +20 XP');
    } else {
      audioFX.playClick();
      if (onActionReward) onActionReward(5, 'Review Logged +5 XP');
    }

    setSessionReviewed(prev => prev + 1);

    try {
      await reviewStudyCardAPI(currentCard.id, isCorrect);
    } catch (e) {}

    // Auto-advance to next card after brief delay
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  const handleGenerateCards = async () => {
    setGenerating(true);
    audioFX.playClick();
    try {
      await generateStudyCardsAPI();
      await loadCards();
      triggerMiniConfetti();
      if (onActionReward) onActionReward(40, 'Generated Curriculum Cards +40 XP');
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center min-h-[calc(100vh-12rem)] px-2 sm:px-4 py-2 select-none">
      
      {/* Top Header: Filter Pills & Session Stats */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        {/* Course Filter Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
          <button
            onClick={() => setCourseFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
              courseFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            All Cards
          </button>
          {courses.map(c => (
            <button
              key={c.id}
              onClick={() => setCourseFilter(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                courseFilter === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {c.code}
            </button>
          ))}
        </div>

        {/* Action: Generate AI Cards Button */}
        <button
          onClick={handleGenerateCards}
          disabled={generating}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-all shrink-0"
          title="Extract quick-win cards and active recall questions from your syllabus & homework"
        >
          <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : 'Curriculum Sync'}</span>
        </button>
      </div>

      {/* Main Feed Card Container */}
      {loading ? (
        <div className="w-full h-96 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
          <Brain className="w-10 h-10 text-indigo-500 animate-bounce" />
          <p className="text-sm font-semibold text-slate-500">Loading your Study Feed...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="w-full py-16 px-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Brain className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Deck Completed! 🎉</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">
            You've reviewed all available cards for this subject. Generate fresh cards from your syllabus or reset the deck!
          </p>
          <button
            onClick={handleGenerateCards}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
          >
            Generate Fresh Cards from Schedule
          </button>
        </div>
      ) : (
        <div className="relative w-full flex flex-col items-center">
          
          {/* Card Stack Index Counter */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-medium px-2 mb-2">
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Card {currentIndex + 1} of {cards.length}</span>
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {sessionReviewed} reviewed today
            </span>
          </div>

          {/* Card Surface */}
          <div className="w-full min-h-[380px] sm:min-h-[420px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between p-6 sm:p-8 transition-all duration-300 relative group">
            
            {/* Card Badge & Type Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                  currentCard.type === 'quiz'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40'
                    : currentCard.type === 'micro_task'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40'
                    : currentCard.type === 'mnemonic'
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300/40'
                    : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300/40'
                }`}>
                  {currentCard.type === 'quiz' ? '⚡ Micro-Quiz' : currentCard.type === 'micro_task' ? '🎯 2-Min Action' : currentCard.type === 'mnemonic' ? '🧠 Mnemonic' : '🔄 Active Recall'}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentCard.title}
                </span>
              </div>

              {currentCard.type === 'flashcard' && (
                <button
                  onClick={handleFlip}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Show Prompt' : 'Flip Card'}</span>
                </button>
              )}
            </div>

            {/* Card Body: Question / Flashcard / Options */}
            <div className="flex-1 flex flex-col justify-center py-2">
              
              {/* Type: FLASHCARD & MNEMONIC */}
              {(currentCard.type === 'flashcard' || currentCard.type === 'mnemonic') && (
                <div 
                  onClick={handleFlip}
                  className="cursor-pointer flex flex-col justify-center items-center text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors min-h-[200px]"
                >
                  {!isFlipped ? (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-xs uppercase font-bold text-indigo-500 mb-2">Prompt</p>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                        {currentCard.front}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-4 flex items-center justify-center gap-1">
                        <RotateCw className="w-3 h-3" /> Tap to reveal answer
                      </p>
                    </div>
                  ) : (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <p className="text-xs uppercase font-bold text-emerald-500 mb-2">Concept Breakdown</p>
                      <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 whitespace-pre-line leading-relaxed font-medium">
                        {currentCard.back}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Type: QUIZ & MICRO_TASK */}
              {(currentCard.type === 'quiz' || currentCard.type === 'micro_task') && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2">
                    {currentCard.front}
                  </h4>

                  {/* 4 Interactive Option Buttons */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentCard.options?.map((opt, idx) => {
                      const isChosen = selectedOption === idx;
                      const isCorrectOption = idx === currentCard.correctAnswer;
                      
                      let btnStyle = "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200";
                      
                      if (selectedOption !== null) {
                        if (isCorrectOption) {
                          btnStyle = "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm";
                        } else if (isChosen && !isCorrectOption) {
                          btnStyle = "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 line-through";
                        } else {
                          btnStyle = "opacity-50 border-slate-200 dark:border-slate-800";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectOption(idx)}
                          disabled={selectedOption !== null}
                          className={`w-full text-left p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {selectedOption !== null && isCorrectOption && (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 animate-bounce" />
                          )}
                          {selectedOption !== null && isChosen && !isCorrectOption && (
                            <X className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation reveal */}
                  {selectedOption !== null && currentCard.explanation && (
                    <div className="mt-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 animate-in fade-in duration-200">
                      <span className="font-bold">Rationale: </span>
                      <span>{currentCard.explanation}</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Card Footer: Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
              {(currentCard.type === 'flashcard' || currentCard.type === 'mnemonic') ? (
                <div className="w-full flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleFlashcardResult(false)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                  >
                    Review Later
                  </button>
                  <button
                    onClick={() => handleFlashcardResult(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mastered (+20 XP)</span>
                  </button>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between text-xs text-slate-400">
                  <span className="hidden sm:inline">Use keys 1-4 or click to select</span>
                  <button
                    onClick={handleNext}
                    className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95"
                  >
                    <span>Next Card</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Quick Vertical Swipe Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all"
              title="Previous Card (Up Arrow)"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-500">
              Scroll or Swipe
            </span>
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all"
              title="Next Card (Down Arrow)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

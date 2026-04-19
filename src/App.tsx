import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Gamepad2, 
  Settings, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Zap,
  Globe,
  Upload,
  MessageSquare,
  Sparkles,
  Award,
  BookOpen,
  Languages
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from './lib/utils';
import { Question, QuizSession, Difficulty, TranslationResult, Language, UserStats } from './types';
import { geminiService } from './services/geminiService';

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => {
  const progress = (current / total) * 100;
  return (
    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden border border-white/5">
      <motion.div 
        className="h-full bg-gradient-to-r from-neon-purple to-neon-blue"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};

function VocabularyBadge({ word, arabic }: { word: string; arabic: string; key?: React.Key }) {
  return (
    <div className="inline-flex flex-col items-center bg-white/5 border border-white/10 rounded-lg px-3 py-1 m-1 group hover:border-neon-blue/50 transition-colors cursor-default">
      <span className="text-sm font-semibold text-neon-blue">{word}</span>
      <span className="text-xs text-white/60 group-hover:text-white transition-colors" dir="rtl">{arabic}</span>
    </div>
  );
}

// --- Translations ---

const translations = {
  en: {
    hero: "Transform any text into a fun learning quest. Perfect for students who find English difficult.",
    placeholder: "Paste your lessons, paragraphs, or exercise text here...",
    startBtn: "START QUEST",
    easy: "easy",
    medium: "medium",
    hard: "hard",
    feedbackTitle: "Instant Feedback",
    feedbackDesc: "Learn from every mistake instantly.",
    iraqiTitle: "Iraqi Simplified",
    iraqiDesc: "Explanations in friendly simple Arabic.",
    progressTitle: "Game Progress",
    progressDesc: "Track your score and level up skills.",
    openCoach: "Open Translate & Explain Tool",
    quitLevel: "Quit Level",
    score: "Score",
    learningSupport: "Learning Support",
    nextStage: "NEXT STAGE",
    finishQuest: "FINISH QUEST",
    wellDone: "WELL DONE!",
    questComplete: "Quest Complete",
    scoredPoints: (score: number, total: number) => `You scored ${score} out of ${total} points.`,
    accuracyRating: "Accuracy Rating",
    tryNewTopic: "TRY NEW TOPIC",
    useCoach: "USE COACH",
    exitTool: "Exit Tool",
    coachSubtitle: "Type any sentence to translate and explain",
    coachPlaceholder: "e.g., 'The stack follows the LIFO principle...'",
    explainBtn: "EXPLAIN",
    simpleArabicExp: "شرح مبسط:",
    keyVocab: "Key Vocabulary",
    sentenceStructure: "Sentence structure",
    coachTitle: "Iراقي Coach",
    loadingPhrases: [
      "Analyzing text structure...",
      "Translating into simple Arabic...",
      "Generating interactive rewards...",
      "Building your custom learning path...",
      "Almost ready, Iraqi Ace!"
    ],
    trainerMode: "Trainer Mode",
    trainerDesc: "Learn HOW to translate step-by-step.",
    examMode: "Exam Mode",
    howToThink: "How to Think",
    chunksTitle: "Parts of the Sentence",
    revealMeaning: "Reveal Meaning",
    literalTranslation: "Literal Meaning (كلمة بكلمة)",
    realMeaning: "The Real Meaning (السالفة وما بيها)",
    stepQuestion: "Analyzing Question...",
    stepThinking: "Strategy Hint",
    stepChunking: "Breaking it down",
    stepAnswer: "Select the answer",
    points: "Points",
    level: "Lv."
  },
  ar: {
    hero: "حول أي نص إلى مغامرة تعليمية ممتعة. مثالي للطلاب الذين يجدون اللغة الإنجليزية صعبة.",
    placeholder: "الصق دروسك، القطع الخارجيه، أو أي نص هنا...",
    startBtn: "ابدأ المغامرة",
    easy: "سهل",
    medium: "متوسط",
    hard: "صعب",
    feedbackTitle: "تصحيح فوري",
    feedbackDesc: "اتعلم من كل غلطه توكع بيها فورا.",
    iraqiTitle: "شرح عراقي",
    iraqiDesc: "شروحات بلغة عراقية بسيطة وقريبة للكلب.",
    progressTitle: "تقدمك باللعبة",
    progressDesc: "تابع نتيجتك وطور مستواك خطوة بخطوة.",
    openCoach: "افتح أداة الترجمة والشرح",
    quitLevel: "إنهاء المستوى",
    score: "النتيجة",
    learningSupport: "دعم تعليمي",
    nextStage: "المرحلة التالية",
    finishQuest: "إنهاء المغامرة",
    wellDone: "عاشت ايدك!",
    questComplete: "اكتملت المهمة",
    scoredPoints: (score: number, total: number) => `حصلت على ${score} من أصل ${total} نقاط.`,
    accuracyRating: "نسبة الدقة",
    tryNewTopic: "موضوع جديد",
    useCoach: "استخدم المدرب",
    exitTool: "اخرج من الأداة",
    coachSubtitle: "اكتب أي جملة حتى نشرحها ونترجمها الك",
    coachPlaceholder: "مثال: 'The stack follows the LIFO principle...'",
    explainBtn: "اشرح لي",
    simpleArabicExp: "شرح مبسط:",
    keyVocab: "المفردات الأساسية",
    sentenceStructure: "تركيب الجملة",
    coachTitle: "المدرب العراقي",
    loadingPhrases: [
      "جاي نحلل النص...",
      "جاي نترجم للعربي البسيط...",
      "جاي نجهز المكافآت...",
      "جاي نبني مسارك التعليمي...",
      "ثواني وتجهز يا بطل!"
    ],
    trainerMode: "وضع المدرب",
    trainerDesc: "تعلم شلون تترجم خطوة بخطوة.",
    examMode: "وضع الاختبار",
    howToThink: "شلون تفكر؟",
    chunksTitle: "أجزاء الجملة",
    revealMeaning: "اظهر المعنى",
    literalTranslation: "المعنى الحرفي (كلمة بكلمة)",
    realMeaning: "المعنى الحقيقي (السالفة وما بيها)",
    stepQuestion: "تحليل السؤال...",
    stepThinking: "خطة الشغل",
    stepChunking: "تفكيك الجملة",
    stepAnswer: "اختار الجواب",
    points: "نقاط",
    level: "المستوى"
  }
};

// --- Main App ---

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [view, setView] = useState<'landing' | 'loading' | 'quiz' | 'result' | 'translator'>('landing');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<'trainer' | 'exam'>('trainer');
  const [content, setContent] = useState('');
  const [session, setSession] = useState<QuizSession | null>(null);
  const [stats, setStats] = useState<UserStats>({ points: 0, level: 1, mistakesLineage: {}, completedQuests: 0 });
  const [loadingText, setLoadingText] = useState('Extracting cosmic knowledge...');
  
  // For the Translator feature
  const [transInput, setTransInput] = useState('');
  const [transResult, setTransResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (view === 'loading') {
      const phrases = t.loadingPhrases;
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(phrases[i % phrases.length]);
        i++;
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [view, t.loadingPhrases]);

  const startQuiz = async () => {
    if (!content.trim()) return;
    setView('loading');
    try {
      const questions = await geminiService.generateQuestions(content, difficulty);
      setSession({
        questions,
        currentIndex: 0,
        score: 0,
        answers: new Array(questions.length).fill(null),
        isComplete: false,
        difficulty,
        mode: mode as 'trainer' | 'exam',
        currentStep: mode === 'trainer' ? 'question' : 'guessing'
      });
      setView('quiz');
    } catch (error) {
      console.error(error);
      setView('landing');
      alert("Failed to generate quiz. Please try again.");
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (!session || session.answers[session.currentIndex] !== null) return;
    
    const isCorrect = optionIndex === session.questions[session.currentIndex].correctAnswer;
    if (isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b026ff', '#00d4ff']
      });
      setStats(s => ({ ...s, points: s.points + 20, level: Math.floor((s.points + 20) / 100) + 1 }));
    } else {
      setStats(s => ({ ...s, points: Math.max(0, s.points - 5) }));
    }

    const newAnswers = [...session.answers];
    newAnswers[session.currentIndex] = optionIndex;

    setSession({
      ...session,
      answers: newAnswers,
      score: isCorrect ? session.score + 1 : session.score,
      currentStep: 'feedback'
    });
  };

  const nextStep = () => {
    if (!session) return;
    const steps: QuizSession['currentStep'][] = ['question', 'thinking', 'guessing', 'feedback'];
    const currentIdx = steps.indexOf(session.currentStep);
    
    if (session.mode === 'trainer' && currentIdx < 2) {
      setSession({ ...session, currentStep: steps[currentIdx + 1] });
    } else if (session.currentStep === 'feedback') {
      nextQuestion();
    }
  };

  const nextQuestion = () => {
    if (!session) return;
    if (session.currentIndex < session.questions.length - 1) {
      setSession({ 
        ...session, 
        currentIndex: session.currentIndex + 1,
        currentStep: session.mode === 'trainer' ? 'question' : 'guessing'
      });
    } else {
      setSession({ ...session, isComplete: true });
      setStats(s => ({ ...s, completedQuests: s.completedQuests + 1 }));
      setView('result');
    }
  };

  const handleTranslate = async () => {
    if (!transInput.trim()) return;
    setIsTranslating(true);
    setTransResult(null);
    try {
      const result = await geminiService.translateAndExplain(transInput);
      setTransResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div 
      className={cn(
        "min-h-screen container mx-auto px-4 py-8 max-w-4xl font-sans text-white",
        lang === 'ar' && "text-right"
      )}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="flex justify-end mb-4">
        <button 
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 hover:bg-white/10 transition-all"
        >
          <Globe size={16} className="mr-2" />
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* --- Landing Page --- */}
        {view === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center text-center space-y-12 pt-12"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex items-center space-x-2">
                  <Award size={20} className="text-neon-blue" />
                  <span className="text-white/60 text-sm">{t.level}</span>
                  <span className="text-white font-black">{stats.level}</span>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex items-center space-x-2">
                  <Sparkles size={20} className="text-neon-purple" />
                  <span className="text-white/60 text-sm">{t.points}</span>
                  <span className="text-white font-black">{stats.points}</span>
                </div>
              </div>
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                className="inline-block bg-neon-purple/20 p-4 rounded-3xl border border-neon-purple/50 mb-4"
              >
                <Trophy className="text-neon-purple" size={48} />
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-black font-display tracking-tighter neon-text-purple uppercase">
                LinguaQuest
              </h1>
              <p className="text-xl text-white/70 max-w-lg mx-auto">
                {t.hero}
              </p>
            </div>

            <div className="w-full bg-game-card/50 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
              <div className="relative">
                <textarea
                  placeholder={t.placeholder}
                  className="w-full h-48 bg-black/30 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none focus:border-neon-blue/50 transition-all resize-none placeholder:text-white/20"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className={cn("absolute top-4 text-white/20 pointer-events-none", lang === 'ar' ? 'left-4' : 'right-4')}>
                  <Upload size={24} />
                </div>
              </div>

              {/* Quick Load Shortcut for User's Lecture */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setContent(`Introduction to stack structure: Stack is an ordered list in which all insertions and deletions are made at one end, called the top. Stack is a data structure follows LIFO: Last In First Out.
Stack operations:
- push(e): Insert element e to be the top.
- pop(): Remove and return the top element. Error if empty (Underflow).
- top(): Return the top element without removing it.
- isEmpty(): Check if stack has no elements.
Troubleshooting Tip: Always check isEmpty() before pop() to avoid errors.`)}
                  className="text-xs bg-neon-blue/10 border border-neon-blue/30 text-neon-blue px-3 py-1.5 rounded-lg hover:bg-neon-blue/20 transition-all font-bold flex items-center gap-2"
                >
                  <BookOpen size={14} />
                  {lang === 'ar' ? 'تحميل محاضرة الـ Stack' : 'Load Stack Lecture'}
                </button>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-6">
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Training Mode</span>
                    <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                      {(['trainer', 'exam'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                            mode === m 
                              ? "bg-neon-blue text-black shadow-[0_0_15px_rgba(0,212,255,0.5)]" 
                              : "text-white/40 hover:text-white/60"
                          )}
                        >
                          {m === 'trainer' ? t.trainerMode : t.examMode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Difficulty</span>
                    <div className="flex items-center space-x-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                      {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficulty(d)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all",
                            difficulty === d 
                              ? "bg-neon-purple text-white shadow-[0_0_15px_rgba(176,38,255,0.5)]" 
                              : "text-white/40 hover:text-white/60"
                          )}
                        >
                          {t[d as keyof typeof t] as string}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={startQuiz}
                  disabled={!content.trim()}
                  className={cn(
                    "game-button flex items-center space-x-3 w-full md:w-auto justify-center h-full",
                    (!content.trim()) && "opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  <span className="text-xl uppercase font-black">{t.startBtn}</span>
                  <Gamepad2 size={24} className={lang === 'ar' ? 'mr-3' : 'ml-3'} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pb-12">
              {[
                { icon: <Zap className="text-yellow-400" />, title: t.feedbackTitle, desc: t.feedbackDesc },
                { icon: <Globe className="text-blue-400" />, title: t.iraqiTitle, desc: t.iraqiDesc },
                { icon: <Award className="text-purple-400" />, title: t.progressTitle, desc: t.progressDesc }
              ].map((feature, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 text-left space-y-2">
                  <div className="p-3 bg-white/5 rounded-xl w-fit">{feature.icon}</div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-white/50">{feature.desc}</p>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setView('translator')}
              className="flex items-center space-x-2 text-white/40 hover:text-neon-blue transition-colors pb-12 mt-4"
            >
              <Languages size={18} className={lang === 'ar' ? 'ml-2' : ''} />
              <span className="text-sm font-semibold uppercase tracking-widest">{t.openCoach}</span>
            </button>
          </motion.div>
        )}

        {/* --- Loading View --- */}
        {view === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] space-y-8"
          >
            <div className="relative">
              <motion.div 
                className="w-24 h-24 border-4 border-neon-purple border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <Sparkles className="absolute inset-0 m-auto text-neon-blue" size={32} />
            </div>
            <p className="text-2xl font-bold font-display animate-pulse text-white/80">{loadingText}</p>
          </motion.div>
        )}

        {/* --- Quiz/Trainer View --- */}
        {view === 'quiz' && session && (
          <motion.div 
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-neon-purple/20 p-2 rounded-lg border border-neon-purple/30">
                  <span className="font-display font-bold text-neon-purple">{lang === 'ar' ? 'س' : 'Q'}{session.currentIndex + 1}</span>
                </div>
                <div className={cn("bg-white/5 px-4 py-2 rounded-lg border border-white/10 flex items-center", lang === 'ar' ? 'space-x-reverse space-x-2' : 'space-x-2')}>
                  <Zap size={16} className="text-yellow-400" />
                  <span className="text-white/60 text-sm">{t.points}: </span>
                  <span className="text-neon-blue font-bold">{stats.points}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase font-bold text-white/30">{session.mode === 'trainer' ? t.trainerMode : t.examMode}</span>
                <button 
                  onClick={() => setView('landing')}
                  className="text-white/40 hover:text-white transition-all text-sm uppercase font-bold"
                >
                  {t.quitLevel}
                </button>
              </div>
            </div>

            <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />

            <div className="space-y-6">
              <div className="bg-game-card p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 relative overflow-hidden">
                {/* Step Indicator for Trainer Mode */}
                {session.mode === 'trainer' && (
                  <div className="absolute top-0 left-0 w-full flex">
                    {(['question', 'thinking', 'guessing', 'feedback'] as const).map((s, i) => (
                      <div 
                        key={s}
                        className={cn(
                          "h-1 flex-1 transition-all duration-300",
                          i <= (['question', 'thinking', 'guessing', 'feedback'].indexOf(session.currentStep))
                            ? "bg-neon-blue" : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-neon-blue uppercase tracking-widest opacity-80">{t.stepQuestion}</span>
                    <h2 className={cn("text-2xl font-bold leading-relaxed", lang === 'ar' ? 'text-right' : 'text-left')} dir="ltr">
                      {session.questions[session.currentIndex].text}
                    </h2>
                  </div>
                  
                  {/* Step 1: Thinking Strategy */}
                  <AnimatePresence>
                    {(session.currentStep === 'thinking' || session.currentStep === 'guessing' || session.currentStep === 'feedback') && session.mode === 'trainer' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-5 bg-neon-purple/10 rounded-2xl border border-neon-purple/20 space-y-3"
                      >
                        <p className={cn("text-neon-purple text-xs font-black uppercase flex items-center gap-2", lang === 'ar' ? 'flex-row-reverse' : '')}>
                          <Sparkles size={14} />
                          {t.howToThink}
                        </p>
                        <div className="space-y-2">
                          {session.questions[session.currentIndex].howToThink.map((hint, i) => (
                            <p key={i} className="text-white/80 text-sm leading-relaxed flex items-start gap-2">
                              <span className="bg-neon-purple/30 text-white text-[10px] px-1.5 py-0.5 rounded mt-1">{i+1}</span>
                              {hint}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Step 2: Context & Chunks */}
                  <AnimatePresence>
                    {(session.currentStep === 'thinking' || session.currentStep === 'guessing' || session.currentStep === 'feedback') && session.mode === 'trainer' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{t.chunksTitle}</span>
                          <div className={cn("flex flex-wrap gap-2", lang === 'ar' ? 'flex-row-reverse' : 'flex-row')}>
                            {session.questions[session.currentIndex].chunks.map((chunk, i) => (
                              <div key={i} className="group relative">
                                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:border-neon-blue/50 transition-all">
                                  <span className="text-sm font-mono text-white/90">{chunk.part}</span>
                                </div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-neon-blue text-black text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                                  {chunk.meaning}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Step 3: Answering & Feedback */}
                  {(session.currentStep === 'guessing' || session.currentStep === 'feedback' || session.mode === 'exam') && (
                    <div className="grid grid-cols-1 gap-3 pt-4">
                      {session.questions[session.currentIndex].options.map((option, idx) => {
                        const isAnswered = session.answers[session.currentIndex] !== null;
                        const isSelected = session.answers[session.currentIndex] === idx;
                        const isCorrect = idx === session.questions[session.currentIndex].correctAnswer;

                        return (
                          <button
                            key={idx}
                            disabled={isAnswered}
                            onClick={() => handleAnswer(idx)}
                            className={cn(
                              "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group",
                              !isAnswered && "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 hover:scale-[1.01]",
                              isAnswered && isCorrect && "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]",
                              isAnswered && isSelected && !isCorrect && "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]",
                              isAnswered && !isCorrect && !isSelected && "opacity-40 grayscale"
                            )}
                          >
                            <span className="text-lg font-medium" dir="ltr">{option}</span>
                            {isAnswered && isCorrect && <CheckCircle2 className="text-green-500 shrink-0" size={24} />}
                            {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500 shrink-0" size={24} />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Trainer Navigation Button */}
                  {session.mode === 'trainer' && session.currentStep !== 'feedback' && (
                    <button 
                      onClick={nextStep}
                      className="game-button w-full mt-4 py-4 flex items-center justify-center space-x-3 text-lg"
                    >
                      <span>{session.currentStep === 'question' ? 'Show Thinking Plan' : 'Go to Answer'}</span>
                      <ArrowRight size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback Section (Enhanced with context) */}
              <AnimatePresence>
                {session.answers[session.currentIndex] !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6">
                      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4")}>
                         <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
                           <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t.literalTranslation}</span>
                           <p className="text-white/70 text-sm italic">{session.questions[session.currentIndex].contextLiteral}</p>
                         </div>
                         <div className="p-4 bg-neon-blue/10 rounded-2xl border border-neon-blue/20 space-y-2 text-right">
                           <span className="text-[10px] font-bold text-neon-blue uppercase tracking-widest">{t.realMeaning}</span>
                           <p className="text-white font-bold">{session.questions[session.currentIndex].contextReal}</p>
                         </div>
                      </div>

                      <div className={cn("flex items-center space-x-3 text-neon-purple", lang === 'ar' ? 'space-x-reverse' : 'space-x-3')}>
                        <Sparkles size={20} />
                        <h3 className="font-bold text-lg uppercase tracking-wider">{t.learningSupport}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2" dir="ltr">
                          <p className="text-white/80 leading-relaxed italic">"{session.questions[session.currentIndex].explanation.english}"</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-right" dir="rtl">
                          <p className="text-white/90 leading-relaxed font-medium">{session.questions[session.currentIndex].explanation.arabic}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{t.keyVocab}</span>
                        <div className={cn("flex flex-wrap gap-2", lang === 'ar' ? 'justify-end' : '')}>
                          {session.questions[session.currentIndex].keywords.map((kw, i) => (
                            <div key={i} className="group relative">
                              <VocabularyBadge word={kw.english} arabic={kw.arabic} />
                              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/95 border border-neon-purple/50 p-6 rounded-3xl w-[90%] max-w-sm z-[100] opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                                <h4 className="text-neon-purple font-black text-2xl mb-1">{kw.english}</h4>
                                <p className="text-white/40 text-xs mb-4 font-bold border-b border-white/5 pb-2">{kw.arabic}</p>
                                <p className="text-white/80 text-sm leading-relaxed mb-4">{kw.simpleExplanation}</p>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-[10px] text-neon-blue font-bold uppercase block mb-1">Example</span>
                                  <p className="text-xs italic text-white/60">{kw.example}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={nextQuestion}
                        className="game-button w-full mt-4 flex items-center justify-center space-x-3 py-4"
                      >
                        <span className="mx-2 font-black text-xl">{session.currentIndex === session.questions.length - 1 ? t.finishQuest : t.nextStage}</span>
                        <ArrowRight size={24} className={lang === 'ar' ? 'rotate-180' : ''} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* --- Result View --- */}
        {view === 'result' && session && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center space-y-8 pt-12"
          >
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                className="w-48 h-48 bg-neon-purple/20 rounded-full flex items-center justify-center border-4 border-neon-purple/50"
              >
                <Trophy size={80} className="text-neon-purple" />
              </motion.div>
              <div className="absolute -top-4 -right-4 bg-neon-blue text-white px-4 py-2 rounded-2xl font-black text-xl shadow-lg animate-bounce">
                {t.wellDone}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-5xl font-black font-display uppercase italic tracking-tighter">{t.questComplete}</h2>
              <p className="text-xl text-white/50">{t.scoredPoints(session.score, session.questions.length)}</p>
            </div>

            <div className="bg-game-card p-12 rounded-3xl border border-white/10 w-full max-w-sm shadow-[0_0_30px_rgba(0,212,255,0.15)]">
              <div className="text-7xl font-black text-neon-blue font-display">
                {Math.round((session.score / session.questions.length) * 100)}%
              </div>
              <p className="mt-4 text-white/40 uppercase tracking-widest font-bold">{t.accuracyRating}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full justify-center pb-20">
              <button 
                onClick={() => setView('landing')}
                className="game-button flex items-center space-x-3 px-12"
              >
                <RotateCcw size={20} className={lang === 'ar' ? 'ml-3' : ''} />
                <span>{t.tryNewTopic}</span>
              </button>
              <button 
                onClick={() => setView('translator')}
                className="bg-white/10 hover:bg-white/20 text-white px-12 py-3 rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center space-x-3"
              >
                <Languages size={20} className={lang === 'ar' ? 'ml-3' : ''} />
                <span>{t.useCoach}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* --- Translator tool view --- */}
        {view === 'translator' && (
          <motion.div 
            key="translator"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Languages className="text-neon-blue" size={32} />
                <h2 className="text-3xl font-black font-display uppercase tracking-tighter">{t.coachTitle}</h2>
              </div>
              <button 
                onClick={() => setView('landing')}
                className="text-white/40 hover:text-white uppercase font-bold text-sm bg-white/5 px-4 py-2 rounded-xl border border-white/10"
              >
                {t.exitTool}
              </button>
            </div>

            <div className="bg-game-card p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen size={14} />
                  {t.coachSubtitle}
                </label>
                <div className="flex flex-col md:flex-row gap-2">
                  <input 
                    type="text" 
                    placeholder={t.coachPlaceholder}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-neon-blue/50 text-white"
                    value={transInput}
                    dir="ltr text-left"
                    onChange={(e) => setTransInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
                  />
                  <button 
                    disabled={isTranslating}
                    onClick={handleTranslate}
                    className="game-button px-8 flex items-center justify-center gap-2"
                  >
                    {isTranslating ? (
                      <div className="animate-spin border-2 border-white/20 border-t-white rounded-full w-5 h-5" />
                    ) : (
                      <>
                        <span>{t.explainBtn}</span>
                        <Zap size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {transResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 pt-6 border-t border-white/5"
                >
                    <div className="space-y-4">
                      <div className="p-4 bg-neon-blue/5 rounded-2xl border border-neon-blue/20 space-y-3">
                        <p className="text-neon-blue text-xs font-black uppercase flex items-center gap-2">
                          <MessageSquare size={14} />
                          Thinking Strategy:
                        </p>
                        <p className="text-white/90 text-sm italic">{transResult.thinkStrategy}</p>
                      </div>

                      <div className="p-6 bg-neon-blue/10 rounded-2xl border border-neon-blue/20" dir="rtl">
                        <h3 className="text-neon-blue text-sm font-bold mb-3 uppercase flex items-center gap-2">
                          <MessageSquare size={16} />
                          {t.simpleArabicExp}
                        </h3>
                        <p className="text-xl leading-relaxed text-white/95">{transResult.simpleArabic}</p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                          <Languages size={14} />
                          {t.keyVocab}
                        </h3>
                        <div className={cn("flex flex-wrap gap-2", lang === 'ar' ? 'justify-end' : '')}>
                          {transResult.vocabulary.map((v, i) => (
                            <div key={i} className="group relative">
                              <VocabularyBadge word={v.english} arabic={v.arabic} />
                              <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/95 border border-neon-purple/50 p-6 rounded-3xl w-[90%] max-w-sm z-[100] opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                                <h4 className="text-neon-purple font-black text-2xl mb-1">{v.english}</h4>
                                <p className="text-white/40 text-xs mb-4 font-bold border-b border-white/5 pb-2">{v.arabic}</p>
                                <p className="text-white/80 text-sm leading-relaxed mb-4">{v.simpleExplanation}</p>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                  <span className="text-[10px] text-neon-blue font-bold uppercase block mb-1">Example</span>
                                  <p className="text-xs italic text-white/60">{v.example}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={14} />
                      {t.sentenceStructure}
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {transResult.breakdown.map((item, i) => (
                        <div key={i} className={cn("bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/10 transition-colors", lang === 'ar' ? 'md:flex-row-reverse' : '')}>
                          <span className="font-mono text-neon-blue font-bold text-lg" dir="ltr">{item.part}</span>
                          <span className="text-white/70 text-right leading-relaxed" dir="rtl">{item.explanation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

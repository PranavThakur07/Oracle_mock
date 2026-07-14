import { useState, useEffect } from 'react';
import { 
  Dna, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  HelpCircle, 
  Activity, 
  Compass, 
  Info, 
  Brain, 
  Star, 
  Download, 
  Search, 
  Plus, 
  LogOut, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

// Import local mock data
import mockDna from './mock/dna.json';
import mockDecision from './mock/decision.json';
import mockTimeline from './mock/timeline.json';
import mockHistory from './mock/history.json';
import mockReport from './mock/report.json';

type Screen = 'landing' | 'calibration' | 'dna-generated' | 'dashboard' | 'loading' | 'comparison' | 'profile' | 'report';

interface Option {
  label: string;
  sublabel: string;
  value: string;
  icon: string;
}

interface QuestionConfig {
  field: string;
  title: string;
  description: string;
  options: Option[];
}

const QUESTION_CONFIGS: QuestionConfig[] = [
  {
    field: 'goal',
    title: 'What is your primary career goal right now?',
    description: 'Select the primary focus that dominates your immediate professional path.',
    options: [
      { label: 'Highest Income', sublabel: 'Maximize cash compensation & immediate liquidity', value: 'Highest Income', icon: '💰' },
      { label: 'Career Growth', sublabel: 'Optimize promotions & skill compounding', value: 'Career Growth', icon: '📈' },
      { label: 'Entrepreneurship', sublabel: 'Build products, own equity, take venture leaps', value: 'Entrepreneurship', icon: '🚀' },
      { label: 'Leadership Role', sublabel: 'Drive teams, set strategy, cross-functional scope', value: 'Leadership Role', icon: '👑' },
      { label: 'Financial Stability', sublabel: 'Preserve capital, lock in low-risk salaries', value: 'Financial Stability', icon: '🛡️' },
      { label: 'Deep Learning', sublabel: 'Master specialized techs & research sectors', value: 'Deep Learning', icon: '🎓' }
    ]
  },
  {
    field: 'risk',
    title: 'What is your risk appetite for career moves?',
    description: 'How comfortable are you with trade-offs between security and rapid gains?',
    options: [
      { label: 'Conservative', sublabel: 'Protect downside, value job security and stable benefits', value: 'Conservative', icon: '🔒' },
      { label: 'Balanced', sublabel: 'Take calculated, asymmetric risks for high gains', value: 'Balanced', icon: '⚖️' },
      { label: 'Aggressive', sublabel: 'High risk, high reward paths. Value rapid pivots', value: 'Aggressive', icon: '⚡' }
    ]
  },
  {
    field: 'financial_style',
    title: 'What is your personal financial style?',
    description: 'How do you prioritize allocating your savings and budget?',
    options: [
      { label: 'Save First', sublabel: 'Lock 40%+ surplus in index funds & treasury bonds', value: 'Save First', icon: '🐷' },
      { label: 'Balanced', sublabel: 'Proportional split between safety and growth instruments', value: 'Balanced', icon: '💵' },
      { label: 'Invest Aggressively', sublabel: 'Leverage crypto, private equities, and personal projects', value: 'Invest Aggressively', icon: '📊' }
    ]
  },
  {
    field: 'work_life_balance',
    title: 'How do you value work-life balance?',
    description: 'Choose your desired integration level between career scaling and personal health.',
    options: [
      { label: 'Highest Priority', sublabel: 'Limit work hours to 35-40h, preserve family time', value: 'Highest Priority', icon: '🏡' },
      { label: 'Balanced Integration', sublabel: 'Flexible mix of hard work and mental wellness', value: 'Balanced', icon: '🍃' },
      { label: 'Growth Over Balance', sublabel: 'Sprint 60h+ weeks. Prioritize speed over comfort', value: 'Growth Over Balance', icon: '🔥' }
    ]
  },
  {
    field: 'learning_style',
    title: 'What is your preferred style of learning?',
    description: 'How do you acquire new professional competencies?',
    options: [
      { label: 'Hands On', sublabel: 'Direct trial, system coding, and hacking', value: 'Hands On', icon: '🛠️' },
      { label: 'Structured', sublabel: 'University, certs, and structured syllabi', value: 'Structured', icon: '📚' },
      { label: 'Mixed', sublabel: 'Read papers, audit code, hybrid self-learning', value: 'Mixed', icon: '🧩' }
    ]
  },
  {
    field: 'vision',
    title: 'What is your ultimate long-term career vision?',
    description: 'Where do you see yourself at the peak of your professional trajectory?',
    options: [
      { label: 'Build Wealth', sublabel: 'Target $5M+ liquid net worth via career equity', value: 'Build Wealth', icon: '💎' },
      { label: 'Start Company', sublabel: 'Launch a SaaS or technical venture within 3 years', value: 'Start Company', icon: '🏢' },
      { label: 'Become Leader', sublabel: 'Ascend to VP of Eng or CTO at major scale', value: 'Become Leader', icon: '📣' },
      { label: 'Global Career', sublabel: 'Navigate a global career & remote nodes', value: 'Global Career', icon: '🌍' },
      { label: 'Technical Expert', sublabel: 'Become a distinguished Fellow or Architect', value: 'Technical Expert', icon: '🧠' }
    ]
  }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [calibrated, setCalibrated] = useState(false);
  const [calibrationStep, setCalibrationStep] = useState(0); // 0-5
  const [answers, setAnswers] = useState({
    goal: '',
    risk: '',
    financial_style: '',
    work_life_balance: '',
    learning_style: '',
    vision: ''
  });

  // Load state parameters
  const [dna, setDna] = useState(mockDna);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState<string>('Year 1');
  const [explainingTrait, setExplainingTrait] = useState<{ name: string; value: string; score: number; explanation: string } | null>(null);
  const [isEditingDna, setIsEditingDna] = useState(false);
  const [editedTraits, setEditedTraits] = useState(mockDna.generated_profile);

  // Search and history simulation states
  const [promptText, setPromptText] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  
  // Scrubber parameters
  const timelineYears = ['Year 1', 'Year 2-3', 'Year 5'];
  
  const LOADING_STEPS = [
    'Calibrating Oracle...',
    'Understanding your priorities...',
    'Learning your decision style...',
    'Building your Decision DNA...',
    'Simulating alternative timelines...',
    'Personalizing recommendations...'
  ];

  const historyList = mockHistory;
  const activeScenarioId = 'A';

  // Auto-progress loading screen
  useEffect(() => {
    if (currentScreen === 'loading') {
      setLoadingStepIndex(0);
      const interval = setInterval(() => {
        setLoadingStepIndex(prev => {
          if (prev < LOADING_STEPS.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            // route appropriately after load
            if (!calibrated) {
              setCalibrated(true);
              setCurrentScreen('dna-generated');
            } else {
              setCurrentScreen('comparison');
            }
            return prev;
          }
        });
      }, 700);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  const handleCalibrationSelection = (field: string, val: string) => {
    setAnswers(prev => ({ ...prev, [field]: val }));
    if (calibrationStep < 5) {
      setTimeout(() => {
        setCalibrationStep(prev => prev + 1);
      }, 300);
    }
  };

  const finalizeCalibration = () => {
    // Generate synthetic profile
    const updatedDna = {
      ...dna,
      goal: answers.goal || 'Entrepreneurship',
      risk: answers.risk || 'Balanced',
      financial_style: answers.financial_style || 'Invest Aggressively',
      learning_style: answers.learning_style || 'Hands On',
      work_life_balance: answers.work_life_balance || 'Growth Over Balance',
      vision: answers.vision || 'Start Company',
      generated_profile: {
        ...dna.generated_profile,
        risk_appetite: { ...dna.generated_profile.risk_appetite, value: answers.risk || 'Balanced' },
        financial_behaviour: { ...dna.generated_profile.financial_behaviour, value: answers.financial_style || 'Invest Aggressively' },
        learning_style: { ...dna.generated_profile.learning_style, value: answers.learning_style || 'Hands On' },
        work_life_balance: { ...dna.generated_profile.work_life_balance, value: answers.work_life_balance || 'Growth Over Balance' }
      }
    };
    setDna(updatedDna);
    setEditedTraits(updatedDna.generated_profile);
    setCurrentScreen('loading');
  };

  const handleDnaTweak = (key: string, val: string) => {
    setEditedTraits(prev => ({
      ...prev,
      [key]: {
        ...prev[key as keyof typeof prev],
        value: val,
        explanation: 'Manually calibrated profile override.'
      }
    }));
  };

  const saveDnaOverrides = () => {
    setDna(prev => ({
      ...prev,
      generated_profile: editedTraits,
      dna_version: prev.dna_version + 1,
      confidence_score: 95
    }));
    setIsEditingDna(false);
  };

  // Recharts Radar Chart compiler
  const metricsKeys = ['risk', 'cost', 'growth', 'learning', 'work_life_balance'];
  const metricLabels: Record<string, string> = {
    risk: 'Risk Index',
    cost: 'Investment Cost',
    growth: 'Career Growth',
    learning: 'Learning Potential',
    work_life_balance: 'Work-Life Balance'
  };

  const radarData = metricsKeys.map(key => {
    const row: Record<string, any> = { subject: metricLabels[key] };
    mockDecision.scenarios.forEach(s => {
      row[s.id] = mockDecision.comparison_metrics[s.id as keyof typeof mockDecision.comparison_metrics]?.[key as keyof typeof mockDecision.comparison_metrics.A] || 0;
    });
    return row;
  });

  // Recharts Line Chart compiler
  const lineChartData = timelineYears.map(yr => {
    const row: Record<string, any> = { name: yr };
    mockDecision.scenarios.forEach(s => {
      const yrData = (mockTimeline as Record<string, Record<string, { salary: string; milestone: string; desc: string }>>)[yr];
      const salaryStr = yrData?.[s.id]?.salary || "$50,000";
      row[s.id] = parseInt(salaryStr.replace(/[^0-9]/g, '')) || 50000;
    });
    return row;
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      
      {/* ----------------- LANDING SCREEN ----------------- */}
      {currentScreen === 'landing' && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative grid-bg">
          <div className="glow-effect top-10 left-10 opacity-30"></div>
          <div className="glow-effect bottom-10 right-10 opacity-20 bg-accent/10"></div>
          
          <div className="w-full max-w-lg text-center space-y-8 glass-panel p-8 sm:p-12 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden">
            {/* Ambient inner glow */}
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(37,99,235,0.25)] animate-pulse-slow">
                <Dna size={28} />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-display font-extrabold text-white tracking-tight leading-none text-glow-primary">
                ORACLE
              </h1>
              <p className="text-xs font-semibold text-accent font-mono tracking-widest uppercase">
                Cognitive Career Engine
              </p>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed pt-2">
                "Because every decision begins with understanding the decision maker."
              </p>
            </div>

            {/* Checklist feature widget */}
            <div className="py-5 border-y border-zinc-900/60 max-w-xs mx-auto space-y-2.5 text-left font-mono text-[10px] text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Calibrate personality decisions priors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Simulate compound salary timelines</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Compare downside risk volatilities</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-xs mx-auto pt-2">
              <button
                onClick={() => {
                  setCalibrationStep(0);
                  setCurrentScreen('calibration');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-[0_4px_25px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_30px_rgba(37,99,235,0.4)] transition-all cursor-pointer group"
              >
                <span>Calibrate My Engine</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => {
                  setCalibrated(false);
                  setCurrentScreen('dashboard');
                }}
                className="w-full py-3 px-6 rounded-xl bg-zinc-950/40 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all text-xs font-medium cursor-pointer"
              >
                Enter Workspace (Generic)
              </button>
            </div>
            
            <div className="text-[10px] text-zinc-600 font-mono">
              Hackathon Round 1 UI/UX Clickable Demo
            </div>
          </div>
        </div>
      )}

      {/* ----------------- CALIBRATION SCREEN ----------------- */}
      {currentScreen === 'calibration' && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative grid-bg">
          <div className="w-full max-w-3xl space-y-6">
            <div className="flex items-center justify-between text-[10px] text-zinc-550 font-mono tracking-wider uppercase">
              <button
                onClick={() => {
                  if (calibrationStep > 0) {
                    setCalibrationStep(prev => prev - 1);
                  } else {
                    setCurrentScreen('landing');
                  }
                }}
                className="flex items-center gap-1 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                <ArrowLeft size={12} />
                <span>Back</span>
              </button>
              <span>{calibrationStep + 1} / 6</span>
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className="text-danger/80 hover:text-danger cursor-pointer"
              >
                Skip Calibration
              </button>
            </div>

            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                style={{ width: `${((calibrationStep + 1) / 6) * 100}%` }}
              ></div>
            </div>

            {/* Questions rendering */}
            <div className="space-y-6 glass-panel p-8 sm:p-10 rounded-3xl border border-zinc-800/80 shadow-2xl relative overflow-hidden">
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                  {QUESTION_CONFIGS[calibrationStep].title}
                </h2>
                <p className="text-xs text-zinc-400">
                  {QUESTION_CONFIGS[calibrationStep].description}
                </p>
              </div>

              <div className={`grid gap-4 pt-2 ${
                QUESTION_CONFIGS[calibrationStep].options.length === 6 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : QUESTION_CONFIGS[calibrationStep].options.length === 5 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : 'grid-cols-1 sm:grid-cols-3'
              }`}>
                {QUESTION_CONFIGS[calibrationStep].options.map((opt) => {
                  const field = QUESTION_CONFIGS[calibrationStep].field;
                  const isSelected = answers[field as keyof typeof answers] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleCalibrationSelection(field, opt.value)}
                      className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? 'bg-primary/10 border-primary shadow-[0_0_25px_rgba(37,99,235,0.2)] text-white' 
                          : 'bg-zinc-950/40 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-750 hover:bg-zinc-900/10'
                      }`}
                    >
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-all duration-300 ${
                        isSelected ? 'bg-primary/20 border border-primary/30 text-white' : 'bg-zinc-900/60 border border-zinc-800 text-zinc-450'
                      }`}>
                        {opt.icon}
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold block text-white tracking-wide">{opt.label}</span>
                        <span className="text-[10px] text-zinc-500 leading-relaxed block">{opt.sublabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {calibrationStep === 5 && answers.vision && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={finalizeCalibration}
                    className="flex items-center gap-2 py-3 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-[0_4px_25px_rgba(37,99,235,0.3)] transition-all cursor-pointer"
                  >
                    <span>Finalize Calibration</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- LOADER SCREEN ----------------- */}
      {currentScreen === 'loading' && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative grid-bg">
          <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-850 bg-zinc-950/80 shadow-2xl text-center space-y-6 font-mono">
            <div className="flex justify-center">
              <RefreshCw className="animate-spin text-primary" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
                Cognitive Synthesis
              </h3>
              <p className="text-xs text-zinc-350 font-bold animate-pulse text-glow-primary">
                &gt; {LOADING_STEPS[loadingStepIndex]}
              </p>
            </div>
            <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl text-[10px] text-zinc-600 leading-relaxed text-left">
              <span>ORACLE ENGINE INGESTING BEHAVIORAL ATTRIBUTES...</span>
              <br />
              <span>MAPS: [Goal: {answers.goal || 'Entrepreneurship'}, Risk: {answers.risk || 'Balanced'}]</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- DNA GENERATED SPLASH SCREEN ----------------- */}
      {currentScreen === 'dna-generated' && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 relative grid-bg">
          <div className="w-full max-w-sm text-center space-y-6 glass-panel p-8 rounded-3xl border border-zinc-800">
            <div className="flex justify-center">
              <div className="text-success shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-full bg-success/10 p-2">
                <CheckCircle2 size={48} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Calibration Complete</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Your Decision DNA profile has been successfully built and loaded into the simulation memory.
              </p>
            </div>
            
            <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/30 font-mono text-[10px] space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-zinc-500">ARCHETYPE:</span>
                <span className="font-bold text-accent">Builder</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-550">CONFIDENCE:</span>
                <span className="font-bold text-white">92%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-550">DECISION STYLE:</span>
                <span className="font-bold text-white">Analytical</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="w-full py-3 px-6 rounded-xl bg-primary hover:bg-blue-600 text-xs font-semibold text-white shadow-lg cursor-pointer"
            >
              Enter Workspace
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MAIN APP WORKSPACE PAGES ----------------- */}
      {(currentScreen === 'dashboard' || currentScreen === 'comparison' || currentScreen === 'profile' || currentScreen === 'report') && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* SIDEBAR */}
          <aside className="w-80 border-r border-zinc-800/80 bg-zinc-950/60 hidden md:flex flex-col shrink-0">
            
            {/* Logo and Brand */}
            <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setCurrentScreen('landing')}
              >
                <Dna className="text-primary animate-pulse-slow" size={20} />
                <span className="font-display font-bold text-white text-glow-primary tracking-wide text-sm">ORACLE</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                PROTOTYPE
              </span>
            </div>

            {/* Quick Navigation Links */}
            <div className="p-4 border-b border-zinc-800/50 space-y-1.5">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentScreen === 'dashboard'
                    ? 'bg-primary/10 border border-primary/30 text-white'
                    : 'bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                <Plus size={14} className="text-primary" />
                <span>New Decision</span>
              </button>
              <button
                onClick={() => {
                  if (!calibrated) {
                    setCurrentScreen('calibration');
                  } else {
                    setCurrentScreen('profile');
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentScreen === 'profile'
                    ? 'bg-primary/10 border border-primary/30 text-white'
                    : 'bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                <Dna size={14} className="text-accent" />
                <span>Decision DNA</span>
              </button>
              {calibrated && (
                <button
                  onClick={() => setCurrentScreen('report')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    currentScreen === 'report'
                      ? 'bg-primary/10 border border-primary/30 text-white'
                      : 'bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                  }`}
                >
                  <FileText size={14} className="text-zinc-450" />
                  <span>Executive Briefing PDF</span>
                </button>
              )}
            </div>

            {/* Past History Searches */}
            <div className="p-4 border-b border-zinc-800/50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-zinc-550" size={16} />
                <input
                  type="text"
                  placeholder="Search past simulations..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-550 uppercase tracking-widest block font-mono">
                Simulations
              </div>
              {historyList
                .filter(item => item.query.toLowerCase().includes(historySearch.toLowerCase()))
                .map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedYear('Year 1');
                      setCurrentScreen('comparison');
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-zinc-900/40 border border-transparent hover:border-zinc-900 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-0.5 truncate">
                      <p className="text-xs text-zinc-300 font-medium group-hover:text-white truncate">
                        {item.query}
                      </p>
                      <p className="text-[10px] text-zinc-550 font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
            </div>

            {/* Logout button */}
            <div className="p-4 border-t border-zinc-800/50">
              <button
                onClick={() => setCurrentScreen('landing')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-900 text-zinc-450 hover:text-danger text-xs font-semibold cursor-pointer transition-colors"
              >
                <LogOut size={14} />
                <span>Return to Landing</span>
              </button>
            </div>
          </aside>

          {/* MAIN PAGE AREA */}
          <main className="flex-1 overflow-y-auto bg-[#09090B] p-6 sm:p-10 relative">
            <div className="glow-effect top-1/4 right-1/4 opacity-10"></div>
            
            {/* ----------------- 1. DASHBOARD / COMPOSER VIEW ----------------- */}
            {currentScreen === 'dashboard' && (
              <div className="w-full max-w-3xl mx-auto space-y-12 py-12 flex flex-col justify-center min-h-[calc(100vh-140px)]">
                
                {/* Headers */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-display font-bold text-white tracking-tight text-glow-primary">
                    Explore Your Futures
                  </h2>
                  <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                    Model decisions, simulate timelines, and visualize tradeoffs in our sandbox environment.
                  </p>
                </div>

                {/* Calibration Banner Widget */}
                {calibrated ? (
                  <div className="glass-card p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl flex items-center justify-between gap-4 max-w-lg mx-auto w-full animate-fade-in">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🧬</span>
                      <div>
                        <h4 className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
                          <span>Oracle Calibration Active</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></span>
                        </h4>
                        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[10px] text-zinc-400 font-mono mt-1">
                          <span>Archetype: <strong className="text-accent">{dna.generated_profile.decision_archetype.value}</strong></span>
                          <span>Risk: <strong className="text-white">{dna.generated_profile.risk_appetite.value}</strong></span>
                          <span>Growth: <strong className="text-white">{dna.generated_profile.growth_orientation.value}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-[9px] font-mono text-zinc-500">Refined recently</p>
                      <button
                        type="button"
                        onClick={() => setCurrentScreen('profile')}
                        className="text-[10px] font-bold text-primary hover:underline hover:text-blue-400 flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View Profile</span>
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 backdrop-blur-xl flex items-center justify-between gap-4 max-w-lg mx-auto w-full animate-fade-in">
                    <div className="flex items-center gap-3">
                      <span className="text-xl text-zinc-500">🧬</span>
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-300 tracking-wide">Generic Decision Engine Active</h4>
                        <p className="text-[10px] text-zinc-505 leading-normal mt-0.5">
                          Simulate futures using only your prompt. Complete Calibration for personalized simulations.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('calibration')}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 hover:text-white transition-all text-[10px] font-semibold shrink-0 cursor-pointer"
                    >
                      Calibrate Now
                    </button>
                  </div>
                )}

                {/* Composer Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!promptText.trim()) return;
                    setCurrentScreen('loading');
                  }} 
                  className="space-y-6"
                >
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl overflow-hidden focus-within:border-zinc-700 transition-all shadow-xl">
                    <textarea
                      placeholder="e.g. startup CTO offer with 1.5% equity vs senior engineer big tech promotion with stock options..."
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      className="w-full bg-transparent border-0 resize-none min-h-[100px] p-4 text-sm text-zinc-250 placeholder-zinc-500 focus:outline-none"
                    />
                    <div className="px-4 py-3 bg-zinc-900/30 border-t border-zinc-900/60 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={!promptText.trim()}
                        className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                          promptText.trim()
                            ? 'bg-primary text-white hover:bg-blue-600 cursor-pointer'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        <span>Simulate Scenarios</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Suggestion Prompts */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Suggested Simulators</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {[
                        'Venture startup Lead Dev with equity vs Corporate stable track promotion.',
                        'Relocating to London for hedge fund finance gig vs remote freelance.',
                        'Bootstrapping SaaS full time with savings vs maintaining corporate hybrid.'
                      ].map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPromptText(sug)}
                          className="p-3 text-left rounded-xl border border-zinc-900 hover:border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 transition-colors text-[11px] cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* ----------------- 2. SCENARIO COMPARISON / TIMELINE VIEW ----------------- */}
            {currentScreen === 'comparison' && (
              <div className="space-y-12">
                
                {/* Title Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                  <div className="space-y-2">
                    <button 
                      onClick={() => setCurrentScreen('dashboard')}
                      className="flex items-center gap-1 text-xs text-zinc-550 hover:text-zinc-350 transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={12} />
                      <span>Workspace Composer</span>
                    </button>
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                      <span>Startup CTO offer vs Big Tech promotion</span>
                      <Star size={18} className="text-warning fill-warning" />
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-mono">
                      <span>Age: 28</span>
                      <span>Location: USA</span>
                      <span>Target Horizon: 5 Years</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentScreen('report')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-xs font-semibold text-white shadow-lg transition-colors cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Export Dossier PDF</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Scrubber Timeline */}
                <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-lg text-white">Interactive Decision Timeline</h3>
                      <p className="text-xs text-zinc-500 font-mono">Scrub years to simulate outcomes, milestones, and compound career income growth.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 font-semibold uppercase">Currently Simulating:</span>
                      <span className="px-3 py-1 bg-primary/10 border border-primary/25 rounded-lg text-xs font-mono font-bold text-primary animate-pulse-slow">
                        {selectedYear}
                      </span>
                    </div>
                  </div>

                  {/* Scrubber slider */}
                  <div className="space-y-4 max-w-2xl mx-auto py-2">
                    <input
                      type="range"
                      min={0}
                      max={timelineYears.length - 1}
                      value={timelineYears.indexOf(selectedYear)}
                      onChange={(e) => setSelectedYear(timelineYears[parseInt(e.target.value)])}
                      className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-zinc-400 font-mono px-1">
                      {timelineYears.map(yr => (
                        <span 
                          key={yr}
                          onClick={() => setSelectedYear(yr)}
                          className={`cursor-pointer transition-colors ${selectedYear === yr ? 'text-primary font-bold' : 'hover:text-zinc-200'}`}
                        >
                          {yr}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Timeline Milestones Display */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-900/60">
                    {mockDecision.scenarios.map(s => {
                      const yrData = (mockTimeline as Record<string, Record<string, { salary: string; milestone: string; desc: string }>>)[selectedYear];
                      const yrNode = yrData?.[s.id] || { salary: "$50,005", milestone: "N/A", desc: "No data available." };
                      const config = s.id === 'A' ? { color: '#3B82F6', title: 'Accelerated Growth' } : s.id === 'B' ? { color: '#10B981', title: 'Balanced Path' } : { color: '#8B5CF6', title: 'Defensive Hedge' };
                      
                      return (
                        <div 
                          key={s.id}
                          className={`p-5 rounded-xl border transition-all duration-300 space-y-4 ${
                            activeScenarioId === s.id ? 'border-zinc-800 bg-zinc-900/20' : 'border-zinc-900/50 bg-zinc-950/10 opacity-70'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold font-mono tracking-wider" style={{ color: config.color }}>
                              {config.title}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-550">
                              Confidence: {s.confidence_level}%
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Projected Salary Rate</span>
                            <p className="text-xl font-display font-bold text-white text-glow-primary">
                              {yrNode.salary}
                            </p>
                          </div>

                          <div className="space-y-1 border-t border-zinc-900 pt-3">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Active Milestone ({selectedYear})</span>
                            <h4 className="text-xs font-bold text-white">{yrNode.milestone}</h4>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{yrNode.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personalization Widget */}
                {calibrated && (
                  <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/40 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider font-mono">
                      <Dna size={14} className="animate-pulse" />
                      <span>Decision DNA Simulation Influence</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                      {Object.entries(mockDecision.dna_influence).map(([trait, level]) => (
                        <div key={trait} className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-850 flex flex-col gap-0.5">
                          <span className="text-[10px] text-zinc-400 font-medium">{trait}</span>
                          <span className={`font-bold font-mono tracking-wide ${
                            level === 'High' ? 'text-success' : level === 'Medium' ? 'text-accent' : 'text-zinc-500'
                          }`}>
                            {level} Influence
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recharts Analytics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Radar comparison */}
                  <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Dimension Comparison Matrix</h3>
                      <p className="text-xs text-zinc-500 font-mono">Weighted score values out of 10 across key variables.</p>
                    </div>
                    
                    <div className="h-80 w-full flex items-center justify-center font-mono text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                          <PolarGrid stroke="#27272A" />
                          <PolarAngleAxis dataKey="subject" stroke="#71717A" />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#27272A" />
                          <Radar name="Accelerated" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} />
                          <Radar name="Balanced" dataKey="B" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
                          <Radar name="Defensive" dataKey="C" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.15} />
                          <Tooltip contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#fff' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Line Chart Projections */}
                  <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white">Compound Salary Trajectory</h3>
                      <p className="text-xs text-zinc-500 font-mono">Simulated cash compensation compounded over 5 years.</p>
                    </div>
                    
                    <div className="h-80 w-full flex items-center justify-center font-mono text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                          <XAxis dataKey="name" stroke="#71717A" />
                          <YAxis stroke="#71717A" tickFormatter={(v) => `$${v/1000}k`} />
                          <Tooltip contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', color: '#fff' }} formatter={(v) => [`$${(Number(v)).toLocaleString()}`, 'Projected Income']} />
                          <Line type="monotone" dataKey="A" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="B" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="C" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Scenario details */}
                <div className="space-y-6">
                  <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase font-mono block">
                    Detailed Scenarios Analysis
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mockDecision.scenarios.map(s => (
                      <div key={s.id} className="p-5 rounded-2xl glass-card space-y-5">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">{s.title}</h4>
                          <p className="text-xs text-zinc-550 leading-relaxed">{s.summary}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Key Advantages</span>
                          <ul className="text-xs text-zinc-400 space-y-1 leading-relaxed">
                            {s.pros.map((p, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-success mt-0.5">•</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Downside Volatilities</span>
                          <ul className="text-xs text-zinc-400 space-y-1 leading-relaxed">
                            {s.cons.map((c, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-danger mt-0.5">•</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ----------------- 3. DECISION DNA PROFILE VIEW ----------------- */}
            {currentScreen === 'profile' && (
              <div className="space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-accent font-mono tracking-widest uppercase">My Calibration Portfolio</span>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                      <Dna className="text-primary" size={24} />
                      <span>Decision DNA™ Profile</span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentScreen('calibration')}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-300 transition-colors cursor-pointer"
                    >
                      Retake Calibration
                    </button>
                    {isEditingDna ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsEditingDna(false);
                            setEditedTraits(dna.generated_profile);
                          }}
                          className="px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-400 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveDnaOverrides}
                          className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary hover:bg-blue-600 text-white shadow-lg cursor-pointer"
                        >
                          Save Tweaks
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingDna(true)}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 hover:text-white transition-all cursor-pointer"
                      >
                        Tweak DNA Parameters
                      </button>
                    )}
                  </div>
                </div>

                {/* Health & Workflow Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Health card */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 space-y-4">
                      <h3 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                        <Activity size={14} className="text-primary" />
                        <span>Calibration Health</span>
                      </h3>
                      
                      <div className="space-y-3 pt-2 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-550">Calibration Status</span>
                          <span className="px-2.5 py-0.5 rounded border border-success/30 bg-success/5 text-[10px] font-bold text-success">
                            🟢 Excellent
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-550">Confidence Score</span>
                          <span className="font-bold text-white">{dna.confidence_score}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-550">DNA Version</span>
                          <span className="font-bold text-zinc-350">v{dna.dna_version}.0</span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-lg text-[10px] text-zinc-500 font-mono leading-relaxed">
                        <Info size={11} className="inline mr-1 text-primary shrink-0" />
                        <span>Decision DNA refined based on your recent decision patterns. Evolution is slow and explainable.</span>
                      </div>
                    </div>

                    {/* How Oracle Uses DNA (Visual Workflow) */}
                    <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 space-y-4">
                      <h3 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                        <Compass size={14} className="text-accent" />
                        <span>Oracle Ingestion Flow</span>
                      </h3>
                      <div className="space-y-3 pt-2 font-mono text-[10px]">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-450">1</div>
                          <div>
                            <span className="font-bold text-white block">Oracle Calibration</span>
                            <span className="text-zinc-550">Onboarding seeds initial traits</span>
                          </div>
                        </div>
                        <div className="h-3 w-[1px] bg-zinc-800 ml-3"></div>
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">2</div>
                          <div>
                            <span className="font-bold text-white block">Decision DNA Prior</span>
                            <span className="text-zinc-550">Behavioral constraints loaded</span>
                          </div>
                        </div>
                        <div className="h-3 w-[1px] bg-zinc-800 ml-3"></div>
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-450">3</div>
                          <div>
                            <span className="font-bold text-white block">Timeline Simulation</span>
                            <span className="text-zinc-550">Gemini filters paths by risk weights</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Archetype & Cards Grid */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Archetype banner */}
                    <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl shrink-0">
                        🛠️
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-primary tracking-widest uppercase font-mono">Calibrated Decision Archetype</span>
                        <h3 className="text-xl font-display font-extrabold text-white">
                          {dna.generated_profile.decision_archetype.value}
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {dna.generated_profile.decision_archetype.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(editedTraits).map(([key, trait]) => {
                        if (key === 'decision_archetype') return null;
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        
                        return (
                          <div key={key} className="p-5 rounded-2xl glass-card relative flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase font-mono">{label}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono text-zinc-600">{(trait.weight * 100).toFixed(0)}% weight</span>
                                  <button
                                    type="button"
                                    onClick={() => setExplainingTrait({ name: label, value: trait.value, score: trait.score, explanation: trait.explanation })}
                                    className="text-zinc-650 hover:text-zinc-400 cursor-pointer"
                                  >
                                    <HelpCircle size={12} />
                                  </button>
                                </div>
                              </div>

                              {isEditingDna ? (
                                <div className="pt-1">
                                  {key === 'risk_appetite' && (
                                    <select
                                      value={trait.value}
                                      onChange={(e) => handleDnaTweak(key, e.target.value)}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                                    >
                                      <option value="Conservative">Conservative</option>
                                      <option value="Balanced">Balanced</option>
                                      <option value="Aggressive">Aggressive</option>
                                    </select>
                                  )}
                                  {key === 'growth_orientation' && (
                                    <select
                                      value={trait.value}
                                      onChange={(e) => handleDnaTweak(key, e.target.value)}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                                    >
                                      <option value="High">High</option>
                                      <option value="Medium">Medium</option>
                                      <option value="Low">Low</option>
                                    </select>
                                  )}
                                  {key === 'financial_behaviour' && (
                                    <select
                                      value={trait.value}
                                      onChange={(e) => handleDnaTweak(key, e.target.value)}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                                    >
                                      <option value="Save First">Save First</option>
                                      <option value="Balanced">Balanced</option>
                                      <option value="Invest Aggressively">Invest Aggressively</option>
                                    </select>
                                  )}
                                  {key === 'learning_style' && (
                                    <select
                                      value={trait.value}
                                      onChange={(e) => handleDnaTweak(key, e.target.value)}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                                    >
                                      <option value="Hands On">Hands On</option>
                                      <option value="Structured">Structured</option>
                                      <option value="Mixed">Mixed</option>
                                    </select>
                                  )}
                                  {key === 'work_life_balance' && (
                                    <select
                                      value={trait.value}
                                      onChange={(e) => handleDnaTweak(key, e.target.value)}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                                    >
                                      <option value="Highest Priority">Highest Priority</option>
                                      <option value="Balanced">Balanced</option>
                                      <option value="Growth Over Balance">Growth Over Balance</option>
                                    </select>
                                  )}
                                  {key === 'decision_style' && (
                                    <select
                                      value={trait.value}
                                      onChange={(e) => handleDnaTweak(key, e.target.value)}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                                    >
                                      <option value="Analytical">Analytical</option>
                                      <option value="Intuitive">Intuitive</option>
                                      <option value="Collaborative">Collaborative</option>
                                      <option value="Risk-Averse">Risk-Averse</option>
                                    </select>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm font-semibold text-white tracking-wide pt-1">{trait.value}</p>
                              )}
                            </div>

                            <div className="h-1 w-full bg-zinc-900 rounded-full mt-4 overflow-hidden">
                              <div className="h-full rounded-full bg-primary/70" style={{ width: `${trait.score * 10}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ----------------- 4. EXECUTIVE REPORT PREVIEW SCREEN ----------------- */}
            {currentScreen === 'report' && (
              <div className="space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-primary font-mono tracking-widest uppercase">Dossier PDF Viewer</span>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <FileText className="text-primary" size={24} />
                      <span>Executive Briefing Report</span>
                    </h2>
                  </div>

                  <a
                    href="/oracle_report.pdf"
                    download="oracle_report.pdf"
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-600 text-xs font-semibold text-white shadow-lg transition-colors cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Download Report PDF</span>
                  </a>
                </div>

                {/* Simulated PDF sheet paper */}
                <div className="max-w-3xl mx-auto bg-white text-zinc-900 p-8 sm:p-12 shadow-2xl rounded-xl border border-zinc-200 font-serif leading-relaxed">
                  <div className="border-b-2 border-zinc-900 pb-6 mb-8 text-center sm:text-left">
                    <span className="font-sans text-[10px] font-bold text-primary uppercase tracking-widest block">CONFIDENTIAL DOSSIER</span>
                    <h1 className="font-sans text-3xl font-extrabold tracking-tight mt-1">ORACLE EXECUTIVE REPORT</h1>
                    <p className="font-sans text-xs text-zinc-500 font-mono mt-1">SIMULATION ID: 104-Hackathon-Round1 | DATE: {new Date().toLocaleDateString()}</p>
                  </div>

                  {mockReport.sections.map((sec, i) => (
                    <div key={i} className="space-y-4 mb-8">
                      <h3 className="font-sans text-xs font-bold text-zinc-700 tracking-wider uppercase border-b border-zinc-200 pb-1">{sec.title}</h3>
                      {sec.paragraphs.map((p, idx) => (
                        <p key={idx} className="text-sm text-zinc-800 leading-relaxed">{p}</p>
                      ))}
                    </div>
                  ))}

                  {/* Radar Chart section */}
                  <div className="space-y-4 mb-8">
                    <h3 className="font-sans text-xs font-bold text-zinc-700 tracking-wider uppercase border-b border-zinc-200 pb-1">DECISION DNA PERSONALIZATION SUMMARY</h3>
                    <p className="text-sm text-zinc-800 leading-relaxed">
                      Recommendations in this report have been custom-weighted to reflect your <strong>Builder</strong> prior (Archetype Weight: 90%), preference for <strong>Growth Over Balance</strong>, and calculated risk tolerances.
                    </p>
                    
                    <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 font-sans text-xs space-y-2 max-w-md">
                      <span className="text-[10px] font-bold text-zinc-400 block font-mono">Personalization Influencers</span>
                      <div className="flex justify-between">
                        <span>Risk Appetite prior:</span>
                        <strong className="text-zinc-700">Balanced (75% influence weight)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Financial style prior:</span>
                        <strong className="text-zinc-700">Invest Aggressively (80% influence weight)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 pt-6 mt-12 text-center font-sans text-[9px] text-zinc-400">
                    All simulated timelines represent estimated possibilities based on your cognitive priors.
                  </div>
                </div>

              </div>
            )}

          </main>
        </div>
      )}

      {/* Trait explanation Overlay Modal */}
      {explainingTrait && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setExplainingTrait(null)} />
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 rounded-2xl p-6 relative z-10 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Brain size={16} className="text-primary" />
              <h3 className="text-sm font-bold text-white">Why: {explainingTrait.name}</h3>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-550">VALUE:</span>
                <span className="font-bold text-white">{explainingTrait.value}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-550">SCORE:</span>
                <span className="font-bold text-primary">{explainingTrait.score} / 10</span>
              </div>
              <div className="p-3.5 bg-zinc-900/60 border border-zinc-850 rounded-xl text-zinc-300 font-sans leading-relaxed">
                {explainingTrait.explanation}
              </div>
            </div>
            <button
              onClick={() => setExplainingTrait(null)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer text-center"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Star, 
  Send, 
  AlertTriangle, 
  Info,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Rocket,
  Scale,
  Anchor,
  HelpCircle,
  X,
  Gauge,
  TrendingUp,
  Brain,
  Layers,
  Check,
  Dna,
  Play,
  GitFork,
  HeartHandshake,
  Terminal,
  User,
  DollarSign,
  Globe,
  Calendar,
  Briefcase,
  Mic,
  MicOff,
  ChevronRight,
  Plus,
  LogOut,
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
  Tooltip as ReChartsTooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

// Import local mock data
import mockDna from './mock/dna.json';
import mockDecision from './mock/decision.json';
import mockTimeline from './mock/timeline.json';
import mockHistory from './mock/history.json';
import mockReport from './mock/report.json';

type Screen = 'landing' | 'dashboard' | 'comparison' | 'profile' | 'report';

interface LoadingStep {
  id: number;
  label: string;
  duration: number;
}

const REASONING_STEPS: LoadingStep[] = [
  { id: 1, label: "Understanding your goal", duration: 700 },
  { id: 2, label: "Identifying constraints", duration: 700 },
  { id: 3, label: "Exploring possible paths", duration: 800 },
  { id: 4, label: "Simulating future outcomes", duration: 800 },
  { id: 5, label: "Comparing tradeoffs", duration: 700 },
  { id: 6, label: "Evaluating opportunity costs", duration: 700 },
  { id: 7, label: "Generating insights", duration: 700 }
];

const SUGGESTED_PROMPTS = [
  { text: "Should I pursue an MBA after MCA?", icon: "🎓" },
  { text: "Should I relocate to London?", icon: "📍" },
  { text: "Should I start my own startup?", icon: "🚀" },
  { text: "Should I buy a house or continue renting?", icon: "🏠" }
];

const SCENARIO_COLORS: Record<string, string> = {
  A: '#3B82F6', // Blue (Accelerated)
  B: '#10B981', // Emerald (Balanced)
  C: '#8B5CF6'  // Purple (Defensive)
};

const SCENARIO_IDENTITIES: Record<string, { title: string; philosophy: string; icon: any; color: string; desc: string }> = {
  A: {
    title: "Accelerated Growth",
    philosophy: "Aggressive Leap / High Risk, High Reward",
    icon: Rocket,
    color: "#3B82F6",
    desc: "Maximizes rapid career climbs and capital accumulation at the expense of stability."
  },
  B: {
    title: "Balanced Path",
    philosophy: "Sustainable & Consistent Development",
    icon: Scale,
    color: "#10B981",
    desc: "Maintains standard growth pace and preserves personal time, avoiding cognitive burnout."
  },
  C: {
    title: "Defensive Hedge",
    philosophy: "Downside Risk Mitigation & Safety First",
    icon: Anchor,
    color: "#8B5CF6",
    desc: "Guarantees alternative security paths and safeguards present assets against downturns."
  }
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  
  // Composer Form Parameters
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [age, setAge] = useState('28');
  const [salary, setSalary] = useState('$80,000');
  const [budget, setBudget] = useState('$20,000');
  const [country, setCountry] = useState('USA');
  const [goals, setGoals] = useState('Build high-scale software engineering products');
  const [riskAppetite, setRiskAppetite] = useState('Medium');
  const [timeHorizon, setTimeHorizon] = useState('5 Years');

  // Refinement refiner list
  const [followUps, setFollowUps] = useState<Array<{ id: number; query: string; response_json: { response_text: string; updated_scenarios?: boolean } }>>([]);
  const [chatQuery, setChatQuery] = useState('');
  const [submittingChat, setSubmittingChat] = useState(false);

  // Micro-states
  const [isExiting, setIsExiting] = useState(false);
  const [hoveredBranch, setHoveredBranch] = useState<'A' | 'B' | 'C' | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Simulation Detail States
  const [activeScenarioId, setActiveScenarioId] = useState<string>('A');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('Year 1');
  const [explainingMetric, setExplainingMetric] = useState<{
    scenarioId: string;
    scenarioTitle: string;
    metricName: string;
    score: number;
    explanation: string;
  } | null>(null);

  // DNA State
  const [dna, setDna] = useState(mockDna);
  const [isEditingDna, setIsEditingDna] = useState(false);
  const [editedTraits, setEditedTraits] = useState(mockDna.generated_profile);

  const timelineYears = ['Year 1', 'Year 2-3', 'Year 5'];
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [followUps, submittingChat]);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setCurrentScreen('dashboard');
    }, 700);
  };

  const handleDemo = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      setQuery("Should I pursue an MBA after MCA?");
      setAge("23");
      setSalary("$0 (Student)");
      setBudget("$20,000");
      setCountry("India");
      setGoals("Become a high-level Product Manager or Tech Lead in a global startup");
      setRiskAppetite("Medium");
      setTimeHorizon("5 Years");
      setShowAdvanced(true);
      setCurrentScreen('dashboard');
    }, 700);
  };

  const triggerSimulation = () => {
    if (!query.trim()) return;
    setIsSubmitting(true);
    setCurrentStepIndex(0);

    let completedSteps = 0;
    const startStepAnimation = (index: number) => {
      if (index >= REASONING_STEPS.length) return;
      setTimeout(() => {
        completedSteps++;
        setCurrentStepIndex(completedSteps);
        startStepAnimation(completedSteps);
      }, REASONING_STEPS[index].duration);
    };

    startStepAnimation(0);

    const totalAnimDuration = REASONING_STEPS.reduce((sum, s) => sum + s.duration, 0);
    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedYear('Year 1');
      setActiveScenarioId('A');
      setFollowUps([]);
      setCurrentScreen('comparison');
    }, totalAnimDuration + 400);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    setIsListening(true);
    const recognitionText = "Should I pivot to full-time venture-backed Series A lead dev?";
    setTimeout(() => {
      setQuery(prev => prev ? `${prev} ${recognitionText}` : recognitionText);
      setIsListening(false);
    }, 2200);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || submittingChat) return;

    const userPrompt = chatQuery;
    setChatQuery('');
    setSubmittingChat(true);

    setTimeout(() => {
      setFollowUps(prev => [
        ...prev,
        {
          id: Date.now(),
          query: userPrompt,
          response_json: {
            response_text: `Based on your Builder DNA, evaluating: "${userPrompt}". Compounding the 5-year timeline adjustments suggests accelerated growth models support high base capital returns, whereas risk profiles remain constrained by market variables.`,
            updated_scenarios: true
          }
        }
      ]);
      setSubmittingChat(false);
    }, 1500);
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

  // Radar Compiler
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

  // Timeline Math Compiler
  const getProjectedSalary = (scenarioId: string, yearStr: string) => {
    const numericSalary = parseInt(salary.replace(/[^0-9]/g, '')) || 80000;
    
    let yearsDiff = 0;
    if (yearStr === 'Year 2-3') yearsDiff = 2;
    if (yearStr === 'Year 5') yearsDiff = 4;
    
    let multiplier = 1.05; // 5% baseline
    if (scenarioId === 'A') multiplier = 1.22; // Accelerated: 22% compound growth
    if (scenarioId === 'B') multiplier = 1.10; // Balanced: 10% compound growth
    if (scenarioId === 'C') multiplier = 1.03; // Defensive: 3% compound growth

    const projected = numericSalary * Math.pow(multiplier, yearsDiff);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(projected);
  };

  // Compile Line Chart data across all timeline years
  const lineChartData = timelineYears.map(year => {
    const row: Record<string, any> = { name: year };
    mockDecision.scenarios.forEach(s => {
      const salaryStr = getProjectedSalary(s.id, year);
      row[s.id] = parseInt(salaryStr.replace(/[^0-9]/g, '')) || 0;
    });
    return row;
  });

  const getMetricExplanation = (scenarioId: string, metric: string, score: number) => {
    const scenario = mockDecision.scenarios.find(s => s.id === scenarioId);
    if (!scenario) return "No explanation available.";
    if (metric === 'risk') {
      return `Oracle calculated a Risk Index of ${score}/10 because this pathway involves key risks such as: ${scenario.risks.join(', ')}. The confidence level in this risk simulation is ${scenario.confidence_level}%.`;
    }
    if (metric === 'growth') {
      return `The Career Growth rating of ${score}/10 is backed by the expected benefits: "${scenario.expected_benefits}". Over a multi-year horizon, this yields compound advancement.`;
    }
    if (metric === 'cost') {
      return `The Investment Cost of ${score}/10 corresponds to the estimated financial layout: "${scenario.estimated_costs}".`;
    }
    return `This score of ${score}/10 is computed using user constraints, starting assumptions (${mockDecision.assumptions[0]}), and scenario parameters: "${scenario.summary}".`;
  };

  const lacksContextInfo = query.length > 10 && !age && !budget && !country && !goals;

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      
      {/* Dynamic transition fade */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 flex items-center justify-center pointer-events-none"
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.15 }}
              className="h-96 w-96 rounded-full bg-primary blur-[120px]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----------------- LANDING SCREEN ----------------- */}
      {currentScreen === 'landing' && (
        <div className="min-h-screen bg-background grid-bg text-zinc-100 flex flex-col font-sans overflow-hidden relative">
          
          {/* Header */}
          <header className="px-8 py-6 flex items-center justify-between border-b border-zinc-900/40 backdrop-blur-md bg-zinc-950/10 sticky top-0 z-40">
            <div className="flex items-center gap-2.5 select-none cursor-pointer" onClick={() => setCurrentScreen('landing')}>
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white font-display font-bold text-base shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                Ω
              </div>
              <span className="font-display font-bold text-lg tracking-wider text-white">ORACLE</span>
            </div>
            <div>
              <button 
                onClick={handleStart}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer"
              >
                Go to Workspace
              </button>
            </div>
          </header>

          {/* Hero Content Section */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative max-w-5xl mx-auto w-full z-10">
            {/* Glow behind title */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="text-center space-y-6 max-w-3xl relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm text-[10px] text-zinc-400 font-mono">
                <GitFork size={12} className="text-primary animate-pulse" />
                <span>AI OPERATING SYSTEM FOR DECISION INTELLIGENCE</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
                Every Decision Has <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-emerald-400 text-glow-primary">
                  Multiple Futures.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-455 max-w-xl mx-auto leading-relaxed">
                Stop guessing. Map critical choices to simulated paths. Analyze growth potential, evaluate trade-offs, and visualize compound opportunity costs before you decide.
              </p>

              {/* Action Call-to-Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={handleStart}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-xs font-semibold text-white shadow-[0_4px_25px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_30px_rgba(37,99,235,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Try Oracle</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={handleDemo}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Explore Interactive Demo</span>
                </button>
              </div>
            </div>

            {/* Dynamic Branching Decision Tree Visualization */}
            <div className="w-full max-w-2xl h-80 mt-12 relative flex items-center justify-center">
              {/* Branch Preview Popup Card */}
              <AnimatePresence>
                {hoveredBranch && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: -45 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="absolute top-0 z-30 w-72 p-4 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl space-y-3 font-sans"
                  >
                    {hoveredBranch === 'A' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/35 text-[9px] font-mono font-bold text-blue-400">
                            ACCELERATED GROWTH
                          </span>
                          <TrendingUp size={14} className="text-blue-400" />
                        </div>
                        <p className="text-xs text-zinc-300 font-medium">Aggressive Career Leap</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          Maximizes high earnings and startup capital, trading short-term work-life balance for long-term equity potential.
                        </p>
                        <div className="flex justify-between text-[10px] text-zinc-400 pt-1 font-mono">
                          <span>Risk: High</span>
                          <span>Growth Index: 9.2</span>
                        </div>
                      </>
                    )}

                    {hoveredBranch === 'B' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/35 text-[9px] font-mono font-bold text-emerald-400">
                            BALANCED PATHWAY
                          </span>
                          <HeartHandshake size={14} className="text-emerald-400" />
                        </div>
                        <p className="text-xs text-zinc-300 font-medium">Sustainable Development</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          Prioritizes steady learning, moderate risk, and stable income to avoid burnout while building core mastery.
                        </p>
                        <div className="flex justify-between text-[10px] text-zinc-400 pt-1 font-mono">
                          <span>Risk: Low</span>
                          <span>Work-Life: 8.5</span>
                        </div>
                      </>
                    )}

                    {hoveredBranch === 'C' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/35 text-[9px] font-mono font-bold text-purple-400">
                            DEFENSIVE PIVOT
                          </span>
                          <AlertTriangle size={14} className="text-purple-400" />
                        </div>
                        <p className="text-xs text-zinc-300 font-medium">Alternative Hedge</p>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                          Mitigates downside risk completely. Sacrifices immediate salary gains to hedge against market volatility.
                        </p>
                        <div className="flex justify-between text-[10px] text-zinc-400 pt-1 font-mono">
                          <span>Risk: Minimal</span>
                          <span>Cost Score: 2.0</span>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <svg className="w-full h-full" viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Base Choice Line */}
                <path
                  d="M 60 120 L 220 120"
                  stroke="#27272A"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                
                {/* Core Decision Node */}
                <circle
                  cx="220"
                  cy="120"
                  r="6"
                  fill="#2563EB"
                  className="shadow-[0_0_15px_rgba(37,99,235,0.8)]"
                />
                <text x="220" y="105" fill="#71717A" fontSize="9" fontFamily="sans-serif" textAnchor="middle" className="font-mono">
                  Decision Point
                </text>

                {/* Path A (Top Branch) */}
                <path
                  d="M 220 120 C 295 120, 320 50, 420 50 L 510 50"
                  stroke={hoveredBranch === 'A' ? '#3B82F6' : '#27272A'}
                  strokeWidth={hoveredBranch === 'A' ? '3' : '2'}
                  className="transition-all duration-300"
                />
                <circle
                  cx="510"
                  cy="50"
                  r="5"
                  fill={hoveredBranch === 'A' ? '#3B82F6' : '#27272A'}
                  onMouseEnter={() => setHoveredBranch('A')}
                  onMouseLeave={() => setHoveredBranch(null)}
                  className="cursor-pointer transition-all duration-300 hover:scale-150"
                />

                {/* Path B (Middle Branch) */}
                <path
                  d="M 220 120 L 510 120"
                  stroke={hoveredBranch === 'B' ? '#10B981' : '#27272A'}
                  strokeWidth={hoveredBranch === 'B' ? '3' : '2'}
                  className="transition-all duration-300"
                />
                <circle
                  cx="510"
                  cy="120"
                  r="5"
                  fill={hoveredBranch === 'B' ? '#10B981' : '#27272A'}
                  onMouseEnter={() => setHoveredBranch('B')}
                  onMouseLeave={() => setHoveredBranch(null)}
                  className="cursor-pointer transition-all duration-300 hover:scale-150"
                />

                {/* Path C (Bottom Branch) */}
                <path
                  d="M 220 120 C 295 120, 320 190, 420 190 L 510 190"
                  stroke={hoveredBranch === 'C' ? '#8B5CF6' : '#27272A'}
                  strokeWidth={hoveredBranch === 'C' ? '3' : '2'}
                  className="transition-all duration-300"
                />
                <circle
                  cx="510"
                  cy="190"
                  r="5"
                  fill={hoveredBranch === 'C' ? '#8B5CF6' : '#27272A'}
                  onMouseEnter={() => setHoveredBranch('C')}
                  onMouseLeave={() => setHoveredBranch(null)}
                  className="cursor-pointer transition-all duration-300 hover:scale-150"
                />

                {/* Dynamic Interactive Node labels */}
                <text x="530" y="54" fill={hoveredBranch === 'A' ? '#3B82F6' : '#52525B'} fontSize="9" className="font-mono font-medium transition-colors duration-300">
                  Future Alpha
                </text>
                <text x="530" y="124" fill={hoveredBranch === 'B' ? '#10B981' : '#52525B'} fontSize="9" className="font-mono font-medium transition-colors duration-300">
                  Future Beta
                </text>
                <text x="530" y="194" fill={hoveredBranch === 'C' ? '#8B5CF6' : '#52525B'} fontSize="9" className="font-mono font-medium transition-colors duration-300">
                  Future Gamma
                </text>
              </svg>
            </div>
          </main>

          {/* Ultra Minimal Footer */}
          <footer className="border-t border-zinc-900/60 py-6 px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-650 font-mono relative z-10 bg-zinc-950/20">
            <span>© 2026 ORACLE INC. ALL RIGHTS RESERVED.</span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-zinc-500" />
              <span>DECISION INTELLIGENCE SUITE V1.0</span>
            </span>
          </footer>
        </div>
      )}

      {/* ----------------- WORKSPACE INNER CLIENT PAGES ----------------- */}
      {(currentScreen === 'dashboard' || currentScreen === 'comparison' || currentScreen === 'profile' || currentScreen === 'report') && (
        <div className="flex-1 flex overflow-hidden min-h-screen">
          
          {/* SIDEBAR */}
          <aside className="w-80 border-r border-zinc-800/80 bg-zinc-950/60 hidden md:flex flex-col shrink-0">
            
            {/* Logo and Brand */}
            <div className="p-5 border-b border-zinc-800/50 flex items-center justify-between">
              <div 
                className="flex items-center gap-2 cursor-pointer select-none"
                onClick={() => setCurrentScreen('landing')}
              >
                <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center text-white font-display font-bold text-xs">
                  Ω
                </div>
                <span className="font-display font-bold text-white tracking-wide text-sm">ORACLE</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 select-none">
                PROTOTYPE
              </span>
            </div>

            {/* Quick Navigation Links */}
            <div className="p-4 border-b border-zinc-800/50 space-y-1.5">
              <button
                onClick={() => setCurrentScreen('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentScreen === 'dashboard'
                    ? 'bg-primary/10 border border-primary/30 text-white shadow-sm'
                    : 'bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                <Plus size={14} className="text-primary" />
                <span>New Decision</span>
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentScreen === 'profile'
                    ? 'bg-primary/10 border border-primary/30 text-white shadow-sm'
                    : 'bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                <Dna size={14} className="text-accent" />
                <span>Decision DNA Profile</span>
              </button>
              <button
                onClick={() => setCurrentScreen('report')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  currentScreen === 'report'
                    ? 'bg-primary/10 border border-primary/30 text-white shadow-sm'
                    : 'bg-transparent border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
                }`}
              >
                <FileText size={14} className="text-emerald-450" />
                <span>Executive Dossier PDF</span>
              </button>
            </div>

            {/* Past Simulations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-550 uppercase tracking-widest block font-mono">
                Simulations History
              </div>
              {mockHistory.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setQuery(item.query);
                    setSelectedYear('Year 1');
                    setCurrentScreen('comparison');
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-zinc-900/40 border border-transparent hover:border-zinc-900 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <p className="text-xs text-zinc-300 font-medium group-hover:text-white truncate">
                      {item.query}
                    </p>
                    <p className="text-[10px] text-zinc-550 font-mono">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-zinc-650 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>

            {/* Return to Landing button */}
            <div className="p-4 border-t border-zinc-800/50">
              <button
                onClick={() => setCurrentScreen('landing')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-950 border border-zinc-850 hover:border-zinc-900 text-zinc-450 hover:text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                <LogOut size={14} />
                <span>Exit Workspace</span>
              </button>
            </div>
          </aside>

          {/* MAIN PAGE AREA */}
          <main className="flex-1 overflow-y-auto bg-[#09090B] p-6 sm:p-10 relative">
            <div className="glow-effect top-1/4 right-1/4 opacity-10"></div>
            
            <AnimatePresence mode="wait">
              {/* ----------------- 1. DASHBOARD COMPOSER ----------------- */}
              {currentScreen === 'dashboard' && !isSubmitting && (
                <motion.div
                  key="dashboard-view"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="w-full max-w-3xl mx-auto space-y-8 py-10 flex flex-col justify-center min-h-[calc(100vh-140px)]"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight text-glow-primary">
                      Explore Your Futures
                    </h2>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Model decisions, simulate timelines, and visualize tradeoffs in our sandbox environment.
                    </p>
                  </div>

                  {/* DNA active info card */}
                  <div className="glass-card p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl flex items-center justify-between gap-4 max-w-lg mx-auto w-full">
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

                  {/* Spotlight Composer Form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      triggerSimulation();
                    }}
                    className="space-y-6"
                  >
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl overflow-hidden focus-within:border-zinc-700 transition-all shadow-2xl">
                      <div className="p-5 flex items-start gap-4">
                        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <Sparkles size={16} className="animate-pulse-slow" />
                        </div>
                        <div className="flex-1">
                          <textarea
                            required
                            rows={2}
                            placeholder="What critical crossroad are you facing?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-transparent border-0 text-zinc-150 placeholder-zinc-650 focus:outline-none focus:ring-0 text-sm sm:text-base leading-relaxed resize-none p-0 focus:outline-hidden"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVoiceInput}
                          className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                            isListening 
                              ? 'bg-danger/10 border-danger/40 text-danger animate-pulse' 
                              : 'bg-zinc-900 border-zinc-850 text-zinc-550 hover:text-zinc-200 hover:border-zinc-700'
                          }`}
                        >
                          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                        </button>
                      </div>

                      {/* Guiding context banner */}
                      <AnimatePresence>
                        {lacksContextInfo && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="px-5 pb-5 border-t border-zinc-905 pt-4"
                          >
                            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 space-y-3">
                              <div className="flex items-center gap-2 text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
                                <Info size={11} />
                                <span>Guiding Context Needed</span>
                              </div>
                              <p className="text-[11px] text-zinc-450 leading-relaxed">
                                Oracle yields optimal paths when provided with parameter boundaries. Provide details below or click simulate to proceed.
                              </p>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-sans">
                                <input
                                  type="text"
                                  placeholder="Age (e.g. 24)"
                                  value={age}
                                  onChange={(e) => setAge(e.target.value)}
                                  className="bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-700"
                                />
                                <input
                                  type="text"
                                  placeholder="Budget (e.g. $10k)"
                                  value={budget}
                                  onChange={(e) => setBudget(e.target.value)}
                                  className="bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-700"
                                />
                                <input
                                  type="text"
                                  placeholder="Country (e.g. US)"
                                  value={country}
                                  onChange={(e) => setCountry(e.target.value)}
                                  className="bg-zinc-900 border border-zinc-850 rounded-lg p-2 text-[11px] text-zinc-300 focus:outline-none focus:border-zinc-700"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowAdvanced(true)}
                                  className="text-[10px] font-semibold text-primary hover:underline text-left pl-2 flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>More Params</span>
                                  <ChevronRight size={10} />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="px-5 py-3 border-t border-zinc-900/80 bg-zinc-950/40 flex items-center justify-between text-[10px] text-zinc-550 font-mono">
                        <span>* Press simulate to start engine</span>
                        <button
                          type="button"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="hover:text-zinc-350 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Advanced context inputs</span>
                          <span>{showAdvanced ? '[-]' : '[+]'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Advanced Form */}
                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="p-6 rounded-2xl border border-zinc-850 bg-zinc-950/20 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto shadow-lg"
                        >
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <User size={11} />
                              <span>Current Age</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 28"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              className="w-full bg-zinc-900/40 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <DollarSign size={11} />
                              <span>Current Income / Salary</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. $80,000"
                              value={salary}
                              onChange={(e) => setSalary(e.target.value)}
                              className="w-full bg-zinc-900/40 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <DollarSign size={11} />
                              <span>Available Budget</span>
                            </label>
                            <input
                              type="text"
                              value={budget}
                              onChange={(e) => setBudget(e.target.value)}
                              className="w-full bg-zinc-900/40 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <Globe size={11} />
                              <span>Location</span>
                            </label>
                            <input
                              type="text"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className="w-full bg-zinc-900/40 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <Gauge size={11} />
                              <span>Risk Appetite</span>
                            </label>
                            <select
                              value={riskAppetite}
                              onChange={(e) => setRiskAppetite(e.target.value)}
                              className="w-full bg-zinc-900/40 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 font-sans"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <Calendar size={11} />
                              <span>Outlook Horizon</span>
                            </label>
                            <input
                              type="text"
                              value={timeHorizon}
                              onChange={(e) => setTimeHorizon(e.target.value)}
                              className="w-full bg-zinc-900/40 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <Briefcase size={11} />
                              <span>Primary Career Goals</span>
                            </label>
                            <input
                              type="text"
                              value={goals}
                              onChange={(e) => setGoals(e.target.value)}
                              className="w-full bg-zinc-900/40 border border-zinc-850 rounded-lg p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Suggested Scenarios */}
                    <div className="space-y-2.5 max-w-xl mx-auto">
                      <span className="text-[10px] font-semibold text-zinc-550 uppercase tracking-wider block text-center font-mono">
                        Suggested Scenarios
                      </span>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {SUGGESTED_PROMPTS.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setQuery(item.text)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-850 hover:bg-zinc-800/80 hover:border-zinc-700 text-xs text-zinc-350 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>{item.icon}</span>
                            <span>{item.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center pt-4">
                      <button
                        type="submit"
                        disabled={!query.trim()}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-xs font-semibold text-white shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.4)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span>Simulate Alternative Futures</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ----------------- 2. AI REASONING LOADER ----------------- */}
              {isSubmitting && (
                <motion.div
                  key="loading-view"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-xl mx-auto p-8 rounded-2xl border border-zinc-850 bg-zinc-950/80 shadow-2xl space-y-8 font-mono py-12"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Terminal size={14} className="text-primary animate-pulse" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Oracle Reasoning Engine</span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-danger/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-warning/40"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-success/40"></div>
                    </div>
                  </div>

                  {/* Radial branching SVGs */}
                  <div className="h-28 w-full border border-zinc-900 rounded-xl bg-zinc-950/50 flex items-center justify-center relative overflow-hidden">
                    <div className="h-6 w-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center relative z-10 animate-pulse">
                      <Sparkles size={11} className="text-white" />
                      <div className="absolute inset-0 h-full w-full rounded-full bg-primary animate-ping opacity-25"></div>
                    </div>
                    
                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 288 56 L 150 35 L 70 35" stroke="#2563EB" strokeWidth="1.5" strokeOpacity={currentStepIndex >= 2 ? "0.8" : "0.15"} className="transition-all duration-500" />
                      <circle cx="70" cy="35" r="4.5" fill="#2563EB" fillOpacity={currentStepIndex >= 2 ? "1" : "0.1"} className="transition-all" />

                      <path d="M 288 56 L 400 56 L 500 56" stroke="#10B981" strokeWidth="1.5" strokeOpacity={currentStepIndex >= 4 ? "0.8" : "0.15"} className="transition-all duration-500" />
                      <circle cx="500" cy="56" r="4.5" fill="#10B981" fillOpacity={currentStepIndex >= 4 ? "1" : "0.1"} className="transition-all" />

                      <path d="M 288 56 L 200 80 L 120 80" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity={currentStepIndex >= 6 ? "0.8" : "0.15"} className="transition-all duration-500" />
                      <circle cx="120" cy="80" r="4.5" fill="#8B5CF6" fillOpacity={currentStepIndex >= 6 ? "1" : "0.1"} className="transition-all" />
                    </svg>
                  </div>

                  {/* Rendering steps list */}
                  <div className="space-y-3.5 pt-2">
                    {REASONING_STEPS.map((step, idx) => {
                      const isDone = currentStepIndex > idx;
                      const isActive = currentStepIndex === idx;

                      return (
                        <div 
                          key={step.id} 
                          className={`flex items-center justify-between text-xs transition-colors duration-300 ${
                            isDone ? 'text-success' : isActive ? 'text-primary font-semibold' : 'text-zinc-650'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isDone ? (
                              <div className="h-5 w-5 rounded-full bg-success/15 border border-success/35 flex items-center justify-center text-success text-[10px] shrink-0 text-glow-success">
                                <Check size={11} />
                              </div>
                            ) : isActive ? (
                              <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center shrink-0">
                                <span className="h-2 w-2 rounded-full bg-primary animate-ping"></span>
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border border-zinc-900 flex items-center justify-center shrink-0 text-zinc-700">
                                <span className="text-[10px]">{step.id}</span>
                              </div>
                            )}
                            <span>{step.label}</span>
                          </div>
                          
                          {isActive && <span className="text-[10px] font-semibold text-primary animate-pulse tracking-widest">PROCESSING</span>}
                          {isDone && <span className="text-[10px] font-semibold text-success">DONE</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl text-[10px] text-zinc-550 leading-relaxed flex flex-col gap-1 shadow-inner">
                    <span className="text-zinc-500 font-bold uppercase">MODEL OUTPUT STREAM</span>
                    <span>ENGINE: GEMINI-2.5-FLASH-COGNITIVE-DEEP</span>
                    {currentStepIndex >= 1 && <span>&gt; Mapping constraints: [Age: {age}, Budget: {budget}, Location: {country}]</span>}
                    {currentStepIndex >= 4 && <span className="text-accent">&gt; Timelines matched. Running scenario coordinate simulations...</span>}
                  </div>
                </motion.div>
              )}

              {/* ----------------- 3. SCENARIO COMPARISON TIMELINES ----------------- */}
              {currentScreen === 'comparison' && !isSubmitting && (
                <motion.div
                  key="comparison-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-905 pb-6">
                    <div className="space-y-2">
                      <button 
                        onClick={() => setCurrentScreen('dashboard')}
                        className="flex items-center gap-1.5 text-xs text-zinc-550 hover:text-zinc-350 transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={12} />
                        <span>Workspace Composer</span>
                      </button>
                      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <span>{query || "MBA post MCA career paths alternative futures"}</span>
                        <button 
                          onClick={() => setIsFavorite(!isFavorite)} 
                          className="text-zinc-550 hover:text-warning transition-colors cursor-pointer"
                        >
                          <Star size={18} className={isFavorite ? 'text-warning fill-warning' : ''} />
                        </button>
                      </h2>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-500 font-mono">
                        <span>Age: {age}</span>
                        <span>Budget: {budget}</span>
                        <span>Location: {country}</span>
                        <span>Risk Appetite: {riskAppetite}</span>
                        <span>Horizon: {timeHorizon}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentScreen('report')}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-300 hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        <Download size={13} />
                        <span>Export Report</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Transparency details */}
                  <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-950/40 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-500 tracking-wider uppercase font-mono">
                      <Brain size={14} className="text-primary" />
                      <span>AI Simulation Parameters & Transparency Report</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
                      <strong>Important Notice:</strong> This simulation is generated using your inputs, assumptions, and AI reasoning. It is designed to help you evaluate trade-offs, compare scenarios, and map opportunity costs. Oracle does not predict the future; it models possibilities.
                    </p>

                    <div className="p-4 rounded-xl border border-primary/15 bg-primary/5 space-y-3 font-sans max-w-2xl">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider font-mono">
                        <Dna size={12} className="animate-pulse" />
                        <span>Decision DNA Simulation Influence</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {Object.entries(mockDecision.dna_influence).map(([trait, level]) => (
                          <div key={trait} className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-850 flex flex-col gap-0.5">
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
                  </div>

                  {/* Tab Filters */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-semibold text-zinc-555 tracking-wider uppercase font-mono block">
                      Filters & Priority Focus
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(mockDecision.recommendations).map(([priority, scenarioId]) => {
                        const isSelected = selectedPriority === priority;
                        const config = SCENARIO_IDENTITIES[scenarioId] || { color: '#3B82F6', title: `Scenario ${scenarioId}` };
                        return (
                          <button
                            key={priority}
                            onClick={() => {
                              setSelectedPriority(priority);
                              setActiveScenarioId(scenarioId);
                              setExpandedScenarioId(scenarioId);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                              isSelected 
                                ? 'bg-primary/20 border-primary text-white shadow-[0_0_12px_rgba(37,99,235,0.2)]' 
                                : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                            }`}
                          >
                            {priority} → <span style={{ color: config.color }}>{config.title}</span>
                          </button>
                        );
                      })}
                      {selectedPriority && (
                        <button 
                          onClick={() => {
                            setSelectedPriority(null);
                            setExpandedScenarioId(null);
                          }}
                          className="text-[10px] text-zinc-500 hover:text-zinc-355 font-mono self-center ml-2 cursor-pointer"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scenarios cards */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {mockDecision.scenarios.map((s) => {
                        const isHighlighted = selectedPriority && mockDecision.recommendations[selectedPriority as keyof typeof mockDecision.recommendations] === s.id;
                        const config = SCENARIO_IDENTITIES[s.id] || { title: s.title, philosophy: "Custom Pathway", icon: Sparkles, color: '#71717A', desc: s.summary };
                        const IconComponent = config.icon;
                        const metricsObj = mockDecision.comparison_metrics[s.id as keyof typeof mockDecision.comparison_metrics] || {};
                        const isExpanded = expandedScenarioId === s.id;
                        const isActiveCard = activeScenarioId === s.id;

                        return (
                          <div
                            key={s.id}
                            onClick={() => setActiveScenarioId(s.id)}
                            className={`p-6 rounded-2xl glass-card relative flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                              isHighlighted 
                                ? 'ring-2 ring-primary border-transparent bg-zinc-900/90 shadow-[0_15px_40px_rgba(37,99,235,0.15)]' 
                                : isActiveCard
                                  ? 'ring-1 ring-zinc-700 border-transparent bg-zinc-900/40 shadow-lg'
                                  : 'bg-zinc-950/20'
                            }`}
                          >
                            {isHighlighted && (
                              <span className="absolute -top-2.5 left-6 px-2.5 py-0.5 rounded bg-primary text-[8px] font-mono font-bold text-white uppercase tracking-widest shadow">
                                Aligned Scenario
                              </span>
                            )}

                            <div className="space-y-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }}></span>
                                    <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-zinc-500">
                                      Future {s.id}
                                    </span>
                                  </div>
                                  <h3 className="font-display font-bold text-lg text-white leading-tight">
                                    {config.title}
                                  </h3>
                                  <p className="text-[10px] font-mono font-semibold" style={{ color: config.color }}>
                                    {config.philosophy}
                                  </p>
                                </div>
                                <div 
                                  className="h-10 w-10 rounded-xl flex items-center justify-center border shrink-0"
                                  style={{ backgroundColor: `${config.color}0a`, borderColor: `${config.color}25`, color: config.color }}
                                >
                                  <IconComponent size={18} />
                                </div>
                              </div>

                              <p className="text-xs text-zinc-400 leading-relaxed">
                                {s.summary}
                              </p>

                              {/* Stat sliders */}
                              <div className="space-y-3.5 border-t border-zinc-900/60 pt-4 font-mono text-[10px]">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-zinc-400">
                                    <span className="flex items-center gap-1">
                                      <Gauge size={11} className="text-zinc-500" />
                                      <span>Risk Index</span>
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-zinc-200">{metricsObj.risk}/10</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExplainingMetric({
                                            scenarioId: s.id,
                                            scenarioTitle: config.title,
                                            metricName: 'Risk Index',
                                            score: metricsObj.risk,
                                            explanation: getMetricExplanation(s.id, 'risk', metricsObj.risk)
                                          });
                                        }}
                                        className="text-zinc-650 hover:text-zinc-400 p-0.5 cursor-pointer"
                                      >
                                        <HelpCircle size={10} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-red-400" style={{ width: `${(metricsObj.risk || 0) * 10}%` }}></div>
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-zinc-400">
                                    <span className="flex items-center gap-1">
                                      <TrendingUp size={11} className="text-zinc-550" />
                                      <span>Growth Score</span>
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-zinc-200">{metricsObj.growth}/10</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setExplainingMetric({
                                            scenarioId: s.id,
                                            scenarioTitle: config.title,
                                            metricName: 'Growth Score',
                                            score: metricsObj.growth,
                                            explanation: getMetricExplanation(s.id, 'growth', metricsObj.growth)
                                          });
                                        }}
                                        className="text-zinc-650 hover:text-zinc-400 p-0.5 cursor-pointer"
                                      >
                                        <HelpCircle size={10} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-emerald-450" style={{ width: `${(metricsObj.growth || 0) * 10}%` }}></div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs pt-2 border-t border-zinc-900/60 font-sans">
                                <div className="text-zinc-400 leading-normal">
                                  <span className="font-semibold text-zinc-300">Investment Cost: </span>
                                  <span>{s.estimated_costs}</span>
                                </div>
                                <div className="text-zinc-400 leading-normal">
                                  <span className="font-semibold text-zinc-300">Opportunity Cost: </span>
                                  <span className="italic">"{s.opportunity_cost}"</span>
                                </div>
                              </div>
                            </div>

                            {/* Collapsible Pros & Cons */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden space-y-4 pt-4 border-t border-zinc-900 text-xs font-sans mt-3"
                                >
                                  <div className="space-y-1">
                                    <span className="font-bold text-success flex items-center gap-1">
                                      <Check size={11} />
                                      <span>Pros</span>
                                    </span>
                                    <ul className="list-disc pl-4 text-zinc-450 space-y-1 leading-relaxed">
                                      {s.pros.map((p, i) => <li key={i}>{p}</li>)}
                                    </ul>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-bold text-danger flex items-center gap-1">
                                      <X size={11} />
                                      <span>Cons</span>
                                    </span>
                                    <ul className="list-disc pl-4 text-zinc-455 space-y-1 leading-relaxed">
                                      {s.cons.map((c, i) => <li key={i}>{c}</li>)}
                                    </ul>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="font-bold text-white flex items-center gap-1.5">
                                      <Layers size={11} />
                                      <span>Skills Required</span>
                                    </span>
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {s.skills_required.map((sk, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
                                          {sk}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedScenarioId(isExpanded ? null : s.id);
                              }}
                              className="mt-5 w-full py-2 bg-zinc-900/60 border border-zinc-850 hover:bg-zinc-800 text-xs font-semibold rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer text-center"
                            >
                              {isExpanded ? 'Hide Details' : 'Explore Tradeoffs'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Scrubber Timeline */}
                  <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-lg text-white">Interactive Decision Timeline</h3>
                        <p className="text-xs text-zinc-550 font-mono">Scrub years to simulate outcomes, milestones, and compound career income growth.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 font-semibold uppercase">Currently Simulating:</span>
                        <span className="px-3 py-1 bg-primary/10 border border-primary/25 rounded-lg text-xs font-mono font-bold text-primary animate-pulse-slow">
                          {selectedYear}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4 max-w-2xl mx-auto py-2">
                      <input
                        type="range"
                        min={0}
                        max={timelineYears.length - 1}
                        value={timelineYears.indexOf(selectedYear)}
                        onChange={(e) => setSelectedYear(timelineYears[parseInt(e.target.value)])}
                        className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-[11px] font-mono font-bold text-zinc-500 px-1">
                        {timelineYears.map(yr => (
                          <span 
                            key={yr} 
                            className={`cursor-pointer transition-colors ${selectedYear === yr ? 'text-primary' : 'hover:text-zinc-300'}`}
                            onClick={() => setSelectedYear(yr)}
                          >
                            {yr}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-900/60">
                      {mockDecision.scenarios.map(s => {
                        const yrData = (mockTimeline as Record<string, Record<string, { salary: string; milestone: string; desc: string }>>)[selectedYear];
                        const yrNode = yrData?.[s.id] || { salary: "$50,000", milestone: "N/A", desc: "No data available." };
                        const config = SCENARIO_IDENTITIES[s.id] || { title: s.title, color: '#3B82F6' };
                        const projectedIncome = getProjectedSalary(s.id, selectedYear);
                        
                        return (
                          <div 
                            key={s.id} 
                            className={`p-5 rounded-xl border transition-all duration-300 space-y-4 ${
                              activeScenarioId === s.id 
                                ? 'border-zinc-800 bg-zinc-900/20' 
                                : 'border-zinc-900/50 bg-zinc-950/10 opacity-70'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold font-mono tracking-wider" style={{ color: config.color }}>
                                {config.title}
                              </span>
                              <span className="text-[10px] font-mono font-semibold text-zinc-500">
                                Confidence: {s.confidence_level}%
                              </span>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block font-mono">Projected Salary Rate</span>
                              <p className="text-xl font-display font-bold text-white text-glow-primary">
                                {projectedIncome}
                              </p>
                            </div>

                            <div className="space-y-1 border-t border-zinc-900 pt-3">
                              <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest block font-mono">Active Milestone ({selectedYear})</span>
                              <h4 className="text-xs font-bold text-white">{yrNode.milestone}</h4>
                              <p className="text-[11px] text-zinc-400 leading-relaxed">{yrNode.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recharts comparison charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Radar Matrix */}
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
                            {mockDecision.scenarios.map(s => (
                              <Radar
                                key={s.id}
                                name={SCENARIO_IDENTITIES[s.id]?.title || `Scenario ${s.id}`}
                                dataKey={s.id}
                                stroke={SCENARIO_COLORS[s.id]}
                                fill={SCENARIO_COLORS[s.id]}
                                fillOpacity={0.15}
                              />
                            ))}
                            <Legend wrapperStyle={{ color: '#F4F4F5' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Trajectory */}
                    <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 space-y-4">
                      <div>
                        <h3 className="font-display font-bold text-lg text-white">Projected Income Trajectory</h3>
                        <p className="text-xs text-zinc-500 font-mono">Compound salary expectations simulated across timeline years.</p>
                      </div>
                      
                      <div className="h-80 w-full font-mono text-[10px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={lineChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#18181B" />
                            <XAxis dataKey="name" stroke="#71717A" />
                            <YAxis stroke="#71717A" tickFormatter={v => `$${v/1000}k`} />
                            <ReChartsTooltip 
                              contentStyle={{ backgroundColor: '#121214', borderColor: '#27272A', color: '#F4F4F5' }} 
                              itemStyle={{ color: '#F4F4F5' }}
                              formatter={(v: any) => [`$${(Number(v)).toLocaleString()}`, 'Projected Income']}
                            />
                            <Legend />
                            {mockDecision.scenarios.map(s => (
                              <Line
                                key={s.id}
                                type="monotone"
                                dataKey={s.id}
                                name={SCENARIO_IDENTITIES[s.id]?.title || `Scenario ${s.id}`}
                                stroke={SCENARIO_COLORS[s.id]}
                                strokeWidth={2}
                                activeDot={{ r: 6 }}
                              />
                            ))}
                            <ReferenceLine x={selectedYear} stroke="#2563EB" strokeDasharray="3 3" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Refinement chat Refiner Console */}
                  <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                      <Sparkles size={80} className="text-primary" />
                    </div>

                    <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h3 className="font-display font-bold text-lg text-white">Dynamic Scenario Refinement</h3>
                        <p className="text-xs text-zinc-555 font-mono">Simulate modifications to inputs, ask comparatives, or query constraints.</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[9px] font-mono text-zinc-500 rounded">
                        Context Intact
                      </span>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                      {followUps.length === 0 ? (
                        <div className="text-center py-12 text-zinc-600 text-xs space-y-2">
                          <p>No refinement prompts entered. Challenge Oracle with follow-up scenarios.</p>
                          <div className="flex justify-center gap-2 max-w-md mx-auto pt-2 flex-wrap">
                            <button 
                              type="button"
                              onClick={() => setChatQuery("What if we assume a higher risk tolerance?")}
                              className="px-2.5 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900/30 text-[10px] hover:border-zinc-700 hover:text-zinc-300 text-left cursor-pointer"
                            >
                              "What if we assume higher risk?"
                            </button>
                            <button 
                              type="button"
                              onClick={() => setChatQuery("Explain Scenario A opportunity costs in detail.")}
                              className="px-2.5 py-1.5 rounded-lg border border-zinc-850 bg-zinc-900/30 text-[10px] hover:border-zinc-700 hover:text-zinc-300 text-left cursor-pointer"
                            >
                              "Detail A opportunity costs..."
                            </button>
                          </div>
                        </div>
                      ) : (
                        followUps.map((msg) => (
                          <div key={msg.id} className="space-y-3">
                            <div className="flex justify-end">
                              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-850 text-xs text-zinc-200 max-w-lg leading-relaxed shadow-sm">
                                {msg.query}
                              </div>
                            </div>
                            <div className="flex justify-start">
                              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-zinc-300 max-w-2xl leading-relaxed shadow-sm space-y-3">
                                <span className="text-[10px] font-mono font-bold text-primary flex items-center gap-1">
                                  <Sparkles size={11} className="animate-spin-slow" />
                                  <span>Oracle Response</span>
                                </span>
                                <p>{msg.response_json.response_text}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {submittingChat && (
                        <div className="flex justify-start">
                          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-500 max-w-md flex items-center gap-3">
                            <RefreshCw size={14} className="animate-spin text-primary" />
                            <span className="font-mono text-[10px]">Re-mapping scenario timelines...</span>
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef}></div>
                    </div>

                    <form onSubmit={handleChatSubmit} className="flex gap-3 pt-2">
                      <input
                        type="text"
                        required
                        disabled={submittingChat}
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        placeholder="Introduce parameters... (e.g. 'What if my budget drops by half?' or 'Detail the cons of Scenario C')"
                        className="flex-1 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-750 focus:border-primary/60 transition-colors rounded-xl py-3 px-4 text-xs text-zinc-250 focus:outline-none placeholder-zinc-650 disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={submittingChat || !chatQuery.trim()}
                        className="px-4 py-3 rounded-xl bg-primary hover:bg-blue-600 text-white shadow transition-all disabled:opacity-30 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ----------------- 4. DNA PROFILE VIEW ----------------- */}
              {currentScreen === 'profile' && !isSubmitting && (
                <motion.div
                  key="profile-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-accent font-mono tracking-widest uppercase">My Calibration Portfolio</span>
                      <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                        <Dna className="text-primary" size={24} />
                        <span>Decision DNA™ Profile</span>
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
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

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/40 space-y-4">
                        <h3 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
                          <Info size={14} className="text-primary" />
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
                            <span className="text-zinc-555">Confidence Score</span>
                            <span className="font-bold text-white">{dna.confidence_score}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-555">DNA Version</span>
                            <span className="font-bold text-zinc-350">v{dna.dna_version}.0</span>
                          </div>
                        </div>

                        <div className="p-3.5 bg-zinc-900/30 border border-zinc-900 rounded-lg text-[10px] text-zinc-550 font-mono leading-relaxed">
                          <span>Decision DNA refined based on your recent decision patterns. Evolution is slow and explainable.</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl shrink-0">
                          🛠️
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-primary tracking-widest uppercase font-mono">Calibrated Decision Archetype</span>
                          <h3 className="text-xl font-display font-extrabold text-white">
                            {dna.generated_profile.decision_archetype.value}
                          </h3>
                          <p className="text-xs text-zinc-405 leading-relaxed">
                            {dna.generated_profile.decision_archetype.explanation}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(editedTraits).map(([key, trait]) => {
                          if (key === 'decision_archetype') return null;
                          const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                          
                          return (
                            <div key={key} className="p-5 rounded-2xl glass-card relative flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-bold text-zinc-505 tracking-wider uppercase font-mono">{label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-zinc-600">{(trait.weight * 100).toFixed(0)}% weight</span>
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
                </motion.div>
              )}

              {/* ----------------- 5. EXECUTIVE REPORT PDF PREVIEW ----------------- */}
              {currentScreen === 'report' && !isSubmitting && (
                <motion.div
                  key="report-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
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
                      <p className="font-sans text-xs text-zinc-550 font-mono mt-1">SIMULATION ID: 104-Hackathon-Round1 | DATE: {new Date().toLocaleDateString()}</p>
                    </div>

                    {mockReport.sections.map((sec, i) => (
                      <div key={i} className="space-y-4 mb-8">
                        <h3 className="font-sans text-xs font-bold text-zinc-700 tracking-wider uppercase border-b border-zinc-200 pb-1">{sec.title}</h3>
                        {sec.paragraphs.map((p, idx) => (
                          <p key={idx} className="text-sm text-zinc-800 leading-relaxed">{p}</p>
                        ))}
                      </div>
                    ))}

                    <div className="border-t border-zinc-200 pt-6 mt-12 text-center font-sans text-[9px] text-zinc-400">
                      All simulated timelines represent estimated possibilities based on your cognitive priors.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      )}

      {/* Floating Explainability Panel Overlay */}
      <AnimatePresence>
        {explainingMetric && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setExplainingMetric(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-md bg-zinc-950 border-l border-zinc-900 h-full p-6 flex flex-col justify-between shadow-2xl relative z-10 font-sans"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-2">
                    <Brain size={16} className="text-primary" />
                    <h3 className="font-display font-bold text-lg text-white">Score Explanation</h3>
                  </div>
                  <button 
                    onClick={() => setExplainingMetric(null)}
                    className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-550 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase block">Scenario</span>
                    <p className="text-sm font-semibold text-white pt-0.5">{explainingMetric.scenarioTitle}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase block">Metric Evaluated</span>
                    <p className="text-sm font-semibold text-white pt-0.5">{explainingMetric.metricName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase block">Assigned Score</span>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold text-primary text-glow-primary">
                        {explainingMetric.score} / 10
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase block mb-1.5">Logic & Methodology</span>
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 text-xs text-zinc-350 leading-relaxed font-sans">
                      {explainingMetric.explanation}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900">
                <button
                  onClick={() => setExplainingMetric(null)}
                  className="w-full py-3 rounded-xl bg-zinc-900 border border-zinc-855 hover:bg-zinc-800 text-xs font-semibold text-zinc-350 hover:text-white transition-colors cursor-pointer text-center"
                >
                  Dismiss Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

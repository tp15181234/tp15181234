import React, { useState } from 'react';
import {
  NN_CONCEPT_CARDS,
  NN_SPEED_QUIZ_LIST,
  NNConceptCard,
} from '../data/neuralNetworkData';
import {
  Network,
  Layers,
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  HelpCircle,
  ArrowRight,
  Award,
  BookOpen,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NeuralNetworkLabProps {
  onNavigateTab?: (tab: string) => void;
}

type ArchMode = 'single' | 'mlp' | 'dnn';
type ActivationMode = 'step' | 'relu';

export const NeuralNetworkLab: React.FC<NeuralNetworkLabProps> = ({ onNavigateTab }) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'speedQuiz'>('concepts');
  const [archMode, setArchMode] = useState<ArchMode>('mlp');

  // Interactive Perceptron Simulator State
  const [x1, setX1] = useState<number>(1);
  const [x2, setX2] = useState<number>(1);
  const [w1, setW1] = useState<number>(0.7);
  const [w2, setW2] = useState<number>(0.4);
  const [threshold, setThreshold] = useState<number>(0.8);
  const [activationMode, setActivationMode] = useState<ActivationMode>('step');

  const weightedSum = Number((x1 * w1 + x2 * w2).toFixed(2));
  const activationOutput =
    activationMode === 'step'
      ? weightedSum >= threshold
        ? 1
        : 0
      : Math.max(0, Number((weightedSum - threshold).toFixed(2)));

  // Speed Quiz State
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuiz = NN_SPEED_QUIZ_LIST[quizIdx];

  const handleAnswerQuiz = (choice: string) => {
    if (quizAnswers[quizIdx]) return;
    const isCorrect = choice === currentQuiz.correctAnswer;
    setQuizAnswers((prev) => ({ ...prev, [quizIdx]: choice }));
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.7 },
      });
    }
  };

  const handleNextQuiz = () => {
    if (quizIdx < NN_SPEED_QUIZ_LIST.length - 1) {
      setQuizIdx((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      if (quizScore >= NN_SPEED_QUIZ_LIST.length * 0.8) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
        });
      }
    }
  };

  const handleRestartQuiz = () => {
    setQuizIdx(0);
    setQuizAnswers({});
    setQuizScore(0);
    setQuizFinished(false);
  };

  const accentClasses: Record<
    NNConceptCard['accent'],
    { card: string; badge: string; tip: string }
  > = {
    blue: {
      card: 'border-blue-200 bg-blue-50/40',
      badge: 'bg-blue-100 text-blue-800',
      tip: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    indigo: {
      card: 'border-indigo-200 bg-indigo-50/40',
      badge: 'bg-indigo-100 text-indigo-800',
      tip: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    },
    emerald: {
      card: 'border-emerald-200 bg-emerald-50/40',
      badge: 'bg-emerald-100 text-emerald-800',
      tip: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
    amber: {
      card: 'border-amber-200 bg-amber-50/40',
      badge: 'bg-amber-100 text-amber-800',
      tip: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    violet: {
      card: 'border-violet-200 bg-violet-50/40',
      badge: 'bg-violet-100 text-violet-800',
      tip: 'bg-violet-50 border-violet-200 text-violet-900',
    },
    rose: {
      card: 'border-rose-200 bg-rose-50/40',
      badge: 'bg-rose-100 text-rose-800',
      tip: 'bg-rose-50 border-rose-200 text-rose-900',
    },
    cyan: {
      card: 'border-cyan-200 bg-cyan-50/40',
      badge: 'bg-cyan-100 text-cyan-800',
      tip: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    },
    teal: {
      card: 'border-teal-200 bg-teal-50/40',
      badge: 'bg-teal-100 text-teal-800',
      tip: 'bg-teal-50 border-teal-200 text-teal-900',
    },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Network className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                인공신경망(ANN) · 퍼셉트론 · 딥러닝 연구소
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              인공신경망의 구조(입력층·가중치·은닉층·출력층)와 퍼셉트론, 활성화 함수, 다층 퍼셉트론(MLP), 심층 신경망(DNN), 딥러닝을 완벽히 정리합니다.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveTab('concepts')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 min-h-[36px] ${
                activeTab === 'concepts'
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>구조 · 원리 · 핵심 개념</span>
            </button>
            <button
              onClick={() => setActiveTab('speedQuiz')}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 min-h-[36px] ${
                activeTab === 'speedQuiz'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1초 개념 판별 퀴즈</span>
            </button>
          </div>
        </div>

        {/* AI > ML > ANN > DL Hierarchy Pill Bar */}
        <div className="p-3 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="font-semibold text-slate-300">개념 포함 관계:</span>
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 font-bold">
            인공지능 (AI)
          </span>
          <span className="text-slate-400">⊃</span>
          <span className="px-2.5 py-1 rounded-md bg-blue-900/70 border border-blue-700 font-bold text-blue-200">
            기계학습 (ML)
          </span>
          <span className="text-slate-400">⊃</span>
          <span className="px-2.5 py-1 rounded-md bg-violet-800/80 border border-violet-500 font-bold text-violet-100">
            인공신경망 (ANN)
          </span>
          <span className="text-slate-400">⊃</span>
          <span className="px-2.5 py-1 rounded-md bg-teal-600 border border-teal-400 font-extrabold text-white">
            딥러닝 (심층 신경망 DNN 기반)
          </span>
        </div>
      </div>

      {/* TAB 1: CONCEPTS + INTERACTIVE SIMULATOR */}
      {activeTab === 'concepts' && (
        <div className="space-y-4 sm:space-y-6">
          {/* 1. Architecture Evolution Comparison */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  1. 퍼셉트론 → 다층 퍼셉트론(MLP) → 심층 신경망(DNN) 구조 비교
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  버튼을 눌러 은닉층이 늘어날수록 신경망 구조가 어떻게 발전하는지 확인하세요.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'single', label: '단층 퍼셉트론' },
                  { id: 'mlp', label: '다층 퍼셉트론 (MLP)' },
                  { id: 'dnn', label: '심층 신경망 (DNN) · 딥러닝' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setArchMode(m.id as ArchMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      archMode === m.id
                        ? 'bg-violet-600 text-white border-violet-700 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Layer Diagram */}
            <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto">
              <div className="flex items-center justify-between gap-4 min-w-[460px] max-w-3xl mx-auto">
                {/* Input Layer */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    입력층 (Input)
                  </span>
                  <div className="flex flex-col gap-2.5">
                    {['x₁', 'x₂', 'x₃'].map((n) => (
                      <div
                        key={n}
                        className="w-11 h-11 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-xs border-2 border-emerald-200"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weights arrow */}
                <div className="flex flex-col items-center text-[10px] font-bold text-amber-700 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300">
                    가중치 (w) 곱하기
                  </span>
                  <span className="text-slate-400 text-lg leading-none mt-1">→</span>
                </div>

                {/* Hidden Layer(s) */}
                {archMode === 'single' && (
                  <div className="flex flex-col items-center gap-1 px-4 py-6 rounded-xl border-2 border-dashed border-slate-300 bg-white/70 text-center">
                    <span className="text-xs font-bold text-slate-500">은닉층 없음</span>
                    <span className="text-[11px] text-slate-400">
                      입력층이 출력층에 직접 연결됨
                    </span>
                  </div>
                )}

                {archMode === 'mlp' && (
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span className="px-2.5 py-0.5 rounded bg-violet-100 text-violet-800 text-[11px] font-bold">
                      은닉층 1개 (Hidden)
                    </span>
                    <div className="flex flex-col gap-2">
                      {['h₁', 'h₂', 'h₃', 'h₄'].map((n) => (
                        <div
                          key={n}
                          className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-xs border-2 border-violet-200"
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {archMode === 'dnn' && (
                  <div className="flex items-center gap-3 shrink-0">
                    {['은닉층 1', '은닉층 2', '은닉층 3'].map((layerTitle, lIdx) => (
                      <React.Fragment key={layerTitle}>
                        <div className="flex flex-col items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 text-[10px] font-bold">
                            {layerTitle}
                          </span>
                          <div className="flex flex-col gap-2">
                            {[1, 2, 3, 4].map((nodeNum) => (
                              <div
                                key={nodeNum}
                                className="w-9 h-9 rounded-full bg-violet-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs border-2 border-violet-200"
                              >
                                h{lIdx + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                        {lIdx < 2 && <span className="text-slate-400 font-bold">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Activation arrow */}
                <div className="flex flex-col items-center text-[10px] font-bold text-cyan-800 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-cyan-100 border border-cyan-300">
                    활성화 함수
                  </span>
                  <span className="text-slate-400 text-lg leading-none mt-1">→</span>
                </div>

                {/* Output Layer */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
                    출력층 (Output)
                  </span>
                  <div className="flex flex-col gap-3">
                    {['y₁', 'y₂'].slice(0, archMode === 'single' ? 1 : 2).map((n) => (
                      <div
                        key={n}
                        className="w-11 h-11 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-xs border-2 border-rose-200"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {archMode === 'single' && (
                  <>
                    <strong className="text-slate-900">단층 퍼셉트론:</strong> 입력층과 출력층만 존재하며 은닉층이 없습니다. 단순한 직선 분류는 가능하지만 복잡한 비선형 문제(예: XOR 문제)는 풀 수 없습니다.
                  </>
                )}
                {archMode === 'mlp' && (
                  <>
                    <strong className="text-violet-800">다층 퍼셉트론 (MLP, Multi-Layer Perceptron):</strong> 입력층과 출력층 사이에 <strong>은닉층을 1개 이상</strong> 추가한 신경망입니다. 은닉층이 추가되면서 단층 퍼셉트론으로 풀지 못했던 복잡한 비선형 문제도 해결할 수 있습니다.
                  </>
                )}
                {archMode === 'dnn' && (
                  <>
                    <strong className="text-teal-800">심층 신경망 (DNN)과 딥러닝 (Deep Learning):</strong> 입력층과 출력층 사이에 <strong>은닉층을 여러 개 깊게</strong> 쌓은 신경망을 <strong>심층 신경망(DNN)</strong>이라고 하며, 이 심층 신경망을 이용해 데이터로부터 스스로 특징을 추출하며 학습하는 방법을 <strong>딥러닝</strong>이라고 합니다.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2. Interactive Perceptron Weight + Activation Simulator */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  2. 퍼셉트론 직접 계산 체험기 (입력 × 가중치 → 활성화 함수 → 출력)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">활성화 함수:</span>
                <button
                  onClick={() => setActivationMode('step')}
                  className={`px-2.5 py-1 rounded-md font-bold border ${
                    activationMode === 'step'
                      ? 'bg-cyan-600 text-white border-cyan-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  계단 함수 (0 또는 1)
                </button>
                <button
                  onClick={() => setActivationMode('relu')}
                  className={`px-2.5 py-1 rounded-md font-bold border ${
                    activationMode === 'relu'
                      ? 'bg-cyan-600 text-white border-cyan-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ReLU (0 이상 통과)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
              {/* Inputs & Weights Controls */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800">① 입력층 신호 & 가중치 조절</div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-emerald-700">입력 x₁ (예: 공부 여부)</span>
                    <button
                      onClick={() => setX1(x1 === 1 ? 0 : 1)}
                      className={`px-2 py-0.5 rounded font-mono font-bold ${
                        x1 === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {x1}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-amber-700 font-semibold">가중치 w₁:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={w1}
                      onChange={(e) => setW1(Number(e.target.value))}
                      className="flex-1 accent-amber-500"
                    />
                    <span className="font-mono font-bold w-8 text-right">{w1.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-emerald-700">입력 x₂ (예: 과제 제출)</span>
                    <button
                      onClick={() => setX2(x2 === 1 ? 0 : 1)}
                      className={`px-2 py-0.5 rounded font-mono font-bold ${
                        x2 === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {x2}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-amber-700 font-semibold">가중치 w₂:</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={w2}
                      onChange={(e) => setW2(Number(e.target.value))}
                      className="flex-1 accent-amber-500"
                    />
                    <span className="font-mono font-bold w-8 text-right">{w2.toFixed(1)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-slate-700 font-semibold">기준(임계값 θ):</span>
                  <input
                    type="range"
                    min="0.2"
                    max="1.8"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="flex-1 accent-cyan-600"
                  />
                  <span className="font-mono font-bold w-8 text-right">{threshold.toFixed(1)}</span>
                </div>
              </div>

              {/* Calculation Pipeline */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-center">
                <div className="font-bold text-amber-900">② 가중합 + 활성화 함수 계산</div>
                <div className="p-2.5 rounded-lg bg-white border border-amber-200 font-mono text-[11px] text-slate-800">
                  ({x1} × {w1.toFixed(1)}) + ({x2} × {w2.toFixed(1)}) ={' '}
                  <strong className="text-amber-700 text-sm">{weightedSum}</strong>
                </div>
                <div className="text-[11px] text-slate-600">
                  {activationMode === 'step' ? (
                    <>
                      가중합(<strong>{weightedSum}</strong>)이 임계값(<strong>{threshold.toFixed(1)}</strong>) 이상이면 <strong>1</strong>, 미만이면 <strong>0</strong> 출력
                    </>
                  ) : (
                    <>
                      ReLU(가중합 − θ): max(0, {(weightedSum - threshold).toFixed(2)}) = <strong>{activationOutput}</strong>
                    </>
                  )}
                </div>
              </div>

              {/* Final Output */}
              <div
                className={`p-5 rounded-xl border-2 text-center space-y-1.5 transition-colors ${
                  activationOutput > 0
                    ? 'bg-emerald-50 border-emerald-400'
                    : 'bg-slate-100 border-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold text-slate-500">③ 출력층 최종 결과</div>
                <div
                  className={`text-3xl font-black font-mono ${
                    activationOutput > 0 ? 'text-emerald-700' : 'text-slate-600'
                  }`}
                >
                  {activationOutput}
                </div>
                <div className="text-xs font-bold text-slate-700">
                  {activationOutput > 0 ? '활성화됨 (신호 전달 O)' : '비활성화 (신호 차단 X)'}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Concept Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NN_CONCEPT_CARDS.map((card) => {
              const cls = accentClasses[card.accent];
              return (
                <div
                  key={card.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs space-y-2.5 ${cls.card}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${cls.badge}`}>
                        {card.badge}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 mt-1">
                        {card.term}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">{card.english}</span>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    {card.summary}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {card.detail}
                  </p>
                  <div className={`p-2.5 rounded-lg border text-[11px] font-bold ${cls.tip}`}>
                    ★ 시험 핵심: {card.examPoint}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA to Topic Quiz */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-sm text-violet-300">
                단원별 문제집과 기말 모의고사에도 인공신경망·딥러닝 문제가 추가되었습니다!
              </div>
              <p className="text-slate-400 mt-0.5">
                개념 정리를 마쳤다면 1초 판별 퀴즈 또는 단원별 문제집으로 실전 감각을 확인하세요.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('speedQuiz')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors whitespace-nowrap min-h-[38px]"
              >
                1초 개념 퀴즈 풀기
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('topics')}
                className="px-3.5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap min-h-[38px] flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>단원별 문제집</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPEED QUIZ */}
      {activeTab === 'speedQuiz' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-xs max-w-3xl mx-auto">
          {!quizFinished ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-slate-800">
                    인공신경망 · 딥러닝 개념 판별 퀴즈
                  </span>
                </div>
                <span className="font-mono font-bold text-violet-600">
                  {quizIdx + 1} / {NN_SPEED_QUIZ_LIST.length}
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 transition-all duration-300"
                  style={{ width: `${((quizIdx + 1) / NN_SPEED_QUIZ_LIST.length) * 100}%` }}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {currentQuiz.question}
                </h3>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>힌트: {currentQuiz.hint}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuiz.options.map((opt) => {
                  const selected = quizAnswers[quizIdx];
                  const isSelected = selected === opt;
                  const isCorrect = opt === currentQuiz.correctAnswer;

                  let btnClass = 'bg-white border-slate-200 hover:border-violet-400 hover:bg-violet-50/40 text-slate-800';
                  if (selected) {
                    if (isCorrect) {
                      btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-500/20';
                    } else if (isSelected && !isCorrect) {
                      btnClass = 'bg-red-50 border-red-400 text-red-900';
                    } else {
                      btnClass = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerQuiz(opt)}
                      disabled={Boolean(selected)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between min-h-[54px] text-sm font-semibold ${btnClass}`}
                    >
                      <span>{opt}</span>
                      {selected && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                      {selected && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {quizAnswers[quizIdx] && (
                <div className="space-y-4 animate-fade-in">
                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed ${
                      quizAnswers[quizIdx] === currentQuiz.correctAnswer
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">
                      {quizAnswers[quizIdx] === currentQuiz.correctAnswer
                        ? '✅ 정답입니다!'
                        : `❌ 아쉽네요! 정답은 [${currentQuiz.correctAnswer}] 입니다.`}
                    </div>
                    <p>{currentQuiz.explanation}</p>
                  </div>

                  <button
                    onClick={handleNextQuiz}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <span>
                      {quizIdx < NN_SPEED_QUIZ_LIST.length - 1 ? '다음 문제로 넘어가기' : '최종 결과 확인하기'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
                <Award className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {NN_SPEED_QUIZ_LIST.length}문제 중 {quizScore}개 정답!
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {quizScore === NN_SPEED_QUIZ_LIST.length
                    ? '완벽합니다! 인공신경망·퍼셉트론·딥러닝 핵심 용어를 모두 마스터했습니다.'
                    : '틀린 개념을 개념 정리 탭에서 다시 한 번 복습해 보세요.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartQuiz}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>다시 풀기</span>
                </button>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('topics')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>단원별 문제집 가기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

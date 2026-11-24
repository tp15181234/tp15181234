import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { QuizView } from './components/QuizView';
import { FlowchartLab } from './components/FlowchartLab';
import { ModelingLab } from './components/ModelingLab';
import { MachineLearningLab } from './components/MachineLearningLab';
import { PythonSandbox } from './components/PythonSandbox';
import { CheatSheet } from './components/CheatSheet';
import { NeuralNetworkLab } from './components/NeuralNetworkLab';
import { PrintExamModal } from './components/PrintExamModal';
import { AccessLock, StudentAuthInfo } from './components/AccessLock';
import { TeacherDashboard } from './components/TeacherDashboard';
import { GoogleAuthModal, GoogleUser, TEACHER_EMAIL } from './components/GoogleAuthModal';
import { auth, subscribeSubmissions } from './firebase';
import { INITIAL_QUESTIONS } from './data/questionBank';
import { TopicType } from './types/quiz';
import { BookOpen, Layers, Lock, Cpu, Network } from 'lucide-react';

export default function App() {
  // Password gatekeeper lock state (Code: 15181234) - Always locked on launch/refresh
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [studentInfo, setStudentInfo] = useState<StudentAuthInfo>({
    grade: '1',
    classNum: '',
    studentNumber: '',
    studentName: '',
  });

  // Clear any legacy localStorage state from older versions
  useEffect(() => {
    try {
      localStorage.removeItem('class_exam_pass_1_5');
      localStorage.removeItem('google_auth_user');
    } catch {
      // Ignore
    }
  }, []);

  // Real Firebase Authentication State
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        const email = fbUser.email.trim().toLowerCase();
        const isTeacherEmail = email === TEACHER_EMAIL.toLowerCase();
        setCurrentUser({
          uid: fbUser.uid,
          email,
          name: isTeacherEmail
            ? '정보 선생님'
            : fbUser.displayName || email.split('@')[0] || '사용자',
          picture: fbUser.photoURL || undefined,
          role: isTeacherEmail ? 'teacher' : 'student',
        });
      } else {
        setCurrentUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const isTeacher = Boolean(
    currentUser && currentUser.email.trim().toLowerCase() === TEACHER_EMAIL.toLowerCase()
  );

  const [currentTab, setCurrentTab] = useState<string>('exam');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<TopicType | 'all'>('all');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);

  // Real-time Cloud Firestore submission count strictly for authenticated teacher
  useEffect(() => {
    if (!isUnlocked || !isTeacher || !isAuthReady) {
      setSubmissionCount(0);
      if (!isTeacher) {
        setIsTeacherModalOpen(false);
      }
      return;
    }

    const unsubscribe = subscribeSubmissions(
      (list) => {
        setSubmissionCount(list.length);
      },
      (err) => {
        console.warn('Submission count listener note:', err.message);
      }
    );

    return () => unsubscribe();
  }, [isUnlocked, isTeacher, isAuthReady]);

  const handleLogin = (user: GoogleUser) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    setIsTeacherModalOpen(false);
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const handleLock = () => {
    try {
      localStorage.removeItem('class_exam_pass_1_5');
    } catch {
      // Ignore
    }
    setIsUnlocked(false);
  };

  // If locked, render the 15181234 security PIN gatekeeper screen
  if (!isUnlocked) {
    return (
      <AccessLock
        onUnlock={(info) => {
          setStudentInfo(info);
          setIsUnlocked(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Contract Compliant Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
        }}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onOpenTeacher={() => {
          if (isTeacher) {
            setIsTeacherModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        onLock={handleLock}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        submissionCount={submissionCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Hero Banner Area for 1학년 5반 (그림 없이 깔끔한 디자인) */}
        {currentTab === 'exam' && (
          <div className="rounded-2xl bg-slate-900 text-white border border-slate-800 p-5 sm:p-8 lg:p-10 shadow-md space-y-5 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                {/* Clean unboxed metadata with dot separators */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-blue-400 font-medium">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
                    1학년 5반 전용
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>고등학교 정규 50분 실전 시험</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-[220px] sm:max-w-none">선생님 채점 시스템 연동</span>
                </div>

                <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white text-balance leading-tight">
                  1학년 5반 정보 기말고사 완벽 대비
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  우리가 배운 <strong>자연어 처리</strong>, <strong>기계학습 (지도·비지도·강화학습)</strong>, <strong>인공신경망·딥러닝 (ANN·퍼셉트론·MLP·DNN)</strong>, <strong>순서도 5대 기호</strong>, <strong>실생활 모델링 (입력·출력·조건·변수 구분)</strong>, 그리고 <strong>파이썬</strong>을 한 번에 정리하고 실전 문제로 마스터하세요!
                </p>
              </div>

              {/* Action buttons - full-width friendly on mobile */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
                <button
                  onClick={() => setCurrentTab('topics')}
                  className="px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 shadow-xs min-h-[40px]"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>단원별 문제 풀기</span>
                </button>

                <button
                  onClick={() => setCurrentTab('ann')}
                  className="px-3.5 py-2.5 text-xs font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs min-h-[40px]"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>인공신경망·딥러닝</span>
                </button>

                <button
                  onClick={() => setCurrentTab('ml')}
                  className="px-3.5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs min-h-[40px]"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>기계학습 판별소</span>
                </button>

                <button
                  onClick={() => setCurrentTab('modeling')}
                  className="px-3.5 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs min-h-[40px]"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>입·출·조·변 훈련소</span>
                </button>

                <button
                  onClick={() => setCurrentTab('cheatsheet')}
                  className="px-3.5 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
                >
                  <span>벼락치기 요점노트</span>
                </button>
              </div>
            </div>

            {/* 3 Curriculum Highlight Pillar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 pt-4 border-t border-slate-800 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-blue-400">01. 자연어 처리 · 기계학습 · 딥러닝</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  자연어 처리, 기계학습(지도·비지도·강화)과 인공신경망(ANN, 퍼셉트론, 입력·은닉·출력층, 가중치, 활성화 함수, MLP, DNN, 딥러닝) 완벽 대응.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-400">02. 실생활 문제 모델링</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  다양한 실생활 주제(영화관, 에어컨, 자판기, 교통카드)에서 [입력], [출력], [조건], [변수]를 혼동 없이 분류하기.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="font-bold text-amber-400">03. 파이썬 문법과 단골 함정</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  print, input의 문자열(str) 특성, int/float 변환, if/elif/else 들여쓰기, for문의 range(stop) 규칙 및 while 루프 탈출 조건.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content Routing */}
        {currentTab === 'exam' && (
          <QuizView
            questions={INITIAL_QUESTIONS}
            mode="exam"
            selectedTopicFilter="all"
            initialStudentInfo={studentInfo}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'topics' && (
          <QuizView
            questions={INITIAL_QUESTIONS}
            mode="topics"
            selectedTopicFilter={selectedTopicFilter}
            initialStudentInfo={studentInfo}
            onFilterTopic={(t) => setSelectedTopicFilter(t)}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'modeling' && <ModelingLab />}

        {currentTab === 'ml' && (
          <MachineLearningLab onNavigateTab={(tab) => setCurrentTab(tab)} />
        )}

        {currentTab === 'flowchart' && <FlowchartLab />}

        {currentTab === 'sandbox' && <PythonSandbox />}

        {currentTab === 'cheatsheet' && <CheatSheet />}

        {currentTab === 'ann' && (
          <NeuralNetworkLab
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">1학년 5반 정보 기말고사</span>
            <span aria-hidden="true">·</span>
            <span>실전 모의평가 시스템</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleLock}
              className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              <Lock className="w-3 h-3" />
              <span>보안 잠금하기</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-slate-400">
            <span>자연어 처리</span>
            <span>기계학습 (지도·비지도·강화)</span>
            <span>인공신경망·딥러닝</span>
            <span>순서도 5대 도형</span>
            <span>입력·출력·조건·변수</span>
            <span>파이썬 문법·제어문</span>
          </div>
        </div>
      </footer>

      {/* Printable Exam Paper Modal */}
      {isPrintModalOpen && (
        <PrintExamModal
          questions={INITIAL_QUESTIONS}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {/* Teacher Submissions Board Modal (Strictly for tp15181234@gmail.com) */}
      {isTeacher && isTeacherModalOpen && (
        <TeacherDashboard
          questions={INITIAL_QUESTIONS}
          currentUserEmail={currentUser?.email}
          onClose={() => setIsTeacherModalOpen(false)}
        />
      )}

      {/* Google Sign-In & Account Management Modal */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </div>
  );
}

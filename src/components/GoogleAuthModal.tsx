import React, { useState } from 'react';
import { X, LogIn, LogOut, AlertCircle, Copy, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

export interface GoogleUser {
  uid?: string;
  email: string;
  name: string;
  picture?: string;
  role: 'teacher' | 'student';
}

export const TEACHER_EMAIL = 'tp15181234@gmail.com';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setInputError('');
    setUnauthorizedDomain(null);
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = (fbUser.email || '').trim().toLowerCase();
      const isTeacher = email === TEACHER_EMAIL.toLowerCase();

      onLogin({
        uid: fbUser.uid,
        email,
        name: isTeacher ? '정보 선생님' : fbUser.displayName || email.split('@')[0] || '사용자',
        picture: fbUser.photoURL || undefined,
        role: isTeacher ? 'teacher' : 'student',
      });

      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || '';

      if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        const host = typeof window !== 'undefined' ? window.location.hostname : '';
        setUnauthorizedDomain(host);
        setInputError(
          `현재 접속 주소(${host})가 Firebase 승인 도메인에 아직 등록되지 않았습니다.`
        );
      } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setInputError('Google 로그인 창이 닫혔습니다. 다시 버튼을 눌러 로그인해 주세요.');
      } else if (code === 'auth/popup-blocked') {
        setInputError('브라우저에서 팝업이 차단되었습니다. 팝업 차단을 허용한 뒤 다시 시도해 주세요.');
      } else {
        setInputError(`Google 로그인 중 오류가 발생했습니다: ${msg || code}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      onLogout();
      onClose();
    } catch (err: any) {
      setInputError(err?.message || '로그아웃 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDomain = () => {
    if (!unauthorizedDomain) return;
    navigator.clipboard.writeText(unauthorizedDomain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <h3 className="font-bold text-slate-900 text-sm">
              Google 계정 인증
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current User View */}
        {currentUser ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {currentUser.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.name.charAt(0) || 'G'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-900 text-xs truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-slate-500 font-mono truncate">
                  {currentUser.email}
                </div>
                {currentUser.role === 'teacher' && (
                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" /> 선생님 확인 권한 활성화됨
                  </span>
                )}
              </div>
            </div>

            {currentUser.role !== 'teacher' && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                현재 학생/일반 계정으로 로그인되어 있습니다. <strong>선생님 확인</strong> 기능을 사용하려면 선생님 계정(<strong>{TEACHER_EMAIL}</strong>)으로 로그인해 주세요.
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={handleFirebaseSignOut}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          /* Google Sign-In Prompt */
          <div className="p-6 space-y-4 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm">
                선생님 확인을 위한 Google 로그인
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                학생들은 로그인 없이 바로 시험을 풀고 제출할 수 있습니다. <strong>선생님 확인</strong> 대시보드 열람 시에는 보안을 위해 선생님 Google 계정(<strong>{TEACHER_EMAIL}</strong>) 인증이 필요합니다.
              </p>
            </div>

            {inputError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] space-y-2">
                <div className="flex items-start gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{inputError}</span>
                </div>

                {unauthorizedDomain && (
                  <div className="p-2.5 bg-white rounded-lg border border-red-200 text-slate-700 space-y-2">
                    <div className="font-bold text-slate-900">
                      📌 Vercel 도메인 1회 등록 방법 (10초):
                    </div>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                      <li>아래 도메인을 복사하세요:</li>
                    </ol>
                    <div className="flex items-center gap-1.5">
                      <code className="flex-1 px-2 py-1 bg-slate-100 rounded text-[11px] font-mono text-slate-900 truncate">
                        {unauthorizedDomain}
                      </code>
                      <button
                        type="button"
                        onClick={handleCopyDomain}
                        className="px-2 py-1 bg-slate-800 text-white rounded text-[10px] font-semibold flex items-center gap-1 shrink-0"
                      >
                        {copiedDomain ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedDomain ? '복사됨' : '복사'}</span>
                      </button>
                    </div>
                    <ol start={2} className="list-decimal pl-4 space-y-1 text-[11px]">
                      <li>Firebase 콘솔 &gt; <strong>승인된 도메인(Authorized domains)</strong>에 추가 후 다시 로그인하세요.</li>
                    </ol>
                    <a
                      href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                    >
                      <span>Firebase 도메인 설정 바로가기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-xs min-h-[44px] active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoading ? 'Google 로그인 중...' : 'Google 계정으로 로그인'}</span>
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

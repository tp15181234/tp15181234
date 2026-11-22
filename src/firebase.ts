import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocsFromServer,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { isAuthorized1Class5, TEACHER_EMAIL } from './data/classRoster';

const app = initializeApp(firebaseConfig);

// CRITICAL: Pass firebaseConfig.firestoreDatabaseId so the app connects to the provisioned database
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// --- Helper utilities strictly matching firebase-blueprint.json & firestore.rules ---

function makeSafeId(prefix: string): string {
  const raw = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return raw.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 80);
}

function clampStr(val: unknown, maxLen: number, fallback = ''): string {
  const s = String(val ?? fallback).trim();
  return s.slice(0, maxLen);
}

export interface SubmissionRecord {
  id: string;
  grade: string;
  classNum: string;
  studentName: string;
  studentNumber: string;
  isUnauthorizedClass: boolean;
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, number>;
  topicScores?: Record<string, { correct: number; total: number }>;
  submittedAt: string;
  targetTeacherEmail: string;
}

export interface AlertRecord {
  id: string;
  grade: string;
  classNum: string;
  studentNumber: string;
  studentName: string;
  eventType: 'GATEKEEPER_ENTRY' | 'SUBMISSION';
  score?: number | null;
  emailRecipient: string;
  emailSubject: string;
  emailBody: string;
  emailStatus: 'RECORDED';
  timestamp: string;
}

export async function saveUnauthorizedAlertToFirestore(payload: {
  grade: string;
  classNum: string;
  studentNumber: string;
  studentName: string;
  eventType: 'GATEKEEPER_ENTRY' | 'SUBMISSION';
  score?: number | null;
}): Promise<AlertRecord | null> {
  const trimmedGrade = clampStr(payload.grade, 10, '1') || '1';
  const trimmedClass = clampStr(payload.classNum, 10, '');
  const trimmedNum = clampStr(payload.studentNumber, 10, '');
  const trimmedName = clampStr(payload.studentName, 40, '');

  // Double-check class roster authorization: NEVER record 1학년 5반 students as unauthorized
  if (isAuthorized1Class5(trimmedGrade, trimmedClass, trimmedName)) {
    return null;
  }

  const id = makeSafeId('alert');
  const nowIso = new Date().toISOString();
  const numericScore =
    payload.score !== undefined && payload.score !== null
      ? Math.min(100, Math.max(0, Math.round(Number(payload.score) || 0)))
      : null;

  const subject = clampStr(
    payload.eventType === 'SUBMISSION'
      ? `[📝 타반 답안 제출] ${trimmedGrade}학년 ${trimmedClass}반 ${trimmedName} 학생 제출 (${numericScore ?? 0}점)`
      : `[🚨 타반 보안 잠금 통과] ${trimmedGrade}학년 ${trimmedClass}반 ${trimmedName} 학생 진입`,
    160
  );
  const body = clampStr(
    `1학년 5반 미등록 학생(${trimmedGrade}학년 ${trimmedClass}반 ${trimmedNum ? trimmedNum + '번 ' : ''}${trimmedName}) 감지`,
    500
  );

  const docData = {
    id,
    grade: trimmedGrade,
    classNum: trimmedClass,
    studentNumber: trimmedNum,
    studentName: trimmedName,
    eventType: payload.eventType,
    score: numericScore,
    emailRecipient: TEACHER_EMAIL,
    emailSubject: subject,
    emailBody: body,
    emailStatus: 'RECORDED' as const,
    timestamp: nowIso,
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'unauthorized_alerts', id), docData);
    return {
      id,
      grade: trimmedGrade,
      classNum: trimmedClass,
      studentNumber: trimmedNum,
      studentName: trimmedName,
      eventType: payload.eventType,
      score: numericScore,
      emailRecipient: TEACHER_EMAIL,
      emailSubject: subject,
      emailBody: body,
      emailStatus: 'RECORDED',
      timestamp: nowIso,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `unauthorized_alerts/${id}`);
  }
}

export async function saveSubmissionToFirestore(payload: {
  grade: string;
  classNum: string;
  studentName: string;
  studentNumber: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, number>;
  topicScores?: Record<string, { correct: number; total: number }>;
}): Promise<SubmissionRecord> {
  const trimmedGrade = clampStr(payload.grade, 10, '1') || '1';
  const trimmedClass = clampStr(payload.classNum, 10, '5') || '5';
  const trimmedName = clampStr(payload.studentName, 40);
  const trimmedNum = clampStr(payload.studentNumber, 10);

  if (!trimmedName || !trimmedNum) {
    throw new Error('학생 이름과 번호를 입력해 주세요.');
  }

  const isAuthorized = isAuthorized1Class5(trimmedGrade, trimmedClass, trimmedName);
  const isUnauthorized = !isAuthorized;
  const boundedScore = Math.min(100, Math.max(0, Math.round(Number(payload.score) || 0)));
  const boundedTotal = Math.min(200, Math.max(0, Math.round(Number(payload.totalQuestions) || 0)));
  const boundedCorrect = Math.min(200, Math.max(0, Math.round(Number(payload.correctCount) || 0)));
  const boundedTime = Math.min(86400, Math.max(0, Math.round(Number(payload.timeSpentSeconds) || 0)));

  // If unauthorized (not 1-5 roster), silently record an unauthorized submission alert too
  if (isUnauthorized) {
    saveUnauthorizedAlertToFirestore({
      grade: trimmedGrade,
      classNum: trimmedClass,
      studentNumber: trimmedNum,
      studentName: trimmedName,
      eventType: 'SUBMISSION',
      score: boundedScore,
    }).catch((err) => {
      console.warn('Background unauthorized alert save error:', err);
    });
  }

  const id = makeSafeId('sub');
  const nowIso = new Date().toISOString();

  const docData: Record<string, any> = {
    id,
    grade: trimmedGrade,
    classNum: trimmedClass,
    studentName: trimmedName,
    studentNumber: trimmedNum,
    isUnauthorizedClass: isUnauthorized,
    score: boundedScore,
    totalQuestions: boundedTotal,
    correctCount: boundedCorrect,
    timeSpentSeconds: boundedTime,
    userAnswers: payload.userAnswers || {},
    submittedAt: nowIso,
    createdAt: serverTimestamp(),
    targetTeacherEmail: TEACHER_EMAIL,
  };

  if (payload.topicScores && Object.keys(payload.topicScores).length > 0) {
    docData.topicScores = payload.topicScores;
  }

  try {
    await setDoc(doc(db, 'submissions', id), docData);
    return {
      id,
      grade: trimmedGrade,
      classNum: trimmedClass,
      studentName: trimmedName,
      studentNumber: trimmedNum,
      isUnauthorizedClass: isUnauthorized,
      score: boundedScore,
      totalQuestions: boundedTotal,
      correctCount: boundedCorrect,
      timeSpentSeconds: boundedTime,
      userAnswers: payload.userAnswers || {},
      topicScores: payload.topicScores || {},
      submittedAt: nowIso,
      targetTeacherEmail: TEACHER_EMAIL,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `submissions/${id}`);
  }
}

export function subscribeSubmissions(
  onData: (items: SubmissionRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, 'submissions'),
    where('targetTeacherEmail', '==', TEACHER_EMAIL)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as SubmissionRecord);
      list.sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'submissions');
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
}

export function subscribeAlerts(
  onData: (items: AlertRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(
    collection(db, 'unauthorized_alerts'),
    where('emailRecipient', '==', TEACHER_EMAIL)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => d.data() as AlertRecord);
      list.sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')));
      onData(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'unauthorized_alerts');
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
}

export async function fetchSubmissionsFromServer(): Promise<SubmissionRecord[]> {
  try {
    const q = query(
      collection(db, 'submissions'),
      where('targetTeacherEmail', '==', TEACHER_EMAIL)
    );
    const snapshot = await getDocsFromServer(q);
    const list = snapshot.docs.map((d) => d.data() as SubmissionRecord);
    list.sort((a, b) => String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'submissions');
  }
}

export async function fetchAlertsFromServer(): Promise<AlertRecord[]> {
  try {
    const q = query(
      collection(db, 'unauthorized_alerts'),
      where('emailRecipient', '==', TEACHER_EMAIL)
    );
    const snapshot = await getDocsFromServer(q);
    const list = snapshot.docs.map((d) => d.data() as AlertRecord);
    list.sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'unauthorized_alerts');
  }
}

export async function deleteSubmissionInFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'submissions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `submissions/${id}`);
  }
}

export async function deleteAlertInFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'unauthorized_alerts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `unauthorized_alerts/${id}`);
  }
}

export async function clearAllAlertsInFirestore(alertIds: string[]): Promise<void> {
  try {
    const chunkSize = 400;
    for (let i = 0; i < alertIds.length; i += chunkSize) {
      const batch = writeBatch(db);
      const chunk = alertIds.slice(i, i + chunkSize);
      for (const id of chunk) {
        batch.delete(doc(db, 'unauthorized_alerts', id));
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'unauthorized_alerts');
  }
}

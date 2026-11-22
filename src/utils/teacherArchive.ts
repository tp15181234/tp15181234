export interface ArchivedSubmission {
  id: string;
  grade?: string;
  classNum?: string;
  studentName: string;
  studentNumber: string;
  isUnauthorizedClass?: boolean;
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  userAnswers: Record<string, number>;
  topicScores: Record<string, { correct: number; total: number }>;
  submittedAt: string;
  targetTeacherEmail: string;
}

export interface ArchivedAlert {
  id: string;
  grade: string;
  classNum: string;
  studentNumber: string;
  studentName: string;
  eventType: 'SUBMISSION' | 'GATEKEEPER_ENTRY';
  score?: number | null;
  emailRecipient: string;
  emailSubject: string;
  emailBody: string;
  emailStatus: 'RECORDED';
  timestamp: string;
}

interface PendingEvent {
  id: string;
  url: string;
  payload: any;
  createdAt: string;
}

const SUBMISSIONS_ARCHIVE_KEY = 'teacher_submissions_archive_v1';
const ALERTS_ARCHIVE_KEY = 'teacher_alerts_archive_v1';
const DELETED_IDS_KEY = 'teacher_deleted_ids_v1';
const PENDING_EVENTS_KEY = 'student_pending_events_v1';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

export function getDeletedIds(): Set<string> {
  const list = readJson<string[]>(DELETED_IDS_KEY, []);
  return new Set(Array.isArray(list) ? list : []);
}

export function markDeletedIds(ids: string[]): void {
  if (!ids.length) return;
  const current = readJson<string[]>(DELETED_IDS_KEY, []);
  const nextSet = new Set([...(Array.isArray(current) ? current : []), ...ids]);
  // Keep latest 1000 tombstones to avoid unbounded localStorage growth
  const trimmed = Array.from(nextSet).slice(-1000);
  writeJson(DELETED_IDS_KEY, trimmed);

  // Also remove immediately from local archives
  const subArchive = readJson<ArchivedSubmission[]>(SUBMISSIONS_ARCHIVE_KEY, []);
  writeJson(
    SUBMISSIONS_ARCHIVE_KEY,
    subArchive.filter((item) => !nextSet.has(item.id))
  );

  const alertArchive = readJson<ArchivedAlert[]>(ALERTS_ARCHIVE_KEY, []);
  writeJson(
    ALERTS_ARCHIVE_KEY,
    alertArchive.filter((item) => !nextSet.has(item.id))
  );
}

export function getArchivedSubmissions(): ArchivedSubmission[] {
  const deleted = getDeletedIds();
  const list = readJson<ArchivedSubmission[]>(SUBMISSIONS_ARCHIVE_KEY, []);
  return (Array.isArray(list) ? list : [])
    .filter((item) => item && item.id && !deleted.has(item.id))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function getArchivedAlerts(): ArchivedAlert[] {
  const deleted = getDeletedIds();
  const list = readJson<ArchivedAlert[]>(ALERTS_ARCHIVE_KEY, []);
  return (Array.isArray(list) ? list : [])
    .filter((item) => item && item.id && !deleted.has(item.id))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function mergeSubmissionsWithArchive(serverList: ArchivedSubmission[]): {
  merged: ArchivedSubmission[];
  missingFromServer: ArchivedSubmission[];
} {
  const deleted = getDeletedIds();
  const archive = getArchivedSubmissions();
  const serverIds = new Set(serverList.map((s) => s.id));
  const map = new Map<string, ArchivedSubmission>();

  for (const item of archive) {
    if (item && item.id && !deleted.has(item.id)) {
      map.set(item.id, item);
    }
  }
  for (const item of serverList) {
    if (item && item.id && !deleted.has(item.id)) {
      map.set(item.id, item);
    }
  }

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const missingFromServer = archive.filter((item) => !serverIds.has(item.id) && !deleted.has(item.id));
  writeJson(SUBMISSIONS_ARCHIVE_KEY, merged);

  return { merged, missingFromServer };
}

export function mergeAlertsWithArchive(serverList: ArchivedAlert[]): {
  merged: ArchivedAlert[];
  missingFromServer: ArchivedAlert[];
} {
  const deleted = getDeletedIds();
  const archive = getArchivedAlerts();
  const serverIds = new Set(serverList.map((a) => a.id));
  const map = new Map<string, ArchivedAlert>();

  for (const item of archive) {
    if (item && item.id && !deleted.has(item.id)) {
      map.set(item.id, item);
    }
  }
  for (const item of serverList) {
    if (item && item.id && !deleted.has(item.id)) {
      map.set(item.id, item);
    }
  }

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const missingFromServer = archive.filter((item) => !serverIds.has(item.id) && !deleted.has(item.id));
  writeJson(ALERTS_ARCHIVE_KEY, merged);

  return { merged, missingFromServer };
}

export function clearAllAlertsArchive(): void {
  const archive = getArchivedAlerts();
  markDeletedIds(archive.map((a) => a.id));
  writeJson(ALERTS_ARCHIVE_KEY, []);
}

export function clearAllSubmissionsArchive(): void {
  const archive = getArchivedSubmissions();
  markDeletedIds(archive.map((s) => s.id));
  writeJson(SUBMISSIONS_ARCHIVE_KEY, []);
}

export function importBackupIntoArchive(
  submissions: ArchivedSubmission[],
  alerts: ArchivedAlert[]
): { submissions: ArchivedSubmission[]; alerts: ArchivedAlert[] } {
  // Importing an explicit backup clears tombstones for imported items
  const importedIds = new Set([
    ...submissions.map((s) => s.id),
    ...alerts.map((a) => a.id),
  ]);
  const deleted = readJson<string[]>(DELETED_IDS_KEY, []);
  writeJson(
    DELETED_IDS_KEY,
    deleted.filter((id) => !importedIds.has(id))
  );

  const { merged: mergedSubs } = mergeSubmissionsWithArchive(submissions);
  const { merged: mergedAlerts } = mergeAlertsWithArchive(alerts);
  return { submissions: mergedSubs, alerts: mergedAlerts };
}

/**
 * Reliable POST with automatic retries (for Cloud Run / Vercel cold-starts and mobile networks).
 * If all retries fail, queues the event in localStorage so it flushes on next visit.
 */
export async function postWithRetry(
  url: string,
  payload: any,
  options?: { maxRetries?: number; queueOnFailure?: boolean }
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const maxRetries = options?.maxRetries ?? 3;
  const queueOnFailure = options?.queueOnFailure ?? true;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return { ok: true, data };
      }

      if (res.status >= 400 && res.status < 500) {
        const errData = await res.json().catch(() => ({}));
        return { ok: false, error: errData.error || `요청 오류 (${res.status})` };
      }
    } catch {
      // Retry on transient network error / cold start
    }

    if (attempt < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }

  if (queueOnFailure) {
    const queue = readJson<PendingEvent[]>(PENDING_EVENTS_KEY, []);
    queue.push({
      id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      url,
      payload,
      createdAt: new Date().toISOString(),
    });
    writeJson(PENDING_EVENTS_KEY, queue.slice(-50));
  }

  return { ok: false, error: '서버 응답이 지연되고 있습니다. 잠시 후 자동으로 재전송됩니다.' };
}

/**
 * Flush any previously failed student submissions or alerts on app launch/visibility change.
 */
export async function flushPendingEvents(): Promise<void> {
  const queue = readJson<PendingEvent[]>(PENDING_EVENTS_KEY, []);
  if (!Array.isArray(queue) || queue.length === 0) return;

  const remaining: PendingEvent[] = [];
  for (const evt of queue) {
    try {
      const res = await fetch(evt.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evt.payload),
      });
      if (!res.ok && res.status >= 500) {
        remaining.push(evt);
      }
    } catch {
      remaining.push(evt);
    }
  }

  writeJson(PENDING_EVENTS_KEY, remaining);
}

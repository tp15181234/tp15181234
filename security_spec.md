# Security Specification & Payload Audit

## 1. Data Invariants
- `submissions/{submissionId}`:
  - Must have a valid alphanumeric/hyphen/underscore document ID (`<= 80` chars) matching `data.id`.
  - Must declare all required fields and NO extra ghost fields (`hasAll` + `hasOnly`).
  - `targetTeacherEmail` MUST equal `'tp15181234@gmail.com'`.
  - `createdAt` MUST equal `request.time` (server timestamp).
  - Students may `create` anonymously (required for unauthenticated link-shared exam taking), but ONLY the verified teacher (`tp15181234@gmail.com` with `email_verified == true`) may `get`, `list`, `update`, or `delete`.
- `unauthorized_alerts/{alertId}`:
  - Must have a valid document ID (`<= 80` chars) matching `data.id`.
  - `eventType` MUST be `'GATEKEEPER_ENTRY'` or `'SUBMISSION'`.
  - `emailRecipient` MUST equal `'tp15181234@gmail.com'`.
  - `emailStatus` MUST equal `'RECORDED'`.
  - `createdAt` MUST equal `request.time`.
  - ONLY the verified teacher (`tp15181234@gmail.com` with `email_verified == true`) may `get`, `list`, `update`, or `delete`.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated List Submissions**: `getDocs(collection(db, 'submissions'))` without teacher Google auth -> DENIED.
2. **Non-Teacher Authenticated Read**: `getDocs(collection(db, 'submissions'))` signed in as `student@gmail.com` -> DENIED.
3. **Unverified Teacher Email Spoof**: Token with `email == 'tp15181234@gmail.com'` and `email_verified == false` -> DENIED.
4. **Student Deleting Submission**: `deleteDoc(doc(db, 'submissions', 'sub-1'))` by non-teacher -> DENIED.
5. **Student Updating Score**: `updateDoc(doc(db, 'submissions', 'sub-1'), { score: 100 })` by non-teacher -> DENIED.
6. **Ghost Field Injection**: `setDoc` on `submissions` including extra field `isAdmin: true` -> DENIED (`hasOnly` check).
7. **Oversized Name Poisoning**: `studentName` string of length 500 chars -> DENIED (`size() <= 40`).
8. **Invalid Document ID Injection**: Document ID `../../etc/passwd` or 500-char ID -> DENIED (`isValidId`).
9. **Spoofed Client Timestamp**: `createdAt` set to a past `Timestamp` instead of `serverTimestamp()` -> DENIED (`createdAt == request.time`).
10. **Score Out of Bounds**: `score: 9999` or `score: -10` -> DENIED (`score >= 0 && score <= 100`).
11. **Target Teacher Hijack**: `targetTeacherEmail: 'attacker@evil.com'` -> DENIED.
12. **Unauthenticated Read of Alerts**: `getDocs(collection(db, 'unauthorized_alerts'))` by anyone other than verified teacher -> DENIED.

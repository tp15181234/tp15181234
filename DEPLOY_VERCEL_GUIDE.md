# 🚀 GitHub 및 Vercel 원클릭 배포 가이드 (Firebase 실시간 DB 연동 완료)

본 앱은 **Vercel Serverless + Cloud Firestore 영구 데이터베이스 + Firebase Google 인증**이 이미 모두 연동되어 있습니다. GitHub에 푸시하고 Vercel에 연결하기만 하면, 학생들이 스마트폰·아이패드·카카오톡 인앱 브라우저에서 제출한 답안이 **선생님 확인 화면에 실시간으로 영구 저장**됩니다.

---

## 1단계: GitHub 저장소에 코드 올리기

터미널이나 Git 프로그램(GitHub Desktop, VSCode 등)에서 다음 명령어를 순서대로 실행합니다:

```bash
# 1. git 초기화 (아직 안 되어 있는 경우)
git init

# 2. 모든 파일 스테이징 (firebase-applet-config.json 포함 확인)
git add .

# 3. 커밋 메시지 작성
git commit -m "feat: 1학년 5반 정보 기말고사 앱 (Firebase + Vercel 배포 준비 완료)"

# 4. 기본 브랜치를 main으로 설정
git branch -M main

# 5. 본인의 GitHub 새 저장소 주소(Remote) 연결 (본인 아이디/저장소명으로 변경)
git remote add origin https://github.com/본인아이디/저장소이름.git

# 6. GitHub로 푸시
git push -u origin main
```

---

## 2단계: Vercel에서 배포하기

1. **[Vercel 공식 웹사이트](https://vercel.com)** 에 접속하여 로그인합니다. (GitHub 계정으로 로그인 권장)
2. 대시보드 우측 상단의 **[Add New...]** $\rightarrow$ **[Project]** 를 클릭합니다.
3. 1단계에서 푸시한 **GitHub 저장소**를 찾아 **[Import]** 버튼을 클릭합니다.
4. **Configure Project** 설정 확인:
   - **Framework Preset**: `Vite` (자동 감지됨)
   - **Build Command**: `npm run build` (기본값 유지)
   - **Output Directory**: `dist` (기본값 유지)
   - **Root Directory**: `./` (기본값 유지)
5. *(선택 사항)* **Environment Variables (환경 변수)**:
   - AI 맞춤형 문제 생성 / AI 해설 기능을 Vercel에서도 사용하려면:
     - Key: `GEMINI_API_KEY`
     - Value: `선생님의 Gemini API 키`
   - *(※ API 키를 넣지 않아도 앱 자체 내장 문제 은행과 기본 해설, 모의고사, 순서도, 입·출·조·변, 기계학습 판별소, 파이썬 샌드박스, 선생님 확인 기능은 100% 정상 작동합니다.)*
6. 하단의 **[Deploy]** 버튼을 클릭합니다.
7. 약 30초~1분 후 생성된 Vercel 주소(예: `https://your-project.vercel.app`)를 확인합니다.

---

## 3단계: Vercel 배포 직후 딱 1번 해야 할 설정 (선생님 Google 로그인 도메인 허용)

학생들은 **Google 로그인 없이** 바로 시험을 풀고 답안을 제출할 수 있습니다.
선생님께서 배포된 Vercel 주소(`*.vercel.app`)에서 **선생님 확인(`tp15181234@gmail.com`) Google 로그인**을 사용하시려면, 보안상 Firebase에 Vercel 주소를 1번만 허용 목록에 등록해야 합니다:

1. **[Firebase Authentication 도메인 설정](https://console.firebase.google.com/project/evocative-fort-q7c1c/authentication/settings)** 페이지로 이동합니다.
2. **승인된 도메인(Authorized domains)** 섹션에서 **[도메인 추가(Add domain)]** 를 클릭합니다.
3. 배포된 Vercel 도메인(예: `your-project.vercel.app`)을 입력하고 저장합니다.
   *(※ 만약 깜빡하고 접속해도 앱 로그인 창에 현재 도메인 복사 버튼과 바로가기 링크가 자동으로 안내됩니다.)*

---

## 4단계: 학생들에게 링크 공유 시 작동 방식

- **보안 잠금(Gatekeeper) & 비로그인 제출**:
  - 1학년 5반 학생(김겸 등 26명 명단)은 잠금 코드(`15181234`)와 학번/이름을 입력하고 로그인 없이 즉시 시험에 응시하고 제출할 수 있습니다.
  - 타반 학생이나 미등록 학생이 진입하거나 답안을 제출하면 Cloud Firestore를 통해 선생님 확인 화면의 **타반 경고 알림** 탭에 자동 기록됩니다.
- **선생님 확인(실시간 동기화)**:
  - 선생님 Google 계정(`tp15181234@gmail.com`)으로 로그인하시면, 학생들이 모바일/아이패드/카카오톡에서 제출한 답안이 **새로고침 없이 실시간으로 동기화**되어 표시됩니다.

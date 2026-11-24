export interface NNConceptCard {
  id: string;
  term: string;
  english: string;
  badge: string;
  summary: string;
  detail: string;
  examPoint: string;
  accent: 'blue' | 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'teal';
}

export interface NNSpeedQuizItem {
  id: string;
  question: string;
  hint: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const NN_CONCEPT_CARDS: NNConceptCard[] = [
  {
    id: 'ann',
    term: '인공신경망 (ANN)',
    english: 'Artificial Neural Network',
    badge: '전체 구조',
    summary: '사람의 뇌 속 뉴런(신경세포)들이 연결되어 신호를 주고받는 원리를 모방한 인공지능 모델입니다.',
    detail:
      '수많은 인공 뉴런(노드)이 층(Layer)을 이루어 연결되어 있으며, 데이터를 받아 가중치를 계산하고 활성화 함수를 거쳐 결과를 예측하거나 분류합니다.',
    examPoint: '뇌의 뉴런(신경세포) 연결 구조를 본떠 만든 모델 = 인공신경망(ANN)',
    accent: 'blue',
  },
  {
    id: 'perceptron',
    term: '퍼셉트론',
    english: 'Perceptron',
    badge: '기본 단위',
    summary: '인공신경망을 이루는 가장 기본이 되는 단일 인공 뉴런 모델입니다.',
    detail:
      '여러 개의 입력 신호를 받아 각각의 중요도인 가중치(Weight)를 곱해 모두 더한 다음, 활성화 함수를 통과시켜 하나의 출력값을 내보냅니다. 은닉층이 없는 단일 층 구조는 단층 퍼셉트론이라고 합니다.',
    examPoint: '입력 × 가중치의 합 → 활성화 함수 → 출력으로 동작하는 신경망의 최소 단위',
    accent: 'indigo',
  },
  {
    id: 'input-layer',
    term: '입력층',
    english: 'Input Layer',
    badge: '층 구조 ①',
    summary: '외부의 원시 데이터(특징)를 신경망 안으로 가장 먼저 받아들이는 층입니다.',
    detail:
      '예를 들어 손글씨 숫자 이미지의 픽셀 값, 학생의 시험 점수와 공부 시간 등 문제 해결에 필요한 입력 데이터를 받아 다음 층으로 전달하는 역할을 합니다. 별도의 복잡한 계산 없이 데이터를 전달합니다.',
    examPoint: '데이터가 신경망에 최초로 들어오는 입구 역할',
    accent: 'emerald',
  },
  {
    id: 'weight',
    term: '가중치',
    english: 'Weight',
    badge: '핵심 연산 요소',
    summary: '각 입력 신호가 결과 판단에 얼마나 중요한지를 나타내는 곱셈 비율(수치)입니다.',
    detail:
      '신호의 영향력을 조절하는 값으로, 중요한 입력에는 큰 가중치가, 덜 중요한 입력에는 작은 가중치가 부여됩니다. 신경망이 "학습한다"는 것은 정답과의 오차를 줄이도록 이 가중치 값을 반복적으로 조절(업데이트)하는 과정입니다.',
    examPoint: '각 입력에 곱해지는 중요도 값이며, 학습을 통해 계속 수정·최적화됨',
    accent: 'amber',
  },
  {
    id: 'hidden-layer',
    term: '은닉층',
    english: 'Hidden Layer',
    badge: '층 구조 ②',
    summary: '입력층과 출력층 사이에서 데이터의 특징과 패턴을 추출·가공하는 중간층입니다.',
    detail:
      '외부에서 입력값과 최종 출력값은 직접 보이지만, 중간 계산 과정은 외부에 드러나지 않아 "은닉층(숨겨진 층)"이라고 부릅니다. 은닉층이 많을수록 선, 면, 형태 등 더 복잡하고 추상적인 패턴을 학습할 수 있습니다.',
    examPoint: '입력층과 출력층 사이에 위치해 핵심 특징을 추출하는 중간 처리층',
    accent: 'violet',
  },
  {
    id: 'output-layer',
    term: '출력층',
    english: 'Output Layer',
    badge: '층 구조 ③',
    summary: '신경망의 최종 계산 결과(예측값 또는 분류 결과)를 외부로 내보내는 마지막 층입니다.',
    detail:
      '스팸/정상 메일 판별, 강아지/고양이 확률, 내일의 기온 예측 수치 등 사용자가 최종적으로 얻고자 하는 답이 출력층을 통해 나옵니다.',
    examPoint: '신경망이 연산을 마친 뒤 최종 판정/예측 값을 출력하는 출구 역할',
    accent: 'rose',
  },
  {
    id: 'activation',
    term: '활성화 함수',
    english: 'Activation Function',
    badge: '신호 결정',
    summary: '입력 신호와 가중치를 곱해 더한 값(가중합)을 받아 다음 층으로 신호를 전달할지, 얼마나 강하게 보낼지 결정하는 함수입니다.',
    detail:
      '단순한 직선 계산(선형 결합)만으로는 복잡한 곡선·패턴 문제를 풀 수 없기 때문에, 기준치(임계값)를 넘으면 신호를 통과시키거나 비선형적으로 변환해 출력합니다. (예: 계단 함수, 시그모이드 함수, ReLU 함수)',
    examPoint: '가중합을 받아 출력(신호 전달 여부 및 크기)을 결정하는 함수',
    accent: 'cyan',
  },
  {
    id: 'mlp-dnn-dl',
    term: '다층 퍼셉트론(MLP) · 심층 신경망(DNN) · 딥러닝',
    english: 'MLP · DNN · Deep Learning',
    badge: '확장과 딥러닝',
    summary: '은닉층을 1개 이상 쌓은 다층 퍼셉트론(MLP)에서 은닉층을 여러 층 깊게 쌓으면 심층 신경망(DNN)이 되며, 이를 이용한 학습이 딥러닝입니다.',
    detail:
      '① 다층 퍼셉트론(MLP): 입력층과 출력층 사이에 은닉층을 1개 이상 추가한 신경망\n② 심층 신경망(DNN): 은닉층이 여러 개(2개 이상) 깊게 구성된 다층 신경망\n③ 딥러닝(Deep Learning): 심층 신경망을 활용해 방대한 데이터에서 스스로 특징을 추출하고 학습하는 기계학습의 한 분야',
    examPoint: '단층 퍼셉트론 → 은닉층 추가(다층 퍼셉트론, MLP) → 깊은 은닉층(심층 신경망, DNN) → 학습 방법(딥러닝)',
    accent: 'teal',
  },
];

export const NN_SPEED_QUIZ_LIST: NNSpeedQuizItem[] = [
  {
    id: 'nn-sq-1',
    question: '사람의 뇌 속 뉴런(신경세포)이 서로 연결되어 정보를 처리하는 구조를 모방해 만든 인공지능 모델의 전체 명칭은?',
    hint: '줄여서 ANN(Artificial Neural Network)이라고 부릅니다.',
    options: ['인공신경망 (ANN)', '활성화 함수', '연관 규칙', '선형 회귀'],
    correctAnswer: '인공신경망 (ANN)',
    explanation: '인공신경망(ANN)은 생물학적 뇌의 뉴런과 시냅스 연결 구조를 수학적·전산적으로 본떠 만든 모델입니다.',
  },
  {
    id: 'nn-sq-2',
    question: '인공신경망을 구성하는 가장 기본 단위로, 여러 입력에 가중치를 곱해 더한 뒤 활성화 함수를 거쳐 출력을 내보내는 모델은?',
    hint: '인공 뉴런 1개의 기본 구조입니다.',
    options: ['퍼셉트론 (Perceptron)', '불용어 (Stopword)', 'k-평균 (K-Means)', '토큰화 (Tokenization)'],
    correctAnswer: '퍼셉트론 (Perceptron)',
    explanation: '퍼셉트론은 다수의 입력 신호를 받아 가중합과 활성화 함수를 통해 하나의 신호를 출력하는 인공신경망의 가장 기본 단위입니다.',
  },
  {
    id: 'nn-sq-3',
    question: '퍼셉트론에서 각 입력 신호가 최종 결과에 미치는 "중요도"를 나타내며, 학습 과정에서 오차를 줄이도록 계속 값이 수정되는 요소는?',
    hint: '입력값에 곱해지는 비율 값입니다.',
    options: ['입력층', '가중치 (Weight)', '출력층', '은닉층'],
    correctAnswer: '가중치 (Weight)',
    explanation: '가중치(Weight)는 각 입력의 영향력(중요도)을 조절하는 수치로, 인공신경망이 데이터를 학습할 때 이 가중치 값이 계속 업데이트됩니다.',
  },
  {
    id: 'nn-sq-4',
    question: '외부의 원시 데이터(예: 이미지의 픽셀값, 공부 시간, 키/몸무게 등)를 인공신경망으로 가장 먼저 받아들이는 층은?',
    hint: '데이터가 들어오는 첫 번째 층입니다.',
    options: ['입력층 (Input Layer)', '은닉층 (Hidden Layer)', '출력층 (Output Layer)', '활성화 함수'],
    correctAnswer: '입력층 (Input Layer)',
    explanation: '입력층은 외부 데이터를 받아 신경망 내부로 전달하는 첫 번째 층입니다.',
  },
  {
    id: 'nn-sq-5',
    question: '입력층과 출력층 사이에 위치하며, 외부에서는 직접 보이지 않지만 데이터의 핵심 특징과 복잡한 패턴을 추출·처리하는 중간층은?',
    hint: '숨겨져 있는 중간 층이라는 뜻입니다.',
    options: ['입력층 (Input Layer)', '은닉층 (Hidden Layer)', '출력층 (Output Layer)', '가중치 (Weight)'],
    correctAnswer: '은닉층 (Hidden Layer)',
    explanation: '은닉층(Hidden Layer)은 입력층과 출력층 사이에서 데이터의 특징을 추출하고 변환하는 중간층입니다.',
  },
  {
    id: 'nn-sq-6',
    question: '인공신경망의 마지막에 위치하여, 모든 계산을 거친 최종 예측값이나 분류 결과를 외부로 내보내는 층은?',
    hint: '최종 답이 나오는 마지막 층입니다.',
    options: ['입력층 (Input Layer)', '은닉층 (Hidden Layer)', '출력층 (Output Layer)', '단층 퍼셉트론'],
    correctAnswer: '출력층 (Output Layer)',
    explanation: '출력층(Output Layer)은 신경망이 내린 최종 결론(분류 확률, 예측 수치 등)을 내보내는 마지막 층입니다.',
  },
  {
    id: 'nn-sq-7',
    question: '가중치가 곱해진 입력 신호들의 합을 받아, 다음 층으로 신호를 보낼지 말지 또는 얼마나 출력할지 결정하는 함수는?',
    hint: '뉴런을 활성화할지 결정하는 함수입니다.',
    options: ['활성화 함수', '출력층', '은닉층', 'kNN 함수'],
    correctAnswer: '활성화 함수',
    explanation: '활성화 함수(Activation Function)는 가중합 결과를 변환하여 다음 뉴런으로 전달할 출력 신호를 결정합니다.',
  },
  {
    id: 'nn-sq-8',
    question: '단층 퍼셉트론의 한계를 극복하기 위해 입력층과 출력층 사이에 "은닉층을 1개 이상" 추가해 여러 층으로 연결한 신경망 구조는?',
    hint: '층이 여러 개인 퍼셉트론(MLP)입니다.',
    options: ['단층 퍼셉트론', '다층 퍼셉트론 (MLP)', '불용어 처리기', '의사결정나무'],
    correctAnswer: '다층 퍼셉트론 (MLP)',
    explanation: '다층 퍼셉트론(MLP, Multi-Layer Perceptron)은 입력층과 출력층 사이에 은닉층을 추가해 복잡한 비선형 문제도 해결할 수 있습니다.',
  },
  {
    id: 'nn-sq-9',
    question: '다층 퍼셉트론에서 "은닉층을 여러 개(2개 이상) 깊게" 쌓아 올려 더욱 정교하고 추상적인 특징까지 학습할 수 있게 만든 인공신경망은?',
    hint: '깊은(Deep) 신경망(DNN)입니다.',
    options: ['단층 퍼셉트론', '심층 신경망 (DNN)', '장바구니 분석', '순서도'],
    correctAnswer: '심층 신경망 (DNN)',
    explanation: '심층 신경망(DNN, Deep Neural Network)은 입력층과 출력층 사이에 여러 개의 은닉층을 깊게 쌓은 인공신경망입니다.',
  },
  {
    id: 'nn-sq-10',
    question: '심층 신경망(DNN) 등 여러 층의 인공신경망을 이용해 방대한 데이터로부터 기계가 스스로 핵심 특징을 찾아내며 학습하는 기술 분야는?',
    hint: '기계학습의 하위 분야이자 깊은 학습을 뜻합니다.',
    options: ['딥러닝 (Deep Learning)', '토큰화 (Tokenization)', '연관 규칙 (Association Rule)', '규칙 기반 코딩'],
    correctAnswer: '딥러닝 (Deep Learning)',
    explanation: '딥러닝(Deep Learning)은 심층 신경망을 기반으로 데이터 속 복잡한 패턴과 특징을 스스로 추출하여 학습하는 기계학습의 한 분야입니다.',
  },
];

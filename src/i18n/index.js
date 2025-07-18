import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 한국어 번역
const ko = {
  translation: {
    // 공통
    common: {
      language: "언어",
      korean: "한국어",
      english: "English",
      japanese: "日本語",
    },

    // 네비게이션
    nav: {
      home: "홈",
      detection: "자세 감지",
      data: "데이터",
    },

    // 페이지네이션
    pagination: {
      previous: "이전",
      next: "다음",
    },

    // 홈 페이지
    home: {
      title: "AI 자세교정 앱",
      subtitle: "실시간 자세 분석 및 교정",
      description:
        "MediaPipe를 활용한 정확한 자세 분석으로 건강한 자세를 만들어보세요.",
      startButton: "자세 감지 시작",
      features: {
        title: "주요 기능",
        realtime: "실시간 자세 감지",
        analysis: "정확한 자세 분석",
        feedback: "개인 맞춤 피드백",
        data: "데이터 관리 및 내보내기",
      },
    },

    // 자세 감지 페이지
    detection: {
      title: "자세 감지",
      startButton: "자세 감지 시작",
      stopButton: "자세 감지 중지",
      status: {
        waiting: "감지 대기 중",
        detecting: "자세 감지 중",
        ready: "자세 감지 준비 중",
        error: "초기화 오류",
      },
      posture: {
        perfect: "완벽한 자세",
        good: "좋은 자세",
        normal: "보통 자세",
        bad: "나쁜 자세",
      },
      metrics: {
        neckAngle: "목 각도",
        shoulderSlope: "어깨 기울기",
        headForward: "머리 전방 돌출도",
        shoulderHeightDiff: "어깨 높이 차이",
        score: "자세 점수",
      },
      feedback: {
        title: "자세 피드백",
        analysis: "자세 분석 결과",
      },
    },

    // 데이터 페이지
    data: {
      title: "자세 데이터",
      export: {
        csv: "CSV 내보내기",
        excel: "Excel 내보내기",
        pdf: "PDF 내보내기",
        dateTime: "날짜/시간",
        status: "상태",
        postureData: "자세데이터",
        postureAnalysisReport: "자세 데이터 분석 리포트",
        generatedDate: "생성일",
        records: "개",
        points: "점",
        times: "회",
        page: "페이지",
        report: "리포트",
        history: "자세 기록 히스토리",
        noData: "자세 데이터가 없습니다",
        noDataMessage: "자세 감지를 시작하여 데이터를 수집해보세요.",
        cervicalLordosis: "목 전만각(도)",
        forwardHeadDistance: "머리 전방 이동 거리(mm)",
        headTilt: "머리 좌우 기울기(도)",
        headRotation: "머리 좌우 회전(도)",
        shoulderHeightDiffMm: "어깨 높이 차이(mm)",
        scapularWingingLeft: "견갑골 돌출(좌)",
        scapularWingingRight: "견갑골 돌출(우)",
        shoulderForwardMovement: "어깨 전방 이동(mm)",
        feedback: "자세 피드백",
        minScore: "최저 점수",
        consistency: "일관성",
        scapularWinging: "견갑골 돌출",
        none: "없음",
      },
      filter: {
        title: "기간 필터",
        all: "전체",
        today: "오늘",
        thisWeek: "이번 주",
        thisMonth: "이번 달",
      },
      clear: "데이터 초기화",
      stats: {
        title: "통계",
        totalRecords: "총 기록",
        averageScore: "평균 점수",
        bestScore: "최고 점수",
        improvement: "개선도",
      },
      metrics: {
        title: "측정 지표 (총 10개)",
      },
    },

    // 웹캠
    webcam: {
      activated: "웹캠 활성화됨",
      deactivated: "웹캠 비활성화됨",
      start: "웹캠 시작",
      stop: "웹캠 중지",
      capture: "사진 촬영",
      capturedImage: "촬영된 사진",
      startSuccess: "웹캠이 성공적으로 시작되었습니다.",
      error: "웹캠 오류:",
    },

    // 알림
    notifications: {
      webcamError: "웹캠 접근 오류",
      dataExported: "데이터가 성공적으로 내보내졌습니다.",
      dataCleared: "모든 데이터가 삭제되었습니다.",
      error: "오류가 발생했습니다.",
    },
  },
};

// 영어 번역
const en = {
  translation: {
    // Common
    common: {
      language: "Language",
      korean: "한국어",
      english: "English",
      japanese: "日本語",
    },

    // Navigation
    nav: {
      home: "Home",
      detection: "Detection",
      data: "Data",
    },

    // Pagination
    pagination: {
      previous: "Previous",
      next: "Next",
    },

    // Home page
    home: {
      title: "AI Posture Correction App",
      subtitle: "Real-time Posture Analysis & Correction",
      description:
        "Create healthy posture with accurate posture analysis using MediaPipe.",
      startButton: "Start Posture Detection",
      features: {
        title: "Key Features",
        realtime: "Real-time Posture Detection",
        analysis: "Accurate Posture Analysis",
        feedback: "Personalized Feedback",
        data: "Data Management & Export",
      },
    },

    // Detection page
    detection: {
      title: "Posture Detection",
      startButton: "Start Detection",
      stopButton: "Stop Detection",
      status: {
        waiting: "Waiting for detection",
        detecting: "Detecting posture",
        ready: "Ready for detection",
        error: "Initialization error",
      },
      posture: {
        perfect: "Perfect Posture",
        good: "Good Posture",
        normal: "Normal Posture",
        bad: "Bad Posture",
      },
      metrics: {
        neckAngle: "Neck Angle",
        shoulderSlope: "Shoulder Slope",
        headForward: "Head Forward",
        shoulderHeightDiff: "Shoulder Height Difference",
        score: "Posture Score",
      },
      feedback: {
        title: "Posture Feedback",
        analysis: "Posture Analysis Results",
      },
    },

    // Data page
    data: {
      title: "Posture Data",
      export: {
        csv: "Export CSV",
        excel: "Export Excel",
        pdf: "Export PDF",
        dateTime: "Date/Time",
        status: "Status",
        postureData: "PostureData",
        postureAnalysisReport: "Posture Data Analysis Report",
        generatedDate: "Generated Date",
        records: "records",
        points: "points",
        times: "times",
        page: "Page",
        report: "Report",
        history: "Posture History",
        noData: "No posture data available",
        noDataMessage: "Start posture detection to collect data.",
        cervicalLordosis: "Cervical Lordosis(°)",
        forwardHeadDistance: "Forward Head Distance(mm)",
        headTilt: "Head Lateral Tilt(°)",
        headRotation: "Head Rotation(°)",
        shoulderHeightDiffMm: "Shoulder Height Diff(mm)",
        scapularWingingLeft: "Scapular Winging(Left)",
        scapularWingingRight: "Scapular Winging(Right)",
        shoulderForwardMovement: "Shoulder Forward Movement(mm)",
        feedback: "Posture Feedback",
        minScore: "Min Score",
        consistency: "Consistency",
        scapularWinging: "Scapular Winging",
        none: "None",
      },
      filter: {
        title: "Period Filter",
        all: "All",
        today: "Today",
        thisWeek: "This Week",
        thisMonth: "This Month",
      },
      clear: "Clear Data",
      stats: {
        title: "Statistics",
        totalRecords: "Total Records",
        averageScore: "Average Score",
        bestScore: "Best Score",
        improvement: "Improvement",
      },
      metrics: {
        title: "Measurement Indicators (Total 10)",
      },
    },

    // Webcam
    webcam: {
      activated: "Webcam activated",
      deactivated: "Webcam deactivated",
      start: "Start Webcam",
      stop: "Stop Webcam",
      capture: "Take Photo",
      capturedImage: "Captured Image",
      startSuccess: "Webcam started successfully.",
      error: "Webcam error:",
    },

    // Notifications
    notifications: {
      webcamError: "Webcam access error",
      dataExported: "Data exported successfully.",
      dataCleared: "All data has been deleted.",
      error: "An error occurred.",
    },
  },
};

// 일본어 번역
const ja = {
  translation: {
    // 共通
    common: {
      language: "言語",
      korean: "한국어",
      english: "English",
      japanese: "日本語",
    },

    // ナビゲーション
    nav: {
      home: "ホーム",
      detection: "姿勢検出",
      data: "データ",
    },

    // ページネーション
    pagination: {
      previous: "前へ",
      next: "次へ",
    },

    // ホームページ
    home: {
      title: "AI姿勢矯正アプリ",
      subtitle: "リアルタイム姿勢分析・矯正",
      description:
        "MediaPipeを使用した正確な姿勢分析で健康的な姿勢を作りましょう。",
      startButton: "姿勢検出開始",
      features: {
        title: "主な機能",
        realtime: "リアルタイム姿勢検出",
        analysis: "正確な姿勢分析",
        feedback: "パーソナライズされたフィードバック",
        data: "データ管理・エクスポート",
      },
    },

    // 検出ページ
    detection: {
      title: "姿勢検出",
      startButton: "検出開始",
      stopButton: "検出停止",
      status: {
        waiting: "検出待機中",
        detecting: "姿勢検出中",
        ready: "検出準備中",
        error: "初期化エラー",
      },
      posture: {
        perfect: "完璧な姿勢",
        good: "良い姿勢",
        normal: "普通の姿勢",
        bad: "悪い姿勢",
      },
      metrics: {
        neckAngle: "首の角度",
        shoulderSlope: "肩の傾き",
        headForward: "頭の前方突出",
        shoulderHeightDiff: "肩の高さ差",
        score: "姿勢スコア",
      },
      feedback: {
        title: "姿勢フィードバック",
        analysis: "姿勢分析結果",
      },
    },

    // データページ
    data: {
      title: "姿勢データ",
      export: {
        csv: "CSVエクスポート",
        excel: "Excelエクスポート",
        pdf: "PDFエクスポート",
        dateTime: "日時",
        status: "状態",
        postureData: "姿勢データ",
        postureAnalysisReport: "姿勢データ分析レポート",
        generatedDate: "生成日",
        records: "件",
        points: "点",
        times: "回",
        page: "ページ",
        report: "レポート",
        history: "姿勢記録履歴",
        noData: "姿勢データがありません",
        noDataMessage: "姿勢検出を開始してデータを収集してください。",
        cervicalLordosis: "頸椎前弯角(°)",
        forwardHeadDistance: "頭部前方移動距離(mm)",
        headTilt: "頭部側方傾斜(°)",
        headRotation: "頭部回転(°)",
        shoulderHeightDiffMm: "肩の高さ差(mm)",
        scapularWingingLeft: "肩甲骨突出(左)",
        scapularWingingRight: "肩甲骨突出(右)",
        shoulderForwardMovement: "肩前方移動(mm)",
        feedback: "姿勢フィードバック",
        minScore: "最低スコア",
        consistency: "一貫性",
        scapularWinging: "肩甲骨突出",
        none: "なし",
      },
      filter: {
        title: "期間フィルター",
        all: "すべて",
        today: "今日",
        thisWeek: "今週",
        thisMonth: "今月",
      },
      clear: "データクリア",
      stats: {
        title: "統計",
        totalRecords: "総記録数",
        averageScore: "平均スコア",
        bestScore: "最高スコア",
        improvement: "改善度",
      },
      metrics: {
        title: "測定指標 (計10個)",
      },
    },

    // ウェブカメラ
    webcam: {
      activated: "ウェブカメラ有効",
      deactivated: "ウェブカメラ無効",
      start: "ウェブカメラ開始",
      stop: "ウェブカメラ停止",
      capture: "写真撮影",
      capturedImage: "撮影された写真",
      startSuccess: "ウェブカメラが正常に開始されました。",
      error: "ウェブカメラエラー:",
    },

    // 通知
    notifications: {
      webcamError: "ウェブカメラアクセスエラー",
      dataExported: "データが正常にエクスポートされました。",
      dataCleared: "すべてのデータが削除されました。",
      error: "エラーが発生しました。",
    },
  },
};

// i18n 초기화
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko,
      en,
      ja,
    },
    fallbackLng: "ko",
    debug: false,

    interpolation: {
      escapeValue: false, // React는 이미 XSS를 방지하므로
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;

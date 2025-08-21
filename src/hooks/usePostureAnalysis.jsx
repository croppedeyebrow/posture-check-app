import { useCallback } from "react";
import useStore from "../store/useStore";

const usePostureAnalysis = () => {
  const { setPosture } = useStore();

  // 자세 분석 함수
  const analyzePosture = useCallback(
    (landmarks) => {
      if (!landmarks) return null;

      // 주요 랜드마크 추출
      const nose = landmarks[0];
      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftEar = landmarks[7];
      const leftEye = landmarks[2];
      const rightEye = landmarks[5];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const leftElbow = landmarks[13];
      const rightElbow = landmarks[14];

      // 어깨 중점 계산
      const shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2,
      };

      // 1. 목 각도 계산 (코와 어깨 중점)
      const neckAngle =
        Math.atan2(nose.y - shoulderMidpoint.y, nose.x - shoulderMidpoint.x) *
        (180 / Math.PI);

      // 2. 어깨 기울기 계산
      const shoulderSlope =
        Math.atan2(
          rightShoulder.y - leftShoulder.y,
          rightShoulder.x - leftShoulder.x
        ) *
        (180 / Math.PI);

      // 3. 머리 전방 돌출도 계산 (코와 어깨 중점의 수직 거리)
      const headForward = Math.abs(nose.x - shoulderMidpoint.x);

      // 4. 어깨 높이 차이 계산
      const shoulderHeightDiff = Math.abs(leftShoulder.y - rightShoulder.y);

      // 새로운 지표들 계산
      // 5. 목 전만각 (Cervical Lordosis) - 목의 전만 곡선 각도
      const cervicalLordosis =
        Math.atan2(nose.y - leftShoulder.y, nose.x - leftShoulder.x) *
        (180 / Math.PI);

      // 6. Forward Head Distance (mm 단위로 변환, 화면 크기 기준)
      const forwardHeadDistance = Math.abs(nose.x - shoulderMidpoint.x) * 640;

      // 7. 머리 좌우 기울기 (Head Lateral Tilt)
      const headTilt =
        Math.atan2(leftEar.y - leftShoulder.y, leftEar.x - leftShoulder.x) *
        (180 / Math.PI);

      // 8. 어깨 높이 차이 (mm 단위)
      const leftShoulderHeightDiff =
        Math.abs(leftShoulder.y - rightShoulder.y) * 480;

      // 9. 견갑골 돌출 여부 (Scapular Winging)
      const leftScapularWinging = Math.abs(leftShoulder.x - leftElbow.x) > 0.1;
      const rightScapularWinging =
        Math.abs(rightShoulder.x - rightElbow.x) > 0.1;

      // 10. 어깨 전방 이동 (Shoulder Forward Movement)
      const shoulderForwardMovement =
        Math.abs(shoulderMidpoint.x - (leftHip.x + rightHip.x) / 2) * 640;

      // 11. 머리 회전 (Head Rotation) - 좌우 회전 각도
      const headRotation =
        Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) *
        (180 / Math.PI);

      // 자세 상태 판단
      let status = "감지 대기 중";
      let issues = [];
      let score = 100;
      let totalDeduction = 0;

      // 머리 회전 검사 (정상: -15° ~ 15°)
      if (Math.abs(headRotation) > 15) {
        issues.push({
          problem: "머리가 측면으로 많이 회전되어 있습니다",
          solution: "머리를 정면으로 돌려주세요.",
        });
        totalDeduction += 4;
      }

      // 목 각도 검사 (정상: -45° ~ 45°)
      if (Math.abs(neckAngle) > 45) {
        issues.push({
          problem: "목이 많이 기울어져 있습니다",
          solution:
            "목을 중앙으로 돌리고, 턱을 가슴에 가깝게 당겨주세요. 목 스트레칭을 정기적으로 해주세요.",
        });
        status = "주의";
        totalDeduction += 12;
      } else if (Math.abs(neckAngle) > 30) {
        issues.push({
          problem: "목이 약간 기울어져 있습니다",
          solution: "목을 중앙으로 돌려주세요.",
        });
        status = "양호";
        totalDeduction += 6;
      }

      // 어깨 기울기 검사 (정상: -10° ~ 10°)
      if (Math.abs(shoulderSlope) > 10) {
        issues.push({
          problem: "어깨가 많이 기울어져 있습니다",
          solution:
            "어깨를 수평으로 맞춰주세요. 어깨 스트레칭을 정기적으로 해주세요.",
        });
        status = "주의";
        totalDeduction += 10;
      } else if (Math.abs(shoulderSlope) > 5) {
        issues.push({
          problem: "어깨가 약간 기울어져 있습니다",
          solution: "어깨를 수평으로 맞춰주세요.",
        });
        status = "양호";
        totalDeduction += 5;
      }

      // 머리 전방 돌출도 검사 (정상: 0.1 이하)
      if (headForward > 0.15) {
        issues.push({
          problem: "머리가 많이 앞으로 나와 있습니다",
          solution:
            "턱을 가슴에 가깝게 당기고, 목을 뒤로 젖혀주세요. 목 스트레칭을 정기적으로 해주세요.",
        });
        status = "주의";
        totalDeduction += 15;
      } else if (headForward > 0.1) {
        issues.push({
          problem: "머리가 약간 앞으로 나와 있습니다",
          solution: "턱을 가슴에 가깝게 당겨주세요.",
        });
        status = "양호";
        totalDeduction += 8;
      }

      // 어깨 높이 차이 검사 (정상: 0.05 이하)
      if (shoulderHeightDiff > 0.1) {
        issues.push({
          problem: "어깨 높이가 많이 다릅니다",
          solution:
            "어깨를 수평으로 맞춰주세요. 어깨 스트레칭을 정기적으로 해주세요.",
        });
        status = "주의";
        totalDeduction += 8;
      } else if (shoulderHeightDiff > 0.05) {
        issues.push({
          problem: "어깨 높이가 약간 다릅니다",
          solution: "어깨를 수평으로 맞춰주세요.",
        });
        status = "양호";
        totalDeduction += 4;
      }

      // 새로운 지표들 검사
      // 목 전만각 검사 (정상: -30° ~ 30°)
      if (Math.abs(cervicalLordosis) > 30) {
        issues.push({
          problem: "목의 곡선이 비정상적입니다",
          solution: "목 스트레칭을 정기적으로 해주세요.",
        });
        totalDeduction += 5;
      }

      // Forward Head Distance 검사 (정상: 50mm 이하)
      if (forwardHeadDistance > 100) {
        issues.push({
          problem: "머리가 많이 앞으로 나와 있습니다",
          solution: "턱을 가슴에 가깝게 당겨주세요.",
        });
        totalDeduction += 8;
      }

      // 머리 좌우 기울기 검사 (정상: -15° ~ 15°)
      if (Math.abs(headTilt) > 15) {
        issues.push({
          problem: "목이 측면으로 많이 기울어져 있습니다",
          solution: "목을 중앙으로 돌려주세요.",
        });
        totalDeduction += 6;
      }

      // 어깨 높이 차이 검사 (정상: 20mm 이하)
      if (leftShoulderHeightDiff > 40) {
        issues.push({
          problem: "어깨 높이가 많이 다릅니다",
          solution: "어깨를 수평으로 맞춰주세요.",
        });
        totalDeduction += 6;
      }

      // 견갑골 돌출 검사
      if (leftScapularWinging || rightScapularWinging) {
        issues.push({
          problem: "견갑골이 돌출되어 있습니다",
          solution: "어깨를 뒤로 젖히고 가슴을 펴주세요.",
        });
        totalDeduction += 4;
      }

      // 어깨 전방 이동 검사 (정상: 100mm 이하)
      if (shoulderForwardMovement > 150) {
        issues.push({
          problem: "어깨가 많이 앞으로 나와 있습니다",
          solution: "어깨를 뒤로 젖히고 가슴을 펴주세요.",
        });
        totalDeduction += 5;
      }

      // 최종 점수 계산
      score = Math.max(0, score - totalDeduction);

      // 점수에 따른 상태 재정의
      if (score >= 90) {
        status = "완벽한 자세";
      } else if (score >= 60) {
        status = "좋은 자세";
      } else if (score >= 50) {
        status = "보통 자세";
      } else {
        status = "나쁜 자세";
      }

      const postureData = {
        neckAngle: neckAngle.toFixed(1),
        shoulderSlope: shoulderSlope.toFixed(1),
        headForward: (headForward * 100).toFixed(1),
        shoulderHeightDiff: (shoulderHeightDiff * 100).toFixed(1),
        score: score,
        issues,
        cervicalLordosis: cervicalLordosis.toFixed(1),
        forwardHeadDistance: forwardHeadDistance.toFixed(1),
        headTilt: headTilt.toFixed(1),
        leftShoulderHeightDiff: leftShoulderHeightDiff.toFixed(1),
        leftScapularWinging: leftScapularWinging,
        rightScapularWinging: rightScapularWinging,
        shoulderForwardMovement: shoulderForwardMovement.toFixed(1),
        headRotation: headRotation.toFixed(1),
      };

      // 전역 상태 업데이트
      setPosture({
        status,
        neckAngle,
        shoulderSlope,
        headForward,
        shoulderHeightDiff,
        score,
        timestamp: Date.now(),
        cervicalLordosis,
        forwardHeadDistance,
        headTilt,
        leftShoulderHeightDiff,
        leftScapularWinging,
        rightScapularWinging,
        shoulderForwardMovement,
        headRotation,
      });

      // 로컬 스토리지에 자세 데이터 저장
      const postureHistory = JSON.parse(
        localStorage.getItem("postureHistory") || "[]"
      );
      const newPostureRecord = {
        status,
        neckAngle,
        shoulderSlope,
        headForward,
        shoulderHeightDiff,
        score,
        timestamp: Date.now(),
        sessionId: String(Date.now()),
        cervicalLordosis,
        forwardHeadDistance,
        headTilt,
        leftShoulderHeightDiff,
        leftScapularWinging,
        rightScapularWinging,
        shoulderForwardMovement,
        headRotation,
      };

      postureHistory.push(newPostureRecord);

      // 최근 100개의 기록만 유지
      if (postureHistory.length > 100) {
        postureHistory.splice(0, postureHistory.length - 100);
      }

      localStorage.setItem("postureHistory", JSON.stringify(postureHistory));

      return {
        status,
        postureData,
        issues,
      };
    },
    [setPosture]
  );

  return {
    analyzePosture,
  };
};

export default usePostureAnalysis;

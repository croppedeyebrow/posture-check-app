# Vercel 배포 가이드

## 환경 변수 설정

Vercel에 배포할 때 다음 환경 변수를 설정해야 합니다:

### 필수 환경 변수

1. **VITE_PRODUCTION_API_URL**: 실제 백엔드 서버 URL
   - 예: `https://your-backend-domain.com`
   - 예: `https://your-backend.vercel.app`
   - 예: `https://your-backend.railway.app`

### Vercel에서 환경 변수 설정 방법

1. Vercel 대시보드에서 프로젝트 선택
2. Settings → Environment Variables 메뉴로 이동
3. 다음 변수 추가:
   ```
   Name: VITE_PRODUCTION_API_URL
   Value: https://your-actual-backend-url.com
   Environment: Production
   ```

### 백엔드 서버 배포 옵션

#### 1. Vercel (추천)
- FastAPI 백엔드를 Vercel에 배포
- 무료 플랜으로도 충분한 기능 제공
- 자동 HTTPS 지원

#### 2. Railway
- 간단한 배포 프로세스
- PostgreSQL 데이터베이스 제공
- 무료 플랜 있음

#### 3. Render
- 무료 플랜 제공
- 자동 배포 지원

#### 4. Heroku
- 안정적인 서비스
- 유료 플랜 (무료 플랜 종료)

### 배포 후 확인사항

1. 환경 변수가 올바르게 설정되었는지 확인
2. 백엔드 서버가 정상적으로 실행되는지 확인
3. CORS 설정이 올바른지 확인
4. API 엔드포인트가 정상적으로 응답하는지 확인

### 문제 해결

#### CORS 오류 발생 시
백엔드에서 프론트엔드 도메인을 허용하도록 CORS 설정:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 환경 변수가 적용되지 않는 경우
1. Vercel에서 재배포 실행
2. 브라우저 캐시 삭제
3. 환경 변수 이름이 `VITE_`로 시작하는지 확인

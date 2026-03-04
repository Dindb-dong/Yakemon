# https://yakemon.netlify.app/

- Node 설치가 필요합니다. (LTS 버전 설치를 권장합니다. 이미 설치되어 있으시면 설치 안하셔도 됩니다.)
- npm -v; node -v 로 제대로 설치되었는지 확인해주세요.
- npm install로 의존성을 설치해주세요. 처음 할 때는 좀 시간이 걸립니다.
- npm run dev를 실행하시면 로컬 5173 포트에 개발환경이 실행됩니다.
- http://localhost:5173/ 로 접속하시면 화면이 보입니다.

## MongoDB + Netlify Functions 전적 저장

- 전적/리더보드는 Netlify Functions를 통해 MongoDB Atlas에 저장됩니다.
- 프론트에서 DB 직접 연결은 하지 않습니다.

### Netlify 환경변수

- `MONGODB_URI`: MongoDB Atlas connection string
- `MONGODB_DB_NAME`: 사용할 DB 이름 (예: `yakemon`)

### API 라우팅

- 아래 경로는 Netlify에서 Functions로 리다이렉트됩니다.
  - `/api/count` -> `/.netlify/functions/count`
  - `/api/streak` -> `/.netlify/functions/streak`
  - `/api/history` -> `/.netlify/functions/history`
  - `/api/leaderboard` -> `/.netlify/functions/leaderboard`
  - `/api/player` -> `/.netlify/functions/player`

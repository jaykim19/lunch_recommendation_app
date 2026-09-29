# 🍱 오늘의 한끼픽

점심 메뉴를 빠르게 고를 수 있도록 도와주는 Vue 기반 랜덤 추천 앱입니다.
카테고리를 체크박스로 여러 개 선택한 뒤, 선택한 범위 안에서 메뉴를 랜덤으로 뽑을 수 있습니다.

## 주요 기능

- **랜덤 메뉴 추천**: 버튼 클릭으로 오늘의 메뉴를 무작위 추천
- **다중 카테고리 필터**: 체크박스로 카테고리 여러 개 선택 가능
- **메뉴 확정/거절**: 추천 메뉴를 확정하거나 다시 뽑기 가능
- **통계 아코디언**: 오늘 확정 횟수와 최근 확정 메뉴를 접고 펼쳐서 확인
- **로컬 저장**: 새로고침 후에도 선택 상태와 통계가 유지됨
- **ChatGPT 맞춤 추천**: 키워드와 기분을 입력하면 OpenAI가 점심 메뉴와 추천 이유를 생성

## 기술 스택

- Vue 3
- Pinia
- Vite

## 실행 방법

```bash
npm install
npm run dev
```

## ChatGPT 추천 설정

OpenAI API 호출은 `/api/recommend` 서버 함수에서 처리합니다. 로컬에서는 Vite 개발 서버가 같은 경로를 연결하므로 `.env.example`을 참고해 `.env`에 서버 환경변수를 설정한 뒤 `npm run dev`를 실행하면 됩니다. Vercel 배포 환경에서는 `api/recommend.js`가 Vercel Function으로 실행됩니다.

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

Vercel에서는 **Project → Settings → Environment Variables**에 `OPENAI_API_KEY`를 등록한 뒤 다시 배포해야 합니다. `OPENAI_MODEL`은 선택 사항이며 기본값은 `gpt-4o-mini`입니다. 서버 전용 변수이므로 변수 이름에 `VITE_` 접두사를 붙이지 마세요. ChatGPT 구독과 OpenAI API 사용 요금은 별도입니다.

## 빌드

```bash
npm run build
npm run preview
```

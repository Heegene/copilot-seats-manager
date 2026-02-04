# Copilot Seat Manager

> 🌐 *English version follows below*

GitHub Copilot 시트를 관리하는 애플리케이션입니다. 
비활성 사용자를 조회하고 시트를 일괄 제거할 수 있습니다.

## UI
![ui](/images/ui-eng.png)
![deletion](/images/delete-ui-eng.png)

## 기능

- **설정 관리**: Enterprise slug와 Personal Access Token (Classic PAT) 입력
- **비활성 사용자 검색**: 지정한 일수 이상 비활성인 사용자 필터링(0일이면 모든 사용자 조회)
- **일괄 시트 제거**: 선택한 사용자의 Copilot 시트 제거

## 시작하기

### 사전 요구사항

- Node.js 18+ 
- npm 또는 yarn
- GitHub Personal Access Token (Classic)
  - 필수 스코프: `manage_billing:copilot`, `read:user`
  - `manage_billing:copilot`: Enterprise/Organization Copilot 시트 조회 및 제거
  - `read:user`: 사용자 이메일 조회용
  - 보안에 주의하여 PAT를 안전하게 보관하시기 바랍니다. 이 애플리케이션은 PAT를 저장하지 않습니다.

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드된 앱 미리보기
npm run preview
```

### 사용 방법

1. 앱 실행 후 Enterprise Slug를 입력합니다
2. GitHub Personal Access Token을 입력합니다
3. 비활성 기간(일)을 설정하고 검색합니다
4. 검색된 사용자 중 시트를 제거할 사용자를 선택합니다
5. "시트 제거" 버튼을 클릭하여 선택한 사용자의 시트를 제거합니다(admin 권한 필요)

## 주의사항

- 시트 제거 시 'pending cancellation' 상태가 되며, 현재 빌링 사이클 종료 시점에 실제 접근이 해제됩니다

## 기술 스택

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Framer Motion

## 라이선스

MIT License

---

# Copilot Seat Manager (English)

An application for managing GitHub Enterprise Copilot seats. Search for inactive users and bulk remove their seats.

## Features

- **Settings Management**: Enter Enterprise slug and Personal Access Token (PAT)
- **Inactive User Search**: Filter users inactive for a specified number of days
- **Bulk Seat Removal**: Remove Copilot seats from selected users

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitHub Personal Access Token (Classic)
  - Required scopes: `manage_billing:copilot`, `read:user`
  - `manage_billing:copilot`: Query and remove Enterprise/Organization Copilot seats
  - `read:user`: Query user emails
  - Keep your PAT secure

### Installation and Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Production build
npm run build

# Preview built app
npm run preview
```

### Usage

1. Enter your Enterprise Slug after launching the app
2. Enter your GitHub Personal Access Token
3. Set the inactive period (days) and search
4. Select users whose seats you want to remove
5. Click "Remove Seats" to remove seats from selected users (admin permission required)

## Important Notes

- When seats are removed, they enter 'pending cancellation' status and access is revoked at the end of the current billing cycle

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Framer Motion

## License

MIT License

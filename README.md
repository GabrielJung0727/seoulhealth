# SEOULINKHEALTH

`SEOULINKHEALTH`는 글로벌 파트너와 한국 헬스케어 산업을 연결하는 K-Health 비즈니스 플랫폼 랜딩 페이지 시안입니다. 현재 저장소는 빌드 과정이 없는 정적 프로토타입 중심 구조이며, 가장 완성도 높은 버전은 `seoulinkhealth-v4.html`입니다.

## 프로젝트 개요

- 단일 HTML 기반의 반응형 랜딩 페이지
- K-Health Care / K-Health Industry / K-Bio / K-Health Food 섹션 구성
- 멤버 전용 영역, 자문단 모집, 채용, 뉴스레터, 문의 폼 UI 포함
- 로그인 / 회원가입 / 2FA 흐름은 프런트엔드 데모용 인터랙션으로 구현

## 주요 파일

- `seoulinkhealth-v4.html`: 최신 정적 시안
- `seoulinkhealth-v3.html`: 이전 버전 시안
- `seoulinkhealth-v2.html`: 이전 버전 시안
- `seoulinkhealth-preview.html`: 축약 프리뷰 버전
- `seoulinkhealth-design.jsx`: React/JSX 형태의 디자인 참고 소스

## 실행 방법

별도 설치 없이 브라우저에서 바로 확인할 수 있습니다.

```powershell
start .\seoulinkhealth-v4.html
```

또는 간단한 로컬 서버로 실행할 수 있습니다.

```powershell
python -m http.server 8000
```

이후 브라우저에서 `http://localhost:8000/seoulinkhealth-v4.html`로 접속하면 됩니다.

## 현재 구현 범위

- 스크롤 기반 섹션 이동 및 활성 메뉴 표시
- 모바일 메뉴 토글
- Google Translate 위젯 연동
- 로그인 / 회원가입 모달 및 OTP 입력 UI
- 뉴스레터 / 문의 폼 제출 시 토스트 메시지 표시

다음 항목은 아직 실제 서버 연동이 없습니다.

- 로그인 인증
- 회원가입 저장 및 검증
- 뉴스레터 구독 저장
- 문의 폼 전송
- 멤버 전용 콘텐츠 권한 제어

## 외부 의존성

페이지는 아래 외부 리소스를 사용합니다.

- Google Fonts
- Google Translate 스크립트
- 외부 호스팅 배경 이미지

따라서 일부 UI는 인터넷 연결이 있어야 정상적으로 표시됩니다.

## 수정 포인트

- 브랜드 문구, 연락처, 회사 소개 텍스트 교체
- 외부 이미지와 폰트를 자체 호스팅 자산으로 전환
- 폼 및 인증 모달을 실제 백엔드 API와 연결
- `Privacy Policy`, `Terms of Service`, `Compliance` 링크 대상 페이지 추가

## 연락처 정보

현재 페이지에 표시된 연락처는 아래와 같습니다.

- Email: `contact@seoulinkhealth.com`
- Address: `#101, 19 Gwanpyeong-ro 313 Beon-gil, Dongan-gu, Anyang-si, Gyeonggi-do, South Korea 13936`

## 참고

이 저장소에는 `package.json`이나 별도 빌드 설정이 없으므로, 정적 파일 기준으로 관리하는 프로젝트입니다.

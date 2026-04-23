/**
 * SEOULINKHEALTH — Site Configuration
 *
 * This file centralizes all configurable constants for the site.
 * Update these values or override them via environment variables.
 *
 * Environment variables use the VITE_ prefix (Vite requirement).
 */

export const SITE_CONFIG = {
  // ─── Brand ────────────────────────────────────────────────────────────────
  name: 'SEOULINKHEALTH',
  tagline: 'K-HEALTH BUSINESS PLATFORM',
  description:
    'Our network of professional experts provides accurate, reliable, and timely solutions to your inquiries.',

  // ─── Contact ──────────────────────────────────────────────────────────────
  /** Primary contact email — override with VITE_COMPANY_EMAIL env var */
  companyEmail: import.meta.env.VITE_COMPANY_EMAIL || 'contact@seoulinkhealth.com',

  /** Director name for form submission instructions */
  directorName: import.meta.env.VITE_DIRECTOR_NAME || 'Byung-Joo Kim',

  /** Company website URL */
  website: import.meta.env.VITE_WEBSITE || 'https://www.seoulinkhealth.com',

  // ─── Address ──────────────────────────────────────────────────────────────
  address: {
    postalCode: '13936',
    line1: '#101, 19 Gwanpyeong-ro 313 Beon-gil',
    line2: 'Dongan-gu, Anyang-si',
    line3: 'Gyeonggi-do, Republic of Korea',
  },

  // ─── Feature Flags ────────────────────────────────────────────────────────
  /**
   * Controls LOGIN menu item visibility.
   * Set VITE_LOGIN_ENABLED=true in .env to enable.
   */
  loginEnabled: import.meta.env.VITE_LOGIN_ENABLED === 'true',

  // ─── Founder ──────────────────────────────────────────────────────────────
  founder: {
    name: 'Jinsoo Kim',
    title: 'Founder & CEO',
    credentials: 'Ph.D.',
    signature: 'J S Kim, Ph.D.',
  },

  // ─── K-Health Domains ─────────────────────────────────────────────────────
  domains: [
    'K-HEALTH CARE',
    'K-HEALTH INDUSTRY',
    'K-BIO',
    'K-HEALTH FOOD',
  ] as const,

  // ─── Navigation ───────────────────────────────────────────────────────────
  navLinks: [
    { label: 'ABOUT US', href: '/about' },
    { label: 'OUR EXPERT NETWORK', href: '/network' },
    { label: 'OUR PROCESS', href: '/process' },
    { label: 'REQUEST NOW', href: '/request' },
  ],

  // ─── Social / SEO ─────────────────────────────────────────────────────────
  seo: {
    defaultTitle: 'SEOULINKHEALTH — K-Health Business Platform',
    titleTemplate: '%s | SEOULINKHEALTH',
  },

  // ─── Quick Links (Footer) ────────────────────────────────────────────────
  quickLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'FAQ', href: '/faq' },
  ],

  // ─── Admin UI (Korean labels for elderly-friendly dashboard) ─────────────
  admin: {
    labels: {
      // Tabs
      applications: '지원서',
      inquiries: '문의',
      // Stats
      totalApplications: '전체 지원서',
      totalInquiries: '전체 문의',
      newApplications: '새 지원서',
      newInquiries: '새 문의',
      unread: '건 미확인',
      // Statuses
      statusAll: '전체',
      statusNew: '신규',
      statusReviewed: '검토완료',
      statusContacted: '연락완료',
      // Actions
      signOut: '로그아웃',
      refresh: '새로고침',
      export: 'CSV 내보내기',
      print: '인쇄',
      close: '닫기',
      search: '이름 또는 이메일 검색',
      // Detail modal
      changeStatus: '상태 변경',
      confirmTitle: '상태 변경 확인',
      confirmStatusChange: '정말 상태를 변경하시겠습니까?',
      // Field labels
      fieldName: '이름',
      fieldEmail: '이메일',
      fieldPhone: '전화번호',
      fieldCountry: '국가',
      fieldSpecialty: '전공분야',
      fieldEducation: '학력',
      fieldExperiences: '경력',
      fieldEmployment: '현 직장',
      fieldSubject: '문의 제목',
      fieldDescription: '문의 내용',
      fieldComments: '추가 사항',
      // Login
      loginTitle: '관리자 로그인',
      loginSubtitle: '서울링크헬스 관리자 대시보드',
      password: '비밀번호',
      passwordPlaceholder: '비밀번호를 입력해 주세요',
      signIn: '로그인',
      authenticating: '인증 중...',
      incorrectPassword: '비밀번호가 올바르지 않습니다.',
      connectionError: '서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      loginFooter: '관리자만 접근 가능합니다',
      // Pagination
      prevPage: '이전',
      nextPage: '다음',
      pageOf: '페이지',
      // Empty states
      noResults: '검색 결과가 없습니다.',
      noSubmissions: '제출 내역이 없습니다.',
      // Q&A tab
      qa: '질문답변',
      qaThreads: 'Q&A 목록',
      qaNoThreads: '질문답변 내역이 없습니다.',
      qaSubject: '제목',
      qaCompany: '기업명',
      qaStatus: '상태',
      qaDate: '날짜',
      qaMessages: '메시지',
      qaReply: '답변하기',
      qaReplyPlaceholder: '답변을 입력하세요...',
      qaSend: '전송',
      qaStatusOpen: '대기중',
      qaStatusAnswered: '답변완료',
      qaStatusClosed: '종료',
      qaTranslate: '번역',
      qaTranslating: '번역 중...',
      qaSelectLanguage: '언어 선택',
      qaBackToList: '목록으로',
    },
  },
} as const

export type SiteConfig = typeof SITE_CONFIG

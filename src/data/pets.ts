/**
 * 🐾 펫(내 안의 자아) 데이터
 *
 * 이 파일만 고치면 사이트 내용이 바뀌어요.
 * - slug     : URL 경로 (/music 처럼). 영문 소문자 권장, 겹치면 안 됨.
 * - color    : 펫 몸 색 (파스텔 추천)
 * - cheek    : 볼터치 색
 * - ears     : 귀 모양 — 'round'(곰) | 'pointy'(고양이/여우) | 'long'(토끼)
 * - background : 펫을 눌렀을 때 바뀔 배경색 (라이트/다크 각각)
 * - lines    : 펫이 1인칭으로 나를 소개하는 대사. 한 줄 = 말풍선 한 번.
 * - contents : 대사가 끝난 뒤 아래에 나오는 카드 리스트
 */

export type EarType = 'round' | 'pointy' | 'long';

export interface ContentItem {
  title: string;
  /** 카드 위쪽 작은 글씨 (아티스트, 장소, 장르 등) */
  subtitle?: string;
  description?: string;
  /** public 폴더 기준 경로 (예: '/contents/music/album.jpg') 또는 외부 URL */
  image?: string;
  link?: string;
  tags?: string[];
}

export interface Pet {
  slug: string;
  /** 펫 이름 */
  name: string;
  /** 어떤 자아인지 (칩/제목에 표시) */
  persona: string;
  emoji: string;
  color: string;
  cheek: string;
  ears: EarType;
  background: { light: string; dark: string };
  lines: string[];
  contents: ContentItem[];
}

export const pets: Pet[] = [
  {
    slug: 'music',
    name: '라라',
    persona: '음악 자아',
    emoji: '🎧',
    color: '#C9B6F2',
    cheek: '#F4A6C0',
    ears: 'round',
    background: { light: '#EEE7FC', dark: '#2A2340' },
    lines: [
      '안녕! 나는 라라, 이 사람 안에 사는 음악 자아야.',
      '출근길엔 꼭 이어폰부터 챙기게 만드는 게 바로 나지.',
      '요즘 내가 빠져 있는 노래들을 보여줄게!',
    ],
    contents: [
      { title: '플레이리스트 1', subtitle: '아티스트 이름', description: '이 곡을 좋아하는 이유를 적어주세요.', tags: ['인디', '새벽'] },
      { title: '플레이리스트 2', subtitle: '아티스트 이름', description: '이 곡을 좋아하는 이유를 적어주세요.', tags: ['밴드'] },
      { title: '플레이리스트 3', subtitle: '아티스트 이름', description: '이 곡을 좋아하는 이유를 적어주세요.', tags: ['재즈'] },
    ],
  },
  {
    slug: 'cafe',
    name: '모카',
    persona: '카페 자아',
    emoji: '☕',
    color: '#F2D3B3',
    cheek: '#F2A08C',
    ears: 'round',
    background: { light: '#FBF1E6', dark: '#3A2C22' },
    lines: [
      '반가워, 나는 모카야. 카페 자아를 맡고 있어.',
      '새로운 동네에 가면 제일 먼저 카페 지도를 펼치게 하지.',
      '내가 아끼는 카페들을 소개할게!',
    ],
    contents: [
      { title: '카페 이름 1', subtitle: '동네 · 시그니처 메뉴', description: '이 카페가 좋은 이유를 적어주세요.', tags: ['디저트'] },
      { title: '카페 이름 2', subtitle: '동네 · 시그니처 메뉴', description: '이 카페가 좋은 이유를 적어주세요.', tags: ['작업하기 좋은'] },
      { title: '카페 이름 3', subtitle: '동네 · 시그니처 메뉴', description: '이 카페가 좋은 이유를 적어주세요.', tags: ['핸드드립'] },
    ],
  },
  {
    slug: 'travel',
    name: '솔',
    persona: '여행 자아',
    emoji: '✈️',
    color: '#B5E8D5',
    cheek: '#F5A9A9',
    ears: 'pointy',
    background: { light: '#E5F7F0', dark: '#1E3530' },
    lines: [
      '안녕, 나는 솔! 여행 자아야.',
      '달력에 빨간 날만 보이면 비행기표부터 검색하게 만들지.',
      '우리가 함께 다녀온 곳들을 보여줄게!',
    ],
    contents: [
      { title: '여행지 1', subtitle: '나라 · 도시', description: '기억에 남는 순간을 적어주세요.', tags: ['바다'] },
      { title: '여행지 2', subtitle: '나라 · 도시', description: '기억에 남는 순간을 적어주세요.', tags: ['산책'] },
      { title: '여행지 3', subtitle: '나라 · 도시', description: '기억에 남는 순간을 적어주세요.', tags: ['맛집'] },
    ],
  },
  {
    slug: 'movie',
    name: '팝콘',
    persona: '영화 자아',
    emoji: '🎬',
    color: '#F7BFD0',
    cheek: '#EE8FA8',
    ears: 'long',
    background: { light: '#FDEBF1', dark: '#3A2230' },
    lines: [
      '어서 와! 나는 팝콘, 영화 자아야.',
      '엔딩 크레딧이 끝날 때까지 자리를 못 뜨게 하는 게 나야.',
      '인생 영화 목록을 공개할게!',
    ],
    contents: [
      { title: '영화 제목 1', subtitle: '감독 · 연도', description: '이 영화를 좋아하는 이유를 적어주세요.', tags: ['드라마'] },
      { title: '영화 제목 2', subtitle: '감독 · 연도', description: '이 영화를 좋아하는 이유를 적어주세요.', tags: ['애니메이션'] },
      { title: '영화 제목 3', subtitle: '감독 · 연도', description: '이 영화를 좋아하는 이유를 적어주세요.', tags: ['SF'] },
    ],
  },
  {
    slug: 'game',
    name: '픽셀',
    persona: '게임 자아',
    emoji: '🎮',
    color: '#B8D8F8',
    cheek: '#F2A7B8',
    ears: 'pointy',
    background: { light: '#E6F1FD', dark: '#1F2B3D' },
    lines: [
      '플레이어 등장! 나는 픽셀, 게임 자아야.',
      '"딱 한 판만"을 열 판으로 만드는 게 내 특기지.',
      '최애 게임들을 소개할게!',
    ],
    contents: [
      { title: '게임 제목 1', subtitle: '플랫폼 · 장르', description: '이 게임을 좋아하는 이유를 적어주세요.', tags: ['인디'] },
      { title: '게임 제목 2', subtitle: '플랫폼 · 장르', description: '이 게임을 좋아하는 이유를 적어주세요.', tags: ['협동'] },
      { title: '게임 제목 3', subtitle: '플랫폼 · 장르', description: '이 게임을 좋아하는 이유를 적어주세요.', tags: ['퍼즐'] },
    ],
  },
];

export function getPet(slug: string | undefined | null): Pet | undefined {
  if (!slug) return undefined;
  return pets.find((p) => p.slug === slug);
}

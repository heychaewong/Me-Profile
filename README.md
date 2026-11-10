# Me-Profile — 내 안의 자아들이 소개하는 나

내 취향을 소개하는 인터랙티브 포트폴리오 사이트예요.
화면 가운데 프로필 사진 주위를 **3D 펫 캐릭터**들이 궤도로 돌며 지키고 있어요.
펫은 저의 "자아"들이에요. 펫을 누르면 그 자아가 1인칭으로 저를 소개하고, 해당 취향의 콘텐츠를 보여줘요.

| 자아 | 펫 | 주소 |
|---|---|---|
| 음악 | 라라 | `/music` |
| 여행 | 솔 | `/travel` |
| 영화 | 팝콘 | `/movie` |

## 기술 스택

- **Next.js 16** (App Router, Turbopack, Cache Components) + **TypeScript**
- **React Three Fiber** + **@react-three/drei**: 3D 씬
- **zustand**: 3D 씬과 HTML UI가 함께 쓰는 상태
- **CSS Modules** + CSS 변수: 라이트/다크 테마
- 폰트: Pretendard

## 실행하기

Node.js 20 이상이 필요해요.

```bash
npm install
npm run dev      # http://localhost:3000
```

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (타입 검사 포함) |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |

## 콘텐츠 수정하기

코드를 몰라도 **데이터 파일 2개**만 고치면 사이트 내용이 바뀌어요.

### 프로필: [`src/data/profile.ts`](src/data/profile.ts)

```ts
export const profile = {
  name: '채원',
  greeting: '안녕하세요, 채원이에요',
  tagline: '세 자아가 저를 지키고 있어요. 궁금한 자아를 눌러보세요!',
  photo: '/profile.svg', // public/ 에 사진을 넣고 경로를 바꿔주세요 (정사각형 추천)
};
```

### 펫(자아): [`src/data/pets.ts`](src/data/pets.ts)

| 필드 | 설명 |
|---|---|
| `slug` | URL 경로 (`/music`). 영문 소문자, 겹치면 안 돼요 |
| `name` / `persona` / `emoji` | 펫 이름 / "음악 자아" 같은 설명 / 이모지 |
| `color` / `cheek` | 몸 색 / 볼터치 색 (파스텔 추천) |
| `ears` | 귀 모양: `'round'`(곰) · `'pointy'`(고양이) · `'long'`(토끼) |
| `background` | 펫을 눌렀을 때 바뀔 배경색 `{ light, dark }` |
| `lines` | 펫의 소개 대사. 한 줄이 말풍선 한 번이에요 |
| `contents` | 대사 다음에 나오는 카드 (`title`, `subtitle`, `description`, `image`, `link`, `tags`) |

- **펫 추가·삭제:** 배열에 항목을 넣거나 빼면 궤도 배치와 페이지 주소가 자동으로 맞춰져요.
- **순서 바꾸기:** 배열 순서가 궤도 배치와 하단 버튼 순서예요.

## 폴더 구조

```
src/
├─ app/
│  ├─ layout.tsx         # 3D 캔버스(Stage)를 한 번만 렌더 — 라우트가 바뀌어도 유지
│  ├─ page.tsx           # 메인: 인사말 + 하단 펫 바로가기
│  └─ [pet]/page.tsx     # /music, /travel, /movie
├─ data/                 # ✏️ 수정용 데이터 (pets.ts, profile.ts)
├─ components/
│  ├─ scene/             # 3D: Stage(캔버스), OrbitScene(궤도), PetModel(펫 모델)
│  └─ ui/                # HTML UI: ThemeToggle, PetChips
└─ lib/store.ts          # 공유 상태 (호버 중인 펫 등)
```

**3D 캔버스는 루트 layout에 상주해요.**
페이지(`page.tsx`)는 캔버스 위에 겹치는 HTML만 담당하고, 3D 씬은 현재 주소를 보고 장면을 바꿔요.
그래서 `/` ↔ `/music`을 오갈 때 캔버스가 다시 만들어지지 않고 끊김 없이 전환돼요.

## 진행 상황

- [x] 1단계: 메인 궤도 화면 (궤도 회전, 둥둥 떠다니기, 눈 깜빡임, 호버 시 정지·확대, 반응형, 다크 모드)
- [ ] 2단계: 펫 포커스 전환 + 말풍선 대사 (타이핑 효과, 다음 버튼, 돌아가기)
- [ ] 3단계: 콘텐츠 카드 리스트 + 스크롤 시 따라다니는 미니 펫

## 문서

- [DESIGN.md](DESIGN.md): 컨셉, 펫 디자인 규칙, 모션, 화면별 동작
- [CLAUDE.md](CLAUDE.md): 작업 흐름(브랜치·PR)과 코드 규칙

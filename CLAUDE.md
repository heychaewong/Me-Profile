@AGENTS.md

# Me-Profile 작업 규칙

취향 소개 포트폴리오 사이트예요 (Next.js 16 + React Three Fiber).

- 제품·구조 개요: [README.md](README.md)
- 시각·인터랙션 명세: [DESIGN.md](DESIGN.md). 화면 동작을 바꾸면 DESIGN.md도 같은 PR에서 고쳐요.

## 작업 흐름: 혼자지만 협업처럼

1. **이슈 먼저.**
   `.github/ISSUE_TEMPLATE`의 양식으로 이슈를 만들어요.
   - 제목: `[Feat]`, `[Bug]`, `[Docs]`, `[Chore]` 접두어
   - 라벨: `feature`, `bug`, `docs`, `chore` 중 하나
2. **브랜치는 최신 `main`에서.**
   이름은 `feat/…`, `fix/…`, `docs/…`, `chore/…` (영문 kebab-case).
   - 예: `feat/pet-focus-dialog`
3. **`main`에 직접 커밋하거나 push하지 않아요.**
   모든 변경은 PR로 들어가요.
4. **커밋은 작업 단위마다 자주.**
   - 형식: Conventional Commits에 한국어 요약. 예: `feat: 말풍선 타이핑 효과`
   - push는 PR을 열 때와 리뷰를 반영할 때 해요.
5. **PR은 템플릿대로 작성해요.**
   - 본문에 `Closes #이슈번호`
   - 화면이 바뀌었으면 스크린샷(데스크톱/모바일, 라이트/다크) 첨부
   - 확인 체크리스트 채우기
6. **merge는 레포 주인(채원)이 리뷰 후에 해요.**
   - Squash merge만 허용돼 있고, merge한 브랜치는 자동으로 삭제돼요.
   - 리뷰 코멘트는 같은 브랜치에 커밋을 추가해서 반영해요.
7. **PR은 한 번에 하나씩.**
   merge된 다음 `git checkout main && git pull`로 최신화하고 다음 브랜치를 만들어요.

## 명령어

```bash
npm run dev     # 개발 서버 :3000
npm run build   # 프로덕션 빌드 + 타입 검사
npm run lint    # ESLint (React Compiler 규칙 포함)
```

PR을 열기 전에 `build`와 `lint`가 모두 통과해야 해요.

## 코드 규칙

- **데이터와 코드를 분리해요.**
  사용자가 고칠 내용(이름, 색, 대사, 카드)은 `src/data/`에만 두고, 컴포넌트에 하드코딩하지 않아요.
- **3D 캔버스는 `app/layout.tsx`의 `<Stage />` 하나뿐이에요.**
  - 페이지는 캔버스를 새로 만들지 않아요.
  - 페이지는 `.overlay` 클래스로 캔버스 위에 HTML을 겹쳐요.
  - `.overlay`는 `pointer-events: none`이에요. 클릭이 필요한 요소에는 `a`, `button`, `[data-interactive]`를 써요.
- **3D와 HTML이 함께 쓰는 상태는 `src/lib/store.ts`(zustand)에 둬요.**
  `useFrame` 안에서는 `useSceneStore.getState()`로 읽어요. 리렌더를 피하려는 거예요.
- **애니메이션은 `useFrame` + `MathUtils.damp`로 프레임 독립적으로 만들어요.**
  `delta`는 0.1로 제한해요 (탭 복귀 시 튐 방지).
- **색은 CSS 변수(테마 토큰)를 써요.**
  새 색이 필요하면 `globals.css`의 `:root`와 `[data-theme='dark']`에 둘 다 추가해요.
- **스타일:** 전역 클래스는 `globals.css`, 컴포넌트 전용은 CSS Modules
- **주석과 사용자에게 보이는 문구는 한국어로 써요.**

## Next 16 / 라이브러리 주의점 (실제로 겪은 것)

- **Next.js API:** 코드를 쓰기 전에 `node_modules/next/dist/docs/`를 확인해요 (AGENTS.md 참고).
- **`params`는 Promise예요.**
  - 서버 컴포넌트에서는 `await props.params`, 클라이언트에서는 `use(params)`로 읽어요.
  - 타입은 전역 헬퍼 `PageProps<'/[pet]'>`, `LayoutProps<'/'>`를 써요 (import 불필요).
- **`cacheComponents: true`가 켜져 있어요.**
  - `dynamicParams`, `dynamic`, `revalidate` 같은 route segment config는 쓸 수 없어요. 쓰면 빌드 에러가 나요.
  - 없는 slug는 페이지 안에서 `notFound()`로 처리해요.
- **React Compiler lint (`react-hooks/purity`):**
  - 렌더 중에 `Math.random()`, `Date.now()`를 호출하면 에러가 나요.
  - 랜덤 초기값은 ref에 sentinel(-1 등)을 넣어두고, `useFrame`이나 이펙트 안에서 처음 채워요.
- **next-themes는 쓰지 않아요.**
  React 19에서 script 경고 이슈가 있어요. 테마는 `ThemeToggle.tsx`의 인라인 스크립트와 `useSyncExternalStore`로 처리해요.
- **`AGENTS.md`는 `next dev`가 다시 만드는 파일이에요.**
  직접 고치지 말고, 바뀌면 그대로 커밋해요.
- **콘솔 경고 `THREE.Clock … deprecated`:** R3F 내부에서 나는 경고라 무시해도 돼요.

## 화면 검증 (스크린샷)

3D가 있어서 빌드 통과만으로는 부족해요. 화면을 바꾼 PR은 headless Chrome으로 스크린샷을 찍어 확인해요.

```bash
npm run build && npx next start -p 3457   # 백그라운드로 실행
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new \
  --use-angle=swiftshader --enable-unsafe-swiftshader --hide-scrollbars \
  --window-size=1280,800 --virtual-time-budget=8000 \
  --user-data-dir="<임시폴더>" --screenshot="<임시폴더>/shot.png" http://localhost:3457/
```

- **세로 화면:** `--window-size=600,900`으로 직접 찍어요.
  - headless Chrome은 최소 창 너비가 있어서 390px를 그대로 찍을 수 없어요.
  - iframe으로 감싸 찍으면 WebGL이 빈 화면으로 나올 수 있어요.
- **다크 모드:** `--blink-settings=preferredColorScheme=0`
- **다시 빌드하기 전에는 실행 중인 `next start`를 꼭 종료해요.**
  옛 서버가 새 HTML과 없는 청크를 섞어 보내서 캔버스가 빈 화면이 돼요.
- **WebGL 인스턴스는 하나씩 찍어요.**
  여러 개를 동시에 돌리면 빈 화면이 나올 수 있어요.

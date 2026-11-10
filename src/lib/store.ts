import { create } from 'zustand';

/**
 * 3D 씬(Canvas)과 HTML UI가 함께 쓰는 상태.
 * - hoveredSlug: 마우스가 올라간 펫 (3D 펫 / 하단 칩 어디서든 설정 가능)
 */
interface SceneState {
  hoveredSlug: string | null;
  setHovered: (slug: string | null) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  hoveredSlug: null,
  setHovered: (slug) => set({ hoveredSlug: slug }),
}));

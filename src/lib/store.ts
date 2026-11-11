import { create } from 'zustand';

/**
 * 3D 씬(Canvas)과 HTML UI가 함께 쓰는 상태.
 * - hoveredSlug: 마우스가 올라간 펫 (3D 펫 / 하단 칩 어디서든 설정 가능)
 * - talking: 포커스된 펫이 말풍선으로 말하는 중인지 (타이핑 중이면 true → 몸이 통통 튐)
 */
interface SceneState {
  hoveredSlug: string | null;
  setHovered: (slug: string | null) => void;
  talking: boolean;
  setTalking: (talking: boolean) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  hoveredSlug: null,
  setHovered: (slug) => set({ hoveredSlug: slug }),
  talking: false,
  setTalking: (talking) => set({ talking }),
}));

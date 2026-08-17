import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    {
      name: 'student-sidebar-state',
    },
  ),
);

interface MobileSidebarState {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useMobileSidebarStore = create<MobileSidebarState>()((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));

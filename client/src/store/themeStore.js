import { create } from 'zustand';

const useThemeStore = create((set) => ({
    darkMode: JSON.parse(localStorage.getItem('darkMode')) || false,

    toggleDarkMode: () => set((state) => {
        const newMode = !state.darkMode;
        localStorage.setItem('darkMode', JSON.stringify(newMode));

        // Apply / remove .dark on <html>
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return { darkMode: newMode };
    }),

    // Call once on boot to sync DOM with stored preference
    initTheme: () => {
        const stored = JSON.parse(localStorage.getItem('darkMode')) || false;
        if (stored) {
            document.documentElement.classList.add('dark');
        }
        set({ darkMode: stored });
    },
}));

export default useThemeStore;

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const verseLinkColorLight = '#2563eb';
export const verseLinkColorDark = '#60a5fa';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    verseLink: verseLinkColorLight,
    card: '#f9fafb',
    placeholder: '#9ca3af',
    error: '#dc2626',
    overlay: 'rgba(0,0,0,0.5)',
    buttonSecondary: '#f3f4f6',
    buttonSecondaryText: '#111',
    banner: '#f59e0b',
    bannerText: '#fff',
    listRow: 'rgba(128,128,128,0.1)',
    listRowSelected: 'rgba(59, 130, 246, 0.25)',
  },
  dark: {
    text: '#f3f4f6',
    background: '#0f172a',
    tint: tintColorDark,
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    verseLink: '#93c5fd',
    card: '#1e293b',
    placeholder: '#64748b',
    error: '#f87171',
    overlay: 'rgba(0,0,0,0.75)',
    buttonSecondary: '#334155',
    buttonSecondaryText: '#f3f4f6',
    banner: '#b45309',
    bannerText: '#fff',
    listRow: 'rgba(255,255,255,0.08)',
    listRowSelected: 'rgba(96, 165, 250, 0.25)',
  },
};

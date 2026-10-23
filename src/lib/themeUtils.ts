/**
 * Calculates the best readable text color (#000000 or #ffffff) for a given background hex color.
 */
export function getContrastTextColor(hexColor: string): string {
  if (!hexColor) return '#ffffff';
  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return '#ffffff';

  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;

  // Perceived brightness formula (YIQ)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 165 ? '#000000' : '#ffffff';
}

/**
 * Applies CSS custom variables for theme color and dynamic contrast text/borders to document.documentElement.
 */
export function applyThemeVariables(themeColor: string, isDarkMode: boolean) {
  const root = document.documentElement;
  if (isDarkMode) {
    root.classList.add('dark');
    root.style.setProperty('--bg-primary', '#000000');
    root.style.setProperty('--bg-secondary', '#0c0c0c');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#a1a1aa');
    root.style.setProperty('--theme-color', themeColor || '#ffffff');
    root.style.setProperty('--theme-text-color', themeColor?.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff');
    root.style.setProperty('--theme-border-color', 'rgba(255,255,255,0.12)');
    root.style.setProperty('--theme-accent-text', '#ffffff');
    root.style.setProperty('--theme-badge-bg', 'rgba(255,255,255,0.12)');
  } else {
    root.classList.remove('dark');
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--bg-secondary', '#f4f4f5');
    root.style.setProperty('--text-primary', '#000000');
    root.style.setProperty('--text-secondary', '#52525b');
    root.style.setProperty('--theme-color', themeColor || '#000000');
    root.style.setProperty('--theme-text-color', themeColor?.toLowerCase() === '#000000' ? '#ffffff' : '#000000');
    root.style.setProperty('--theme-border-color', 'rgba(0,0,0,0.12)');
    root.style.setProperty('--theme-accent-text', '#000000');
    root.style.setProperty('--theme-badge-bg', 'rgba(0,0,0,0.06)');
  }
}

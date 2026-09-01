const STORAGE_KEY = "trackhub-theme";

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || "dark";
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(STORAGE_KEY, theme);
}

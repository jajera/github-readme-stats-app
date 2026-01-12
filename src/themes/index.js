const themes = {
  default: {
    titleColor: "#2f80ed",
    iconColor: "#4c71f2",
    textColor: "#434d58",
    bodyTextColor: "#586069",
    bgColor: "#fffefe",
    borderColor: "#e4e2e2",
  },
  dark: {
    titleColor: "#fff",
    iconColor: "#79ff97",
    textColor: "#9f9f9f",
    bodyTextColor: "#8b949e",
    bgColor: "#151515",
    borderColor: "#e4e2e2",
  },
  white: {
    titleColor: "#000",
    iconColor: "#000",
    textColor: "#000",
    bodyTextColor: "#333333",
    bgColor: "#ffffff",
    borderColor: "#e4e2e2",
  },
  orange: {
    titleColor: "#FF9900",
    iconColor: "#FF9900",
    textColor: "#232F3E",
    bodyTextColor: "#4A5568",
    bgColor: "#ffffff",
    borderColor: "#FF9900",
  },
  "orange-dark": {
    titleColor: "#FF9900",
    iconColor: "#FF9900",
    textColor: "#E8E8E8",
    bodyTextColor: "#C0C0C0",
    bgColor: "#232F3E",
    borderColor: "#FF9900",
  },
  blue: {
    titleColor: "#0066CC",
    iconColor: "#0066CC",
    textColor: "#434d58",
    bodyTextColor: "#586069",
    bgColor: "#ffffff",
    borderColor: "#0066CC",
  },
  "blue-dark": {
    titleColor: "#4A9EFF",
    iconColor: "#4A9EFF",
    textColor: "#E8E8E8",
    bodyTextColor: "#C0C0C0",
    bgColor: "#1a1a2e",
    borderColor: "#4A9EFF",
  },
  green: {
    titleColor: "#28a745",
    iconColor: "#28a745",
    textColor: "#434d58",
    bodyTextColor: "#586069",
    bgColor: "#ffffff",
    borderColor: "#28a745",
  },
  "green-dark": {
    titleColor: "#4ade80",
    iconColor: "#4ade80",
    textColor: "#E8E8E8",
    bodyTextColor: "#C0C0C0",
    bgColor: "#0f2027",
    borderColor: "#4ade80",
  },
  matrix: {
    titleColor: "#00FF41",
    iconColor: "#00FF41",
    textColor: "#00FF41",
    bodyTextColor: "#00CC33",
    bgColor: "#000000",
    borderColor: "#00FF41",
  },
  pink: {
    titleColor: "#FF69B4",
    iconColor: "#FF69B4",
    textColor: "#434d58",
    bodyTextColor: "#586069",
    bgColor: "#ffffff",
    borderColor: "#FF69B4",
  },
  "pink-dark": {
    titleColor: "#FF69B4",
    iconColor: "#FF69B4",
    textColor: "#E8E8E8",
    bodyTextColor: "#D0D0D0",
    bgColor: "#1a1a2e",
    borderColor: "#FF69B4",
  },
  yellow: {
    titleColor: "#FFD700",
    iconColor: "#FFD700",
    textColor: "#434d58",
    bodyTextColor: "#586069",
    bgColor: "#ffffff",
    borderColor: "#FFD700",
  },
  "yellow-dark": {
    titleColor: "#FFD700",
    iconColor: "#FFD700",
    textColor: "#E8E8E8",
    bodyTextColor: "#D0D0D0",
    bgColor: "#1a1a2e",
    borderColor: "#FFD700",
  },
  purple: {
    titleColor: "#9B59B6",
    iconColor: "#9B59B6",
    textColor: "#434d58",
    bodyTextColor: "#586069",
    bgColor: "#ffffff",
    borderColor: "#9B59B6",
  },
  "purple-dark": {
    titleColor: "#BB86FC",
    iconColor: "#BB86FC",
    textColor: "#E8E8E8",
    bodyTextColor: "#D0D0D0",
    bgColor: "#1a1a2e",
    borderColor: "#BB86FC",
  },
  red: {
    titleColor: "#E74C3C",
    iconColor: "#E74C3C",
    textColor: "#434d58",
    bodyTextColor: "#586069",
    bgColor: "#ffffff",
    borderColor: "#E74C3C",
  },
  "red-dark": {
    titleColor: "#FF6B6B",
    iconColor: "#FF6B6B",
    textColor: "#E8E8E8",
    bodyTextColor: "#D0D0D0",
    bgColor: "#1a1a2e",
    borderColor: "#FF6B6B",
  },
};

function getTheme(themeName) {
  if (!themeName) {
    return themes.default;
  }
  // Case-insensitive theme lookup
  const normalizedName = themeName.toLowerCase();
  return themes[normalizedName] || themes.default;
}

module.exports = {
  themes,
  getTheme,
};

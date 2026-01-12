const { getTheme } = require('../themes');
const { formatNumber } = require('../calculators/stats');

const CARD_WIDTH = 495;
const CARD_HEIGHT = 195;
const PADDING = 25;
const ICON_SIZE = 16;
const STAT_HEIGHT = 35;
const STAT_SPACING = 15;

function generateSVG(stats, themeName, username, isOrg = false) {
  const theme = getTheme(themeName);
  const statsArray = Object.entries(stats);

  if (statsArray.length === 0) {
    return generateErrorSVG('No stats to display', theme);
  }

  const statItems = statsArray.map(([key, value], index) => {
    const x = PADDING + (index % 2) * (CARD_WIDTH / 2);
    const y = 60 + Math.floor(index / 2) * (STAT_HEIGHT + STAT_SPACING);

    const label = getStatLabel(key);
    const formattedValue = formatNumber(value);

    // Use bodyTextColor if available, otherwise fall back to textColor
    const bodyColor = theme.bodyTextColor || theme.textColor;

    return `
      <g transform="translate(${x}, ${y})">
        <text x="0" y="0" class="stat-label" fill="${bodyColor}" font-family="Segoe UI, Verdana, sans-serif" font-size="14">
          ${label}:
        </text>
        <text x="0" y="20" class="stat-value" fill="${bodyColor}" font-family="Segoe UI, Verdana, sans-serif" font-size="14" font-weight="bold">
          ${formattedValue}
        </text>
      </g>
    `;
  }).join('');

  // Check if username contains "(All Orgs)" to determine title
  const isAggregated = username.includes('(All Orgs)');
  const cleanUsername = username.replace(' (All Orgs)', '');

  let title;
  if (isOrg) {
    title = `${cleanUsername}'s Organization Stats`;
  } else if (isAggregated) {
    title = `${cleanUsername}'s GitHub Stats (All Organizations)`;
  } else {
    title = `${cleanUsername}'s GitHub Stats`;
  }

  const svg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .stat-label { font-size: 14px; }
          .stat-value { font-size: 14px; font-weight: bold; }
        </style>
      </defs>
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${theme.bgColor}" stroke="${theme.borderColor}" stroke-width="1" rx="4.5"/>
      <text x="${PADDING}" y="35" class="title" fill="${theme.titleColor}" font-family="Segoe UI, Verdana, sans-serif" font-size="18" font-weight="bold">
        ${title}
      </text>
      ${statItems}
    </svg>
  `.trim();

  return svg;
}

function generateErrorSVG(message, themeName) {
  const theme = getTheme(themeName || 'default');

  const svg = `
    <svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${theme.bgColor}" stroke="${theme.borderColor}" stroke-width="1" rx="4.5"/>
      <text x="${CARD_WIDTH / 2}" y="${CARD_HEIGHT / 2}" text-anchor="middle" fill="${theme.textColor}" font-family="Segoe UI, Verdana, sans-serif" font-size="16">
        ${message}
      </text>
    </svg>
  `.trim();

  return svg;
}

function getStatLabel(key) {
  const labels = {
    stars: 'Total Stars',
    commits: 'Total Commits',
    prs: 'Total PRs',
    issues: 'Total Issues',
    contributions: 'Contributions',
  };
  return labels[key] || key;
}

module.exports = {
  generateSVG,
  generateErrorSVG,
};

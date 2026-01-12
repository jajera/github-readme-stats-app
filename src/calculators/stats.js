function calculateStats(userData) {
  const { repos, contributions } = userData;

  const stats = {
    stars: 0,
    commits: contributions.commits || 0,
    prs: contributions.prs || 0,
    issues: contributions.issues || 0,
    contributions: 0,
  };

  repos.forEach((repo) => {
    stats.stars += repo.stargazers_count || 0;
  });

  // Use totalContributions from GraphQL if available (includes all activity types)
  // Otherwise fall back to summing commits + prs + issues
  stats.contributions = contributions.total || (stats.commits + stats.prs + stats.issues);

  return stats;
}

function filterStats(stats, hide = [], show = []) {
  const filtered = { ...stats };

  if (show.length > 0) {
    const allowed = new Set(show);
    Object.keys(filtered).forEach((key) => {
      if (!allowed.has(key)) {
        delete filtered[key];
      }
    });
  } else if (hide.length > 0) {
    const hidden = new Set(hide);
    Object.keys(filtered).forEach((key) => {
      if (hidden.has(key)) {
        delete filtered[key];
      }
    });
  }

  return filtered;
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

module.exports = {
  calculateStats,
  filterStats,
  formatNumber,
};

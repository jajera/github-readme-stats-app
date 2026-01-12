const { fetchAllUserData } = require('../src/fetchers/github');
const { calculateStats, filterStats } = require('../src/calculators/stats');
const { generateSVG, generateErrorSVG } = require('../src/renderers/svg');
const { getTheme } = require('../src/themes');

module.exports = async (req, res) => {
  try {
    // Handle duplicate query parameters (url.parse returns arrays for duplicates)
    const getQueryParam = (param, defaultValue) => {
      const value = req.query[param];
      if (Array.isArray(value)) {
        return value[value.length - 1]; // Use last value if duplicate
      }
      return value || defaultValue;
    };

    const username = getQueryParam('username');
    const theme = getQueryParam('theme', 'default');
    const hide = getQueryParam('hide');
    const show = getQueryParam('show');
    const count_private = getQueryParam('count_private');
    const include_all_orgs = getQueryParam('include_all_orgs');

    if (!username) {
      const errorSVG = generateErrorSVG('username parameter is required', theme);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(400).send(errorSVG);
    }

    const hideArray = hide ? hide.split(',').map((s) => s.trim()) : [];
    const showArray = show ? show.split(',').map((s) => s.trim()) : [];
    const countPrivate = count_private === 'true';
    const includeAllOrgs = include_all_orgs === 'true';

    try {
      const userData = await fetchAllUserData(username, countPrivate, includeAllOrgs);
      const stats = calculateStats(userData);
      const filteredStats = filterStats(stats, hideArray, showArray);
      
      // Update title if aggregated
      const displayName = userData.aggregated 
        ? `${username} (All Orgs)`
        : username;
      
      const svg = generateSVG(filteredStats, theme, displayName, userData.isOrg);

      const cacheSeconds = process.env.CACHE_SECONDS
        ? parseInt(process.env.CACHE_SECONDS, 10)
        : 86400;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', `public, max-age=${cacheSeconds}`);
      return res.status(200).send(svg);
    } catch (error) {
      let errorMessage = 'An error occurred';
      if (error.message.includes('not found')) {
        errorMessage = `User "${username}" not found`;
      } else if (error.message.includes('PAT_1')) {
        errorMessage = 'GitHub token not configured';
      } else if (error.status === 403) {
        errorMessage = 'GitHub API rate limit exceeded';
      } else {
        errorMessage = error.message || 'An error occurred';
      }

      const errorSVG = generateErrorSVG(errorMessage, theme);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(error.status || 500).send(errorSVG);
    }
  } catch (error) {
    const errorSVG = generateErrorSVG('Internal server error', 'default');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(500).send(errorSVG);
  }
};


const { Octokit } = require("@octokit/rest");

let octokit = null;

function getOctokit() {
  if (!octokit) {
    const token = process.env.PAT_1;
    if (!token) {
      throw new Error("PAT_1 environment variable is required");
    }
    octokit = new Octokit({ auth: token });
  }
  return octokit;
}

async function fetchUserProfile(username) {
  const octokit = getOctokit();
  try {
    const { data } = await octokit.rest.users.getByUsername({ username });
    // This endpoint works for both users and organizations
    // The 'type' field will be 'User' or 'Organization'
    return data;
  } catch (error) {
    if (error.status === 404) {
      throw new Error(`User or organization "${username}" not found`);
    }
    throw error;
  }
}

async function fetchRepositories(
  username,
  isOrg = false,
  countPrivate = false
) {
  const octokit = getOctokit();
  const repos = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      let data;
      if (isOrg) {
        // Use organization-specific endpoint
        ({ data } = await octokit.rest.repos.listForOrg({
          org: username,
          per_page: perPage,
          page,
          sort: "updated",
        }));
      } else {
        // Use user-specific endpoint
        ({ data } = await octokit.rest.repos.listForUser({
          username,
          per_page: perPage,
          page,
          sort: "updated",
        }));
      }

      if (data.length === 0) break;

      repos.push(...data);
      page++;

      if (data.length < perPage) break;
    }

    return repos;
  } catch (error) {
    if (error.status === 404) {
      throw new Error(`User or organization "${username}" not found`);
    }
    throw error;
  }
}

async function fetchUserContributions(
  username,
  isOrg = false,
  countPrivate = false
) {
  // Organizations don't have user contributions in the same way
  if (isOrg) {
    return {
      commits: 0,
      prs: 0,
      issues: 0,
      total: 0,
    };
  }

  const octokit = getOctokit();
  const contributions = {
    commits: 0,
    prs: 0,
    issues: 0,
    total: 0, // Total contributions (includes code reviews, etc.)
  };

  try {
    // Use GraphQL to get contribution data (more accurate than Events API)
    // GraphQL API limits date range to 1 year, so we'll query the last 12 months
    // This matches GitHub's "contributions in the last year" which is a rolling 365-day period
    // To get all-time stats, we'd need to make multiple queries (one per year)
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setTime(now.getTime() - 365 * 24 * 60 * 60 * 1000); // Exactly 365 days ago
    // Format dates as ISO 8601 strings
    const fromDate = oneYearAgo.toISOString();
    const toDate = now.toISOString();

    const graphqlQuery = `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalPullRequestReviewContributions
            totalRepositoryContributions
            restrictedContributionsCount
            contributionCalendar {
              totalContributions
            }
          }
        }
      }
    `;

    try {
      // Octokit graphql method: first param is query string, second is variables object
      // Note: GraphQL API requires authentication and may have rate limits
      const graphqlResponse = await octokit.graphql(graphqlQuery, {
        username: username,
        from: fromDate,
        to: toDate,
      });

      if (graphqlResponse?.user?.contributionsCollection) {
        const collection = graphqlResponse.user.contributionsCollection;
        contributions.commits = collection.totalCommitContributions || 0;
        contributions.prs = collection.totalPullRequestContributions || 0;
        contributions.issues = collection.totalIssueContributions || 0;

        // Get total contributions from contribution calendar (includes all activity types)
        // This matches GitHub's "contributions in the last year" number
        // Includes: commits, PRs, issues, code reviews, and other activity
        contributions.total =
          collection.contributionCalendar?.totalContributions || 0;

        // If countPrivate is true and we have restricted contributions, add them
        if (countPrivate && collection.restrictedContributionsCount) {
          // Add restricted (private) contributions to the total
          contributions.total += collection.restrictedContributionsCount || 0;
        }

        // If we got data from GraphQL, we can return early (it's more accurate)
        // But we still want to use search API as fallback if GraphQL fails
        return contributions;
      } else if (graphqlResponse?.user === null) {
        // User not found
        throw new Error(`User "${username}" not found`);
      }
    } catch (graphqlError) {
      // If GraphQL fails (e.g., token doesn't have permissions, user not found), fall back to search API
      if (graphqlError.message?.includes("not found")) {
        throw graphqlError; // Re-throw user not found errors
      }
      console.warn(
        `GraphQL query failed for ${username}, falling back to search API:`,
        graphqlError.message
      );
    }

    // Fallback: Use search API for PRs and Issues (more accurate than Events API)
    try {
      // Count Pull Requests
      const prSearchQuery = `author:${username} type:pr`;
      const prSearch = await octokit.rest.search.issuesAndPullRequests({
        q: prSearchQuery,
        per_page: 1, // We only need the total count
      });
      contributions.prs = prSearch.data.total_count || 0;
    } catch (prError) {
      console.warn(`Error fetching PRs for ${username}:`, prError.message);
    }

    try {
      // Count Issues (excluding PRs)
      const issueSearchQuery = `author:${username} type:issue`;
      const issueSearch = await octokit.rest.search.issuesAndPullRequests({
        q: issueSearchQuery,
        per_page: 1, // We only need the total count
      });
      contributions.issues = issueSearch.data.total_count || 0;
    } catch (issueError) {
      console.warn(
        `Error fetching issues for ${username}:`,
        issueError.message
      );
    }

    // For commits, if GraphQL failed, we can't get accurate count from search
    // Search API doesn't support commit search in the same way
    // So we'll leave commits at 0 if GraphQL failed
    if (contributions.commits === 0 && contributions.total === 0) {
      console.warn(
        `Could not fetch commit count for ${username} - GraphQL failed and no fallback available`
      );
    }

    // Calculate total if not set (fallback when GraphQL fails)
    if (contributions.total === 0) {
      contributions.total =
        contributions.commits + contributions.prs + contributions.issues;
    }

    return contributions;
  } catch (error) {
    // If there's an error, return what we have (might be 0)
    console.warn(
      `Error fetching contributions for ${username}:`,
      error.message
    );
    return contributions;
  }
}

async function fetchUserOrganizations() {
  const octokit = getOctokit();
  const orgs = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const { data } = await octokit.rest.orgs.listForAuthenticatedUser({
        per_page: perPage,
        page,
      });

      if (data.length === 0) break;

      orgs.push(...data);
      page++;

      if (data.length < perPage) break;
    }

    return orgs;
  } catch (error) {
    // If user doesn't have org access, return empty array
    return [];
  }
}

async function fetchAllUserData(
  username,
  countPrivate = false,
  includeAllOrgs = false
) {
  try {
    // First, fetch profile to determine if it's a user or organization
    const profile = await fetchUserProfile(username);
    const isOrg = profile.type === "Organization";

    // If includeAllOrgs is true and it's a user, fetch all their orgs and aggregate
    if (includeAllOrgs && !isOrg) {
      const orgs = await fetchUserOrganizations();
      const allRepos = [];
      let allContributions = {
        commits: 0,
        prs: 0,
        issues: 0,
        total: 0,
      };

      // Fetch user's personal repos
      const userRepos = await fetchRepositories(username, false, countPrivate);
      allRepos.push(...userRepos);

      // Fetch user's contributions
      const userContributions = await fetchUserContributions(
        username,
        false,
        countPrivate
      );
      allContributions.commits += userContributions.commits;
      allContributions.prs += userContributions.prs;
      allContributions.issues += userContributions.issues;
      allContributions.total += userContributions.total || 0;

      // Fetch repos from all organizations
      for (const org of orgs) {
        try {
          const orgRepos = await fetchRepositories(
            org.login,
            true,
            countPrivate
          );
          allRepos.push(...orgRepos);
        } catch (error) {
          // Skip orgs we can't access (SAML enforcement, token restrictions, etc.)
          // Only log if it's not a common access restriction
          const isAccessRestriction =
            error.message?.includes("SAML") ||
            error.message?.includes("personal access token") ||
            error.message?.includes("forbids access");
          if (!isAccessRestriction) {
            console.warn(
              `Could not fetch repos for org ${org.login}:`,
              error.message
            );
          }
          // Silently skip orgs with access restrictions (expected behavior)
        }
      }

      return {
        profile,
        repos: allRepos,
        contributions: allContributions,
        isOrg: false,
        aggregated: true,
        orgCount: orgs.length,
      };
    }

    // Normal flow: just fetch for the specified username
    const repos = await fetchRepositories(username, isOrg, countPrivate);
    const contributions = await fetchUserContributions(
      username,
      isOrg,
      countPrivate
    );

    return {
      profile,
      repos,
      contributions,
      isOrg,
      aggregated: false,
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  fetchUserProfile,
  fetchRepositories,
  fetchUserContributions,
  fetchAllUserData,
  fetchUserOrganizations,
};

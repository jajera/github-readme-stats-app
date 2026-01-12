# GitHub Readme Stats - Usage Guide

How to use the GitHub Readme Stats API to generate stats cards for your GitHub profile.

## Quick Start

Add this to your README.md:

```markdown
![GitHub Stats](https://github-readme-stats-app-blue.vercel.app/api?username=YOUR_USERNAME)
```

Replace `YOUR_USERNAME` with your GitHub username.

## API Endpoint

```
https://github-readme-stats-app-blue.vercel.app/api
```

## Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `username` | Yes | GitHub username or organization name | `octocat` |
| `theme` | No | Color theme (see themes below) | `dark` |
| `hide` | No | Comma-separated stats to hide | `stars,commits` |
| `show` | No | Comma-separated stats to show (only these) | `stars,commits` |
| `count_private` | No | Include private contributions (`true`/`false`) | `true` |
| `include_all_orgs` | No | Include stats from all your organizations (`true`/`false`) | `true` |

## Themes

Available themes: `default`, `dark`, `white`, `aws`, `orange`, `orange-dark`, `blue`, `blue-dark`, `green`, `green-dark`, `matrix`, `pink`, `pink-dark`, `yellow`, `yellow-dark`, `purple`, `purple-dark`, `red`, `red-dark`

## Examples

### Basic Usage

```markdown
![GitHub Stats](https://github-readme-stats-app-blue.vercel.app/api?username=octocat)
```

### With Theme

```markdown
![GitHub Stats](https://github-readme-stats-app-blue.vercel.app/api?username=octocat&theme=dark)
```

### Hide Specific Stats

```markdown
![GitHub Stats](https://github-readme-stats-app-blue.vercel.app/api?username=octocat&hide=issues,prs)
```

### Show Only Specific Stats

```markdown
![GitHub Stats](https://github-readme-stats-app-blue.vercel.app/api?username=octocat&show=stars,commits)
```

### Include All Organizations

```markdown
![GitHub Stats](https://github-readme-stats-app-blue.vercel.app/api?username=yourname&include_all_orgs=true)
```

### Organization Stats

```markdown
![GitHub Stats](https://github-readme-stats-app-blue.vercel.app/api?username=github)
```

## Stats Displayed

- **Total Stars**: Stars received across all repositories
- **Total Commits**: Commits made in the last 12 months
- **Total PRs**: Pull requests created
- **Total Issues**: Issues created
- **Contributions**: Total contributions (commits + PRs + issues)

## Tips

- Use `hide` to remove stats you don't want to display
- Use `show` to display only specific stats
- Set `include_all_orgs=true` to aggregate stats from your personal account and all organizations
- Use `count_private=true` to include private repository contributions (requires proper token permissions)

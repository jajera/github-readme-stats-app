# github-readme-stats-app

Self-hosted serverless API for dynamically generating GitHub stats cards

## Features

- Generate beautiful GitHub stats cards as SVG images
- Multiple themes: default, dark, white, and AWS
- Customizable stats display (hide/show specific stats)
- Self-hosted on Vercel
- Local development support with devcontainer

## Quick Start

### Prerequisites

- Node.js 18+ (or use devcontainer)
- Vercel CLI (or use devcontainer)
- GitHub Personal Access Token with `repo` and `read:user` scopes

### Local Development

1. **Using Devcontainer (Recommended)**
   - Open project in VS Code
   - Click "Reopen in Container" when prompted
   - Wait for container to build
   - Copy `.env.local.example` to `.env.local` and add your GitHub PAT
   - Run `npm run dev`

2. **Using Local Node.js**
   - Install dependencies: `npm install`
   - Install Vercel CLI: `npm install -g vercel`
   - Copy `.env.local.example` to `.env.local` and add your GitHub PAT
   - Run `npm run dev`

3. **Test the API**
   - Open `http://localhost:3000/api?username=yourusername`
   - Try different themes: `?username=user&theme=dark`
   - Test hide parameter: `?username=user&hide=stars,commits`

## API Usage

### Endpoint

```plaintext
GET /api?username=<github_username>&theme=<theme>&hide=<stats>&show=<stats>
```

### Parameters

- `username` (required): GitHub username or organization name
- `theme` (optional): Theme name (`default`, `dark`, `white`, `orange`, `orange-dark`, `blue`, `blue-dark`, `green`, `green-dark`, `matrix`, `pink`, `pink-dark`, `yellow`, `yellow-dark`, `purple`, `purple-dark`, `red`, `red-dark`) - default: `default`
- `hide` (optional): Comma-separated list of stats to hide (e.g., `hide=stars,commits`)
- `show` (optional): Comma-separated list of stats to show (only these will be displayed)
- `count_private` (optional): Include private contributions (`true`/`false`) - default: `false`
- `include_all_orgs` (optional): Aggregate stats from personal account + all organizations (`true`/`false`) - default: `false`
  - Only works for user accounts (not organizations)
  - Requires the GitHub token to have access to your organizations

### Examples

```plaintext
/api?username=octocat
/api?username=octocat&theme=dark
/api?username=octocat&theme=orange&hide=issues
/api?username=octocat&show=stars,commits
/api?username=yourname&include_all_orgs=true
/api?username=github
```

## Deployment

### Using Terraform

See the `tf-vercel` repository for infrastructure as code setup.

### Manual Deployment

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variable `PAT_1` with your GitHub token
4. Deploy

## Environment Variables

- `PAT_1` (required): GitHub Personal Access Token
- `CACHE_SECONDS` (optional): Cache duration in seconds (default: 86400)

## Project Structure

```plaintext
github-readme-stats-app/
├── .devcontainer/          # Devcontainer configuration
├── api/                    # Vercel serverless functions
│   └── index.js           # Main API endpoint
├── src/
│   ├── fetchers/          # GitHub API client
│   ├── calculators/       # Statistics calculation
│   ├── renderers/         # SVG generation
│   └── themes/            # Theme definitions
├── package.json
├── vercel.json
└── README.md
```

## License

See [LICENSE](LICENSE) file.

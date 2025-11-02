# GitHub CLI & MCP Setup Guide

## ✅ GitHub CLI - Installed!

GitHub CLI (gh) version 2.40.0 is now installed and ready to use.

### Authenticate GitHub CLI

You need to authenticate interactively. Run:

```bash
gh auth login
```

Follow the prompts:
1. Choose: **GitHub.com**
2. Choose: **HTTPS** 
3. Authenticate with: **Login with a web browser** (easiest)
4. Copy the one-time code shown
5. Press Enter to open browser
6. Paste the code and authorize

### Alternative: Use a Token

If you have a GitHub Personal Access Token:

```bash
# Set the token
export GITHUB_TOKEN=your_token_here

# Or login with token
gh auth login --with-token < your_token_file
```

### Verify Authentication

```bash
gh auth status
```

### Useful GitHub CLI Commands

```bash
# View repository
gh repo view

# Create pull request
gh pr create --title "feat: complete MVP" --body "Ready for review"

# List PRs
gh pr list

# Check workflow runs
gh run list

# View latest workflow run
gh run view

# Create issue
gh issue create --title "Bug: ..." --body "Description"
```

## 📦 MCP (Model Context Protocol) Setup

MCP servers are typically configured in **Claude Desktop** settings, not via CLI installation.

### For Claude Desktop Users:

1. **Open Claude Desktop settings**
   - Click your profile → Settings → Developer

2. **Edit the MCP configuration file:**

**On macOS:**
```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**On Windows:**
```bash
code %APPDATA%\Claude\claude_desktop_config.json
```

**On Linux:**
```bash
code ~/.config/Claude/claude_desktop_config.json
```

3. **Add GitHub MCP Server:**

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_token_here"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/allowed/directory"
      ]
    }
  }
}
```

4. **Restart Claude Desktop** to load the MCP servers

### Create a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `read:org` (Read org data)
4. Click **"Generate token"**
5. Copy the token and add it to your MCP config

### Verify MCP is Working

In Claude Desktop, try:
- "List my GitHub repositories"
- "Show recent pull requests"
- "Create a new GitHub issue"

---

## 🚀 Quick Start with GitHub CLI

Since GitHub CLI is now installed, you can:

### Create a Pull Request

```bash
cd /home/user/byo
gh pr create \
  --title "feat: complete BYO SaaS boilerplate MVP" \
  --body "Complete implementation of all 10 phases including auth, RBAC, testing, and CI/CD" \
  --base main \
  --head claude/continue-implementation-plan-011CUi6ZncE3Vg78V1CWf5Hf
```

### Check CI Status

```bash
gh run list
gh run view  # View latest run
```

### Manage Issues

```bash
gh issue list
gh issue view 1
gh issue create
```

---

## Next Steps

1. **Authenticate GitHub CLI**: `gh auth login`
2. **Configure MCP in Claude Desktop** (if using)
3. **Create PR or deploy to Vercel**

Both tools are now ready to use! 🎉

# Update AGENT.md Documentation

**Trigger**: When you need to update the AGENT.md file to reflect recent code changes

**Description**: This skill reviews git history to identify changes made since AGENT.md was last updated, then updates the documentation to reflect those changes while keeping updates concise and focused on what traditionally belongs in a CLAUDE.md file.

## Steps

1. **Check git diff**: Run `git log -p --follow docs/AGENT.md` or `git diff` to see when AGENT.md was last updated and what changes have been made to the codebase since then

2. **Identify relevant changes**: Look for:
   - New dependencies or package changes
   - New scripts in package.json
   - Changes to project structure or architecture
   - New development commands or workflows
   - Configuration changes (app.json, tsconfig.json, etc.)
   - New testing infrastructure or patterns
   - Database schema or migration changes

3. **Update docs/AGENT.md**: Add concise updates to the relevant sections:
   - Project Overview (for architecture changes)
   - Development Commands (for new scripts)
   - Key Dependencies (for package changes)
   - Database section (for schema changes)
   - Testing section (for test infrastructure changes)

4. **Keep it concise**: Only include information that would be helpful for Claude Code when working with the repository. Avoid:
   - Implementation details better suited for code comments
   - Temporary or experimental changes
   - Overly verbose explanations
   - Information already well-documented elsewhere

## Usage

Run this skill via the pnpm script:

```bash
make claude-update-agent-md
```

Or invoke with `/update-agent-md` in Claude Code.

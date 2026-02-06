# Create PR Description

**Trigger**: When you need to generate a pull request description based on branch changes

**Description**: This skill analyzes git diffs and commit history for the current branch, then generates a well-structured PR description that clearly communicates what changed, why, and any relevant context for reviewers.

## Steps

1. **Analyze branch changes**:
   - Run `git diff main...HEAD` to see all code changes on the branch
   - Run `git log main..HEAD --oneline` to review commit messages
   - Run `git diff main...HEAD --stat` to get a summary of files changed

2. **Categorize changes**:
   - **Features**: New functionality added
   - **Bug fixes**: Issues resolved
   - **Refactoring**: Code improvements without behavior changes
   - **Documentation**: Updates to docs, comments, or README
   - **Tests**: New or updated tests
   - **Dependencies**: Package updates or additions
   - **Configuration**: Build, CI/CD, or config changes
   - **Database**: Schema or migration changes

3. **Generate PR description** with the following structure:

   ```markdown
   ## Summary
   [Brief 1-2 sentence overview of the PR]

   ## Changes
   - [List key changes organized by category]
   - [Be specific but concise]
   - [Link to related issues if applicable]

   ## Why
   [Explain the motivation for these changes]

   ## Testing
   - [Describe how changes were tested]
   - [List any new tests added]
   - [Note if manual testing was performed]

   ## Screenshots/Demo
   [If UI changes, include screenshots or GIFs]

   ## Notes for Reviewers
   - [Any specific areas that need attention]
   - [Known limitations or follow-up work needed]
   - [Deployment considerations if any]
   ```

4. **Include relevant context**:
   - Breaking changes (if any)
   - Migration steps required
   - Environment variable changes
   - Dependencies that need updating
   - Related PRs or issues

5. **Keep it reviewer-friendly**:
   - Use clear, descriptive language
   - Highlight important decisions or trade-offs
   - Link to relevant documentation
   - Call out any areas that need special attention

## Usage

Via makefile:

```bash
make claude-create-pr-description
```

Or invoke with `/create-pr-description` in Claude Code.

## Output

The skill will generate a formatted PR description that you can copy directly into GitHub/GitLab. Review and adjust as needed before posting.

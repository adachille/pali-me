# Sync Documentation with Code Changes

**Trigger**: When you need to review code changes on your branch and update relevant documentation

**Description**: This skill analyzes git diffs for the current branch, identifies what has changed in the codebase, and updates the appropriate documentation files in `/docs` to reflect those changes.

## Steps

1. **Get branch changes**:
   - Run `git diff main...HEAD` (or appropriate base branch) to see all changes on the current branch
   - Run `git log main..HEAD --oneline` to see commit messages for context

2. **Analyze changes by category**:
   - **Database changes** (`db/` directory, `expo-sqlite` usage) → Update `docs/DATABASE.md`
   - **Testing changes** (`__tests__/`, `test-utils/`, jest config) → Update `docs/TESTING.md`
   - **Architecture/config changes** (routing, dependencies, scripts) → Update `docs/AGENT.md`
   - **New features or major changes** → Consider if `README.md` needs updates
   - **etc.** → Update the appropriate documentation file (use your best judgment)

3. **Update relevant documentation files** based on the changes identified in step 2.

4. **Keep updates focused**:
   - Only update documentation that is directly affected by the changes
   - Keep explanations concise and relevant
   - Include code examples where helpful
   - Update version numbers or dates if applicable
   - Remove outdated information

5. **Review consistency**:
   - Ensure terminology is consistent across all updated docs
   - Check that cross-references between docs are still valid
   - Verify code examples still work with the changes

## Usage

Via makefile:

```bash
make sync-docs
```

Or invoke with `/sync-docs` in Claude Code.

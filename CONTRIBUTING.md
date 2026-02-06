# Contributing to Pali-Me

Thank you for your interest in contributing to Pali-Me! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `pnpm install`
4. Create a new branch for your changes

## Development Workflow

### Code Formatting and Linting

This project uses **Prettier** for code formatting and **ESLint** for linting to ensure consistent code style across the codebase.

#### Automatic Formatting (Recommended)

If you're using **VSCode** or **Cursor**:

1. Install the recommended extensions when prompted (or manually install):
   - Prettier - Code formatter (`esbenp.prettier-vscode`)
   - ESLint (`dbaeumer.vscode-eslint`)
   - Expo Tools (`expo.vscode-expo-tools`)

2. Files will automatically be formatted on save thanks to the workspace settings in `.vscode/settings.json`

#### Manual Formatting

You can format the entire codebase using:

```bash
pnpm format
```

To check if files are properly formatted without modifying them:

```bash
pnpm format:check
```

#### Linting

To run ESLint and automatically fix issues:

```bash
pnpm lint
```

**Note:** ESLint is configured to work with Prettier, so both tools work together seamlessly.

### Pre-commit Checks

Before committing your changes:

1. **Format your code**: `pnpm format`
2. **Run linting**: `pnpm lint`
3. **Run tests**: `pnpm test`

### Testing

Run the test suite to ensure your changes don't break existing functionality:

```bash
# Run all tests
pnpm test

# Run tests in watch mode (useful during development)
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

See `docs/TESTING.md` for detailed testing guidelines.

### Continuous Integration

When you open a pull request, GitHub Actions will automatically:

- ✅ Check code formatting with Prettier
- ✅ Run ESLint checks
- ✅ Run the test suite
- ✅ Run end-to-end tests

**Your PR must pass all checks before it can be merged.**

If the format/lint check fails:

1. Run `pnpm format` to fix formatting issues
2. Run `pnpm lint` to fix linting issues
3. Commit and push the changes

## Code Style Guidelines

### General Principles

- Follow the existing code style in the project
- Write clear, self-documenting code
- Add comments only when necessary to explain complex logic
- Keep functions small and focused on a single responsibility

### TypeScript

- Use TypeScript strict mode (already enabled)
- Provide explicit types for function parameters and return values
- Avoid using `any` type unless absolutely necessary
- Use interfaces for object shapes and types for unions/primitives

### React/React Native

- Use functional components with hooks
- Follow React hooks rules
- Use descriptive component and prop names
- Keep components focused and reusable

### File Organization

- Place components in appropriate directories
- Keep related files together
- Use index files for cleaner imports when appropriate

## Pull Request Process

1. Create a descriptive pull request title
2. Provide a clear description of what changes you made and why
3. Reference any related issues
4. Ensure all CI checks pass
5. Wait for review from maintainers
6. Address any feedback or requested changes

## Questions?

If you have questions about contributing, feel free to:

- Open an issue for discussion
- Review existing documentation in the `docs/` directory
- Check the README.md for basic project information

Thank you for contributing to Pali-Me! 🙏

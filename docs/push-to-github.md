# Push your local changes to GitHub and open a pull request (without the web "Create PR" button)

If you cannot use the GitHub UI to open a pull request, you can push your branch from the terminal and create the PR by URL or with the GitHub CLI.

## 1) Make sure your fork remote is configured

```bash
git remote -v
```

If your fork is missing, add it (replace `<your-username>` and `<repo>` with your fork details):

```bash
git remote add origin git@github.com:<your-username>/<repo>.git
```

If the upstream project is not configured, add it as well so you can pull updates:

```bash
git remote add upstream git@github.com:<upstream-owner>/<repo>.git
```

## 2) Create and push a feature branch

```bash
# update your local base branch (e.g., main)
git checkout main
git pull upstream main

# create a feature branch for your changes
git checkout -b feature/chrome-extension-helpers

# stage and commit your edits
git add .
git commit -m "Describe your change"

# push the branch to your fork
git push -u origin feature/chrome-extension-helpers
```

If your default branch is not `main`, swap it above.

## 3) Open a pull request without the web button

### Option A: Use the GitHub CLI (recommended)

Install the GitHub CLI (`gh`) and authenticate (`gh auth login`). Then run:

```bash
gh pr create --base main --head feature/chrome-extension-helpers --title "Describe your change" --body-file docs/chrome-extension.md
```

Replace the title/body as needed. If you want to reuse the last commit message and body, use `--fill` instead of `--title/--body-file`.

### Option B: Use the compare URL directly

Open this URL pattern in your browser (replace placeholders):

```
https://github.com/<upstream-owner>/<repo>/compare/main...<your-username>:feature/chrome-extension-helpers?expand=1
```

This bypasses the "Create PR" button—you can fill in the PR form directly. Change `main` if the base branch differs.

## 4) Keep your branch up to date (optional but recommended)

If upstream adds new commits while you are working, update your branch:

```bash
git checkout main
git pull upstream main

git checkout feature/chrome-extension-helpers
git rebase main
# resolve conflicts if prompted, then continue
# finally push the updated branch

git push --force-with-lease
```

Use `--force-with-lease` to avoid overwriting collaborators’ work.

## Troubleshooting: "Binary files are not supported"

Some GitHub web flows (including "apply patch" or file-upload UIs) reject binary assets like `.png` icons with the error `Binary files are not supported`. If you see this, switch to a local git workflow so the binary files are staged directly from disk.

1. Clone your fork locally and check out your feature branch:

   ```bash
   git clone git@github.com:<your-username>/<repo>.git
   cd <repo>
   git checkout feature/chrome-extension-helpers
   ```

2. Pull the upstream branch that contains the binary files (if needed):

   ```bash
   git remote add upstream git@github.com:<upstream-owner>/<repo>.git
   git pull upstream feature/chrome-extension-helpers
   ```

3. Stage and commit the binaries from your working directory, then push as normal:

   ```bash
   git add extension/icons/*.png
   git commit -m "Include extension icons"
   git push --force-with-lease
   ```

If you cannot clone locally, ask a collaborator to push the binary assets for you or attach them to an issue so someone with git access can add them.

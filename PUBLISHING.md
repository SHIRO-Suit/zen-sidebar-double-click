# Publication

## GitHub

Intended public repository: `SHIRO-Suit/zen-sidebar-double-click`.

In GitHub Desktop, add this directory as an existing local repository and select
**Publish repository**. Use the name above and uncheck **Keep this code private**.
The `theme.json` links already target this repository's `main` branch.

Alternatively, with an authenticated GitHub CLI:

```sh
gh repo create SHIRO-Suit/zen-sidebar-double-click --public --source=. --remote=origin --push
```

Before announcing a stable release, complete the browser checklist in TESTING.md.
The initial version is 0.1.0 to make its validation status explicit.

## Sine marketplace

After publishing the repository and verifying it in Zen, submit it using the
[official Add Theme form](https://github.com/sineorg/store/issues/new?template=add-theme.yml).
The form asks for **Theme Homepage**:

```text
https://github.com/SHIRO-Suit/zen-sidebar-double-click
```

Suggested issue title: `[add-theme]: Sidebar Double Click`.

Submission is reviewed by Sine maintainers. A GitHub repository alone does not
mean the mod is approved or listed in the marketplace. The current official
submission form is in `sineorg/store/.github/ISSUE_TEMPLATE/add-theme.yml`.

For updates, change `version` and `updatedAt` in `theme.json`, keep package.json's
version in sync, test, and push. Sine distributes updates from this repository.

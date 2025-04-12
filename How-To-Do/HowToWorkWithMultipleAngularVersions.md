Working with multiple Angular version-based projects on the same machine is **totally doable**, but you'll need to manage different versions of the **Angular CLI** and possibly **Node.js** too.

Here’s a clean way to handle it:

---

## ✅ 1. Use `npx` to Run Specific Angular CLI Versions Per Project

You can use `npx` to run the correct CLI version **without installing it globally**:

```bash
npx -p @angular/cli@1.5.0 ng new my-angular5-app
```

Or, if the project already exists:

```bash
cd my-angular5-app
npx -p @angular/cli@1.5.0 ng serve
```

This way, you avoid version conflicts entirely.

---

## ✅ 2. Install Angular CLI Locally per Project

Instead of using global CLI, install the version you need **in each project**:

```bash
npm install @angular/cli@1.5.0 --save-dev
```

Then run commands using `npx` or through `package.json` scripts:

```bash
npx ng serve
```

---

## ✅ 3. Use `nvm` to Manage Multiple Node Versions

Older Angular versions (like Angular 5) often need older Node.js versions. Use `nvm` (Node Version Manager) to switch between Node versions:

### Install `nvm`:
- **macOS/Linux**: https://github.com/nvm-sh/nvm
- **Windows**: Use [`nvm-windows`](https://github.com/coreybutler/nvm-windows)

### Example commands:

```bash
nvm install 8
nvm use 8
```

---

## ✅ 4. Use `volta` for Simpler Tooling (Alternative to nvm)

[Volta](https://volta.sh) pins Node, npm, and CLI tools **per project**, automatically. Great for keeping each Angular app isolated.

---

## ✅ 5. Pro Tips

- Use different terminals or shell tabs for running different Angular versions.
- Add version info in each project’s `README.md` for clarity.
- Set up project-specific Node/Angular versions in `.nvmrc` and `.npmrc` (optional but helpful).

---

Let me know what versions you're working with — I can help you craft the exact setup.
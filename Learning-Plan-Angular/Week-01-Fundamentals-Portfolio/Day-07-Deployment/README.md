````markdown
# Day 7: Deployment

**Duration**: 3 hours  
**Goal**: Build and deploy the portfolio to a public host (Netlify or Firebase). Understand build optimizations and CI basics.

---

## 🎯 Learning Objectives
- Build production bundles (`ng build --configuration production`)
- Deploy to Netlify and Firebase Hosting
- Understand basic CI deployment flow

---

## 📝 Topics Covered

### 1. Production Build & Optimizations (30 minutes)
- `ng build --configuration production` and output `dist/`
- Analyze bundle sizes with `source-map-explorer` or `webpack-bundle-analyzer`
- Lazy-load large routes and images

### 2. Deploy to Netlify (45 minutes)
- Connect GitHub repo to Netlify
- Set build command: `ng build --configuration production`
- Set publish directory: `dist/<project-name>`
- Configure environment variables for API endpoints

### 3. Deploy to Firebase Hosting (45 minutes)
- `npm install -g firebase-tools`
- `firebase login`
- `firebase init hosting` (select project)
- `firebase deploy --only hosting`

### 4. Quick CI Notes (20 minutes)
- Add a GitHub Action to run `ng test` and `ng build` on PRs
- Add deploy step on `main` branch (Netlify has its own; Firebase via `firebase-tools` in action)

### 5. Hands-On Tasks (40 minutes)
- Produce a production build and deploy to Netlify or Firebase
- Verify live site, ensure assets load and meta tags are correct
- Add `robots.txt` and basic SEO meta tags

---

## 🏋️ Practice Exercises
1. Deploy to Netlify and record the live URL in `README.md`.
2. Add a simple GitHub Actions workflow that runs tests and the build on PRs.
3. Measure first contentful paint (FCP) and identify one optimization.

---

## 📚 Resources
- Netlify Docs: https://docs.netlify.com
- Firebase Hosting: https://firebase.google.com/docs/hosting
- GitHub Actions: https://docs.github.com/actions

---

## ✅ End of Day Checklist
- [ ] Production build created
- [ ] Site deployed and accessible publicly
- [ ] CI workflow scaffolded in `.github/workflows/` (simple test + build)
- [ ] Commit deployment configs and notes

````
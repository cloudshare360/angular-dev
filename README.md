# Angular Development Workspace

This repository contains a comprehensive **6-week Angular 18 learning plan** to take you from beginner to job-ready mid-level developer.

---

## 📚 **What's Inside**

### 🎓 [Learning Plan](./Learning-Plan-Angular/)
Complete 6-week curriculum with 42 daily lessons covering:
- Angular 18 fundamentals (Standalone Components, Signals)
- 4 production-grade projects
- Testing strategies (Unit, E2E, CI/CD)
- Interview preparation

### 📖 **Key Documentation**

| Document | Purpose |
|----------|---------|
| [Learning Plan](./Learning-Plan-Angular/readme.md) | Main curriculum with navigation |
| [PROGRESS.md](./Learning-Plan-Angular/PROGRESS.md) | Track your daily progress |
| [CHANGELOG.md](./CHANGELOG.md) | Project evolution log |
| [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | Essential commands & patterns |
| [AUDIT-REPORT.md](./AUDIT-REPORT.md) | Complete verification & status ✨ |
| [Conversation Tracking](./Learning-Plan-Angular/CONVERSATIONS.md) | How to log your learning |
| [Tools README](./tools/README.md) | Helper scripts documentation |

---

## 🚀 **Quick Start**

### 1. Clone & Setup
```bash
git clone https://github.com/cloudshare360/angular-dev.git
cd angular-dev
```

### 2. Install Dependencies (for helper tools)
```bash
npm install minimist
```

### 3. Make Scripts Executable
```bash
chmod +x tools/*.sh tools/*.js
```

### 4. Start Learning
```bash
# Navigate to Week 1, Day 1
cd Learning-Plan-Angular/Week-01-Fundamentals-Portfolio/Day-01-Setup-Introduction

# Follow the README.md instructions
```

---

## 💾 **Automated Commit System**

Never lose your progress! Use helper scripts:

```bash
# Mark a day complete
./tools/checkpoint.sh 1 1 completed

# Quick save
./tools/auto-commit.sh "WIP: building forms"

# Log conversation
node tools/log_conversation.js \
  --sessionId "week1-20251020" \
  --role user \
  --content "Completed exercises"
```

See [tools/README.md](./tools/README.md) for full details.

---

## 📂 **Repository Structure**

```
angular-dev/
├── Learning-Plan-Angular/          # Main curriculum
│   ├── Week-01-Fundamentals-Portfolio/
│   ├── Week-02-Routing-State-Forms-EmployeeApp/
│   ├── Week-03-Advanced-Patterns-ShoppingCart/
│   ├── Week-04-CMS-SmallBusiness/
│   ├── PROGRESS.md
│   └── readme.md
├── .conversations/                 # Session logs & memory
│   ├── sessions/
│   ├── index.json
│   ├── memory.json
│   └── schema.json
├── tools/                          # Helper scripts
│   ├── auto-commit.sh
│   ├── checkpoint.sh
│   ├── log_conversation.js
│   └── update-memory.js
├── CHANGELOG.md
├── QUICK-REFERENCE.md
└── README.md (this file)
```

---

## 🎯 **Learning Path**

### Week 1: Portfolio Site
- Setup, Components, Signals, Testing, Deployment
- **Deliverable**: Live portfolio with dark mode

### Week 2: Employee Management
- Routing, Forms, Services, State Management
- **Deliverable**: Full CRUD application

### Week 3: Shopping Cart
- HTTP, Interceptors, Cart Persistence, Checkout
- **Deliverable**: E-commerce cart with LocalStorage

### Week 4: CMS
- Firebase Auth, Firestore, WYSIWYG Editor, Versioning
- **Deliverable**: Content management system

### Week 5: Testing & CI/CD
- Unit/E2E tests, GitHub Actions, Deployment strategies
- **Deliverable**: All projects with CI/CD pipelines

### Week 6: Interview Prep
- Angular concepts, Interview Q&A, System design, Portfolio polish
- **Deliverable**: Job-ready profile

---

## 📊 **Progress Tracking**

Track your learning in multiple ways:

1. **Manual**: Update [PROGRESS.md](./Learning-Plan-Angular/PROGRESS.md)
2. **Automated**: Use checkpoint script
3. **Conversation logs**: `.conversations/sessions/`
4. **Git history**: Commit messages

---

## 🛠️ **Technologies Covered**

- **Framework**: Angular 18 (Standalone Components)
- **Language**: TypeScript 5.x
- **State**: Signals, RxJS (when needed)
- **Forms**: Reactive Forms
- **HTTP**: HttpClient, Interceptors
- **Auth**: Firebase Authentication
- **Database**: Firestore
- **Testing**: Jasmine, Karma, Cypress
- **CI/CD**: GitHub Actions
- **Deployment**: Netlify, Firebase, Vercel, AWS Amplify

---

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/cloudshare360/angular-dev/issues)
- **Discussions**: Use conversation tracking system
- **Progress**: Check PROGRESS.md regularly

---

## 📄 **License**

This learning plan is open source. Feel free to use and adapt for your learning journey.

---

## 🎓 **Ready to Start?**

👉 **[Begin Week 1, Day 1](./Learning-Plan-Angular/Week-01-Fundamentals-Portfolio/Day-01-Setup-Introduction/)**

---

**Remember**: Commit early, commit often! Use `./tools/checkpoint.sh` after each day. 🚀

# Contributing to Student Attendance Manager

This document records how the two of us worked together: who built what, how we used branches, pull requests and code reviews, and how we resolved a real merge conflict. It is based on the repository history at [MalayaGupta/student-attendance-manager](https://github.com/MalayaGupta/student-attendance-manager).

---

## 1. Individual Contributions

### Malaya Gupta (Roll No. 36, repo owner) — [@MalayaGupta](https://github.com/MalayaGupta)

Set up the repository (initial commit, `.gitignore`, project structure) and built three features.

| Branch | PR | Commits | Contribution | Main files |
|--------|:--:|:-------:|--------------|------------|
| `feature-malaya/manage-students` | #1 | 4 | `Store.addStudent` / `removeStudent` with validation; roster table, add-student form and remove button; styles; unit tests | `js/store.js`, `js/teacher.js`, `style.css`, `tests/store.test.js` |
| `feature-malaya/student-percentage-view` | #4 | 4 + merge | `Store.getAttendanceSummary`; subject cards with percentage and progress bar; highlighting for subjects below 75%; unit tests | `js/store.js`, `js/student.js`, `style.css`, `tests/summary.test.js` |
| `feature-malaya/leave-application` | #5 | 4 | `Store.applyLeave` / `getLeavesForStudent`; leave form and "My Leave Requests" table with status badges; unit tests | `js/store.js`, `js/student.js`, `style.css`, `tests/leave.test.js` |

### Ansh Chaturvedi (Roll No. 12) — [@anshchaturvedi0210](https://github.com/anshchaturvedi0210)

| Branch | PR | Contribution | Main files |
|--------|:--:|--------------|------------|
| `feature-anshchaturvedi/mark-attendance` | #2 | Subject and date selectors, student table with Present/Absent buttons, save to `Store` | `js/teacher.js`, `style.css` |
| `feature-anshchaturvedi/role-switcher` | #3 | Teacher/Student view dropdown in the top bar, student-profile selector in the portal | `index.html`, `js/app.js`, `js/student.js`, `style.css` |
| `feature-anshchaturvedi/leave-approval` | #6 | Pending leave list with Approve/Reject; approved leave recorded as `Leave` so it is excluded from the class count | `js/store.js` (`getPendingLeaves`, `updateLeaveStatus`), `js/teacher.js` |

---

## 2. Branching Strategy

- `main` is the stable branch and must always load without errors.
- Nobody commits directly to `main` after the initial setup; all work arrives through pull requests.
- Each feature gets its own branch created from the latest `main`.

**Naming convention:** `feature-<author>/<feature-name>`, lowercase with hyphens.

```bash
git checkout main
git pull origin main
git checkout -b feature-malaya/manage-students
```

| Branch | Owner | PR |
|--------|-------|:--:|
| `feature-malaya/manage-students` | Malaya | #1 |
| `feature-anshchaturvedi/mark-attendance` | Ansh | #2 |
| `feature-anshchaturvedi/role-switcher` | Ansh | #3 |
| `feature-malaya/student-percentage-view` | Malaya | #4 |
| `feature-malaya/leave-application` | Malaya | #5 |
| `feature-anshchaturvedi/leave-approval` | Ansh | #6 |

---

## 3. Commit Guidelines

- Make small, focused commits: one logical change each (store logic, UI, styles, tests).
- Write the message in the imperative mood and say what changed.

Real examples from this repository:

```text
Add Store.addStudent and Store.removeStudent with validation
Add roster table with add-student form and remove button
Style roster form, table and buttons
Add node tests for add/remove student logic
Add Store.getAttendanceSummary for per-subject percentages
Render student portal subject cards with attendance percentage
Style attendance cards and highlight subjects below 75%
Add Store.applyLeave and Store.getLeavesForStudent
```

---

## 4. Pull Request Process

1. Push your branch:

   ```bash
   git push -u origin feature-malaya/leave-application
   ```

2. Open a **pull request** on GitHub into `main`, with a short title and a description of what changed and how to test it.
3. Request your teammate as the **reviewer**.
4. Address review comments with further commits on the same branch.
5. Once approved, merge with a **merge commit** (GitHub's "Merge pull request" button), which keeps each feature visible in the history.
6. Update your local `main` and start the next branch from it:

   ```bash
   git checkout main
   git pull origin main
   ```

**History of merged pull requests**

| PR | Feature | Merged by | Date |
|:--:|---------|-----------|------|
| #1 | Manage Students | Ansh Chaturvedi | 15 Nov 2026 |
| #2 | Mark Attendance | Malaya Gupta | 15 Nov 2026 |
| #3 | Role Switcher | Malaya Gupta | 16 Nov 2026 |
| #4 | Student Percentage View | Malaya Gupta | 16 Nov 2026 |
| #5 | Leave Application | Malaya Gupta | 16 Nov 2026 |
| #6 | Leave Approval | Ansh Chaturvedi | 17 Nov 2026 |

"Merged by" is taken from the merge commit author in the repository history.

---

## 5. Merge Conflict Resolution (Example)

Several features edit the same files (`js/student.js`, `js/teacher.js`, `js/store.js`, `style.css`), so conflicts were expected.

**What happened:** by the time `feature-malaya/student-percentage-view` was ready, `main` had already received the role-switcher (PR #3), which also rewrote `js/student.js` and `style.css`. Both branches changed the same regions of those two files.

**How it was resolved** (commit [`268026b`](https://github.com/MalayaGupta/student-attendance-manager/commit/268026b), *"Merge main into student-percentage-view, resolve student.js and style.css conflicts"*):

1. Bring the latest `main` into the feature branch:

   ```bash
   git checkout feature-malaya/student-percentage-view
   git fetch origin
   git merge origin/main
   ```

2. Git stops and marks each conflicting region in the file:

   ```text
   <<<<<<< HEAD
   (code from the feature branch)
   =======
   (code from main)
   >>>>>>> origin/main
   ```

3. Open `js/student.js` and `style.css`, keep **both** sides' work (the student-profile selector from `main` and the percentage cards from the feature branch) and delete the markers.
4. Load the app and confirm both features work together.
5. Mark the files resolved and commit:

   ```bash
   git add js/student.js style.css
   git commit
   git push
   ```

6. The pull request then showed no conflicts and was merged as PR #4.

---

## 6. Code Review Guidelines

Reviewers check that:

- [ ] The feature works as described in the roadmap.
- [ ] The app loads with no console errors.
- [ ] Data access goes through `Store`; views only render and handle events.
- [ ] User input is validated and output is escaped (the views use an `escape()` helper).
- [ ] There are no unrelated changes or leftover debug code.
- [ ] Naming and styling match the existing code and the CSS variables in `style.css`.
- [ ] Tests pass for any logic that has them (see below).

**Review etiquette**

- Be specific and constructive; suggest a fix, not just a problem.
- Use GitHub's review options: *Comment*, *Approve* or *Request changes*.
- Reply to review comments promptly and push fixes to the same branch.

---

## 7. Testing Before You Open a PR

Run the Node test scripts from the project root:

```bash
node tests/store.test.js
node tests/summary.test.js
node tests/leave.test.js
```

Then open `index.html` in a browser and try the feature by hand, in both Teacher View and Student View.

---

## 8. Local Setup

```bash
git clone https://github.com/MalayaGupta/student-attendance-manager.git
cd student-attendance-manager
python -m http.server 8000
```

Open <http://localhost:8000>. See the [README](README.md) for more details.

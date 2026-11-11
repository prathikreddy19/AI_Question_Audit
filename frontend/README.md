# Acadza AI Faculty Review Console & Student Portal

> Production-quality, frontend-only React + Vite application for reviewing student error reports on JEE/NEET questions with autonomous AI triage recommendations, native MathML formula rendering, interactive before/after diffs, and audit logging.

Built with **React 18**, **Vite**, **TailwindCSS**, **React Router 6**, and **Lucide Icons** following the Modern SaaS dashboard aesthetic (White + Slate + Indigo accents).

---

## Architecture & Directory Structure

```text
c:\Users\PARTHIK\Desktop\AI Question Audit\
├── acadza-report-fix/          # Original assignment problem & raw dataset
│   ├── data/
│   │   ├── questions.json      # 43 production JEE/NEET questions (HTML + MathML)
│   │   ├── reports.json        # 44 real student defect reports
│   │   └── taxonomy.json       # Closed list of verdicts & repair types
│   └── README.md
├── src/
│   ├── assets/                 # Brand SVG logos & static media
│   ├── components/
│   │   ├── common/             # Navbar, Sidebar, StatusBadge, ReportCard,
│   │   │                       # LoadingSkeleton, EmptyState, ErrorState, Toast
│   │   ├── faculty/            # StatsCard, QuestionQueueCard, AIReviewCard,
│   │   │                       # DiffViewer, ReplyPreview, EditSuggestionModal,
│   │   │                       # AuditTimeline
│   │   └── student/            # MathViewer, StudentQuestionCard, ReportDialog
│   ├── contexts/
│   │   ├── AuthContext.jsx     # Faculty & Student persona & session management
│   │   └── AuditContext.jsx    # Reactive question state, audit logs, and actions
│   ├── hooks/
│   │   ├── useAuditState.js    # Easy access hook for audit actions & data
│   │   └── useDebounce.js      # Debounced search input hook
│   ├── layouts/
│   │   ├── FacultyLayout.jsx   # Topbar + Left Sidebar + Main review container
│   │   ├── StudentLayout.jsx   # Topbar + Centered test practice container
│   │   └── AuthLayout.jsx      # Minimalist centered authentication wrapper
│   ├── pages/
│   │   ├── LoginPage.jsx       # Email/password + 1-click persona quick login
│   │   ├── RoleSelectPage.jsx  # Interactive role choice (Faculty vs Student)
│   │   ├── faculty/
│   │   │   ├── FacultyDashboard.jsx   # Top 4 statistics cards, urgent queue, metrics
│   │   │   ├── ReviewQueuePage.jsx    # Grouped questions queue with filters & search
│   │   │   ├── ReviewConsolePage.jsx  # Split-layout review screen (Viewer + AI Card)
│   │   │   └── AuditLogsPage.jsx      # Immutable timeline view with JSON export
│   │   └── student/
│   │       ├── StudentDashboard.jsx       # JEE/NEET question bank with filters
│   │       └── StudentQuestionDetails.jsx # MathML question viewer, test options,
│   │                                      # hidden answer toggle, and Report dialog
│   ├── services/
│   │   ├── mockData.json       # Enriched mock database generated from 43 questions & 44 reports
│   │   ├── mockData.js         # Reactive DataService with localStorage persistence & reset
│   │   ├── questionService.js  # Clean service layer for questions & reports
│   │   └── auditService.js     # Clean service layer for faculty actions
│   ├── utils/
│   │   ├── cn.js               # clsx + tailwind-merge helper
│   │   ├── formatters.js       # Date, relative time, status, and verdict formatters
│   │   └── mathmlHelper.js     # MathML sanitizer & option extraction utilities
│   ├── App.jsx                 # Routing configuration with role-aware redirects
│   ├── index.css               # Tailwind directives & MathML styling rules
│   └── main.jsx
├── scripts/
│   └── buildMockDatabase.cjs   # Pre-processor compiling questions + reports + AI analysis
├── package.json
├── tailwind.config.js
├── vite.config.js
└── index.html
```

---

## Key Features

### 1. Dual-Persona Role Selection & Authentication
- **Role Selector & Login**: Switch freely between **Faculty Reviewer** and **JEE/NEET Student** with one click.
- Topbar role indicator with instantaneous switcher so you can report an error as a student and immediately review it as faculty!

### 2. Faculty Review Console
- **Top Statistics Cards**:
  - `Pending Reviews`: Real-time count of questions needing faculty attention.
  - `Auto Applied`: Routine, safe edits automated by the AI triage engine (e.g. typos, noise).
  - `Approved Today`: Confirmed and merged fixes verified by faculty.
  - `Rejected Today`: Student calculation errors / trap reports correctly dismissed.
- **Grouped Review Queue**:
  - Clustered by Question ID.
  - Urgency Badge (`Urgent`, `High`, `Medium`, `Low`).
  - Student report count chip.
  - AI confidence meter.
  - Real-time status badge (`Pending`, `Approved`, `Auto Applied`, `Rejected`).
  - Search by Question ID, subject, chapter, formula, or comment.
- **Split-Layout Review Console (`/faculty/queue/:id`)**:
  - **Left Pane (Question Viewer)**:
    - Subject, chapter, concept, question type, difficulty metadata.
    - Full rendered HTML with native **MathML equations** (fractions, exponents, roots, integrals).
    - Current database answer key clearly displayed.
    - Official solution derivation accordion.
    - Clustered student reports with student IDs, device source (`Android`, `iOS`, `Web`), and timestamps.
  - **Right Pane (AI Analysis Card)**:
    - Verdict badge matching taxonomy (`defect`, `no_error`, `display_issue`, `app_issue`, etc.).
    - Repair type matching taxonomy (`answer_key`, `stem_data`, `option_repair`, `spelling`, `diagram`, `syllabus`, etc.).
    - AI Confidence progress meter.
    - Grounded Evidence string explaining the mathematical/pedagogical rationale.
    - **Before / After Diff Viewer** with Split vs. Unified view and token-level diff highlighting.
    - **Student Reply Preview** formatted in an encouraging, empathetic tone suited for a 17-year-old JEE aspirant.
    - **Actions**:
      - `Approve Fix`: Merges the edit, triggers celebratory confetti, updates stats, and logs to Audit Trail.
      - `Reject Report`: Prompts for review reason, dismisses report, and logs to Audit Trail.
      - `Edit Suggestion`: Opens a modal dialog allowing faculty to adjust the target field, find/replace values, and student reply text before approving.
  - **Quick Queue Carousel**: Previous / Next navigation buttons to cycle through the queue without returning to the index page.

### 3. Student Practice & Error Reporting
- **Question Bank**:
  - Search by keywords and filter by Subject (`Physics`, `Chemistry`, `Mathematics`, `Biology`) and Question Type (`SCQ`, `MCQ`, `Numerical`).
- **Question Details & Hidden Answer Key**:
  - MathML rendered cleanly.
  - Options selector allows self-testing.
  - **Correct answer is hidden by default** to avoid spoiling test preparation; can be revealed on demand.
  - **"Report Error" Button**: Opens the Report Dialog with a textarea, quick issue chips (`Answer key wrong`, `Figure missing`, `Option D blank`), and submission to the AI triage pipeline with immediate success toast!

### 4. Immutable Audit Logs
- Chronological timeline tracking every faculty approval, rejection, auto-applied fix, and student submission.
- Filter by action type (`All`, `Approved`, `Rejected`, `Auto-Applied`, `Reports`).
- Export audit history directly to formatted JSON.

---

## How to Run

### Development Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port Vite outputs).

### Production Build:
```bash
npm run build
npm run preview
```
Open [http://localhost:4173](http://localhost:4173).

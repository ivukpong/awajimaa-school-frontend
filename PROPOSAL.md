# Awajimaa School Management Platform — Project Proposal

**Prepared:** April 2026  
**Status:** Active Development  
**Repository:** `awajimaa-school-backend` · `awajimaa-school-frontend`

---

## 1. Executive Summary

Awajimaa is a comprehensive, multi-tenant school management platform built for the Nigerian education ecosystem. It unifies every stakeholder in the education lifecycle — schools, teachers, students, parents, sponsors, regulators, and government ministries — under a single, role-aware digital infrastructure.

The platform replaces fragmented, paper-based, and siloed school operations with a single source of truth: real-time enrollment, academic records, fees collection, payroll, compliance, e-learning, and inter-agency reporting.

---

## 2. Problem Statement

Nigerian schools — particularly public and community-funded institutions — suffer from:

- **Fragmented administration**: admissions, fees, timetables, and results managed across spreadsheets, physical registers, and disconnected tools.
- **No accountability to regulators**: LGA and state regulators have no real-time view of school compliance, teacher postings, or student data.
- **Funding opacity**: Sponsors and donors cannot verify whether funds reached the right beneficiaries.
- **Unreachable freelance teachers**: Qualified teachers outside formal employment have no channel to find and engage with schools.
- **Insurance gaps**: Students and schools lack structured access to education insurance products.
- **Ministry data blindness**: State ministries of education have no consolidated dashboard of school performance, teacher deployment, or curriculum compliance.

Awajimaa addresses all of these with a single integrated platform.

---

## 3. Platform Architecture

| Layer            | Technology                                                                  |
| ---------------- | --------------------------------------------------------------------------- |
| Frontend         | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Zustand, TanStack Query |
| Backend          | Laravel 11, PHP 8.2+, Laravel Sanctum (token auth)                          |
| Database         | MySQL 8.0+ (12 migration groups)                                            |
| Storage          | Laravel Filesystems (S3-compatible)                                         |
| Payments         | Stripe + Wallet system                                                      |
| Email            | SMTP / Mailpit (dev)                                                        |
| Containerisation | Docker (both services)                                                      |

The system is **multi-tenant by school**: every piece of data is scoped to a `school_id` or `branch_id`. Role-based access control is enforced at both the API (Laravel middleware) and UI (Next.js route groups) layers.

---

## 4. User Roles & Stakeholders

The platform defines **18 distinct roles**, each with its own dashboard and permission set:

| Role                  | Description                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `super_admin`         | Platform owner — manages all schools, plans, subscriptions, and system settings               |
| `state_ministry`      | State Ministry of Education — oversight of all schools, recruitment, curriculum, scholarships |
| `regulator`           | Senior regulator — cross-school approvals, curriculum, events, broadcasts, government fees    |
| `state_regulator`     | State-level regulator                                                                         |
| `lga_regulator`       | LGA-level regulator                                                                           |
| `school_admin`        | School principal/director — full school management                                            |
| `branch_admin`        | Branch-level school manager                                                                   |
| `teacher`             | School-employed teacher                                                                       |
| `freelancer_teacher`  | Independent teacher — browses gigs, builds KYC profile, manages wallet                        |
| `student`             | School student                                                                                |
| `parent`              | Parent/guardian — fees, results, pickup, child tracking                                       |
| `sponsor`             | Scholarship sponsor — funds students, manages disbursements                                   |
| `affiliate`           | Referral partner — earns commissions on school sign-ups                                       |
| `revenue_collector`   | Government revenue agent — tracks school fee payments                                         |
| `security`            | School security officer — pickup code verification, access control                            |
| `insurance_operator`  | Education insurance provider — packages and claims                                            |
| `platform_accountant` | Awajimaa internal finance team                                                                |
| `school_accountant`   | School-side accountant                                                                        |

---

## 5. Feature Modules

### 5.1 School Administration (`school_admin`, `branch_admin`)

| Feature                | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| **Onboarding**         | School registration, branch creation, profile setup               |
| **Student Management** | Admissions, student profiles, bulk upload, class assignment       |
| **Academic Calendar**  | Academic years, terms, exam schedules, holidays                   |
| **Classes & Subjects** | Class rooms, subject linking, department management               |
| **Attendance**         | Teacher-recorded daily attendance per class                       |
| **Exam & Results**     | Exam scheduling, result entry, report card generation             |
| **Fee Management**     | Fee types, invoices, payments, receipts, fee status reports       |
| **Government Fees**    | Government-mandated levies — types, payment tracking              |
| **HR — Teachers**      | Teacher profiles, salary structures, contracts                    |
| **HR — Departments**   | Department CRUD, head-of-department assignment                    |
| **HR — Leave**         | Leave types, application, approval/rejection workflow             |
| **HR — Recruitment**   | Job postings, applications, multi-stage progression               |
| **HR — Payroll**       | Payroll runs, item generation per staff, mark-paid                |
| **Inventory**          | Item categories, stock levels, transaction history                |
| **Purchase Orders**    | PO creation, approval, receipt workflow                           |
| **E-Learning**         | Course and lesson creation, student enrollment, progress tracking |
| **E-Library**          | Digital book catalogue, approved books                            |
| **Communications**     | Announcements, internal messaging, meeting scheduling             |
| **Broadcast**          | Mass messages to parents, students, or teachers                   |
| **Pickup Codes**       | Secure student pickup authorisation for parents                   |
| **Scholarships**       | In-school scholarship programs and award tracking                 |
| **Sponsors**           | Link external sponsors to student beneficiaries                   |
| **Insurance**          | School insurance packages                                         |
| **Projects**           | School-level community/academic projects                          |
| **Reports**            | Finance, academic, HR, and compliance reports                     |
| **Regulators**         | View and respond to regulatory requests                           |
| **Subscription**       | Manage Awajimaa subscription plan and billing                     |
| **Store**              | (Upcoming) School store / canteen management                      |
| **Settings**           | School branding, notification preferences                         |

---

### 5.2 Ministry of Education Dashboard (`state_ministry`)

| Feature                   | Description                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| **Overview Dashboard**    | Real-time counts: schools, pending approvals, teachers, recruitment |
| **Schools**               | View all registered schools by state, approval status               |
| **Regulators**            | Assign and manage state/LGA regulators                              |
| **Recruitment Campaigns** | Create campaigns, track applications across stages                  |
| **Teacher Postings**      | Deploy teachers to schools                                          |
| **Interviews**            | Schedule and manage interview stages                                |
| **Curriculum**            | Publish state-level approved curricula                              |
| **Scholarships**          | Ministry scholarship programs and award disbursements               |
| **Competitions**          | Academic competitions — entries and results                         |
| **Academic Calendar**     | Ministry-wide academic year and term calendar                       |
| **Communications**        | Announcements, email accounts, meetings                             |
| **Analytics**             | Cross-school performance analytics                                  |
| **Users**                 | Ministry staff user management                                      |
| **Timeline**              | Ministry activity log                                               |

---

### 5.3 Regulatory Compliance (`regulator`, `state_regulator`, `lga_regulator`)

| Feature                 | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| **School Approvals**    | Review and approve/reject school registration requests |
| **Approved Books**      | Manage approved textbook list                          |
| **Curriculum Review**   | Validate and publish curricula                         |
| **Government Programs** | Create programs, manage student applications           |
| **Government Events**   | Events, registrations                                  |
| **Government Fees**     | Define fee types, confirm payments                     |
| **Broadcast**           | Mass communications to schools                         |
| **Forms**               | Regulatory verification forms                          |
| **Teacher Postings**    | View and manage teacher assignments                    |
| **Charges**             | Per-school regulatory charges                          |
| **Platform Jobs**       | Manage platform-wide job listings                      |
| **Meetings**            | Regulatory meetings with school delegates              |

---

### 5.4 Student Portal (`student`)

| Feature         | Description                                               |
| --------------- | --------------------------------------------------------- |
| **Dashboard**   | Academic overview — attendance, results, upcoming exams   |
| **E-Learning**  | Access enrolled courses, complete lessons, track progress |
| **E-Library**   | Access approved digital books                             |
| **Fees**        | View fee invoices and payment history                     |
| **Results**     | View term and exam results                                |
| **Schedule**    | Class timetable and exam schedule                         |
| **Messages**    | Communication with school                                 |
| **Profile**     | Personal and academic profile                             |
| **Link School** | Request to be linked to a registered school               |

---

### 5.5 Parent Portal (`parent`)

| Feature          | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| **Dashboard**    | Children overview — attendance, fees outstanding, recent activity |
| **Children**     | View profiles and academic records for all linked children        |
| **Fees**         | Pay fees, view receipts                                           |
| **Reports**      | Academic performance reports                                      |
| **Pickup**       | Request and confirm secure pickup codes                           |
| **Meetings**     | Schedule parent-teacher meetings                                  |
| **Messages**     | Communication with school                                         |
| **Engagements**  | Track school events, appointments                                 |
| **Transactions** | Payment history                                                   |

---

### 5.6 Teacher Portal (`teacher`)

| Feature           | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| **Dashboard**     | Class overview, attendance summary, upcoming lessons                     |
| **Classes**       | Assigned classes and subjects                                            |
| **Attendance**    | Record and review daily attendance                                       |
| **Results**       | Enter and view student results                                           |
| **E-Learning**    | Create and manage lesson content                                         |
| **E-Library**     | Access school digital library                                            |
| **Leave**         | Apply for leave, view status                                             |
| **Salary**        | View salary structure and payslips                                       |
| **Gigs**          | Browse and apply to freelance teaching engagements (if cross-registered) |
| **Messages**      | Communication with admin and parents                                     |
| **Notifications** | Real-time alerts                                                         |

---

### 5.7 Freelance Teacher Portal (`freelancer_teacher`)

| Feature              | Description                                 |
| -------------------- | ------------------------------------------- |
| **Dashboard**        | Gig activity, earnings overview             |
| **Profile**          | Professional profile, qualifications        |
| **KYC Verification** | Identity verification for platform trust    |
| **Gigs**             | Browse open teaching gigs, submit proposals |
| **Engagements**      | Active and historical teaching engagements  |
| **Recruitment**      | Apply to formal school job postings         |
| **Wallet**           | Earnings, withdrawals, transaction history  |

---

### 5.8 Sponsor Portal (`sponsor`)

| Feature           | Description                                             |
| ----------------- | ------------------------------------------------------- |
| **Dashboard**     | Active sponsorships, total disbursed, beneficiary stats |
| **Students**      | Browse and select students to sponsor                   |
| **Scholarships**  | View scholarship programs                               |
| **Payments**      | Initiate and track scholarship payments                 |
| **Gigs**          | (Optional) post tutoring gigs                           |
| **Messages**      | Communication with schools/students                     |
| **Notifications** | Alerts on beneficiary progress                          |

---

### 5.9 Affiliate Portal (`affiliate`)

| Feature       | Description                            |
| ------------- | -------------------------------------- |
| **Dashboard** | Referral stats, commission overview    |
| **Schools**   | List of schools referred               |
| **Wallet**    | Commission balance, withdrawal history |
| **Messages**  | Platform communications                |

---

### 5.10 Revenue Collector Portal (`revenue_collector`)

| Feature       | Description                              |
| ------------- | ---------------------------------------- |
| **Dashboard** | Payment activity summary                 |
| **Payments**  | View and verify school fee remittances   |
| **Reports**   | Revenue reports by school, state, period |

---

### 5.11 Insurance Operator Portal (`insurance_operator`)

| Feature       | Description                                               |
| ------------- | --------------------------------------------------------- |
| **Dashboard** | Policy and claims overview                                |
| **Packages**  | Create and manage insurance packages for schools/students |
| **Claims**    | Receive, process, and settle insurance claims             |

---

### 5.12 Security Officer Portal (`security`)

| Feature       | Description                       |
| ------------- | --------------------------------- |
| **Dashboard** | Pickup activity log               |
| **Roles**     | Manage access control assignments |

---

### 5.13 Super Admin Portal (`super_admin`)

| Feature                | Description                            |
| ---------------------- | -------------------------------------- |
| **Dashboard**          | Platform-wide metrics                  |
| **Schools**            | View and manage all registered schools |
| **Users**              | Platform user management               |
| **Subscription Plans** | Create and manage pricing tiers        |
| **Subscriptions**      | View all active school subscriptions   |
| **Sponsors**           | Platform-level sponsor management      |
| **Scholarships**       | Platform-wide scholarship oversight    |
| **Gigs**               | Freelance gig marketplace moderation   |
| **Teachers**           | Cross-school teacher directory         |
| **Regulators**         | Assign and manage regulatory bodies    |
| **Blog**               | Publish and manage blog content        |
| **Audit Log**          | Full platform activity audit trail     |
| **Settings**           | Platform configuration                 |

---

## 6. Public-Facing Pages

| Page                   | Description                                                               |
| ---------------------- | ------------------------------------------------------------------------- |
| **Homepage**           | Platform overview, features, who-we-serve, open recruitment, donation CTA |
| **Blog**               | Education news, student spotlights, platform updates                      |
| **Admissions**         | School admission application portal (public)                              |
| **Sponsor a Student**  | Browse students needing sponsorship, pay securely                         |
| **Schools Directory**  | List of registered schools                                                |
| **Schools Insurance**  | Insurance product listings for schools                                    |
| **E-Learning**         | Public-facing course catalogue                                            |
| **E-Library**          | Digital library access                                                    |
| **Curriculums**        | Published regulatory curricula                                            |
| **Announcements**      | Public school announcements                                               |
| **Certificates**       | Certificate verification portal                                           |
| **Teachers Directory** | Browse available freelance teachers                                       |
| **Donate**             | General donation / endowment                                              |
| **Meeting**            | Video meeting interface                                                   |
| **FAQ**                | Frequently asked questions                                                |
| **Privacy Policy**     | Data handling policy                                                      |
| **Terms & Conditions** | Platform terms                                                            |

---

## 7. Financial Infrastructure

| Component                     | Description                                                                 |
| ----------------------------- | --------------------------------------------------------------------------- |
| **Wallet System**             | Every stakeholder has a wallet — schools, sponsors, freelancers, affiliates |
| **Payments**                  | Stripe integration for card payments; offline payment requests              |
| **Invoicing**                 | Auto-generated invoices for fees, subscriptions, sponsorships               |
| **Payroll**                   | Multi-staff payroll runs, salary structure assignment, payslip generation   |
| **Subscription Plans**        | Tiered SaaS billing — schools subscribe to unlock features                  |
| **Affiliate Commissions**     | Tracked and settled via wallet payouts                                      |
| **Scholarship Disbursements** | End-to-end sponsor → student fee payment flow                               |
| **Government Fees**           | Regulatory levy collection with payment confirmation                        |

---

## 8. Communication Infrastructure

| Channel              | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| **In-App Messaging** | Role-scoped direct messaging between users                 |
| **Announcements**    | School-wide broadcast announcements                        |
| **Email Accounts**   | Per-school email account management                        |
| **Meetings**         | Scheduled video/physical meetings with participants        |
| **Notifications**    | Real-time notification logs per user                       |
| **Broadcasts**       | Regulator mass-communications to schools                   |
| **Mail (Laravel)**   | Transactional emails — verification, alerts, confirmations |

---

## 9. Data & Reporting

| Report                       | Audience                         |
| ---------------------------- | -------------------------------- |
| Student academic performance | School Admin, Parent, Regulator  |
| Fee collection & outstanding | School Admin, Revenue Collector  |
| Attendance summary           | Teacher, School Admin            |
| Payroll & HR reports         | School Admin, School Accountant  |
| Inventory & purchase orders  | School Admin                     |
| Platform revenue             | Super Admin, Platform Accountant |
| Scholarship disbursement     | Super Admin, Sponsor             |
| School compliance status     | Regulator, Ministry              |
| Gig marketplace activity     | Super Admin, Freelancer          |

---

## 10. Technical Strengths

- **Role-based access control** enforced at API middleware and UI route-group level across 18 roles
- **Multi-tenancy** — all data scoped by `school_id`/`branch_id`; one instance serves hundreds of schools
- **Sanctum token auth** — stateless API tokens, device session management, OTP verification
- **Responsive UI** — Tailwind CSS, mobile-first, progressive enhancement
- **Optimistic updates** — TanStack Query for server state with caching and background refetch
- **Docker-ready** — both frontend and backend have `Dockerfile`s for containerised deployment
- **Test coverage** — PHPUnit test suite (`tests/Feature` and `tests/Unit`) in the backend

---

## 11. Deployment Targets

| Service          | Suggested Hosting                                        |
| ---------------- | -------------------------------------------------------- |
| Next.js Frontend | Vercel / AWS Amplify / Nginx on VPS                      |
| Laravel API      | AWS EC2 / Railway / DigitalOcean App Platform            |
| MySQL Database   | AWS RDS / PlanetScale / managed MySQL                    |
| File Storage     | AWS S3 / Cloudflare R2                                   |
| Email            | SendGrid / Mailgun                                       |
| Video Meetings   | Daily.co / Jitsi integration (existing `/meeting` route) |

---

## 12. Current Development Status

| Area                                               | Status                                                  |
| -------------------------------------------------- | ------------------------------------------------------- |
| Backend API (Laravel)                              | ✅ Core complete — 12 migration groups, 20+ controllers |
| Authentication                                     | ✅ Complete — Sanctum, roles, OTP, device sessions      |
| School Admin Dashboard                             | ✅ Complete — 30+ sub-modules                           |
| Ministry Dashboard                                 | ✅ Complete — 15 modules                                |
| Regulator Dashboard                                | ✅ Complete — 15 modules                                |
| Student / Parent / Teacher Portals                 | ✅ Complete                                             |
| Freelancer Teacher Portal                          | ✅ Complete                                             |
| Sponsor Portal                                     | ✅ Complete                                             |
| Super Admin Portal                                 | ✅ Complete                                             |
| Affiliate / Revenue / Security / Insurance Portals | ✅ Functional (dashboards live)                         |
| Public Homepage + Marketing Pages                  | ✅ Complete                                             |
| Blog Module                                        | ✅ Complete                                             |
| E-Learning                                         | ✅ Complete                                             |
| E-Library                                          | ✅ Complete                                             |
| Sponsorship / Scholarship flows                    | ✅ Complete                                             |
| Payroll                                            | ✅ Complete                                             |
| Inventory & Purchase Orders                        | ✅ Complete                                             |
| Admissions                                         | ✅ Complete                                             |
| Government Programs / Events / Fees                | ✅ Complete                                             |
| Meeting / Video                                    | ✅ Route live                                           |
| Certificates                                       | ✅ Verification portal live                             |
| Mobile responsiveness                              | ✅ Tailwind responsive throughout                       |
| Docker deployment                                  | ✅ Both services containerised                          |

---

## 13. Roadmap (Suggested Next Phases)

### Phase 1 — Hardening & QA

- End-to-end test coverage (Playwright or Cypress)
- API rate limiting and throttling
- Error monitoring (Sentry)
- Full mobile PWA support

### Phase 2 — Scale & Growth

- Multi-language support (Hausa, Igbo, Yoruba)
- SMS notifications (Termii / Africa's Talking)
- Parent mobile app (React Native)
- Advanced analytics dashboard with charts per stakeholder

### Phase 3 — Ecosystem Expansion

- Open API for third-party integrations (CBN, WAEC, NECO)
- Marketplace for school supplies (vendors)
- AI-powered result analysis and at-risk student alerts
- Live virtual classroom (WebRTC integration)

---

## 14. Summary

Awajimaa is a production-grade, full-stack SaaS platform targeting the Nigerian K-12 education sector. It is distinguished by:

- **Breadth**: 18 stakeholder roles, 40+ functional modules, end-to-end financial flows
- **Depth**: Every module has full CRUD, business logic, and role-scoped visibility
- **Integration**: Government compliance, private sponsorship, insurance, and HR all in one system
- **Technology**: Modern stack (Next.js 14, Laravel 11) with clean architecture and Docker-ready deployment

The platform is positioned to become the definitive operating system for Nigerian schools.

---

_For technical details, refer to the backend `README.md` and the API reference documentation._

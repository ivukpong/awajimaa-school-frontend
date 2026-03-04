# Awajimaa School Management System — Frontend

Next.js 14 · TypeScript · Tailwind CSS · Zustand

---

## Table of Contents

1. [Requirements](#requirements)
2. [Setup](#setup)
3. [Environment Variables](#environment-variables)
4. [Project Structure](#project-structure)
5. [User Roles & Dashboards](#user-roles--dashboards)
6. [Feature Walkthrough](#feature-walkthrough)
7. [Testing Checklist](#testing-checklist)

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | ≥ 18.x |
| npm | ≥ 9.x |
| Backend API | Running on port 8000 |

---

## Setup

```bash
# 1. Enter directory
cd awajimaa-school-frontend

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.local   # or create .env.local manually

# 4. Set your backend URL in .env.local (see below)

# 5. Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

**Build for production:**
```bash
npm run build
npm start
```

---

## Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/               # Login & Register pages
│   └── (dashboards)/         # All role dashboards
│       ├── school-admin/     # School administrator
│       ├── teacher/          # Teacher
│       ├── student/          # Student
│       ├── parent/           # Parent
│       ├── regulator/        # Government regulator
│       ├── super-admin/      # Platform super admin
│       ├── sponsor/          # Scholarship sponsor
│       └── revenue/          # Revenue management
├── components/
│   ├── layout/               # DashboardLayout, Sidebar, Topbar
│   └── ui/                   # Button, Card, Table, Badge, Input, StatCard
├── hooks/                    # API data-fetching hooks
├── lib/                      # axios instance (api.ts), auth helpers
├── store/                    # Zustand auth store
└── types/                    # TypeScript interfaces
```

---

## User Roles & Dashboards

| Role | Login Path | Dashboard |
|---|---|---|
| `super_admin` | `/login` | `/super-admin` |
| `school_admin` | `/login` | `/school-admin` |
| `teacher` | `/login` | `/teacher` |
| `student` | `/login` | `/student` |
| `parent` | `/login` | `/parent` |
| `regulator` | `/login` | `/regulator` |
| `sponsor` | `/login` | `/sponsor` |
| `revenue` | `/login` | `/revenue` |

Authentication is handled automatically — after login the app reads `user.role` and redirects to the correct dashboard.

---

## Feature Walkthrough

### Authentication

1. Navigate to `http://localhost:3000`
2. Click **Login**
3. Enter credentials
4. You will be redirected to your role's dashboard automatically
5. To log out, click your avatar in the top bar → **Logout**

---

### School Admin Dashboard (`/school-admin`)

#### Departments — `/school-admin/departments`
- View all departments in a table
- Click **New Department** to create one (name, code, description)
- Assign a head teacher by entering their Teacher Profile ID
- Edit or delete departments inline

#### Inventory — `/school-admin/inventory`
- View all inventory items with stock status badges (OK / Low Stock)
- Click **Add Item** to create a new item (name, category, unit, cost, reorder level)
- Click **Stock In/Out** on any item to record a transaction (stock_in, stock_out, adjustment, disposal)

#### Purchase Orders — `/school-admin/purchase-orders`
- View all purchase orders and their statuses (draft → submitted → approved → received)
- Create new orders
- Submit a draft order for approval
- Approve submitted orders
- Mark approved orders as received

#### Admissions — `/school-admin/admissions`
- View active admission sessions
- Click **New Session** to open an admissions window (name, open/close dates, slots, application fee)
- View and manage incoming applications
- Update applicant status (submitted → under_review → shortlisted → entrance_exam → admitted → rejected)
- Click **Enroll** on an admitted applicant to convert them to a full student record

#### Recruitment — `/school-admin/recruitment`
- View all job postings with status and application counts
- Click **Post Job** to create a posting (title, type, requirements, deadline)
- Click **View Applications** to see and manage applicants
- Update applicant status through the pipeline: submitted → shortlisted → interviewed → offered → hired / rejected

#### Payroll — `/school-admin/payroll`
- View payroll run history
- Create a new payroll run (period, academic year)
- View individual payroll items per run
- Mark individual items as paid

#### Leave Management — `/school-admin/leave`
- View all staff leave requests
- Approve or reject pending requests with an optional note
- Configure leave types (annual, sick, study, etc.) with allowed days per type

#### Government Programs — `/school-admin/government-programs`
- Browse programs published by regulators
- Click **Apply** on any open program to submit an application (statement, requested amount)
- Track application statuses and disbursements under **My Applications**

#### Approval Requests — `/school-admin/approvals`
- View all submitted regulatory requests and their statuses
- Click **New Request** to submit a request to the regulator (type: new_registration, renewal, upgrade, etc.)
- Track review notes and decisions

#### Government Fees — `/school-admin/government-fees`
- View mandated fee types from the regulator
- Click **Record Payment** to pay a government fee (select fee type, amount, method, reference)
- Track all payment history with statuses (pending → confirmed)

---

### Teacher Dashboard (`/teacher`)

#### Salary — `/teacher/salary`
- View personal payroll history
- See net salary, deductions, and payment status per period

#### Leave — `/teacher/leave`
- View leave balance per leave type (used vs. allowed)
- Click **Apply for Leave** (type, start/end dates, reason)
- Track request status and reviewer notes

---

### Regulator Dashboard (`/regulator`)

#### Government Programs — `/regulator/programs`
- View all programs and their application statistics
- Click **New Program** to create a grant, scholarship, or training program
- Click **Publish** on a draft program to open it for applications
- Click **Close** on an open program
- Click **View Applications** to review school applications, approve/reject, and disburse funds

#### Government Events — `/regulator/events`
- View all events (workshops, training sessions, conferences, etc.)
- Click **New Event** to create one (title, category, venue, start/end datetime, max participants)
- Edit or delete events
- Track registration counts

#### Approval Requests — `/regulator/approvals`
- View all school approval requests (new_registration, renewal, upgrade, etc.)
- Click **Approve** / **Reject** on actionable requests
- Add review notes when taking action

#### Government Fees — `/regulator/government-fees`
- Manage fee types (name, amount, category: registration, renewal, levy, inspection)
- View all school fee payment records
- Confirm or reject payments

---

## Testing Checklist

Use this checklist to verify the full implementation end-to-end.

### Backend must be running first
```bash
cd awajimaa-school-backend && php artisan serve
```

### Auth
- [ ] Register a new user
- [ ] Login returns a token and correct role
- [ ] Protected routes return 401 without a token
- [ ] `/api/auth/me` returns authenticated user

### School Admin flow
- [ ] Create a department → appears in departments list
- [ ] Create an inventory item → stock status shows "OK"
- [ ] Record a stock_out transaction → quantity decreases
- [ ] Add an item below reorder level → "Low Stock" badge appears
- [ ] Create a purchase order → status is "draft"
- [ ] Submit it → status changes to "submitted"
- [ ] Approve it → status changes to "approved"
- [ ] Create an admission session → appears in sessions list
- [ ] Apply to it as a student → appears in applications
- [ ] Move application to "admitted" → Enroll button appears
- [ ] Click Enroll → student record created
- [ ] Create a job posting → appears in recruitment list
- [ ] Update an application status to "hired"
- [ ] Create a payroll run → items generated for teachers
- [ ] Mark a payroll item as paid → status changes
- [ ] Submit a leave request (as teacher) → pending status
- [ ] Approve leave request (as admin) → status changes to approved
- [ ] Submit a government approval request → appears in regulator dashboard
- [ ] Apply to a government program → appears under My Applications
- [ ] Record a government fee payment → status is "pending"

### Regulator flow
- [ ] Create a government program → status is "draft"
- [ ] Publish the program → status changes to "open"
- [ ] View and approve a school's application
- [ ] Disburse funds to an approved application
- [ ] Close the program → status changes to "closed"
- [ ] Create a government event → appears in events list
- [ ] Review a school approval request → approve with notes
- [ ] Confirm a school fee payment → status changes to "confirmed"

### Teacher flow
- [ ] View salary page → payroll items shown (if payroll run exists)
- [ ] Submit a leave request → appears in admin's leave list
- [ ] View leave balance per type

### UI / Build
- [ ] `npm run build` completes with 0 errors
- [ ] All 68 pages generate successfully
- [ ] Sidebar shows correct nav items per role
- [ ] Tables render with loading state when data is fetching
- [ ] Empty state messages show when no data exists
- [ ] Forms validate required fields before submitting
- [ ] Toast notifications show on success and error

---

## API Hooks Reference

All data fetching is centralized in `src/hooks/`:

| Hook | File | Used By |
|---|---|---|
| `useDashboard` | `useDashboard.ts` | All dashboard home pages |
| `useStudents` | `useStudents.ts` | Student management |
| `useAttendance` | `useAttendance.ts` | Attendance tracking |
| `useResults` | `useResults.ts` | Academic results |
| `useFees` | `useFees.ts` | Fee management |
| `useMeetings` | `useMeetings.ts` | Parent-teacher meetings |
| `useMessages` | `useMessages.ts` | Internal messaging |
| `useAnnouncements` | `useAnnouncements.ts` | School announcements |
| `usePickupCodes` | `usePickupCodes.ts` | Student pickup authorization |
| `useScholarships` | `useScholarships.ts` | Scholarship management |
| `useSchools` | `useSchools.ts` | School CRUD |
| `useHR` | `useHR.ts` | Departments, teacher profiles, leave, recruitment, payroll |
| `useInventory` | `useInventory.ts` | Inventory, purchase orders, admissions |
| `useGovernment` | `useGovernment.ts` | Programs, events, fees, approvals |

All hooks follow the same pattern:
```ts
const { data, loading, createItem, updateItem, deleteItem } = useHookName(params);
```

---

## Types Reference

| File | Interfaces |
|---|---|
| `src/types/index.ts` | Core school, student, academic types |
| `src/types/finance.ts` | Fee, Invoice, Payment types |
| `src/types/school.ts` | School, Branch types |
| `src/types/student.ts` | Student, Attendance, Result types |
| `src/types/hr.ts` | Department, TeacherProfile, LeaveType, LeaveRequest, JobPosting, JobApplication, PayrollRun, PayrollItem |
| `src/types/inventory.ts` | InventoryItem, InventoryTransaction, PurchaseOrder, AdmissionSession, AdmissionApplication |
| `src/types/government.ts` | GovernmentProgram, ProgramApplication, GovernmentEvent, GovernmentFeeType, GovernmentFeePayment, SchoolApprovalRequest |

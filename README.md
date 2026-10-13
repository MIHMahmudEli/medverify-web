# MedVerify Web

Clinical operations frontend for the **MedVerify** medical report generation, clinical decision approval, and public verification platform.

## Architecture & Technology Stack

- **Framework**: Next.js (v14 App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with clinical semantic tokens
- **Icons**: Lucide React
- **Forms & Validation**: Controlled clinical inputs & Zod
- **Tables**: Responsive clinical tables with server-side pagination & debounced search
- **Public Verification**: Mobile-responsive, print-safe QR landing route at `/verify/[token]`

## Visual Design Philosophy

Designed as a quiet, precise, and information-dense clinical information system:
- Deep ink/navy primary navigation and actions
- Warm neutral backgrounds with fine borders
- High-contrast clinical status indicators (Emerald for FIT, Rose for UNFIT, Amber for IN REVIEW)
- Zero generic SaaS gradients, oversized headings, or distracting animations

## Environment Variables

Copy `.env.example` to `.env.local`:

| Variable | Description | Example / Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of MedVerify NestJS API | `http://localhost:4000` |
| `NEXT_PUBLIC_APP_URL` | Base URL of this frontend application | `http://localhost:3000` |

## Application Routes

- `/login` — Clinical staff authentication with quick demo personas
- `/dashboard` — Operational metrics, review volume, and recent examinations
- `/patients` — Patient directory, search, and registration
- `/patients/[id]` — Demographic profile and historical reports
- `/reports` — Medical reports list with status and fitness filters
- `/reports/new` — Dynamic examination and laboratory data entry
- `/reports/[id]` — Side-by-side clinical report review and doctor approval
- `/reports/[id]/preview` — High-fidelity PDF viewer
- `/templates` — Examination templates and schema inspector
- `/users` — Staff account administration and role assignments
- `/audit-logs` — Immutable audit trail of system events
- `/settings` — Diagnostic center profile and PDF certificate settings
- `/verify/[token]` — **Public read-only QR verification page** (No login required)

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm run start
```

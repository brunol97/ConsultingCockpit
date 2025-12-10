# Architecture Overview

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      ConsultingCockpit                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Next.js Application (Port 3000)           │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │                                                        │    │
│  │  Routes:                                              │    │
│  │  ├─ /presentations          (Presentation Gallery)    │    │
│  │  ├─ /projects/[id]/         (Project Overview)        │    │
│  │  └─ /projects/[id]/         (Business Case Editor)    │    │
│  │     business-case                                     │    │
│  │                                                        │    │
│  │  Components:                                          │    │
│  │  ├─ PresentationGenerator.tsx (Form UI)              │    │
│  │  ├─ BusinessCaseEditor.tsx    (Univer Embed)         │    │
│  │  └─ ui/tabs.tsx               (Tab Navigation)        │    │
│  │                                                        │    │
│  │  Libraries:                                           │    │
│  │  ├─ react-hook-form (Form State)                     │    │
│  │  ├─ @univerjs/presets (Spreadsheet)                  │    │
│  │  └─ tailwindcss (Styling)                            │    │
│  │                                                        │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                     │
│          ┌────────────────┼────────────────┐                   │
│          ↓                ↓                ↓                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  Supabase    │ │  Presenton   │ │   Univer     │            │
│  │              │ │   API Call   │ │   Instance   │            │
│  │ • Projects   │ │   (HTTP)     │ │ (In Memory)  │            │
│  │ • Decks      │ └──────┬───────┘ │              │            │
│  │ • Cases      │        │         │              │            │
│  └──────────────┘        ↓         │              │            │
│         ↑         ┌──────────────┐ │              │            │
│         │         │    API Route │ │              │            │
│         │         │ /api/present │ │              │            │
│         │         │   ations/    │ │              │            │
│         │         │   generate   │ │              │            │
│         └─────────┤              │ │              │            │
│                   └──────┬───────┘ └──────────────┘            │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ↓                  ↓                  ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  Presenton   │  │   Browser    │
│  Database    │  │  Container   │  │   Storage    │
│              │  │  (Port 5000) │  │              │
│ • Durable    │  │              │  │ • Supabase   │
│   Storage    │  │ • Flask App  │  │   Session    │
│ • ACID       │  │ • OpenAI/    │  │ • User Data  │
│   Integrity  │  │   Google API │  │              │
│              │  │ • File Gen   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow

### Presentation Generation Flow

```
User Input
   ↓
┌─────────────────────────┐
│ PresentationGenerator   │
│ Component               │
│ - Content               │
│ - Slides Count          │
│ - Tone                  │
│ - Language              │
└────────────┬────────────┘
             ↓
     ┌──────────────┐
     │ Validate     │
     │ & Prepare    │
     └────────┬─────┘
              ↓
    ┌─────────────────┐
    │ POST Request    │
    │ to /api/        │
    │ presentations/  │
    │ generate        │
    └────────┬────────┘
             ↓
    ┌──────────────────┐
    │ Next.js API      │
    │ Route Handler    │
    │ - Validation     │
    │ - Auth Check     │
    └────────┬─────────┘
             ↓
    ┌──────────────────┐
    │ Presenton API    │
    │ Call             │
    │ http://localhost │
    │ :5000/api/v1/..  │
    └────────┬─────────┘
             ↓
    ┌──────────────────┐
    │ Presenton        │
    │ Service          │
    │ - Generate Deck  │
    │ - Create Slides  │
    │ - Add Images     │
    │ - Format Output  │
    └────────┬─────────┘
             ↓
    ┌──────────────────┐
    │ Response         │
    │ {                │
    │   presentation   │
    │   _id,           │
    │   path,          │
    │   edit_path      │
    │ }                │
    └────────┬─────────┘
             ↓
    ┌──────────────────┐
    │ Store in DB      │
    │ (Optional)       │
    └────────┬─────────┘
             ↓
    ┌──────────────────┐
    │ Redirect to      │
    │ Editor           │
    │ localhost:5000   │
    └──────────────────┘
```

### Business Case Editing Flow

```
User Opens Editor
   ↓
┌──────────────────────┐
│ Load Business Case   │
│ Page                 │
│ /projects/[id]/      │
│ business-case        │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Initialize Univer    │
│ Instance             │
│ - Create Preset      │
│ - Mount to DOM       │
│ - Setup Listeners    │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Load Existing Data   │
│ from Supabase        │
│ (if available)       │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Render Editor UI     │
│ - Toolbar            │
│ - Cells              │
│ - Formulas           │
│ - Charts             │
└─────────┬────────────┘
          ↓
       User Edits
          ↓
┌──────────────────────┐
│ User Clicks Save     │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Extract Workbook     │
│ Data                 │
│ .save() Method       │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Send to Backend      │
│ POST /api/business-  │
│ cases/[id]           │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Validate & Store     │
│ in Supabase          │
└─────────┬────────────┘
          ↓
┌──────────────────────┐
│ Confirm Success      │
│ Show Message         │
└──────────────────────┘
```

## Technology Stack

### Frontend
```
Next.js 16.0.8
├─ React 19.2.1
├─ TypeScript 5
├─ Tailwind CSS 3.4.14
├─ Radix UI (components)
├─ react-hook-form (forms)
├─ @univerjs/presets (spreadsheets)
└─ lucide-react (icons)
```

### Backend
```
Next.js API Routes
├─ Node.js Runtime
├─ Fetch API (HTTP calls)
└─ Supabase JS Client
```

### External Services
```
Presenton (Port 5000)
├─ OpenAI API (optional)
├─ Google Gemini API (optional)
├─ Anthropic Claude API (optional)
├─ Ollama (local models)
├─ DALL-E 3 (images)
├─ Pexels API (images)
└─ Pixabay API (images)

Supabase
├─ PostgreSQL Database
├─ Authentication
├─ Real-time Subscriptions
└─ Storage (optional)
```

## Directory Structure

```
ConsultingCockpit/
├── apps/web/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   └── presentations/
│   │   │   │       └── generate/
│   │   │   │           └── route.ts
│   │   │   ├── presentations/
│   │   │   │   └── page.tsx
│   │   │   ├── projects/
│   │   │   │   └── [id]/
│   │   │   │       └── business-case/
│   │   │   │           └── page.tsx
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── organizations/
│   │   │
│   │   ├── components/
│   │   │   ├── PresentationGenerator.tsx (NEW)
│   │   │   ├── BusinessCaseEditor.tsx    (NEW)
│   │   │   ├── Header.tsx
│   │   │   ├── org-context.tsx
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       ├── tabs.tsx              (NEW)
│   │   │       └── ...
│   │   │
│   │   ├── lib/
│   │   │   ├── presenton.ts              (NEW)
│   │   │   ├── supabaseClient.ts
│   │   │   └── utils.ts
│   │   │
│   │   └── hooks/
│   │       └── useRequireSession.ts
│   │
│   ├── package.json (updated)
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── .env.local.example              (NEW)
│
├── supabase/
│   └── migrations/
│
├── INTEGRATION_GUIDE.md                (NEW)
├── QUICKSTART.md                       (NEW)
├── ARCHITECTURE.md                     (NEW)
└── README.md
```

## Component Relationships

```
                    ┌──────────────────────┐
                    │   App Router         │
                    │   (Next.js)          │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────▼────────┐   ┌───────▼────────┐
            │ /presentations │   │ /projects/[id] │
            │    Page        │   │    /business-  │
            │                │   │    case        │
            └───────┬────────┘   └───────┬────────┘
                    │                    │
         ┌──────────▼──────────┐ ┌───────▼────────────┐
         │ PresentationGenerator│ │ BusinessCaseEditor │
         │    Component         │ │   Component        │
         │                      │ │                    │
         │ - Form Inputs        │ │ - Univer Instance  │
         │ - State Management   │ │ - Toolbar          │
         │ - Error Handling     │ │ - Save Handler     │
         │ - Loading States     │ │ - Data Export      │
         └──────────┬───────────┘ └───────┬────────────┘
                    │                     │
         ┌──────────▼──────────┐ ┌────────▼──────────┐
         │ API Route Handler   │ │ API Route Handler  │
         │ /api/presentations │ │ /api/business-    │
         │ /generate           │ │ cases/[id]        │
         └──────────┬──────────┘ └────────┬──────────┘
                    │                     │
         ┌──────────▼──────────┐ ┌────────▼──────────┐
         │ Presenton Service   │ │ Supabase Database  │
         │ (External)          │ │ (PostgreSQL)       │
         └─────────────────────┘ └────────────────────┘
```

## Security & Authentication Flow

```
User Request
     │
     ↓
┌─────────────────┐
│ Next.js Route   │
│ Middleware      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Check Session   │
│ (useRequire     │
│  Session)       │
└────────┬────────┘
         │
    ┌────┴──────┐
    │            │
   NO           YES
    │            │
    ↓            ↓
┌────────┐  ┌──────────────┐
│Redirect│  │ Verify User  │
│to Login│  │ Permissions  │
└────────┘  └────────┬─────┘
                     │
                ┌────┴──────┐
                │            │
              NO            YES
                │            │
                ↓            ↓
           ┌────────┐  ┌─────────────┐
           │Return  │  │ Process     │
           │ 403    │  │ Request     │
           └────────┘  └──────┬──────┘
                              │
                   ┌──────────┴──────────┐
                   │                     │
            ┌──────▼────────┐    ┌──────▼────────┐
            │ External API  │    │ Database      │
            │ (Presenton)   │    │ Query         │
            └────────────────┘    └───────────────┘
```

## Deployment Architecture (Production)

```
┌────────────────────────────────────────────────────────┐
│                   Cloud Infrastructure                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │         Vercel / Render (Next.js)              │   │
│  │  Port 3000                                     │   │
│  │  - Auto scaling                               │   │
│  │  - CDN                                         │   │
│  │  - SSL/TLS                                     │   │
│  └────────────────────────────────────────────────┘   │
│                     │                                  │
│    ┌────────────────┼────────────────┐               │
│    │                │                │               │
│    ↓                ↓                ↓               │
│ ┌──────┐      ┌──────────┐     ┌──────────┐        │
│ │Supabase    │ Presenton  │    │ S3/CDN   │        │
│ │Cloud       │ Server     │    │ Storage  │        │
│ │Database    │ (Docker)   │    │          │        │
│ │ + Auth     │ Port 5000  │    │ Files    │        │
│ │            │ Auto-scale │    │          │        │
│ └──────┘      └──────────┘     └──────────┘        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

This architecture provides:
- **Scalability**: Horizontal scaling of containers
- **Reliability**: Redundant services and failover
- **Security**: Isolated services with authentication
- **Performance**: Caching and CDN distribution
- **Maintainability**: Clear separation of concerns

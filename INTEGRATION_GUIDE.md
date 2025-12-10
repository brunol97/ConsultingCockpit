# Presenton & Univer Integration Guide

## Overview

ConsultingCockpit has been enhanced with two powerful tools:

1. **Presenton** - AI-powered presentation generation tool
2. **Univer** - Spreadsheet and document editor for financial models

## Architecture

### Presenton Integration

```
┌─────────────────────┐
│  Next.js Frontend   │
│  (React Component)  │
└────────┬────────────┘
         │ HTTP POST
         ↓
┌─────────────────────┐
│  API Route          │
│  /api/presentations │
│  /generate          │
└────────┬────────────┘
         │ HTTP POST
         ↓
┌─────────────────────┐
│  Presenton Service  │
│  (Docker Container) │
│  Port: 5000         │
└────────┬────────────┘
         │ File Generation
         ↓
┌─────────────────────┐
│  Generated PPTX/PDF │
│  (Stored locally)   │
└─────────────────────┘
```

### Univer Integration

```
┌─────────────────────┐
│  Next.js Page       │
│  /projects/[id]/    │
│  business-case      │
└────────┬────────────┘
         │
         ↓
┌─────────────────────┐
│  BusinessCaseEditor │
│  Component          │
│  (Univer Instance)  │
└────────┬────────────┘
         │
         ↓
┌─────────────────────┐
│  Supabase           │
│  business_cases     │
│  table              │
└─────────────────────┘
```

## Implementation Details

### 1. Presenton Setup

#### Step 1: Start Presenton Docker Container

```bash
# Basic setup (localhost only)
docker run -it --name presenton -p 5000:80 \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest

# With OpenAI API key (recommended)
docker run -it --name presenton -p 5000:80 \
  -e LLM="openai" \
  -e OPENAI_API_KEY="sk-..." \
  -e IMAGE_PROVIDER="dall-e-3" \
  -e CAN_CHANGE_KEYS="false" \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest

# With Google Gemini
docker run -it --name presenton -p 5000:80 \
  -e LLM="google" \
  -e GOOGLE_API_KEY="..." \
  -e IMAGE_PROVIDER="gemini_flash" \
  -e CAN_CHANGE_KEYS="false" \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest

# With Ollama (local models, no API key needed)
docker run -it --name presenton -p 5000:80 \
  -e LLM="ollama" \
  -e OLLAMA_MODEL="llama3.2:3b" \
  -e IMAGE_PROVIDER="pexels" \
  -e PEXELS_API_KEY="..." \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest

# With GPU support (NVIDIA)
docker run -it --gpus=all --name presenton -p 5000:80 \
  -e LLM="ollama" \
  -e OLLAMA_MODEL="llama3.2:3b" \
  -e IMAGE_PROVIDER="pexels" \
  -e PEXELS_API_KEY="..." \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest
```

#### Step 2: Environment Configuration

Create or update `.env.local` in `apps/web/`:

```env
PRESENTON_API_URL=http://localhost:5000
NEXT_PUBLIC_PRESENTON_URL=http://localhost:5000
```

#### Step 3: Files Created

- `src/lib/presenton.ts` - Type-safe API client
- `src/app/api/presentations/generate/route.ts` - API endpoint
- `src/components/PresentationGenerator.tsx` - UI component
- `src/app/presentations/page.tsx` - Presentations management page

#### Step 4: Usage

Navigate to `/presentations` in the app to:
- Generate new presentations with AI
- Specify topic, number of slides, tone, language
- Download as PPTX or PDF
- Edit in Presenton UI

### 2. Univer Setup

#### Step 1: Installation

Dependencies are already added to `package.json`:
```json
{
  "@univerjs/presets": "^0.4.4",
  "@univerjs/preset-sheets-core": "^0.4.4"
}
```

Run `pnpm install` to download packages.

#### Step 2: Files Created

- `src/components/BusinessCaseEditor.tsx` - Univer editor component
- `src/app/projects/[id]/business-case/page.tsx` - Business case page

#### Step 3: Database Schema

The `business_cases` table should have:

```sql
CREATE TABLE business_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  workbook_data JSONB, -- Univer spreadsheet data
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, archived
  metadata JSONB -- Additional fields like scenarios, versions
);
```

#### Step 4: Usage

Navigate to `/projects/[id]/business-case` to:
- Create and edit financial models
- Use spreadsheet functions and formulas
- Save data back to Supabase
- Export workbook data

## API Reference

### Generate Presentation

**Endpoint:** `POST /api/presentations/generate`

**Request Body:**
```json
{
  "content": "Introduction to Machine Learning",
  "n_slides": 8,
  "language": "English",
  "template": "general",
  "tone": "professional",
  "verbosity": "standard",
  "export_as": "pptx",
  "web_search": false
}
```

**Response:**
```json
{
  "presentation_id": "d3000f96-096c-4768-b67b-e99aed029b57",
  "path": "/app_data/d3000f96-096c-4768-b67b-e99aed029b57/presentation.pptx",
  "edit_path": "/presentation?id=d3000f96-096c-4768-b67b-e99aed029b57"
}
```

## File Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── presentations/
│   │   │       └── generate/
│   │   │           └── route.ts
│   │   ├── presentations/
│   │   │   └── page.tsx
│   │   └── projects/
│   │       └── [id]/
│   │           └── business-case/
│   │               └── page.tsx
│   ├── components/
│   │   ├── PresentationGenerator.tsx
│   │   ├── BusinessCaseEditor.tsx
│   │   └── ui/
│   │       └── tabs.tsx (new)
│   └── lib/
│       └── presenton.ts
├── .env.local.example
└── package.json
```

## Database Schema

### Decks Table (for Presenton)

```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  presenton_id VARCHAR(255), -- ID from Presenton
  file_path VARCHAR(512), -- Path to generated file
  export_format VARCHAR(10), -- pptx or pdf
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'generated' -- draft, generated, archived
);
```

### Business Cases Table (for Univer)

```sql
CREATE TABLE business_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  workbook_data JSONB, -- Univer workbook JSON
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'draft',
  version INT DEFAULT 1
);
```

## Next Steps & Future Enhancements

### For Presenton:
- [ ] Add database persistence for generated presentations
- [ ] Implement presentation versioning and history
- [ ] Add templates management UI
- [ ] Support file upload for template generation
- [ ] Add API key management per organization
- [ ] Implement presentation scheduling/batch generation

### For Univer:
- [ ] Complete Supabase integration for data persistence
- [ ] Add collaboration features (real-time editing)
- [ ] Implement scenario management for business cases
- [ ] Add scenario comparison and visualization
- [ ] Export to PDF/Excel functionality
- [ ] Add formula library and business templates

### Integration:
- [ ] Create presentations from business case data
- [ ] Link presentations to business cases
- [ ] Add approval workflow for presentations
- [ ] Implement audit logging for both tools
- [ ] Add search and filtering across presentations and cases
- [ ] Create project-wide report generation

## Troubleshooting

### Presenton Service Not Running

```bash
# Check if container is running
docker ps | grep presenton

# View logs
docker logs presenton

# Restart service
docker restart presenton

# Access Presenton UI
# Open http://localhost:5000 in browser
```

### Univer Component Not Loading

- Ensure all Univer dependencies are installed: `pnpm install`
- Check browser console for JavaScript errors
- Verify React version compatibility (requires React 18+)

### API Call Failures

- Check PRESENTON_API_URL environment variable
- Verify Presenton container is accessible
- Check network connectivity: `curl http://localhost:5000/health`
- Review server logs for detailed error messages

## Security Considerations

1. **API Keys**: Store securely using environment variables, never commit to git
2. **Rate Limiting**: Implement rate limiting on `/api/presentations/generate`
3. **Authentication**: Verify user session before allowing generation
4. **File Storage**: Use secure file paths and implement access controls
5. **CORS**: Configure appropriate CORS headers for Presenton communication
6. **Input Validation**: Validate all user inputs before sending to Presenton

## Performance Optimization

1. **Caching**: Cache generated presentations to avoid regeneration
2. **Async Processing**: Use background jobs for long-running generations
3. **File Compression**: Compress exported files before download
4. **Database Indexing**: Index frequently searched fields
5. **CDN**: Use CDN for serving generated presentation files

## Support Resources

- **Presenton Documentation**: https://github.com/presenton/presenton
- **Presenton Discord**: Available for community support
- **Univer Documentation**: https://univer.ai/docs
- **ConsultingCockpit Issues**: GitHub issues for integration problems

# Quick Start: Presenton & Univer Integration

## 📋 Summary of Changes

Your ConsultingCockpit application now has:

✅ **Presenton** - AI presentation generator with multiple LLM providers  
✅ **Univer** - Spreadsheet editor for financial models  
✅ **Type-safe APIs** - Full TypeScript integration  
✅ **Database schema** - Ready for presentations and business cases  
✅ **UI Components** - Pre-built forms and editors  

## 🚀 Getting Started (5 minutes)

### 1. Install Dependencies

```bash
cd apps/web
pnpm install
```

### 2. Start Presenton (Choose One)

**Option A: Simple (No AI needed for testing)**
```bash
docker run -it --name presenton -p 5000:80 \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest
```

**Option B: With OpenAI (Best for production)**
```bash
docker run -it --name presenton -p 5000:80 \
  -e LLM="openai" \
  -e OPENAI_API_KEY="sk-your-key-here" \
  -e IMAGE_PROVIDER="dall-e-3" \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest
```

**Option C: With Ollama (Local, free)**
```bash
# First install Ollama from https://ollama.ai
# Then run:
docker run -it --name presenton -p 5000:80 \
  -e LLM="ollama" \
  -e OLLAMA_MODEL="llama3.2:3b" \
  -e IMAGE_PROVIDER="pexels" \
  -e PEXELS_API_KEY="your-pexels-key" \
  -v "./app_data:/app_data" \
  ghcr.io/presenton/presenton:latest
```

### 3. Configure Environment

Copy the example config:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with:
- `PRESENTON_API_URL=http://localhost:5000` (already set)
- Any API keys if using cloud models

### 4. Run the App

```bash
pnpm dev
```

### 5. Test It!

- **Presentations**: Visit http://localhost:3000/presentations
- **Business Cases**: Go to a project, then click "Business Case"

## 📂 New Files & Components

### Core Integration Files
- `src/lib/presenton.ts` - API client for Presenton
- `src/app/api/presentations/generate/route.ts` - Backend endpoint

### UI Components
- `src/components/PresentationGenerator.tsx` - Form to create presentations
- `src/components/BusinessCaseEditor.tsx` - Univer spreadsheet editor
- `src/components/ui/tabs.tsx` - Tab navigation component

### Pages
- `src/app/presentations/page.tsx` - Presentations management
- `src/app/projects/[id]/business-case/page.tsx` - Business case editor

### Configuration
- `.env.local.example` - All required environment variables
- `INTEGRATION_GUIDE.md` - Detailed implementation documentation

## 🔄 Database Tables to Create

Add these tables to your Supabase database:

### Decks Table (Presentations)
```sql
CREATE TABLE decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255),
  presenton_id VARCHAR(255),
  file_path VARCHAR(512),
  export_format VARCHAR(10),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
```

### Business Cases Table
```sql
CREATE TABLE business_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255),
  workbook_data JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
```

## 🎯 Key Features

### Presenton
- ✨ Generate presentations from text prompts
- 🎨 Choose from multiple tones (professional, casual, funny, etc.)
- 🖼️ Auto-generate images with AI
- 📊 Customize slides count and verbosity
- 💾 Export as PPTX or PDF
- 🔑 Support for OpenAI, Google, Anthropic, Ollama

### Univer
- 📊 Full spreadsheet editing capabilities
- 🧮 Formula support
- 📈 Charts and visualization
- 💾 Save workbook data to database
- 🔄 Real-time updates (with WebSocket support)
- 📥 Import/export functionality

## ⚙️ Configuration Options

### LLM Providers
```bash
# OpenAI (best quality, costs money)
-e LLM="openai"
-e OPENAI_API_KEY="sk-..."

# Google Gemini (good quality, costs money)
-e LLM="google"
-e GOOGLE_API_KEY="..."

# Anthropic Claude (excellent quality, costs money)
-e LLM="anthropic"
-e ANTHROPIC_API_KEY="..."

# Ollama (free, runs locally)
-e LLM="ollama"
-e OLLAMA_MODEL="llama3.2:3b"
```

### Image Providers
```bash
# DALL-E 3 (best quality, costs money)
-e IMAGE_PROVIDER="dall-e-3"
-e OPENAI_API_KEY="sk-..."

# Google Gemini Flash (good quality, costs money)
-e IMAGE_PROVIDER="gemini_flash"
-e GOOGLE_API_KEY="..."

# Pexels (free stock photos)
-e IMAGE_PROVIDER="pexels"
-e PEXELS_API_KEY="..."

# Pixabay (free stock photos)
-e IMAGE_PROVIDER="pixabay"
-e PIXABAY_API_KEY="..."
```

## 🐛 Troubleshooting

### Presenton Service Won't Start
```bash
# Check if port 5000 is already in use
lsof -i :5000

# Check Docker container logs
docker logs presenton

# Restart the container
docker restart presenton
```

### Univer Not Loading
```bash
# Check if dependencies are installed
pnpm install

# Clear cache and rebuild
rm -rf .next
pnpm build
```

### API Connection Issues
```bash
# Test Presenton connectivity
curl http://localhost:5000/health

# Check environment variables
echo $PRESENTON_API_URL

# View app logs in development
# Check browser console (F12)
```

## 📚 Next Steps

1. **Integrate with Database**: Connect presentations and business cases to Supabase
2. **Add Versioning**: Track presentation and case versions
3. **Implement Sharing**: Allow team members to view and edit
4. **Add Exports**: Export combined reports (presentation + business case)
5. **Create Templates**: Build custom presentation templates
6. **Add Collaboration**: Real-time editing for business cases

## 📖 Detailed Documentation

See `INTEGRATION_GUIDE.md` for:
- Architecture diagrams
- Complete API reference
- Database schema details
- Security best practices
- Performance optimization tips
- Future enhancement roadmap

## 🆘 Getting Help

1. Check logs: `docker logs presenton`
2. Read INTEGRATION_GUIDE.md
3. Test with simple examples first
4. Verify all environment variables
5. Check network connectivity

## 💡 Tips & Best Practices

- **Development**: Use Ollama for testing (no API costs)
- **Production**: Use OpenAI or Google for best quality
- **Presentations**: Aim for 5-15 slides for clarity
- **Business Cases**: Start with 5-10 cells to test
- **Backups**: Keep copies of generated presentations
- **Monitoring**: Log all generation requests for analytics

---

**Ready to go!** Start with `/presentations` page to test the integration.

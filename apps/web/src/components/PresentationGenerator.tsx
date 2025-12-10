'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';
import { Loader2 } from 'lucide-react';

interface PresentationGeneratorProps {
  onGenerationComplete?: (result: { presentationId: string; editPath: string }) => void;
  projectId?: string;
}

export function PresentationGenerator({ onGenerationComplete, projectId }: PresentationGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    content: '',
    n_slides: 8,
    language: 'English',
    template: 'general',
    tone: 'professional' as const,
    verbosity: 'standard' as const,
    export_as: 'pptx' as const,
  });

  async function handleGenerate() {
    setError(null);
    setSuccess(false);

    if (!formData.content.trim()) {
      setError('Please enter a presentation topic or content');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/presentations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: formData.content,
          n_slides: parseInt(formData.n_slides.toString()),
          language: formData.language,
          template: formData.template,
          tone: formData.tone,
          verbosity: formData.verbosity,
          export_as: formData.export_as,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate presentation');
      }

      const data = await response.json();

      setSuccess(true);
      setFormData({ ...formData, content: '' });

      if (onGenerationComplete) {
        onGenerationComplete({
          presentationId: data.presentation_id,
          editPath: data.edit_path,
        });
      }

      // Redirect to presentation editor after a short delay
      setTimeout(() => {
        window.location.href = `http://localhost:5000${data.edit_path}`;
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating the presentation');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Label htmlFor="content" className="text-base font-semibold">
          Presentation Topic or Content
        </Label>
        <textarea
          id="content"
          placeholder="Enter your presentation topic, outline, or full content..."
          className="w-full min-h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="slides">Number of Slides</Label>
          <Input
            id="slides"
            type="number"
            min="1"
            max="50"
            value={formData.n_slides}
            onChange={(e) => setFormData({ ...formData, n_slides: parseInt(e.target.value) || 8 })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <select
            id="tone"
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="casual">Casual</option>
            <option value="professional">Professional</option>
            <option value="funny">Funny</option>
            <option value="educational">Educational</option>
            <option value="sales_pitch">Sales Pitch</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            placeholder="e.g., English, Spanish, French"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="verbosity">Verbosity</Label>
          <select
            id="verbosity"
            value={formData.verbosity}
            onChange={(e) => setFormData({ ...formData, verbosity: e.target.value as any })}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="concise">Concise</option>
            <option value="standard">Standard</option>
            <option value="text-heavy">Text Heavy</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="template">Template</Label>
          <Input
            id="template"
            placeholder="e.g., general, minimalist"
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="export">Export Format</Label>
          <select
            id="export"
            value={formData.export_as}
            onChange={(e) => setFormData({ ...formData, export_as: e.target.value as any })}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pptx">PowerPoint (PPTX)</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Presentation generated successfully! Redirecting to editor...
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={loading || !formData.content.trim()}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate Presentation'
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Presentations are generated using AI. Make sure Presenton service is running on localhost:5000
      </p>
    </div>
  );
}

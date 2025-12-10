/**
 * Presenton API wrapper for AI presentation generation
 * Provides type-safe interface to communicate with Presenton service
 */

export interface PresentationRequest {
  content: string;
  n_slides?: number;
  language?: string;
  template?: string;
  tone?: 'default' | 'casual' | 'professional' | 'funny' | 'educational' | 'sales_pitch';
  verbosity?: 'concise' | 'standard' | 'text-heavy';
  export_as?: 'pptx' | 'pdf';
  web_search?: boolean;
  include_title_slide?: boolean;
  include_table_of_contents?: boolean;
}

export interface PresentationResponse {
  presentation_id: string;
  path: string;
  edit_path: string;
}

export interface PrestonErrorResponse {
  error: string;
  details?: string;
}

/**
 * Get the Presenton API URL from environment or use default
 */
function getPrestontonApiUrl(): string {
  // In Next.js API routes, server-side env vars are available
  // Default to localhost for development
  return 'http://localhost:5000';
}

/**
 * Generate a presentation using Presenton API
 * @param request - Presentation generation request parameters
 * @returns Promise with presentation ID and paths
 */
export async function generatePresentation(
  request: PresentationRequest
): Promise<PresentationResponse> {
  // Set sensible defaults
  const payload = {
    content: request.content,
    n_slides: request.n_slides || 8,
    language: request.language || 'English',
    template: request.template || 'general',
    tone: request.tone || 'default',
    verbosity: request.verbosity || 'standard',
    export_as: request.export_as || 'pptx',
    web_search: request.web_search || false,
    include_title_slide: request.include_title_slide !== false,
    include_table_of_contents: request.include_table_of_contents || false,
  };

  const apiUrl = getPrestontonApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/v1/ppt/presentation/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as PrestonErrorResponse;
      throw new Error(`Presenton API error: ${errorData.error || response.statusText}`);
    }

    return await response.json() as PresentationResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate presentation: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check if Presenton service is available
 */
export async function checkPrestontonHealth(): Promise<boolean> {
  const apiUrl = getPrestontonApiUrl();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get available templates from Presenton
 */
export async function getAvailableTemplates(): Promise<string[]> {
  const apiUrl = getPrestontonApiUrl();
  try {
    const response = await fetch(`${apiUrl}/api/v1/templates`, {
      method: 'GET',
    });

    if (!response.ok) {
      return ['general']; // Fallback to default template
    }

    const data = (await response.json()) as { templates: string[] };
    return data.templates;
  } catch {
    return ['general']; // Fallback to default template
  }
}

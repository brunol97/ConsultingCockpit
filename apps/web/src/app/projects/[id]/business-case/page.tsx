'use client';

import { useState, useEffect } from 'react';
import { useRequireSession } from '@/hooks/useRequireSession';
import { BusinessCaseEditor } from '@/components/BusinessCaseEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download } from 'lucide-react';
import Link from 'next/link';

interface BusinessCasePageProps {
  params: {
    id: string;
  };
}

export default function BusinessCasePage({ params }: BusinessCasePageProps) {
  const { user, loading } = useRequireSession();
  const [businessCaseData, setBusinessCaseData] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Fetch business case data on mount
  useEffect(() => {
    async function fetchBusinessCase() {
      try {
        // This would be replaced with actual API call to your database
        // const response = await fetch(`/api/business-cases/${params.id}`);
        // const data = await response.json();
        // setBusinessCaseData(data.workbook_data);
        
        // For now, start with empty
        setBusinessCaseData(undefined);
      } catch (error) {
        console.error('Error fetching business case:', error);
      }
    }

    if (user) {
      fetchBusinessCase();
    }
  }, [user, params.id]);

  const handleSave = async (data: string) => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      // This would be replaced with actual API call to your database
      // const response = await fetch(`/api/business-cases/${params.id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ workbook_data: data }),
      // });

      // if (!response.ok) throw new Error('Failed to save');

      setSaveMessage('✓ Changes saved successfully');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving business case:', error);
      setSaveMessage('✗ Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([businessCaseData || '{}'], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `business-case-${params.id}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${params.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Case</h1>
            <p className="text-sm text-gray-600">ID: {params.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveMessage && (
            <span className={`text-sm font-medium ${
              saveMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'
            }`}>
              {saveMessage}
            </span>
          )}
          
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            disabled={isSaving}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 overflow-hidden">
        <BusinessCaseEditor
          businessCaseId={params.id}
          workbookData={businessCaseData}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

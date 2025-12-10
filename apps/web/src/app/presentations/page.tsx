'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireSession } from '@/hooks/useRequireSession';
import { PresentationGenerator } from '@/components/PresentationGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function PresentationsPage() {
  const router = useRouter();
  const { user, loading } = useRequireSession();
  const [activeTab, setActiveTab] = useState('create');

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

  const handleGenerationComplete = (result: { presentationId: string; editPath: string }) => {
    console.log('Presentation generated:', result);
    // You can add additional logic here, like logging the generation or updating a database
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Presentation Decks</h1>
          <p className="text-gray-600">Create and manage AI-powered presentations</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="browse">My Presentations</TabsTrigger>
          </TabsList>

          {/* Create Tab */}
          <TabsContent value="create" className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate New Presentation</h2>
              <PresentationGenerator onGenerationComplete={handleGenerationComplete} />
            </div>
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Presentations</h2>

              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No presentations yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first presentation using the AI generator above.
                </p>
                <Button
                  onClick={() => setActiveTab('create')}
                  className="px-6 py-2"
                >
                  Create Presentation
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">⚡ Fast Generation</h3>
            <p className="text-sm text-gray-600">
              Generate professional presentations in minutes using AI
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">✨ Customizable</h3>
            <p className="text-sm text-gray-600">
              Control tone, style, number of slides, and more
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">📥 Easy Export</h3>
            <p className="text-sm text-gray-600">
              Download as PowerPoint or PDF for easy sharing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

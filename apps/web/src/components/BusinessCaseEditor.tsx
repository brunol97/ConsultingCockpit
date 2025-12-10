'use client';

import { useEffect, useRef } from 'react';
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreEnUS from '@univerjs/preset-sheets-core/locales/en-US';
import '@univerjs/preset-sheets-core/lib/index.css';

interface BusinessCaseEditorProps {
  workbookData?: string;
  onSave?: (data: string) => void;
  businessCaseId?: string;
}

export function BusinessCaseEditor({
  workbookData,
  onSave,
  businessCaseId,
}: BusinessCaseEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a unique container ID for this editor instance
    const containerId = `univer-sheet-${businessCaseId || 'default'}`;
    containerRef.current.id = containerId;

    // Initialize Univer
    const { univer, univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: mergeLocales(UniverPresetSheetsCoreEnUS),
      },
      presets: [
        UniverSheetsCorePreset({
          container: containerId,
        }),
      ],
    });

    univerInstanceRef.current = { univer, univerAPI };

    // Create initial workbook if no data provided
    if (!workbookData) {
      univerAPI.createWorkbook({
        sheets: [
          {
            id: 'sheet1',
            name: 'Financial Model',
            cellData: {
              '0_0': { v: 'Year' },
              '0_1': { v: 'Revenue' },
              '0_2': { v: 'Costs' },
              '0_3': { v: 'Profit' },
            },
          },
        ],
      });
    }

    // Cleanup function
    return () => {
      if (univerInstanceRef.current?.univer) {
        univerInstanceRef.current.univer.dispose();
        univerInstanceRef.current = null;
      }
    };
  }, [businessCaseId]);

  const handleSave = () => {
    if (univerInstanceRef.current?.univerAPI && onSave) {
      // Get workbook snapshot for saving
      const workbook = univerInstanceRef.current.univerAPI.getActiveWorkbook();
      if (workbook) {
        const data = JSON.stringify(workbook.save());
        onSave(data);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-gray-100 border-b border-gray-200 p-3 flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Save Changes
        </button>
        <p className="text-gray-600 text-sm ml-auto">
          {businessCaseId ? `Business Case ID: ${businessCaseId}` : 'New Business Case'}
        </p>
      </div>

      {/* Univer Editor Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{
          height: 'calc(100% - 60px)',
        }}
      />
    </div>
  );
}

import React from 'react';

export const TimetableExportButton = ({ termId, onExport }: { termId?: string; onExport: (format: 'csv' | 'json') => void }) => {
  return (
    <div className="relative inline-block text-left group">
      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded border hover:bg-gray-200">
        Export
      </button>
      <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg hidden group-hover:block z-10">
        <button 
          onClick={() => onExport('csv')} 
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Export CSV
        </button>
        <button 
          onClick={() => onExport('json')} 
          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
};

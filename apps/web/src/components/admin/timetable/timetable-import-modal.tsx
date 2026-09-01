import React, { useState } from 'react';

export const TimetableImportModal = ({ isOpen, onClose, onImport }: { isOpen: boolean; onClose: () => void; onImport: (file: File) => void }) => {
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Import Timetable (CSV)</h2>
        <input 
          type="file" 
          accept=".csv" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">Cancel</button>
          <button 
            onClick={() => { if (file) { onImport(file); onClose(); } }} 
            disabled={!file}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

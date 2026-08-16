'use client';
import React from 'react';
import {
  FileText,
  Download,
  Eye,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

const documents = [
  {
    id: 1,
    name: '10th Grade Marksheet',
    type: 'PDF',
    size: '2.4 MB',
    status: 'Verified',
    date: 'Aug 12, 2024',
  },
  {
    id: 2,
    name: '12th Grade Marksheet',
    type: 'PDF',
    size: '3.1 MB',
    status: 'Verified',
    date: 'Aug 12, 2024',
  },
  {
    id: 3,
    name: 'Transfer Certificate',
    type: 'Image',
    size: '1.2 MB',
    status: 'Pending',
    date: 'Aug 15, 2024',
  },
  {
    id: 4,
    name: 'Government ID Proof',
    type: 'PDF',
    size: '4.5 MB',
    status: 'Rejected',
    date: 'Aug 16, 2024',
  },
];

export function DocumentsTab() {
  return (
    <div className="flex flex-col gap-6">
      {/* Upload Zone */}
      <div className="border-border bg-card hover:bg-muted/50 group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors">
        <div className="bg-primary/10 mb-4 rounded-full p-4 transition-transform group-hover:scale-110">
          <UploadCloud className="text-primary h-8 w-8" />
        </div>
        <h3 className="text-foreground mb-1 text-lg font-semibold">Upload New Document</h3>
        <p className="text-muted-foreground max-w-md text-sm">
          Drag and drop files here or click to browse. Supported formats: PDF, JPG, PNG (Max 10MB).
        </p>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-card border-border group flex flex-col gap-4 rounded-xl border p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-lg p-2.5">
                  <FileText className="text-muted-foreground h-6 w-6" />
                </div>
                <div>
                  <h4
                    className="text-foreground line-clamp-1 text-sm font-semibold"
                    title={doc.name}
                  >
                    {doc.name}
                  </h4>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-border mt-2 flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-1.5">
                {doc.status === 'Verified' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {doc.status === 'Pending' && <Clock className="h-4 w-4 text-orange-500" />}
                {doc.status === 'Rejected' && <AlertCircle className="h-4 w-4 text-red-500" />}

                <span
                  className={`text-xs font-medium ${
                    doc.status === 'Verified'
                      ? 'text-green-600 dark:text-green-400'
                      : doc.status === 'Pending'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  className="hover:bg-muted text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

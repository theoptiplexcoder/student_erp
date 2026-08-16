import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Badge } from '@student-erp/ui';
import { FileText, Download, Upload, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function DocumentsPage() {
  const documents = [
    {
      id: 1,
      name: 'High School Marksheet',
      type: 'Academic',
      date: 'Aug 15, 2021',
      status: 'VERIFIED',
    },
    {
      id: 2,
      name: 'Identity Proof (Aadhar)',
      type: 'Identity',
      date: 'Aug 15, 2021',
      status: 'VERIFIED',
    },
    {
      id: 3,
      name: 'Medical Certificate',
      type: 'Admission',
      date: 'Sep 10, 2023',
      status: 'PENDING',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="mr-1 h-4 w-4 text-orange-500" />;
      case 'REJECTED':
        return <XCircle className="mr-1 h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage your uploaded academic and identity documents.
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" /> Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base leading-tight">{doc.name}</CardTitle>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant="outline">{doc.type}</Badge>
                <div className="flex items-center text-xs font-medium">
                  {getStatusIcon(doc.status)}
                  <span
                    className={
                      doc.status === 'VERIFIED'
                        ? 'text-green-600'
                        : doc.status === 'PENDING'
                          ? 'text-orange-600'
                          : 'text-red-600'
                    }
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4" /> Uploaded on {doc.date}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Badge } from '@student-erp/ui';
import { FileText, Download, Plus, Clock } from 'lucide-react';

export default function CertificatesPage() {
  const mockCertificates = [
    {
      id: 1,
      type: 'Bonafide Certificate',
      requestedOn: 'Oct 10, 2023',
      status: 'ISSUED',
      fileUrl: '#',
    },
    {
      id: 2,
      type: 'Fee Receipt (Fall 2023)',
      requestedOn: 'Sep 01, 2023',
      status: 'ISSUED',
      fileUrl: '#',
    },
    {
      id: 3,
      type: 'Migration Certificate',
      requestedOn: 'Oct 15, 2023',
      status: 'PROCESSING',
      fileUrl: null,
    },
  ];

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground mt-1">
            Request and download your official documents.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Request Certificate
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCertificates.map((cert) => (
          <Card key={cert.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{cert.type}</CardTitle>
                <Badge variant={cert.status === 'ISSUED' ? 'default' : 'secondary'}>
                  {cert.status}
                </Badge>
              </div>
              <CardDescription className="mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Requested: {cert.requestedOn}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="bg-muted flex items-center justify-center rounded-md border border-dashed p-6">
                <FileText
                  className={`h-10 w-10 ${cert.status === 'ISSUED' ? 'text-primary' : 'text-muted-foreground opacity-30'}`}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant={cert.status === 'ISSUED' ? 'outline' : 'ghost'}
                className="w-full"
                disabled={cert.status !== 'ISSUED'}
              >
                {cert.status === 'ISSUED' ? (
                  <>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </>
                ) : (
                  'Processing...'
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

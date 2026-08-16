import React from 'react';
import { currentStudent } from '@/lib/mock/student/data';
import { Avatar, AvatarFallback, AvatarImage, Button, Card, CardContent } from '@student-erp/ui';
import { Badge } from '@student-erp/ui';
import { Edit2, MapPin, Mail, Phone } from 'lucide-react';

export function ProfileBanner() {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="from-primary/20 via-primary/40 to-primary/20 h-32 bg-gradient-to-r md:h-48"></div>
      <CardContent className="relative px-6 pt-0 pb-6 sm:px-10">
        <div className="-mt-16 mb-6 flex flex-col items-center gap-6 sm:-mt-20 sm:flex-row sm:items-end sm:gap-8">
          <Avatar className="border-background h-32 w-32 border-4 shadow-lg">
            <AvatarImage src={currentStudent.avatarUrl} alt={currentStudent.name} />
            <AvatarFallback className="text-4xl">{currentStudent.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="mb-2 flex-1 text-center sm:text-left">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <h1 className="font-display text-3xl font-bold">{currentStudent.name}</h1>
              <Badge variant="secondary" className="mx-auto w-fit sm:mx-0">
                {currentStudent.id}
              </Badge>
              <Badge variant="default" className="mx-auto w-fit sm:mx-0">
                {currentStudent.status}
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium">
              {currentStudent.program} • {currentStudent.department}
            </p>
          </div>

          <div className="mb-2">
            <Button>
              <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>

        <div className="border-border grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-3">
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentStudent.email}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{currentStudent.contact.phone}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentStudent.contact.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

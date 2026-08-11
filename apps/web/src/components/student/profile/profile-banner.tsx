import React from "react";
import { currentStudent } from "@/lib/mock/student/data";
import { Avatar, AvatarFallback, AvatarImage, Button, Card, CardContent } from "@student-erp/ui";
import { Badge } from "@student-erp/ui";
import { Edit2, MapPin, Mail, Phone } from "lucide-react";

export function ProfileBanner() {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"></div>
      <CardContent className="relative px-6 pb-6 pt-0 sm:px-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 -mt-16 sm:-mt-20 mb-6">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
            <AvatarImage src={currentStudent.avatarUrl} alt={currentStudent.name} />
            <AvatarFallback className="text-4xl">{currentStudent.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-3xl font-display font-bold">{currentStudent.name}</h1>
              <Badge variant="secondary" className="w-fit mx-auto sm:mx-0">{currentStudent.id}</Badge>
              <Badge variant="default" className="w-fit mx-auto sm:mx-0">{currentStudent.status}</Badge>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentStudent.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{currentStudent.contact.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{currentStudent.contact.address}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

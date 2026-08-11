import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@student-erp/ui";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@student-erp/ui";
import { Button } from "@student-erp/ui";
import { Badge } from "@student-erp/ui";
import { Users, Code, Cpu, Palette } from "lucide-react";

export default function ClubsPage() {
  const myClubs = [
    { id: 1, name: "Coding Club", icon: Code, role: "Member", members: 120, description: "Official programming and algorithmic club." },
  ];

  const availableClubs = [
    { id: 2, name: "Robotics Society", icon: Cpu, members: 85, description: "Build and program robots for competitions." },
    { id: 3, name: "Design & Arts", icon: Palette, members: 200, description: "Creative minds exploring UI/UX and digital art." }
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Clubs & Societies</h1>
        <p className="text-muted-foreground mt-1">Discover and join campus communities.</p>
      </div>
      
      <Tabs defaultValue="my-clubs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
          <TabsTrigger value="available">Available Clubs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-clubs" className="mt-6">
          {myClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myClubs.map(club => (
                <Card key={club.id}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                      <club.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{club.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="default">{club.role}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Users className="h-3 w-3 mr-1" /> {club.members} Members
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{club.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Activity</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>You haven't joined any clubs yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableClubs.map(club => (
              <Card key={club.id}>
                <CardHeader>
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <club.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl">{club.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Users className="h-3 w-3 mr-1" /> {club.members} Members
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{club.description}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Join Club</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

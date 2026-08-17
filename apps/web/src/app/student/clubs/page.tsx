'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@student-erp/ui';
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
import { Users, Code, Cpu, Palette } from 'lucide-react';
import { useStudentClubs } from '@student-erp/hooks';

export default function ClubsPage() {
  const { data, isPending } = useStudentClubs();

  const myClubs = data?.myMemberships || [];
  const availableClubs = data?.availableClubs || [];

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6 pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Clubs & Societies</h1>
        <p className="text-muted-foreground mt-1">Discover and join campus communities.</p>
      </div>

      <Tabs defaultValue="my-clubs" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
          <TabsTrigger value="available">Available Clubs</TabsTrigger>
        </TabsList>

        <TabsContent value="my-clubs" className="mt-6">
          {isPending ? (
            <div className="text-muted-foreground mt-10 text-center">Loading clubs...</div>
          ) : myClubs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myClubs.map((membership: any) => {
                const club = membership.club;
                return (
                  <Card key={membership.id}>
                    <CardHeader>
                      <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                        <Users className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{club.name}</CardTitle>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="default">{membership.role}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{club.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Activity
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed py-12 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 opacity-20" />
              <p>You haven't joined any clubs yet.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          {isPending ? (
            <div className="text-muted-foreground mt-10 text-center">Loading clubs...</div>
          ) : availableClubs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableClubs.map((club: any) => (
                <Card key={club.id}>
                  <CardHeader>
                    <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                      <Users className="text-muted-foreground h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{club.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Join Club</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed py-12 text-center">
              <p>No more clubs available to join.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

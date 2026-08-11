import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@student-erp/ui";
import { Button } from "@student-erp/ui";
import { MessageSquare, MessageCircle, Clock, Plus } from "lucide-react";

export default function ForumsPage() {
  const threads = [
    { id: 1, title: "Question about the Mid-Term Syllabus", course: "CS301", author: "Priya Sharma", replies: 5, time: "2 hours ago" },
    { id: 2, title: "Project Group Search - Team of 3", course: "CS302", author: "Rahul Kumar", replies: 12, time: "1 day ago" },
    { id: 3, title: "Help with graph algorithm implementation", course: "CS301", author: "Alex Johnson", replies: 2, time: "3 days ago" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Academic Forums</h1>
          <p className="text-muted-foreground mt-1">Discuss course topics and find project partners.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Discussion
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {threads.map(thread => (
          <Card key={thread.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row p-6 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 text-xs font-medium text-primary">
                  <span>{thread.course}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Posted by {thread.author}</span>
                </div>
                <h3 className="text-lg font-semibold">{thread.title}</h3>
              </div>
              
              <div className="flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-4 min-w-[120px] text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> {thread.replies} replies
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" /> {thread.time}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

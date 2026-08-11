import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@student-erp/ui"
import { Users, UserPlus, FileText, CalendarCheck, FileCheck2, Clock, Plus, BookOpen, Layers } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Institution overview and administrative operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-admin-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
            <Users className="h-4 w-4 text-admin-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground">+180 from last year</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-admin-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Faculty</CardTitle>
            <BookOpen className="h-4 w-4 text-admin-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145</div>
            <p className="text-xs text-muted-foreground">Across 8 departments</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-admin-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Admissions</CardTitle>
            <UserPlus className="h-4 w-4 text-admin-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">432</div>
            <p className="text-xs text-muted-foreground">12 require urgent review</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Issues</CardTitle>
            <CalendarCheck className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">Students below 75% threshold</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="w-full justify-start text-left border-border hover:border-admin-primary hover:text-admin-primary">
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
            <Button variant="outline" className="w-full justify-start text-left border-border hover:border-admin-primary hover:text-admin-primary">
              <UserPlus className="mr-2 h-4 w-4" /> Add Faculty
            </Button>
            <Button variant="outline" className="w-full justify-start text-left border-border hover:border-admin-primary hover:text-admin-primary">
              <Layers className="mr-2 h-4 w-4" /> Create Course
            </Button>
            <Button variant="outline" className="w-full justify-start text-left border-border hover:border-admin-primary hover:text-admin-primary">
              <FileCheck2 className="mr-2 h-4 w-4" /> Create Exam
            </Button>
            <Button variant="outline" className="w-full justify-start text-left border-border hover:border-admin-primary hover:text-admin-primary">
              <FileText className="mr-2 h-4 w-4" /> Publish Announcement
            </Button>
          </CardContent>
        </Card>

        {/* Overview Panels */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest administrative actions across the institution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { icon: UserPlus, text: "Admission approved for Application #A-1024", time: "10 minutes ago" },
                { icon: BookOpen, text: "Faculty Dr. Smith assigned to course CS301", time: "1 hour ago" },
                { icon: FileCheck2, text: "Midterm results published for Engineering Batch 2025", time: "3 hours ago" },
                { icon: CalendarCheck, text: "Attendance warning generated for 5 students", time: "5 hours ago" },
                { icon: Clock, text: "User role 'Academic Admin' assigned to J. Doe", time: "Yesterday" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="bg-admin-accent p-2 rounded-full text-admin-accent-foreground">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.text}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Admissions Pipeline</CardTitle>
            <CardDescription>Current year admission statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm">Submitted Applications</span>
                <span className="font-medium">1,250</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm">Under Review</span>
                <span className="font-medium">432</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm">Offers Extended</span>
                <span className="font-medium">680</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-sm">Accepted & Enrolled</span>
                <span className="font-medium text-admin-primary">450</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Examinations</CardTitle>
            <CardDescription>Exams scheduled for the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="text-sm font-medium">Midterm - Computer Science</div>
                  <div className="text-xs text-muted-foreground">Oct 15, 2026 • 2nd Year Batch</div>
                </div>
                <div className="text-sm text-admin-primary bg-admin-primary/10 px-2 py-1 rounded">Ready</div>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="text-sm font-medium">Final Lab - Electrical Eng</div>
                  <div className="text-xs text-muted-foreground">Oct 18, 2026 • 4th Year Batch</div>
                </div>
                <div className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded dark:bg-amber-900/30 dark:text-amber-500">Draft</div>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="text-sm font-medium">Theory Exam - Business Admin</div>
                  <div className="text-xs text-muted-foreground">Oct 20, 2026 • 1st Year Batch</div>
                </div>
                <div className="text-sm text-admin-primary bg-admin-primary/10 px-2 py-1 rounded">Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

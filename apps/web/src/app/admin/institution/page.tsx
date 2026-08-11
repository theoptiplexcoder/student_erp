import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@student-erp/ui"

export default function InstitutionPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Institution</h1>
          <p className="text-muted-foreground mt-1">Manage institution profile, departments, and academic years.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Institution Profile</CardTitle>
            <CardDescription>Manage general institution details and branding.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Configure academic and administrative departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Manage Departments</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Programs</CardTitle>
            <CardDescription>Manage degree programs and certifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Manage Programs</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Academic Year</CardTitle>
            <CardDescription>Configure terms, semesters, and holidays.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Academic Calendar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

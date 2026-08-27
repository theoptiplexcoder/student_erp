'use client';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@student-erp/ui';
import { BookMarked, Plus, Calendar as CalIcon, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useAcademicTerms } from '@/hooks/api/admin/useAcademicTerms';
import { useState, use } from 'react';

export default function AcademicYearDetails(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { id: academicYearId } = params;
  const {
    data: terms,
    isLoading,
    createTerm,
    updateTerm,
    deleteTerm,
  } = useAcademicTerms(academicYearId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTerm, setNewTerm] = useState({
    name: '',
    code: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING',
  });
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editTermData, setEditTermData] = useState({
    name: '',
    code: '',
    startDate: '',
    endDate: '',
    status: 'UPCOMING',
  });

  const handleAddTerm = async () => {
    if (!newTerm.name || !newTerm.startDate || !newTerm.endDate) return;
    await createTerm({
      ...newTerm,
      code: newTerm.code || newTerm.name.toUpperCase().substring(0, 4),
      termType: 'SEMESTER',
    });
    setShowAddForm(false);
    setNewTerm({ name: '', code: '', startDate: '', endDate: '', status: 'UPCOMING' });
  };

  const handleUpdateTerm = async () => {
    if (!editTermData.name || !editTermData.startDate || !editTermData.endDate || !editingTermId)
      return;
    await updateTerm({
      termId: editingTermId,
      name: editTermData.name,
      code: editTermData.code,
      startDate: editTermData.startDate,
      endDate: editTermData.endDate,
      status: editTermData.status,
    });
    setEditingTermId(null);
  };

  const startEditing = (term: any) => {
    setEditingTermId(term.id);
    setEditTermData({
      name: term.name,
      code: term.code,
      startDate: term.startDate ? new Date(term.startDate).toISOString().split('T')[0] : '',
      endDate: term.endDate ? new Date(term.endDate).toISOString().split('T')[0] : '',
      status: term.status,
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/administration/institution/academic-year">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <BookMarked className="h-8 w-8 text-emerald-600" /> Academic Terms
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage academic terms and dates for this year.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Terms List</h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex h-10 items-center gap-2 rounded-full bg-emerald-600 px-6 text-white shadow-lg transition-all hover:bg-emerald-700 hover:shadow-xl"
        >
          <Plus className="h-4 w-4" /> Add Term
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="space-y-4 p-6">
            <h3 className="font-semibold">Add New Term</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Term Name</label>
                <Input
                  placeholder="e.g. Fall 2024"
                  value={newTerm.name}
                  onChange={(e) => setNewTerm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Code (Optional)</label>
                <Input
                  placeholder="e.g. FA24"
                  value={newTerm.code}
                  onChange={(e) => setNewTerm((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newTerm.startDate}
                  onChange={(e) => setNewTerm((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={newTerm.endDate}
                  onChange={(e) => setNewTerm((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={newTerm.status}
                  onChange={(e) => setNewTerm((prev) => ({ ...prev, status: e.target.value }))}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddTerm}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Save Term
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-muted-foreground py-8 text-center">Loading terms...</div>
        ) : !terms || terms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                No terms configured for this academic year.
              </p>
              <Button variant="outline" onClick={() => setShowAddForm(true)}>
                Add your first term
              </Button>
            </CardContent>
          </Card>
        ) : (
          terms.map((term: any) => (
            <Card key={term.id} className="group overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-6">
                {editingTermId === term.id ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Edit Term</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Term Name</label>
                        <Input
                          placeholder="e.g. Fall 2024"
                          value={editTermData.name}
                          onChange={(e) =>
                            setEditTermData((prev) => ({ ...prev, name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Code (Optional)</label>
                        <Input
                          placeholder="e.g. FA24"
                          value={editTermData.code}
                          onChange={(e) =>
                            setEditTermData((prev) => ({ ...prev, code: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          value={editTermData.startDate}
                          onChange={(e) =>
                            setEditTermData((prev) => ({ ...prev, startDate: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Input
                          type="date"
                          value={editTermData.endDate}
                          onChange={(e) =>
                            setEditTermData((prev) => ({ ...prev, endDate: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <select
                          value={editTermData.status}
                          onChange={(e) =>
                            setEditTermData((prev) => ({ ...prev, status: e.target.value }))
                          }
                          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                          <option value="UPCOMING">Upcoming</option>
                          <option value="ACTIVE">Active</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="outline" onClick={() => setEditingTermId(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateTerm}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                        {term.name}{' '}
                        <span className="text-muted-foreground text-sm font-normal">
                          ({term.code})
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            term.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : term.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {term.status}
                        </span>
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <CalIcon className="h-4 w-4" />
                        <span>
                          {new Date(term.startDate).toLocaleDateString()} to{' '}
                          {new Date(term.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-accent hover:text-accent-foreground"
                        onClick={() => startEditing(term)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this term?')) {
                            deleteTerm(term.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

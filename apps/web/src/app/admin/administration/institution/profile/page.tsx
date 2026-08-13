'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Input } from '@student-erp/ui';
import { Label } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { motion } from 'framer-motion';
import { Save, Building2 } from 'lucide-react';

export default function InstitutionProfile() {
  const [profile, setProfile] = useState<any>({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient
      .get('/admin/institution/profile')
      .then((res) => setProfile(res.data || { name: '', email: '', phone: '', address: '' }))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.post('/admin/institution/profile', profile);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <Building2 className="h-8 w-8 text-blue-600" /> Profile
        </h1>
        <p className="text-muted-foreground mt-2">Update your institution's core details.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 bg-white shadow-lg dark:bg-gray-900">
          <CardHeader className="border-b bg-gray-50/50 pb-4 dark:bg-gray-800/50">
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 w-full rounded bg-gray-200"></div>
                <div className="h-10 w-full rounded bg-gray-200"></div>
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Institution Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="h-12"
                    placeholder="Acme University"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="h-12"
                      placeholder="admin@acme.edu"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="h-12"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="h-12"
                    placeholder="123 Education St."
                  />
                </div>

                <div className="flex justify-end border-t pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex h-12 items-center gap-2 rounded-full px-8 shadow-md transition-all hover:shadow-lg"
                  >
                    <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

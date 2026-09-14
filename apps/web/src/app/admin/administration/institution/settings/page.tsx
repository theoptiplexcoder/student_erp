'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Checkbox } from '@student-erp/ui';
import { Input } from '@student-erp/ui';
import { Label } from '@student-erp/ui';
import { motion } from 'framer-motion';
import { Save, Settings2, Clock, Check } from 'lucide-react';

export default function InstitutionSettings() {
  const [settings, setSettings] = useState<any>({
    enableAdmissions: true,
    autoApproval: false,
    notificationsEnabled: true,
    startTime: '08:00',
    closingTime: '17:00',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    apiClient
      .get('/admin/institution/settings')
      .then((res) => setSettings(res.data || settings))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await apiClient.post('/admin/institution/settings', settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save preferences', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
          <Settings2 className="h-8 w-8 text-gray-600" /> Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure institutional preferences and behaviors.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <CardTitle>System Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {!loading && (
              <>
                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Checkbox
                    id="admissions"
                    checked={settings.enableAdmissions}
                    onCheckedChange={(c) => setSettings({ ...settings, enableAdmissions: !!c })}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="admissions" className="cursor-pointer text-base font-semibold">
                      Enable Online Admissions
                    </Label>
                    <p className="text-sm text-gray-500">
                      Allow students to apply online through the portal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Checkbox
                    id="approval"
                    checked={settings.autoApproval}
                    onCheckedChange={(c) => setSettings({ ...settings, autoApproval: !!c })}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="approval" className="cursor-pointer text-base font-semibold">
                      Auto-Approve Applications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Automatically approve applications that meet minimum criteria.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                  <Checkbox
                    id="notifications"
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(c) => setSettings({ ...settings, notificationsEnabled: !!c })}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="notifications"
                      className="cursor-pointer text-base font-semibold"
                    >
                      System Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Send email and SMS alerts for important events.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg bg-gray-50 p-4 transition-colors dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <h3 className="text-base font-semibold">Operating Hours</h3>
                      <p className="text-sm text-gray-500">
                        Set the daily institution start and closing times.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="start-time" className="text-sm font-medium">
                        Institution Start Time
                      </Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={settings.startTime || '08:00'}
                        onChange={(e) => setSettings({ ...settings, startTime: e.target.value })}
                        className="h-10 bg-white dark:bg-gray-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="closing-time" className="text-sm font-medium">
                        Institution Closing Time
                      </Label>
                      <Input
                        id="closing-time"
                        type="time"
                        value={settings.closingTime || '17:00'}
                        onChange={(e) => setSettings({ ...settings, closingTime: e.target.value })}
                        className="h-10 bg-white dark:bg-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t pt-6">
                  {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4" /> Preferences saved
                    </span>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex h-11 items-center gap-2 rounded-full px-6 shadow hover:shadow-md"
                  >
                    <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

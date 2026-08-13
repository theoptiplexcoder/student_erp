'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '../../../../../lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { Checkbox } from '@student-erp/ui';
import { Label } from '@student-erp/ui';
import { motion } from 'framer-motion';
import { Save, Settings2 } from 'lucide-react';

export default function InstitutionSettings() {
  const [settings, setSettings] = useState<any>({
    enableAdmissions: true,
    autoApproval: false,
    notificationsEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/admin/institution/settings')
      .then((res) => setSettings(res.data || settings))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = () => {
    apiClient.post('/admin/institution/settings', settings);
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

                <div className="flex justify-end border-t pt-6">
                  <Button
                    onClick={handleSave}
                    className="flex h-11 items-center gap-2 rounded-full px-6 shadow hover:shadow-md"
                  >
                    <Save className="h-4 w-4" /> Save Preferences
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

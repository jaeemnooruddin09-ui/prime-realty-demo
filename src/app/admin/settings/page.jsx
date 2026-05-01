import { getSiteSettings } from '@/lib/settings';
import SettingsForm from '@/components/admin/SettingsForm';

export default function AdminSettings() {
  const settings = getSiteSettings();
  return (
    <>
      <h1 className="font-display text-3xl font-semibold text-navy-900">Settings</h1>
      <p className="text-navy-500 mt-1">Site-wide values used across the website. Changes appear immediately after saving.</p>
      <div className="mt-6">
        <SettingsForm initial={settings} />
      </div>
    </>
  );
}

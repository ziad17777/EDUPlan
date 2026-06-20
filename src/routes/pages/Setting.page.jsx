import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authedFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";

const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

export default function SettingPage() {
  const [values, setValues] = useState({
    notifications: "enabled",
    language: "en",
  });
  
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const onChange = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  
  const onPassChange = (key) => (e) => {
    setPasswords((p) => ({ ...p, [key]: e.target.value }));
    setPassError("");
    setPassSuccess("");
  };

  const onSaveSettings = () => {
    setSavingSettings(true);
    // persist to localStorage as example
    localStorage.setItem("eduplan_settings", JSON.stringify(values));
    setTimeout(() => {
      setSavingSettings(false);
      alert("Settings saved (simulated)");
    }, 500);
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!passwords.oldPassword || !passwords.newPassword || !passwords.newPasswordConfirm) {
      setPassError("All fields are required");
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      setPassError("New password must be at least 6 characters");
      return;
    }
    
    if (passwords.newPassword !== passwords.newPasswordConfirm) {
      setPassError("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    setPassError("");
    setPassSuccess("");

    try {
      const res = await authedFetch(`${API_BASE}/auth/change-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          old_password: passwords.oldPassword,
          new_password: passwords.newPassword,
          new_password_confirm: passwords.newPasswordConfirm,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        setPassSuccess("Password changed successfully");
        setPasswords({ oldPassword: "", newPassword: "", newPasswordConfirm: "" });
      } else {
        const errorMsg = data?.old_password?.[0] || data?.new_password?.[0] || data?.detail || data?.error || "Failed to change password";
        setPassError(errorMsg);
      }
    } catch (err) {
      setPassError("Network error. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-10">
      
      {/* General Settings */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2">General Settings</h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Language</label>
            <Input value={values.language} onChange={onChange("language")} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Notifications</label>
            <Input value={values.notifications} onChange={onChange("notifications")} />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={onSaveSettings} disabled={savingSettings}>
            {savingSettings ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Saving...</> : "Save Settings"}
          </Button>
        </div>
      </section>

      {/* Security */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2">Security</h2>
        
        <form onSubmit={onChangePassword} className="space-y-4 max-w-md">
          {passError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{passError}</div>}
          {passSuccess && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">{passSuccess}</div>}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Current Password</label>
            <Input 
              type="password" 
              value={passwords.oldPassword} 
              onChange={onPassChange("oldPassword")} 
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">New Password</label>
            <Input 
              type="password" 
              value={passwords.newPassword} 
              onChange={onPassChange("newPassword")} 
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Confirm New Password</label>
            <Input 
              type="password" 
              value={passwords.newPasswordConfirm} 
              onChange={onPassChange("newPasswordConfirm")} 
              placeholder="Confirm new password"
            />
          </div>

          <Button type="submit" disabled={savingPassword} variant="secondary" className="mt-2">
            {savingPassword ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Updating...</> : "Change Password"}
          </Button>
        </form>
      </section>

    </div>
  );
}

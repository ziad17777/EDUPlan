import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingPage() {
  const [values, setValues] = useState({
    notifications: true,
    language: "en",
  });

  const onChange = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const onSave = () => {
    // persist to localStorage as example
    localStorage.setItem("eduplan_settings", JSON.stringify(values));
    alert("Settings saved (simulated)");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-gray-600">Language</label>
          <Input value={values.language} onChange={onChange("language")} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Notifications</label>
          <Input value={values.notifications ? "enabled" : "disabled"} onChange={onChange("notifications")} />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  );
}

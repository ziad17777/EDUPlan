import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Ahmed Ziad",
    school: "Future University",
    email: "ahmed.ziad@example.com",
    avatar: "https://github.com/shadcn.png",
  });

  const onChange = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));

  const onSave = () => {
    // Replace with API call when backend is ready
    console.log("Saving profile", profile);
    alert("Profile saved (simulated)");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-6">
        <Avatar>
          <AvatarImage src={profile.avatar} />
          <AvatarFallback>{profile.name.split(" ")[0][0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{profile.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.school}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Full name</label>
          <Input value={profile.name} onChange={onChange("name")} />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">School</label>
          <Input value={profile.school} onChange={onChange("school")} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Email</label>
          <Input value={profile.email} onChange={onChange("email")} type="email" />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Button onClick={onSave}>Save</Button>
        <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
      </div>
    </div>
  );
}

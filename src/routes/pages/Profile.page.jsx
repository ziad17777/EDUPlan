import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { getStoredTokens, clearStoredTokens, authedFetch } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { Loader2, Camera, Trash2 } from 'lucide-react';

const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

export default function ProfilePage(){
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '', profile_picture_url: '', date_joined: '' });
  const auth = useAuth();
  const navigate = useNavigate();
  const picInputRef = useRef(null);

  // fetch profile from server on mount
  useEffect(()=>{
    const tokens = getStoredTokens();
    if (!tokens || !tokens.access) {
      navigate('/auth/signin');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await authedFetch(`${API_BASE}/auth/profile/`);
        if (res.status === 401) {
          clearStoredTokens();
          auth.signout?.();
          navigate('/auth/signin');
          return;
        }
        const data = await res.json().catch(() => null);
        if (res.ok && data) {
          setProfile({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            profile_picture_url: data.profile_picture_url || '',
            date_joined: data.date_joined || '',
          });
        } else {
          setError('Failed to load profile');
        }
      } catch (err) {
        setError('Network error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (key) => (e) => {
    setProfile((p) => ({ ...p, [key]: e.target.value }));
    setSuccess('');
  };

  const onSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await authedFetch(`${API_BASE}/auth/profile/update/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        if (data?.user) {
          setProfile((p) => ({ ...p, ...data.user }));
        }
      } else if (res.status === 401) {
        clearStoredTokens();
        navigate('/auth/signin');
      } else {
        setError(data?.detail || data?.error || 'Failed to update profile');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onUploadPicture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validate: JPEG/PNG, max 5MB
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Profile picture must be JPEG or PNG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile picture must be under 5 MB');
      return;
    }

    setUploadingPic(true);
    setError('');
    try {
      const form = new FormData();
      form.append('profile_picture', file);
      const res = await authedFetch(`${API_BASE}/auth/profile/picture/`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.user) {
        setProfile((p) => ({ ...p, profile_picture_url: data.user.profile_picture_url || '' }));
        setSuccess('Profile picture updated!');
      } else {
        setError(data?.detail || data?.error || 'Failed to upload picture');
      }
    } catch {
      setError('Network error uploading picture');
    } finally {
      setUploadingPic(false);
      e.target.value = null;
    }
  };

  const onDeletePicture = async () => {
    setError('');
    try {
      const res = await authedFetch(`${API_BASE}/auth/profile/picture/delete/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProfile((p) => ({ ...p, profile_picture_url: '' }));
        setSuccess('Profile picture removed.');
      } else if (res.status === 404) {
        setError('No profile picture to delete.');
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.detail || 'Failed to delete picture');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleLogout = async () => {
    await auth.signout?.();
    navigate('/auth/signin');
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="animate-spin h-6 w-6 text-primary" />
      <span className="ml-2 text-gray-500">Loading profile…</span>
    </div>
  );

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const initials = fullName ? fullName.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase() : 'U';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar className="h-16 w-16">
            {profile.profile_picture_url 
              ? <AvatarImage src={profile.profile_picture_url} /> 
              : <AvatarFallback className="text-lg">{initials}</AvatarFallback>}
          </Avatar>
          <button
            onClick={() => picInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            disabled={uploadingPic}
          >
            {uploadingPic ? <Loader2 className="animate-spin h-5 w-5 text-white" /> : <Camera className="h-5 w-5 text-white" />}
          </button>
          <input
            ref={picInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={onUploadPicture}
            className="hidden"
          />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{fullName || 'Your Name'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
          {profile.date_joined && (
            <p className="text-xs text-gray-400 dark:text-gray-500">Joined {new Date(profile.date_joined).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {error && <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
      {success && <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{success}</div>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">First Name</label>
          <Input value={profile.first_name} onChange={onChange('first_name')} />
        </div>
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">Last Name</label>
          <Input value={profile.last_name} onChange={onChange('last_name')} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">Email</label>
          <Input value={profile.email} type="email" disabled className="opacity-60" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={onSave} disabled={saving}>
          {saving ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Saving...</> : 'Save'}
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
        {profile.profile_picture_url && (
          <Button variant="ghost" size="sm" onClick={onDeletePicture} className="text-red-400 hover:text-red-500">
            <Trash2 className="h-4 w-4 mr-1" /> Remove Photo
          </Button>
        )}
        <div className="ml-auto">
          <Button variant="ghost" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </div>
  );
}

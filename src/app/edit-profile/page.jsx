'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '../components/Navbar';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Add state for field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    fullName: '',
    username: '',
    website: '',
    hourlyRate: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      setUser(session.user);
      await fetchUserProfile(session.user.id);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setFullName(data.full_name || '');
        setUsername(data.username || '');
        setCompany(data.company_name || '');
        setLocation(data.location || '');
        // Parse skills as array or initialize as empty array
        setSkills(data.skills ? (Array.isArray(data.skills) ? data.skills : [data.skills]) : []);
        setWebsite(data.website || '');
        setBio(data.bio || '');
        setHourlyRate(data.hourly_rate || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load your profile');
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Include user ID in the path for RLS
      const filePath = `${user.id}/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      // Get the public URL and log it
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      console.log("Generated image URL:", data.publicUrl);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const checkUsernameAvailability = async (username) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id) // Exclude current user
      .single();
    
    return !data; // Return true if username is available
  };

  const validateForm = () => {
    const errors = {};
    
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!username.trim()) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (website && !website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
      errors.website = 'Please enter a valid website URL';
    }
    
    if (hourlyRate && (isNaN(hourlyRate) || parseFloat(hourlyRate) < 0)) {
      errors.hourlyRate = 'Please enter a valid hourly rate';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null); // Clear previous errors
    
    try {
      // Validate required fields
      if (!fullName.trim() || !username.trim()) {
        throw new Error('Full name and username are required');
      }

      // Check username availability
      const isUsernameAvailable = await checkUsernameAvailability(username);
      if (!isUsernameAvailable) {
        throw new Error('Username is already taken');
      }

      // Validate website format if provided
      if (website && !website.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)) {
        throw new Error('Please enter a valid website URL');
      }

      const updates = {
        id: user.id,
        full_name: fullName.trim(),
        username: username.trim(),
        company_name: company.trim(),
        location: location.trim(),
        skills: skills.length > 0 ? skills : null, // Handle empty skills array
        website: website.trim(),
        bio: bio.trim(),
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(updates);

      if (upsertError) throw upsertError;
      
      router.push('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Error updating your profile');
      setSaving(false); // Allow resubmission
      return; // Prevent navigation
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <button 
            onClick={() => router.push('/profile')} 
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-white p-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden mb-4">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={fullName} 
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23666' d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {fullName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <label className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md cursor-pointer transition-colors">
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">
                Full Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setFieldErrors(prev => ({ ...prev, fullName: '' }));
                }}
                required
                className={`w-full bg-gray-800 border ${
                  fieldErrors.fullName ? 'border-red-500' : 'border-gray-700'
                } rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500`}
              />
              <FormError message={fieldErrors.fullName} />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">
                Username<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-gray-300 mb-2">
              Skills/Expertise
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
                <div 
                  key={index} 
                  className="bg-indigo-900/40 text-indigo-200 px-3 py-1 rounded-full flex items-center text-sm"
                >
                  {skill}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSkill(skill)} 
                    className="ml-2 text-indigo-300 hover:text-white"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a skill (e.g. Web Development)"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-l-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded-r-md flex items-center"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Hourly Rate ($)
            </label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              min="0"
              step="0.01"
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`${
                saving 
                  ? 'bg-indigo-800 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white py-2 px-6 rounded-md transition-colors`}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add this near the error display
const FormError = ({ message }) => message ? (
  <div className="text-red-400 text-sm mt-1">
    {message}
  </div>
) : null; 
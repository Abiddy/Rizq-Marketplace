import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileForm({ user, onClose, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    company_name: '',
    location: '',
    skills: '',
    bio: '',
    website: '',
    avatar_url: '',
    hourly_rate: 25,
    ...user
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    // Fetch existing profile data when component mounts
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          company_name: data.company_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          website: data.website || '',
          location: data.location || '',
          skills: data.skills || '',
          username: data.username || '',
          hourly_rate: data.hourly_rate || 25
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          ...formData,
          updated_at: new Date()
        });

      if (error) throw error;
      
      if (onProfileUpdate) {
        onProfileUpdate(formData);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      // Compress image if it's large
      let fileToUpload = file;
      if (file.size > 1000000) {
        // For large files, you might want to add compression
        // This is a placeholder for that logic
        console.log("Large file detected, consider compression");
      }
      
      // Upload the file
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile-images')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);
      
      console.log("Image uploaded successfully:", data.publicUrl);
      
      // Update the form with the new avatar URL
      setFormData({
        ...formData,
        avatar_url: data.publicUrl
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Error uploading image: ' + error.message);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="relative bg-black text-white rounded-lg p-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Close button in upper right */}
      <button 
        onClick={onClose}
        className="absolute right-2 top-2 text-gray-400 hover:text-white p-1"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="text-center mb-6">
        {/* Avatar upload area with improved styling */}
        <div className="relative mx-auto w-24 h-24 mb-4 group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/70">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
              <div className="absolute text-xs text-white">{uploadProgress}%</div>
            </div>
          )}
          
          <label className="block mt-2 text-indigo-400 text-sm hover:text-indigo-300 cursor-pointer transition-colors">
            {isUploading ? 'Uploading...' : 'Change Photo'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Full Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Username<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.username || ''}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. developerJohn"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Company / Organization
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Skills/Expertise
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Web Development, Design, Marketing"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="https://example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={4}
            placeholder="Tell us about yourself"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Hourly Rate ($)
          </label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={formData.hourly_rate || ''}
            onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
            className="w-full bg-[#121212] border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="25.00"
          />
        </div>
        
        <div className="mt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </div>
            ) : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
} 
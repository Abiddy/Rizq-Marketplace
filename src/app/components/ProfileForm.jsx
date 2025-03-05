import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileForm({ user, onClose, onProfileUpdate }) {
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    bio: '',
    avatar_url: '',
    website: '',
    location: '',
    skills: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
          skills: data.skills || ''
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
    
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      console.log("Image uploaded successfully:", data.publicUrl);
      
      // Update the form with the new avatar URL
      setFormData({
        ...formData,
        avatar_url: data.publicUrl
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#1E1E1E] rounded-lg p-6 max-w-2xl mx-auto"
    >
      <h2 className="text-xl font-bold text-white mb-6">Your Profile</h2>
      
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-700 overflow-hidden mb-3">
              {formData.avatar_url ? (
                <img 
                  src={formData.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>
            
            <label className="cursor-pointer text-indigo-400 hover:text-indigo-300 text-sm">
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
          
          <div className="md:w-2/3 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Full Name*
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
                required
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
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
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
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Skills/Expertise
          </label>
          <input
            type="text"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
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
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
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
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
            rows={4}
            placeholder="Tell us about yourself"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </motion.div>
  );
} 
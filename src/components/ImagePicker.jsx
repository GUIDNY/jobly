import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, ImageIcon } from 'lucide-react';

/**
 * ImagePicker — העלאת תמונה לSupabase Storage + fallback לURL ידני
 * @param {string} label
 * @param {string} value - כתובת URL הנוכחית
 * @param {function} onChange - נקרא עם ה-URL החדש
 * @param {'avatar'|'banner'} aspect - avatar=ריבוע, banner=מלבן רחב
 * @param {string} folder - תיקייה בbucket (e.g. bot_id or user_id)
 * @param {string} bucket - שם הbucket (ברירת מחדל: 'bot-images')
 */
export default function ImagePicker({ label, value, onChange, aspect = 'avatar', folder = 'general', bucket = 'bot-images' }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const isBanner = aspect === 'banner';

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${folder}/${aspect}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(publicUrl);
    } catch (e) {
      console.warn('upload error:', e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>}
      <div
        className={`relative overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-orange-400/50 transition-colors group ${isBanner ? 'h-32 w-full' : 'h-24 w-24'}`}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-orange-400 transition-colors">
            <ImageIcon size={isBanner ? 24 : 18} />
            <span className="text-xs mt-1">{isBanner ? 'לחץ להעלאה' : 'תמונה'}</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-900/70 text-white rounded-lg p-1">
            <Upload size={12} />
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="או הדבק URL של תמונה..."
        className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-orange-400/60"
      />
    </div>
  );
}

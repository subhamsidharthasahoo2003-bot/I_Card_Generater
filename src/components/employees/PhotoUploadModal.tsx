import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Employee } from '../../types/employee';
import { fileToDataUrl, formatGoogleDriveImageUrl, isRemotePhotoUrl } from '../../services/photoService';
import { Upload, Camera, Image as ImageIcon, Check, Link as LinkIcon, Cloud } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSavePhoto: (employeeId: string, photoUrl: string) => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSavePhoto
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [driveUrlInput, setDriveUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!employee) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const dataUrl = await fileToDataUrl(file);
      setPreviewUrl(dataUrl);
      setUrlError('');
    }
  };

  const handleApplyDriveUrl = () => {
    if (!driveUrlInput.trim()) return;
    if (!isRemotePhotoUrl(driveUrlInput)) {
      setUrlError('Please enter a valid Google Drive sharing link or image URL.');
      return;
    }

    const resolved = formatGoogleDriveImageUrl(driveUrlInput.trim());
    setPreviewUrl(resolved);
    setUrlError('');
  };

  const handleSave = () => {
    if (previewUrl) {
      onSavePhoto(employee.id, previewUrl);
      onClose();
      setPreviewUrl(null);
      setDriveUrlInput('');
      setUrlError('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setPreviewUrl(null);
        setDriveUrlInput('');
        setUrlError('');
      }}
      title="Update Employee Photo"
      subtitle={`Assign photo for ${employee.name}`}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Preview & File Upload Box */}
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl || employee.photoUrl ? (
            <div className="relative group">
              <img
                src={previewUrl || employee.photoUrl}
                alt="Employee Preview"
                className="w-32 h-40 object-cover rounded-xl border-2 border-indigo-500 shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-950/40 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-semibold"
              >
                <Camera className="w-5 h-5 mb-1" />
                Change Image
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-40 border border-slate-300 rounded-xl bg-white flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-500 hover:text-indigo-600 transition-colors shadow-2xs"
            >
              <ImageIcon className="w-8 h-8 mb-1" />
              <span className="text-xs font-semibold">Choose Photo</span>
              <span className="text-[10px] text-slate-400 mt-1">JPG, PNG, WEBP</span>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Browse Local File
            </button>
          </div>
        </div>

        {/* Option 1: Google Drive or Image URL Input */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Cloud className="w-4 h-4 text-orange-600" />
            <span>Or Paste Google Drive / Web Link:</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://drive.google.com/file/d/..."
                value={driveUrlInput}
                onChange={e => {
                  setDriveUrlInput(e.target.value);
                  setUrlError('');
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyDriveUrl}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              Load Link
            </button>
          </div>
          {urlError && <p className="text-[11px] text-red-600">{urlError}</p>}
          <p className="text-[10px] text-slate-400">
            Ensure your Google Drive sharing setting is set to "Anyone with the link can view".
          </p>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!previewUrl}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Save Photo
          </button>
        </div>
      </div>
    </Modal>
  );
};

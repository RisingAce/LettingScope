import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Camera, Upload, X, PlusCircle, Image as ImageIcon } from 'lucide-react';

interface Photo {
  id: string;
  dataUrl: string;
  caption: string;
  timestamp: string;
  roomId?: string;
  issueId?: string;
}

interface PhotoUploaderProps {
  onPhotoUpload: (photo: Photo) => void;
  roomId?: string;
  issueId?: string;
  className?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onPhotoUpload,
  roomId,
  issueId,
  className = ''
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => '_' + Math.random().toString(36).substring(2, 11);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const clearPreview = () => {
    setPreview(null);
    setCaption('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleUpload = () => {
    if (!preview) return;
    
    setIsUploading(true);
    
    const newPhoto: Photo = {
      id: generateId(),
      dataUrl: preview,
      caption,
      timestamp: new Date().toISOString(),
      roomId,
      issueId
    };
    
    // Simulate network delay
    setTimeout(() => {
      onPhotoUpload(newPhoto);
      clearPreview();
      setIsUploading(false);
    }, 500);
  };

  return (
    <div className={`photo-uploader ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      
      {!preview ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={triggerCameraInput} 
              variant="outline"
              className="h-20 border-dashed border-gold-400/50 hover:border-gold-400"
            >
              <div className="flex flex-col items-center">
                <Camera className="h-6 w-6 mb-1 text-gold-500" />
                <span className="text-sm">Take Photo</span>
              </div>
            </Button>
            <Button 
              onClick={triggerFileInput} 
              variant="outline"
              className="h-20 border-dashed border-gold-400/50 hover:border-gold-400"
            >
              <div className="flex flex-col items-center">
                <Upload className="h-6 w-6 mb-1 text-gold-500" />
                <span className="text-sm">Upload Photo</span>
              </div>
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-gold-400/30 overflow-hidden">
          <div className="relative">
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={clearPreview}
            >
              <X className="h-4 w-4" />
            </Button>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-cover"
            />
          </div>
          <CardContent className="p-3">
            <Label htmlFor="caption" className="text-sm font-medium">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Add a description..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="h-20 mt-1"
            />
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-end">
            <Button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="bg-gold-600 hover:bg-gold-700 text-white"
            >
              {isUploading ? 'Uploading...' : 'Save Photo'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Upload, 
  X, 
  PlusCircle, 
  Image as ImageIcon, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Tag, 
  Check, 
  Home
} from 'lucide-react';

export interface Photo {
  id: string;
  dataUrl: string;
  caption: string;
  timestamp: string;
  roomId?: string;
  issueId?: string;
  tags: string[];
  location?: string;
}

interface Room {
  id: string;
  name: string;
  type: string;
}

interface Issue {
  id: string;
  title: string;
}

interface EnhancedPhotoUploaderProps {
  onPhotoUpload: (photo: Photo) => void;
  roomId?: string;
  issueId?: string;
  className?: string;
  availableRooms?: Room[];
  availableIssues?: Issue[];
  currentRoomName?: string;
}

export const EnhancedPhotoUploader: React.FC<EnhancedPhotoUploaderProps> = ({
  onPhotoUpload,
  roomId,
  issueId,
  className = '',
  availableRooms = [],
  availableIssues = [],
  currentRoomName
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<string | undefined>(roomId);
  const [selectedIssue, setSelectedIssue] = useState<string | undefined>(issueId);
  const [showTagInput, setShowTagInput] = useState(false);
  const [activeTab, setActiveTab] = useState('camera');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  const commonTags = ['Damage', 'Mold', 'Clean', 'Dirty', 'Stain', 'Broken', 'New', 'Furnished', 'Empty', 'Wear'];

  // Reset selected room and issue when props change
  useEffect(() => {
    setSelectedRoom(roomId);
    setSelectedIssue(issueId);
  }, [roomId, issueId]);

  const generateId = () => '_' + Math.random().toString(36).substring(2, 11);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        // Reset zoom and rotation when a new image is loaded
        setZoomLevel(1);
        setRotation(0);
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
    setTags([]);
    setZoomLevel(1);
    setRotation(0);
    setShowTagInput(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
    setShowTagInput(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = () => {
    if (!preview) return;
    
    setIsUploading(true);
    
    const newPhoto: Photo = {
      id: generateId(),
      dataUrl: preview,
      caption,
      timestamp: new Date().toISOString(),
      roomId: selectedRoom,
      issueId: selectedIssue,
      tags,
      location: currentRoomName || ''
    };
    
    // Simulate network delay
    setTimeout(() => {
      onPhotoUpload(newPhoto);
      clearPreview();
      setIsUploading(false);
    }, 500);
  };

  const handleQuickTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    } else {
      removeTag(tag);
    }
  };

  return (
    <div className={`enhanced-photo-uploader ${className}`}>
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
        <Card className="border-gold-400/30">
          <CardContent className="p-4">
            <Tabs defaultValue="camera" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="camera" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  <span>Camera</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="camera" className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={triggerCameraInput} 
                    variant="outline"
                    className="h-24 border-dashed border-gold-400/50 hover:border-gold-400"
                  >
                    <div className="flex flex-col items-center">
                      <Camera className="h-8 w-8 mb-2 text-gold-500" />
                      <span className="text-sm">Take Photo</span>
                    </div>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Capture a photo directly from your device's camera
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={triggerFileInput} 
                    variant="outline"
                    className="h-24 border-dashed border-gold-400/50 hover:border-gold-400"
                  >
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-8 w-8 mb-2 text-gold-500" />
                      <span className="text-sm">Select Photo</span>
                    </div>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Choose from existing photos on your device
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gold-400/30 overflow-hidden">
          <div className="relative bg-black/10">
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                onClick={handleZoomIn}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                onClick={handleZoomOut}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-white/90 hover:bg-white"
                onClick={handleRotate}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="h-8 w-8 rounded-full"
                onClick={clearPreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div 
              ref={imageContainerRef}
              className="w-full h-60 overflow-hidden flex items-center justify-center"
            >
              <img 
                ref={previewImageRef}
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-contain transition-all duration-200"
                style={{ 
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              />
            </div>
          </div>
          
          <CardContent className="p-4 space-y-4">
            <div>
              <Label htmlFor="caption" className="text-sm font-medium">Caption</Label>
              <Textarea
                id="caption"
                placeholder="Add a description of what's shown in the photo..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="h-20 mt-1 resize-none"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="pl-2 pr-1 py-1 flex items-center gap-1 bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300 hover:bg-gold-200"
                  >
                    {tag}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 rounded-full hover:bg-gold-200/80" 
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                
                {showTagInput ? (
                  <div className="flex gap-1 items-center">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="h-8 w-32"
                      placeholder="New tag"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag();
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      className="h-8 w-8 rounded-full bg-gold-500 hover:bg-gold-600" 
                      onClick={addTag}
                    >
                      <Check className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-dashed border-gold-400/50 h-8"
                    onClick={() => setShowTagInput(true)}
                  >
                    <Tag className="h-3.5 w-3.5 mr-1" />
                    Add Tag
                  </Button>
                )}
              </div>
              
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">Common tags:</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {commonTags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className={`cursor-pointer ${tags.includes(tag) ? 'bg-gold-100 border-gold-300 text-gold-700 dark:bg-gold-900/30 dark:border-gold-700 dark:text-gold-300' : ''}`}
                      onClick={() => handleQuickTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {availableRooms.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Associate with Room</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableRooms.map(room => (
                    <Button
                      key={room.id}
                      variant="outline"
                      size="sm"
                      className={`justify-start ${selectedRoom === room.id ? 'bg-gold-100 border-gold-300 dark:bg-gold-900/30 dark:border-gold-700' : ''}`}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <Home className="h-3.5 w-3.5 mr-2" />
                      {room.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {availableIssues.length > 0 && selectedRoom && (
              <div>
                <Label className="text-sm font-medium">Associate with Issue</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {availableIssues
                    .filter(issue => {
                      // Only show issues for the selected room if room is selected
                      if (!selectedRoom) return true;
                      return true; // You'd need to check if issue belongs to room
                    })
                    .map(issue => (
                      <Button
                        key={issue.id}
                        variant="outline"
                        size="sm"
                        className={`justify-start ${selectedIssue === issue.id ? 'bg-gold-100 border-gold-300 dark:bg-gold-900/30 dark:border-gold-700' : ''}`}
                        onClick={() => setSelectedIssue(issue.id)}
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-2" />
                        {issue.title}
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-4 pt-0 flex justify-end">
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

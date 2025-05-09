import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PhotoUploader } from './PhotoUploader';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { 
  AlertTriangle, 
  Calendar, 
  Clock,
  Banknote,
  Tag,
  CheckCircle, 
  User, 
  XCircle, 
  ArrowRightCircle,
  RotateCcw, 
  PenSquare 
} from 'lucide-react';

// Types (would normally be imported from a shared types file)
interface Photo {
  id: string;
  dataUrl: string;
  caption: string;
  timestamp: string;
  roomId?: string;
  issueId?: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  photos: Photo[];
  status: 'new' | 'in-progress' | 'resolved' | 'monitoring';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  estimatedCost?: number;
  category: string;
  tags: string[];
  maintenanceRequired: boolean;
}

interface IssueManagerProps {
  issue: Issue;
  roomId: string;
  roomName: string;
  onUpdateIssue: (updatedIssue: Issue) => void;
  onDeleteIssue: (issueId: string) => void;
  availableStaff?: { id: string; name: string; role: string }[];
}

export const IssueManager: React.FC<IssueManagerProps> = ({
  issue,
  roomId,
  roomName,
  onUpdateIssue,
  onDeleteIssue,
  availableStaff = []
}) => {
  const [localIssue, setLocalIssue] = useState<Issue>({...issue});
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  // Handle form field changes
  const handleChange = (field: keyof Issue, value: any) => {
    setLocalIssue(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };
  
  // Save changes
  const saveChanges = () => {
    onUpdateIssue(localIssue);
    setIsEditing(false);
  };
  
  // Add a new tag
  const addTag = () => {
    if (newTag.trim() && !localIssue.tags.includes(newTag.trim())) {
      handleChange('tags', [...localIssue.tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    handleChange('tags', localIssue.tags.filter(tag => tag !== tagToRemove));
  };
  
  // Update issue status
  const updateStatus = (newStatus: Issue['status']) => {
    handleChange('status', newStatus);
  };
  
  // Add a photo to the issue
  const handlePhotoUpload = (photo: Photo) => {
    const updatedIssue = {
      ...localIssue,
      photos: [...localIssue.photos, {...photo, issueId: localIssue.id}],
      updatedAt: new Date().toISOString()
    };
    setLocalIssue(updatedIssue);
    onUpdateIssue(updatedIssue);
  };
  
  // Helper function to get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600 text-white';
      case 'high': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'low': return 'bg-green-500 hover:bg-green-600 text-white';
      default: return 'bg-slate-500 hover:bg-slate-600 text-white';
    }
  };
  
  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'in-progress': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'resolved': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'monitoring': return 'bg-purple-500 hover:bg-purple-600 text-white';
      default: return 'bg-slate-500 hover:bg-slate-600 text-white';
    }
  };
  
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertTriangle className="w-4 h-4" />;
      case 'in-progress': return <ArrowRightCircle className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'monitoring': return <RotateCcw className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <Card className="border-gold-400/30">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Badge className={getSeverityColor(localIssue.severity)}>
                  {localIssue.severity}
                </Badge>
                <Badge className={getStatusColor(localIssue.status)}>
                  <span className="flex items-center gap-1.5">
                    {getStatusIcon(localIssue.status)} {localIssue.status.replace('-', ' ')}
                  </span>
                </Badge>
                {localIssue.maintenanceRequired && (
                  <Badge variant="outline" className="border-red-400/50 text-red-600 dark:text-red-400">
                    Maintenance Required
                  </Badge>
                )}
              </div>
              
              {isEditing ? (
                <Input 
                  value={localIssue.title} 
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="text-xl font-bold font-artdeco mb-1"
                />
              ) : (
                <CardTitle className="text-xl font-artdeco text-gold-600 dark:text-gold-400">
                  {localIssue.title}
                </CardTitle>
              )}
              
              <CardDescription>
                Issue in {roomName} • Created {format(new Date(localIssue.createdAt), 'PP')}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
            >
              <PenSquare className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <Label className="text-sm font-medium mb-1 block">Description</Label>
            {isEditing ? (
              <Textarea 
                value={localIssue.description} 
                onChange={(e) => handleChange('description', e.target.value)}
                className="min-h-24"
              />
            ) : (
              <p className="text-sm leading-relaxed px-4 py-3 bg-muted rounded-md">
                {localIssue.description || "No description provided."}
              </p>
            )}
          </div>
          
          {/* Assignment and scheduling section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">Assigned To</Label>
                {isEditing ? (
                  <Select 
                    value={localIssue.assignedTo || ''} 
                    onValueChange={(value) => handleChange('assignedTo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {availableStaff.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>{staff.name} ({staff.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-md">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gold-200 text-gold-700">
                        {localIssue.assignedTo ? localIssue.assignedTo.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      {localIssue.assignedTo ? 
                        availableStaff.find(s => s.id === localIssue.assignedTo)?.name || localIssue.assignedTo : 
                        "Unassigned"}
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1 block">Category</Label>
                {isEditing ? (
                  <Select 
                    value={localIssue.category} 
                    onValueChange={(value) => handleChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="structural">Structural</SelectItem>
                      <SelectItem value="appliance">Appliance</SelectItem>
                      <SelectItem value="pest">Pest Control</SelectItem>
                      <SelectItem value="safety">Safety Issue</SelectItem>
                      <SelectItem value="cosmetic">Cosmetic</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="capitalize">
                    {localIssue.category}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1 block">Due Date</Label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input 
                      type="date" 
                      value={localIssue.dueDate ? new Date(localIssue.dueDate).toISOString().split('T')[0] : ''} 
                      onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value).toISOString() : undefined)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {localIssue.dueDate ? format(new Date(localIssue.dueDate), 'PP') : "No due date set"}
                  </div>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-1 block">Estimated Cost</Label>
                {isEditing ? (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">£</span>
                    <Input 
                      type="number" 
                      placeholder="0.00"
                      className="pl-8"
                      value={localIssue.estimatedCost || ''} 
                      onChange={(e) => handleChange('estimatedCost', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    {localIssue.estimatedCost ? `£${localIssue.estimatedCost.toFixed(2)}` : "No cost estimate"}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="maintenance" 
                  checked={localIssue.maintenanceRequired}
                  onCheckedChange={(checked) => handleChange('maintenanceRequired', checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor="maintenance">Requires Maintenance</Label>
              </div>
            </div>
          </div>
          
          {/* Tags section */}
          <div>
            <Label className="text-sm font-medium mb-1 block">Tags</Label>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {localIssue.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="bg-gold-100 text-gold-800 dark:bg-gold-900/40 dark:text-gold-400 flex items-center gap-1"
                >
                  {tag}
                  {isEditing && (
                    <button onClick={() => removeTag(tag)} className="h-3.5 w-3.5 rounded-full hover:bg-gold-200 dark:hover:bg-gold-800 flex items-center justify-center ml-1">
                      <XCircle className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              
              {isEditing && (
                <div className="flex gap-2 items-center">
                  <Input 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    className="w-32 h-8"
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={addTag}
                    className="h-8"
                  >
                    <Tag className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Status update buttons */}
          {!isEditing && (
            <div className="border-t border-border pt-4">
              <Label className="text-sm font-medium mb-2 block">Update Status</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className={localIssue.status === 'new' ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}
                  onClick={() => updateStatus('new')}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" /> New
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className={localIssue.status === 'in-progress' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}
                  onClick={() => updateStatus('in-progress')}
                >
                  <ArrowRightCircle className="h-3.5 w-3.5 mr-1" /> In Progress
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className={localIssue.status === 'resolved' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                  onClick={() => updateStatus('resolved')}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Resolved
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className={localIssue.status === 'monitoring' ? 'bg-purple-100 text-purple-800 border-purple-300' : ''}
                  onClick={() => updateStatus('monitoring')}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Monitoring
                </Button>
              </div>
            </div>
          )}
          
          {/* Photos */}
          <div className="border-t border-border pt-4">
            <Label className="text-sm font-medium mb-2 block">Photos</Label>
            <div className="space-y-4">
              <PhotoUploader 
                onPhotoUpload={handlePhotoUpload}
                issueId={localIssue.id}
                roomId={roomId}
              />
              
              {localIssue.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {localIssue.photos.map(photo => (
                    <div key={photo.id} className="relative group overflow-hidden rounded-md border border-border">
                      <img 
                        src={photo.dataUrl} 
                        alt={photo.caption || 'Issue documentation'} 
                        className="aspect-square object-cover w-full"
                      />
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1.5 text-xs">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Last updated info */}
          <div className="flex items-center text-xs text-muted-foreground pt-2">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Last updated: {format(new Date(localIssue.updatedAt), 'PP p')}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-border pt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button 
                onClick={saveChanges}
                className="bg-gold-600 hover:bg-gold-700 text-white"
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="destructive"
                onClick={() => onDeleteIssue(localIssue.id)}
              >
                Delete Issue
              </Button>
              <Button 
                className="bg-gold-600 hover:bg-gold-700 text-white"
                onClick={() => setIsEditing(true)}
              >
                Edit Issue
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

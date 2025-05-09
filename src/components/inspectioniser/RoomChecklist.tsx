import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlusCircle, Check, X, Camera, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { PhotoUploader } from './PhotoUploader';
import { EnhancedPhotoUploader } from './EnhancedPhotoUploader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Import from our types file
import { ChecklistItem, Photo, Room } from '@/types/inspection';

// Default common checklist items based on room type
const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  bedroom: [
    'Walls and ceiling in good condition',
    'Flooring clean and undamaged',
    'Windows open/close properly',
    'Window locks functioning',
    'Curtains/blinds in good condition',
    'Light fixtures working',
    'Power outlets functioning',
    'Smoke detector present and working',
    'Door opens/closes smoothly',
    'Heating functional'
  ],
  bathroom: [
    'Toilet flushes properly',
    'Sink drains properly',
    'Shower/bath functioning',
    'No leaks under sink/bath',
    'Extractor fan working',
    'Flooring waterproof and undamaged',
    'Tiles in good condition',
    'Sealant intact around bath/shower',
    'Sufficient water pressure',
    'Hot water available'
  ],
  kitchen: [
    'Oven/stove functioning',
    'Refrigerator cooling properly',
    'Sink drains properly',
    'No leaks under sink',
    'Dishwasher functioning (if present)',
    'Extractor hood working',
    'Cabinet doors/drawers open smoothly',
    'Work surfaces in good condition',
    'Flooring clean and undamaged',
    'Garbage disposal working (if present)',
    'Microwave functioning (if present)'
  ],
  livingRoom: [
    'Walls and ceiling in good condition',
    'Flooring clean and undamaged',
    'Windows open/close properly',
    'Curtains/blinds in good condition',
    'Light fixtures working',
    'Power outlets functioning',
    'TV points working (if present)',
    'Heating functional',
    'Furniture in good condition (if furnished)'
  ],
  hallway: [
    'Lighting functioning',
    'Flooring clean and undamaged',
    'Doorbell working (if present)',
    'Smoke detector present and working',
    'Entry door locks functioning',
    'Intercom system working (if present)'
  ],
  exterior: [
    'Garden well-maintained',
    'Pathways clear and safe',
    'External lights working',
    'Fence/wall in good condition',
    'Garage door functioning (if present)',
    'Roof appears in good condition',
    'Gutters clear',
    'External paintwork in good condition'
  ],
  other: [
    'General cleanliness',
    'Walls and ceiling in good condition',
    'Flooring clean and undamaged',
    'Light fixtures working',
    'Heating functional'
  ]
};

interface RoomChecklistProps {
  room: Room;
  onUpdateChecklist: (checklist: ChecklistItem[]) => void;
  onAddIssueFromChecklist: (itemName: string, notes: string) => void;
  onAddPhoto: (photo: Photo) => void;
}

export const RoomChecklist: React.FC<RoomChecklistProps> = ({
  room,
  onUpdateChecklist,
  onAddIssueFromChecklist,
  onAddPhoto
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  
  // Generate a random ID
  const generateId = () => '_' + Math.random().toString(36).substring(2, 11);
  
  // Add common checklist items based on room type
  const addDefaultItems = () => {
    const roomType = room.type.toLowerCase();
    const itemsToAdd = DEFAULT_CHECKLISTS[roomType] || DEFAULT_CHECKLISTS.other;
    
    const newItems = itemsToAdd.map(name => ({
      id: generateId(),
      name,
      checked: false,
      roomId: room.id
    }));
    
    onUpdateChecklist([...room.checklist, ...newItems]);
  };
  
  // Add a new custom checklist item
  const addNewItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: ChecklistItem = {
      id: generateId(),
      name: newItemName.trim(),
      checked: false,
      roomId: room.id
    };
    
    onUpdateChecklist([...room.checklist, newItem]);
    setNewItemName('');
    setShowAddItemForm(false);
  };
  
  // Update an existing checklist item
  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    const updatedChecklist = room.checklist.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    onUpdateChecklist(updatedChecklist);
  };
  
  // Remove a checklist item
  const removeItem = (id: string) => {
    const updatedChecklist = room.checklist.filter(item => item.id !== id);
    onUpdateChecklist(updatedChecklist);
  };
  
  // Create an issue from a checklist item
  const createIssue = (item: ChecklistItem) => {
    onAddIssueFromChecklist(item.name, item.notes || '');
  };
  
  // Handle photo upload for a checklist item
  const handlePhotoUpload = (photo: Photo, itemId: string) => {
    const updatedItem = room.checklist.find(item => item.id === itemId);
    if (updatedItem) {
      const updatedPhotos = updatedItem.photos ? [...updatedItem.photos, photo] : [photo];
      updateItem(itemId, { photos: updatedPhotos });
      onAddPhoto(photo);
    }
  };
  
  return (
    <div className="room-checklist space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-artdeco tracking-wide">Room Checklist</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addDefaultItems}
            className="text-xs"
          >
            Add Standard Items
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddItemForm(true)}
            className="text-xs"
          >
            <PlusCircle className="h-3.5 w-3.5 mr-1" />
            Add Custom Item
          </Button>
        </div>
      </div>
      
      {showAddItemForm && (
        <Card className="border-gold-400/30">
          <CardContent className="p-3 space-y-3">
            <div>
              <Label htmlFor="newItemName">Item Description</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  id="newItemName"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Enter checklist item description"
                  className="flex-1"
                />
                <Button 
                  onClick={addNewItem}
                  variant="default"
                  className="bg-gold-600 hover:bg-gold-700 text-white"
                >
                  Add
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => setShowAddItemForm(false)}
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {room.checklist.length === 0 ? (
        <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed border-muted">
          <Check className="h-10 w-10 mx-auto text-muted mb-2" />
          <h3 className="text-base font-medium mb-1">No Checklist Items</h3>
          <p className="text-sm text-muted-foreground mb-4">Add standard or custom checklist items to begin inspection</p>
          <Button 
            variant="outline" 
            onClick={addDefaultItems}
            className="mx-auto"
          >
            Add Standard Checklist
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[450px] pr-3">
          <Accordion
            type="multiple"
            className="space-y-2"
            value={activeItemId ? [activeItemId] : []}
            onValueChange={(values) => setActiveItemId(values[0] || null)}
          >
            {room.checklist.map(item => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border border-gold-400/30 rounded-md overflow-hidden"
              >
                <div className="flex items-center px-3 py-2 bg-background">
                  <Checkbox 
                    id={`check-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={(checked) => updateItem(item.id, { checked: checked as boolean })}
                    className="mr-2 data-[state=checked]:bg-gold-600 data-[state=checked]:text-white"
                  />
                  <Label 
                    htmlFor={`check-${item.id}`} 
                    className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {item.name}
                  </Label>
                  <AccordionTrigger className="py-0" />
                </div>
                <AccordionContent className="px-3 py-2 bg-muted/20">
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor={`notes-${item.id}`} className="text-sm font-medium">Notes</Label>
                      <Textarea
                        id={`notes-${item.id}`}
                        value={item.notes || ''}
                        onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                        placeholder="Add notes about this item..."
                        className="h-24 mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Photos</Label>
                      <div className="mt-2">
                        <EnhancedPhotoUploader
                          onPhotoUpload={(photo) => handlePhotoUpload(photo, item.id)}
                          roomId={room.id}
                          className="mt-2"
                        />
                        
                        {item.photos && item.photos.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-3">
                            {item.photos.map(photo => (
                              <img
                                key={photo.id}
                                src={photo.dataUrl}
                                alt={photo.caption || 'Checklist item photo'}
                                className="w-full h-20 object-cover rounded-md border border-border"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => removeItem(item.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                      
                      {!item.checked && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                          onClick={() => createIssue(item)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Create Issue
                        </Button>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      )}
      
      {room.checklist.length > 0 && (
        <div className="flex justify-between items-center pt-2 text-sm">
          <div>
            <span className="font-medium">{room.checklist.filter(item => item.checked).length}</span> of {room.checklist.length} items checked
          </div>
          <Badge variant={room.checklist.every(item => item.checked) ? "default" : "outline"}>
            {room.checklist.every(item => item.checked) ? "Complete" : "In Progress"}
          </Badge>
        </div>
      )}
    </div>
  );
};

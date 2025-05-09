import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tag, X, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Import our types
import { Issue } from '@/types/inspection';

interface IssueFormProps {
  issue: Issue;
  onUpdateIssue: (field: keyof Issue, value: any) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  newTag: string;
  setNewTag: (value: string) => void;
  availableCategories: string[];
}

export const IssueForm: React.FC<IssueFormProps> = ({
  issue,
  onUpdateIssue,
  onAddTag,
  onRemoveTag,
  newTag,
  setNewTag,
  availableCategories
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const handleDueDateSelect = (date: Date | undefined) => {
    if (date) {
      onUpdateIssue('dueDate', date.toISOString());
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="issueTitle" className="text-sm font-medium">Issue Title</Label>
        <Input
          id="issueTitle"
          value={issue.title}
          onChange={(e) => onUpdateIssue('title', e.target.value)}
          placeholder="Brief description of the issue"
          className="w-full"
        />
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="issueDescription" className="text-sm font-medium">Detailed Description</Label>
        <Textarea
          id="issueDescription"
          value={issue.description}
          onChange={(e) => onUpdateIssue('description', e.target.value)}
          placeholder="Provide more details about the issue..."
          className="min-h-24"
        />
      </div>
      
      {/* Severity */}
      <div className="space-y-2">
        <Label htmlFor="issueSeverity" className="text-sm font-medium">Severity</Label>
        <Select
          value={issue.severity}
          onValueChange={(value) => onUpdateIssue('severity', value)}
        >
          <SelectTrigger id="issueSeverity" className="w-full">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - Minor issue, can be fixed later</SelectItem>
            <SelectItem value="medium">Medium - Should be addressed soon</SelectItem>
            <SelectItem value="high">High - Needs prompt attention</SelectItem>
            <SelectItem value="critical">Critical - Requires immediate action</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="issueCategory" className="text-sm font-medium">Category</Label>
        <Select
          value={issue.category}
          onValueChange={(value) => onUpdateIssue('category', value)}
        >
          <SelectTrigger id="issueCategory" className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {availableCategories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {issue.tags.map(tag => (
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
                onClick={() => onRemoveTag(tag)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddTag();
              }
            }}
          />
          <Button 
            onClick={onAddTag}
            size="sm"
            className="bg-gold-600 hover:bg-gold-700 text-white"
          >
            <Tag className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      {/* Due Date */}
      <div className="space-y-2">
        <Label htmlFor="issueDueDate" className="text-sm font-medium">Due Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              id="issueDueDate"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !issue.dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {issue.dueDate ? format(new Date(issue.dueDate), "PPP") : "No due date set"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={issue.dueDate ? new Date(issue.dueDate) : undefined}
              onSelect={handleDueDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Cost Estimation */}
      <div className="space-y-2">
        <Label htmlFor="issueCost" className="text-sm font-medium">Estimated Cost (£)</Label>
        <div className="relative">
          <DollarSign className="h-4 w-4 text-muted-foreground absolute top-3 left-3" />
          <Input
            id="issueCost"
            type="number"
            value={issue.estimatedCost || ''}
            onChange={(e) => onUpdateIssue('estimatedCost', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Enter estimated cost"
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};

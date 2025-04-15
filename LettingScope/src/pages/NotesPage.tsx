
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, SortAsc, SortDesc, Trash2, Calendar, Building, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useAppData } from "@/contexts/AppContext";

const NotesPage: React.FC = () => {
  const { data, getPropertyById, addNote, updateNote, deleteNote, formatDate } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  
  // Form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  
  // Get the current note being edited
  const currentNote = currentNoteId ? data.notes.find(note => note.id === currentNoteId) : null;
  
  // Filter and sort notes
  const filteredNotes = data.notes
    .filter(note => 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (getPropertyById(note.propertyId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a.updatedAt - b.updatedAt;
      } else {
        return b.updatedAt - a.updatedAt;
      }
    });
  
  // Reset form state
  const resetForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setSelectedPropertyId(data.properties.length > 0 ? data.properties[0].id : "");
    setCurrentNoteId(null);
  };
  
  // Handle add note dialog open
  const handleAddNoteClick = () => {
    resetForm();
    setIsAddNoteDialogOpen(true);
  };
  
  // Handle edit note dialog open
  const handleEditNoteClick = (noteId: string) => {
    const note = data.notes.find(note => note.id === noteId);
    if (!note) return;
    
    setCurrentNoteId(noteId);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSelectedPropertyId(note.propertyId);
    setIsEditNoteDialogOpen(true);
  };
  
  // Handle add note submit
  const handleAddNoteSubmit = () => {
    if (!noteTitle.trim() || !noteContent.trim() || !selectedPropertyId) return;
    
    addNote({
      propertyId: selectedPropertyId,
      title: noteTitle,
      content: noteContent,
    });
    
    resetForm();
    setIsAddNoteDialogOpen(false);
  };
  
  // Handle edit note submit
  const handleEditNoteSubmit = () => {
    if (!currentNoteId || !noteTitle.trim() || !noteContent.trim() || !selectedPropertyId) return;
    
    updateNote({
      id: currentNoteId,
      propertyId: selectedPropertyId,
      title: noteTitle,
      content: noteContent,
      createdAt: currentNote?.createdAt || Date.now(),
      updatedAt: Date.now()
    });
    
    resetForm();
    setIsEditNoteDialogOpen(false);
  };
  
  // Handle delete note
  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(noteId);
    }
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            title={`Sort by date ${sortOrder === "asc" ? "newest first" : "oldest first"}`}
          >
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
          
          <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNoteClick}>
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
                <DialogDescription>
                  Create a new note for your property
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="property" className="text-sm font-medium">
                    Property
                  </label>
                  <select
                    id="property"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    required
                  >
                    <option value="">Select a property</option>
                    {data.properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Content
                  </label>
                  <Textarea
                    id="content"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your note here..."
                    rows={5}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleAddNoteSubmit}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditNoteDialogOpen} onOpenChange={setIsEditNoteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Note</DialogTitle>
                <DialogDescription>
                  Update your note details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-property" className="text-sm font-medium">
                    Property
                  </label>
                  <select
                    id="edit-property"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    required
                  >
                    <option value="">Select a property</option>
                    {data.properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="edit-title"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Note title"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-content" className="text-sm font-medium">
                    Content
                  </label>
                  <Textarea
                    id="edit-content"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write your note here..."
                    rows={5}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={handleEditNoteSubmit}>
                  Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-muted/10 rounded-lg border border-dashed">
          <p className="text-muted-foreground mb-4">No notes found</p>
          <Button onClick={handleAddNoteClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add your first note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const property = getPropertyById(note.propertyId);
            
            return (
              <Card key={note.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="truncate text-lg">{note.title}</CardTitle>
                  {property && (
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Building className="h-3 w-3" />
                      {property.name}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-28 w-full pr-4">
                    <p className="text-sm whitespace-pre-line">{note.content}</p>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-between pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(note.updatedAt)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditNoteClick(note.id)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotesPage;

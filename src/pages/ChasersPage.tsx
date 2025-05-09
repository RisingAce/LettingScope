
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, Plus, Search, ArrowUpDown, 
  Check, MoreHorizontal, Building, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppData } from "@/contexts/AppContext";

const ChasersPage: React.FC = () => {
  const { data, getPropertyById, formatDate, updateChaser } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"dueDate" | "priority">("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter chasers based on search and tab
  const filteredChasers = data.chasers.filter(chaser => 
    (activeTab === "upcoming" ? !chaser.completed : chaser.completed) &&
    (
      chaser.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chaser.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chaser.propertyId && getPropertyById(chaser.propertyId)?.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  // Sort chasers
  const sortedChasers = [...filteredChasers].sort((a, b) => {
    if (sortField === "dueDate") {
      const comparison = a.dueDate - b.dueDate;
      return sortDirection === "asc" ? comparison : -comparison;
    } else {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      return sortDirection === "asc" ? comparison : -comparison;
    }
  });

  const toggleSort = (field: "dueDate" | "priority") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleChaserCompleted = (chaser: typeof data.chasers[0]) => {
    updateChaser({
      ...chaser,
      completed: !chaser.completed,
      completedDate: !chaser.completed ? Date.now() : undefined,
    });
  };

  const getChaserStatusColors = (chaser: typeof data.chasers[0]) => {
    const dueDate = new Date(chaser.dueDate);
    const isOverdue = dueDate < today && !chaser.completed;
    const isDueToday = dueDate.toDateString() === today.toDateString() && !chaser.completed;
    
    if (isOverdue) return "bg-destructive/10 border-destructive/30 text-destructive";
    if (isDueToday) return "bg-amber-50 border-amber-200";
    if (chaser.completed) return "bg-muted border-muted-foreground/20";
    
    return "bg-white border-border";
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Chasers</h1>
          <p className="text-muted-foreground">Track and manage your reminders and to-dos</p>
        </div>
        <Button asChild>
          <Link to="/chasers/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Chaser
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "upcoming" | "completed")}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="upcoming" className="pt-4 space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chasers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort("dueDate")}
              >
                Due Date
                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === "dueDate" ? "opacity-100" : "opacity-40"}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort("priority")}
                className="hidden sm:flex"
              >
                Priority
                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === "priority" ? "opacity-100" : "opacity-40"}`} />
              </Button>
            </div>
          </div>

          {/* Upcoming Chasers list */}
          {sortedChasers.length > 0 ? (
            <div className="space-y-3">
              {sortedChasers.map((chaser) => {
                const property = chaser.propertyId ? getPropertyById(chaser.propertyId) : undefined;
                const dueDate = new Date(chaser.dueDate);
                const isOverdue = dueDate < today;
                const isDueToday = dueDate.toDateString() === today.toDateString();
                
                return (
                  <Card 
                    key={chaser.id} 
                    className={`${getChaserStatusColors(chaser)} overflow-hidden`}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-base flex items-start gap-3">
                        <Checkbox 
                          checked={chaser.completed}
                          onCheckedChange={() => toggleChaserCompleted(chaser)}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <span>{chaser.title}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs ${
                                chaser.priority === "high" 
                                  ? "bg-red-100 text-red-700" 
                                  : chaser.priority === "medium"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}>
                                {chaser.priority}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="-mr-2">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => toggleChaserCompleted(chaser)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark as {chaser.completed ? "incomplete" : "complete"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Edit Chaser</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    Delete Chaser
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {chaser.description && (
                            <p className="text-sm text-muted-foreground">{chaser.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs">
                            <p className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                              {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                              {isOverdue ? "Overdue: " : isDueToday ? "Due today: " : "Due: "}
                              {formatDate(chaser.dueDate)}
                            </p>
                            
                            {property && (
                              <p className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {property.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No chasers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term or clear your filters" : "Add your first chaser to get started"}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link to="/chasers/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chaser
                  </Link>
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="pt-4 space-y-4">
          {/* Similar content for completed tab, with appropriate adjustments */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search completed chasers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {sortedChasers.length > 0 ? (
            <div className="space-y-3">
              {sortedChasers.map((chaser) => {
                const property = chaser.propertyId ? getPropertyById(chaser.propertyId) : undefined;
                
                return (
                  <Card 
                    key={chaser.id} 
                    className="overflow-hidden bg-muted/40 border-muted"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox 
                          checked={true}
                          onCheckedChange={() => toggleChaserCompleted(chaser)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <span className="line-through text-muted-foreground">{chaser.title}</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="-mr-2">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => toggleChaserCompleted(chaser)}>
                                  Mark as incomplete
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Delete Chaser
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {chaser.description && (
                            <p className="text-sm text-muted-foreground line-through">{chaser.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <p className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Completed: {formatDate(chaser.completedDate || chaser.updatedAt)}
                            </p>
                            
                            {property && (
                              <p className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {property.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Check className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No completed chasers found</h3>
              <p className="text-muted-foreground">
                Completed chasers will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChasersPage;

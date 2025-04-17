import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Building, Plus, Search, 
  ArrowUpDown, MoreHorizontal, Home, MapPin, User, Phone,
  Calendar, Tag, Filter, X, Bookmark, ArrowUpCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppData } from "@/contexts/AppContext";
import { toast } from "sonner";

const PropertiesPage: React.FC = () => {
  const { data, getBillsByPropertyId, formatDate, formatCurrency, deleteProperty } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"name" | "updatedAt">("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [occupancyFilter, setOccupancyFilter] = useState<string>("all");
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  // Filter properties based on search
  let filteredProperties = data.properties.filter(property => 
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (property.landlordName && property.landlordName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (property.tenantName && property.tenantName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Apply additional filters
  if (propertyTypeFilter !== "all") {
    filteredProperties = filteredProperties.filter(
      property => property.propertyType === propertyTypeFilter
    );
  }

  if (occupancyFilter !== "all") {
    filteredProperties = filteredProperties.filter(property => {
      if (occupancyFilter === "occupied") {
        return !!property.tenantName;
      } else if (occupancyFilter === "vacant") {
        return !property.tenantName;
      }
      return true;
    });
  }

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortField === "name") {
      const comparison = a.name.localeCompare(b.name);
      return sortDirection === "asc" ? comparison : -comparison;
    } else {
      const comparison = a.updatedAt - b.updatedAt;
      return sortDirection === "asc" ? comparison : -comparison;
    }
  });

  const toggleSort = (field: "name" | "updatedAt") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    try {
      deleteProperty(propertyId);
      setShowConfirmDelete(null);
      toast.success("Property deleted successfully");
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property");
    }
  };

  const clearFilters = () => {
    setPropertyTypeFilter("all");
    setOccupancyFilter("all");
    setShowFilters(false);
  };

  const getFilterCount = () => {
    let count = 0;
    if (propertyTypeFilter !== "all") count++;
    if (occupancyFilter !== "all") count++;
    return count;
  };

  const filterCount = getFilterCount();

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-artdeco">Properties</h1>
          <p className="text-muted-foreground">Manage your properties and view their details</p>
        </div>
        <Button asChild className="bg-gold-500 hover:bg-gold-600 text-white border-none">
          <Link to="/properties/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-8 border-gold-200 dark:border-gold-800 focus-visible:ring-gold-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("name")}
              className="hidden sm:flex border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40 hover:text-gold-800 dark:hover:text-gold-300"
            >
              Name
              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === "name" ? "opacity-100" : "opacity-40"}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSort("updatedAt")}
              className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40 hover:text-gold-800 dark:hover:text-gold-300"
            >
              Last Updated
              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === "updatedAt" ? "opacity-100" : "opacity-40"}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="relative border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40 hover:text-gold-800 dark:hover:text-gold-300"
            >
              <Filter className="h-4 w-4" />
              {filterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-gold-500">
                  {filterCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-background border border-gold-200 dark:border-gold-800 p-4 rounded-md shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Property Type</label>
                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                  <SelectTrigger className="border-gold-200 dark:border-gold-800">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Occupancy Status</label>
                <Select value={occupancyFilter} onValueChange={setOccupancyFilter}>
                  <SelectTrigger className="border-gold-200 dark:border-gold-800">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="vacant">Vacant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Properties grid */}
      {sortedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProperties.map((property) => {
            const bills = getBillsByPropertyId(property.id);
            const pendingBills = bills.filter(b => b.status === "pending" || b.status === "overdue");
            const isOccupied = !!property.tenantName;
            
            return (
              <Card key={property.id} className="overflow-hidden border-gold-200 dark:border-gold-800 hover:shadow-md transition-shadow flex flex-col min-h-80">
                <CardHeader className="pb-8 space-y-2">
                  <CardTitle className="flex flex-col items-start">
                    <span className="font-artdeco text-xl font-bold whitespace-normal break-words leading-tight">{property.name}</span>
                  </CardTitle>
                  <CardDescription className="flex items-start gap-1 mt-2">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="flex-1 whitespace-normal break-words leading-snug">{property.address}</span>
                  </CardDescription>
                  {property.propertyType && (
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline" className="text-xs border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-950/30 text-gold-800 dark:text-gold-300">
                        {property.propertyType}
                      </Badge>
                      {isOccupied ? (
                        <Badge className="text-xs bg-jade-500 text-white">Occupied</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-burgundy-50 text-burgundy-800 border-burgundy-200">Vacant</Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pb-3 flex-1">
                  <div className="space-y-2 text-sm">
                    {property.landlordName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Landlord:</span>
                        <span className="truncate">{property.landlordName}</span>
                      </div>
                    )}
                    {property.landlordContact && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{property.landlordContact}</span>
                      </div>
                    )}
                    {property.tenantName && (
                      <div className="flex items-center gap-2 mt-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Tenant:</span>
                        <span className="truncate">{property.tenantName}</span>
                      </div>
                    )}
                    {property.rentalAmount && (
                      <div className="flex items-center gap-2 mt-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Rent:</span>
                        <span className="truncate text-gold-700 dark:text-gold-300">
                          {formatCurrency(property.rentalAmount)}
                        </span>
                      </div>
                    )}
                    {property.leaseEndDate && (
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Lease Ends:</span>
                        <span className="truncate">
                          {formatDate(property.leaseEndDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-end border-t pt-3 text-xs text-muted-foreground border-gold-200 dark:border-gold-800">
                  <div>
                    {pendingBills.length > 0 ? (
                      <span className="text-destructive font-medium">
                        {pendingBills.length} pending {pendingBills.length === 1 ? "bill" : "bills"}
                      </span>
                    ) : (
                      <span>No pending bills</span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span>Updated {formatDate(property.updatedAt)}</span>
                    <Button asChild variant="outline" size="sm" className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40 mt-1">
                      <Link to={`/properties/${property.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No properties found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterCount > 0 ? "Try a different search term or clear your filters" : "Add your first property to get started"}
          </p>
          {(searchQuery || filterCount > 0) ? (
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              clearFilters();
            }} className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40">
              Clear All Filters
            </Button>
          ) : (
            <Button asChild className="bg-gold-500 hover:bg-gold-600 text-white border-none">
              <Link to="/properties/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!showConfirmDelete} onOpenChange={(open) => !open && setShowConfirmDelete(null)}>
        <DialogContent className="border-gold-200 dark:border-gold-800">
          <DialogHeader>
            <DialogTitle className="font-artdeco">Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this property? This action cannot be undone and will also delete all associated bills, chasers, and notes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDelete(null)} className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showConfirmDelete && handleDeleteProperty(showConfirmDelete)}
            >
              Delete Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertiesPage;

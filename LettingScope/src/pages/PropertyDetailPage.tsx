import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Building, ReceiptText, Bell, StickyNote, Calendar, PlusCircle, Trash2, Edit, Home, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/contexts/AppContext";
import { useLocalDocStore, LocalDocMeta } from "@/hooks/useLocalDocStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Custom hook for loading local bill thumbnails
function useBillThumbnail(localDocKey?: string) {
  const { getDoc, getPreviewUrl } = useLocalDocStore();
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    async function loadThumb() {
      if (localDocKey) {
        const blob = await getDoc(localDocKey);
        if (blob && active) setThumbUrl(getPreviewUrl(blob));
      } else {
        setThumbUrl(null);
      }
    }
    loadThumb();
    return () => { active = false; };
  }, [localDocKey, getDoc, getPreviewUrl]);
  return thumbUrl;
}

function BillThumbnail({ localDocKey, bill, onClick }: { localDocKey?: string; bill: any; onClick: (bill: any) => void; }) {
  const thumbUrl = useBillThumbnail(localDocKey);
  return (
    <div className="flex items-center justify-center h-16 w-16 bg-gold-50 rounded border border-gold-200 cursor-pointer group" onClick={() => onClick(bill)}>
      {thumbUrl ? (
        <img
          src={thumbUrl}
          alt="Bill thumbnail"
          className="h-16 w-16 object-cover rounded border border-gold-200 shadow-md transition-transform hover:scale-105 hover:shadow-lg"
          style={{ background: '#fff' }}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <FileText className="w-8 h-8 text-gold-400" />
      )}
    </div>
  );
}

const PropertyDetailPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { getPropertyById, getBillsByPropertyId, getChasersByPropertyId, getNotesByPropertyId, deleteProperty, formatCurrency, formatDate } = useAppData();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load all local docs for this property
  }, []);

  // When user wants to view a document
  const handleViewDocument = async (bill: any) => {
    setSelectedBill(bill);
    setIsPreviewOpen(true);
    const { getDoc, getPreviewUrl } = useLocalDocStore();
    const key = bill.localDocKeys?.[0] || bill.localDocKey;
    let url = '';
    if (key) {
      const blob = await getDoc(key);
      if (blob) {
        url = getPreviewUrl(blob);
      }
    }
    if (!url && bill.documentUrl) {
      try {
        if (bill.documentUrl.startsWith('[')) {
          const docs = JSON.parse(bill.documentUrl);
          if (Array.isArray(docs) && docs[0]?.url) url = docs[0].url;
        } else {
          url = bill.documentUrl;
        }
      } catch {
        url = bill.documentUrl;
      }
    }
    setPreviewUrl(url);
  };

  const property = getPropertyById(propertyId ?? "");
  const bills = getBillsByPropertyId(propertyId ?? "");
  const chasers = getChasersByPropertyId(propertyId ?? "");
  const notes = getNotesByPropertyId(propertyId ?? "");

  // Function to format utility type for display
  const formatUtilityType = (types: string) => {
    const arr = types.split(",");
    return arr.map(type =>
      type === "gasAndElectricity" ? "Gas & Electricity" :
      type === "councilTax" ? "Council Tax" :
      type.charAt(0).toUpperCase() + type.slice(1)
    ).join(", ");
  };

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-artdeco">Property not found</h2>
        <p className="mt-2 text-muted-foreground">The property you're looking for doesn't exist or has been removed.</p>
        <Button
          className="mt-6 bg-gold-500 hover:bg-gold-600 text-white"
          onClick={() => navigate("/properties")}
        >
          Back to Properties
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    try {
      deleteProperty(property.id);
      navigate("/properties");
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/properties")}
            className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
          >
            <Home className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-artdeco">{property.name}</h1>
            <p className="text-sm text-muted-foreground">{property.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/properties/${property.id}/edit`)}
            className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this property?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the property
                  and all associated bills, chasers, and notes.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDeleteDialogOpen(false)}
                  className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete Property
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Property Information Card */}
      <Card className="border-gold-200 dark:border-gold-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-gold-500" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold">Property Details</h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between border-b pb-2 border-gold-100 dark:border-gold-800">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">
                  {property.propertyType ? 
                    property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1) : 
                    "Not specified"}
                </span>
              </div>
              {property.rentalAmount && (
                <div className="flex justify-between border-b pb-2 border-gold-100 dark:border-gold-800">
                  <span className="text-muted-foreground">Rental Amount</span>
                  <span className="font-medium">{formatCurrency(property.rentalAmount)}</span>
                </div>
              )}
              {property.leaseEndDate && (
                <div className="flex justify-between border-b pb-2 border-gold-100 dark:border-gold-800">
                  <span className="text-muted-foreground">Lease End Date</span>
                  <span className="font-medium">{formatDate(property.leaseEndDate)}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2 border-gold-100 dark:border-gold-800">
                <span className="text-muted-foreground">Featured</span>
                <span className="font-medium">{property.featured ? "Yes" : "No"}</span>
              </div>
              {/* View Bill button if property has bills */}
              {bills.length > 0 && (
                <div className="flex justify-between border-b pb-2 border-gold-100 dark:border-gold-800">
                  <span className="text-muted-foreground">Bills</span>
                  <Button
                    size="sm"
                    className="bg-gold-400 hover:bg-gold-500 text-white font-bold"
                    onClick={() => {
                      // Go to bills page and scroll to first bill for this property
                      navigate(`/bills?propertyId=${property.id}`);
                    }}
                  >
                    View Bill{bills.length > 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="mt-3 space-y-2">
              {property.landlordName && (
                <div className="flex justify-between border-b pb-2 border-gold-100 dark:border-gold-800">
                  <span className="text-muted-foreground">Landlord</span>
                  <span className="font-medium">{property.landlordName}</span>
                </div>
              )}
              {property.landlordContact && (
                <div className="flex justify-between border-b pb-2 border-gold-100 dark:border-gold-800">
                  <span className="text-muted-foreground">Landlord Contact</span>
                  <span className="font-medium">{property.landlordContact}</span>
                </div>
              )}
              {property.tenantName && (
                <div className="flex justify-between border-b pb-2 border-gold-100 dark:border-gold-800">
                  <span className="text-muted-foreground">Tenant</span>
                  <span className="font-medium">{property.tenantName}</span>
                </div>
              )}
              {property.tenantContact && (
                <div className="flex justify-between border-b pb-2 border-gold-100 dark:border-gold-800">
                  <span className="text-muted-foreground">Tenant Contact</span>
                  <span className="font-medium">{property.tenantContact}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Bills, Chasers, Notes */}
      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid grid-cols-3 w-full border-b border-gold-200 dark:border-gold-800 rounded-none bg-transparent">
          <TabsTrigger value="bills" className="data-[state=active]:border-b-2 data-[state=active]:border-gold-500 data-[state=active]:text-gold-500 rounded-none">
            <FileText className="mr-2 h-4 w-4" /> 
            Bills ({bills.length})
          </TabsTrigger>
          <TabsTrigger value="chasers" className="data-[state=active]:border-b-2 data-[state=active]:border-gold-500 data-[state=active]:text-gold-500 rounded-none">
            <Bell className="mr-2 h-4 w-4" /> 
            Reminders ({chasers.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:border-b-2 data-[state=active]:border-gold-500 data-[state=active]:text-gold-500 rounded-none">
            <StickyNote className="mr-2 h-4 w-4" /> 
            Notes ({notes.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bills" className="mt-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-artdeco">Utility Bills</h2>
            <Button 
              onClick={() => navigate('/bills/new', { state: { propertyId: property.id } })}
              className="bg-gold-500 hover:bg-gold-600 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> 
              Add Bill
            </Button>
          </div>
          <div className="rounded-md border border-gold-200 dark:border-gold-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Bill / Property</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bill.provider}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {property.name}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">{formatUtilityType(bill.utilityType)}</div>
                      </div>
                    </TableCell>
                    <TableCell>£{typeof bill.amount === 'number' ? bill.amount.toFixed(2) : '-'}</TableCell>
                    <TableCell>{formatDate(bill.dueDate)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        bill.status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : bill.status === "pending"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : bill.status === "overdue"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                      }`}>{bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}</span>
                    </TableCell>
                    <TableCell>
                      <BillThumbnail localDocKey={bill.localDocKeys?.[0] || bill.localDocKey} bill={bill} onClick={handleViewDocument} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => navigate(`/bills/${bill.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {(bill.localDocKey || bill.documentUrl) && (
                          <Button size="sm" variant="outline" onClick={() => handleViewDocument(bill)}>View</Button>
                        )}
                        <Button size="sm" variant="outline" asChild className="h-8 border-gold-200 dark:border-gold-800">
                          <Link to={`/properties/${property.id}`}>View Property</Link>
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 border-gold-200 dark:border-gold-800 flex items-center gap-1" onClick={() => setSelectedBill(bill)}>
                          <StickyNote className="w-4 h-4 mr-1" />Notes
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="chasers" className="mt-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-artdeco">Reminders</h2>
            <Button 
              onClick={() => navigate('/chasers/new', { state: { propertyId: property.id } })}
              className="bg-gold-500 hover:bg-gold-600 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> 
              Add Reminder
            </Button>
          </div>
          
          {chasers.length === 0 ? (
            <Card className="border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/20">
              <CardContent className="pt-6 pb-4 px-6 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gold-500 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No reminders added yet</h3>
                <p className="text-muted-foreground">Create reminders for important tasks.</p>
                <Button 
                  onClick={() => navigate('/chasers/new', { state: { propertyId: property.id } })}
                  variant="outline"
                  className="mt-4 border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> 
                  Add Your First Reminder
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {chasers.map(chaser => (
                <Card key={chaser.id} className="border-gold-200 dark:border-gold-800 hover:bg-gold-50 dark:hover:bg-gold-900/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 p-2 rounded-md ${
                          chaser.priority === "high" ? "bg-red-100 dark:bg-red-900/30" :
                          chaser.priority === "medium" ? "bg-amber-100 dark:bg-amber-900/30" :
                          "bg-green-100 dark:bg-green-900/30"
                        }`}>
                          <Bell className={`h-5 w-5 ${
                            chaser.priority === "high" ? "text-red-500" :
                            chaser.priority === "medium" ? "text-amber-500" :
                            "text-green-500"
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{chaser.title}</h3>
                          {chaser.description && (
                            <p className="text-sm text-muted-foreground">{chaser.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2 items-center">
                            <Badge variant={chaser.completed ? "outline" : chaser.dueDate < Date.now() ? "destructive" : "secondary"} className="text-xs">
                              {chaser.completed ? "Completed" : chaser.dueDate < Date.now() ? "Overdue" : "Pending"}
                            </Badge>
                            <span className="text-sm flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {formatDate(chaser.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="notes" className="mt-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-artdeco">Notes</h2>
            <Button 
              onClick={() => navigate('/notes/new', { state: { propertyId: property.id } })}
              className="bg-gold-500 hover:bg-gold-600 text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> 
              Add Note
            </Button>
          </div>
          
          {notes.length === 0 ? (
            <Card className="border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/20">
              <CardContent className="pt-6 pb-4 px-6 text-center">
                <StickyNote className="h-12 w-12 mx-auto mb-4 text-gold-500 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No notes added yet</h3>
                <p className="text-muted-foreground">Add notes to keep track of important information.</p>
                <Button 
                  onClick={() => navigate('/notes/new', { state: { propertyId: property.id } })}
                  variant="outline"
                  className="mt-4 border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> 
                  Add Your First Note
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notes.map(note => (
                <Card key={note.id} className="border-gold-200 dark:border-gold-800 hover:bg-gold-50 dark:hover:bg-gold-900/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-md bg-gold-100 dark:bg-gold-900/30">
                          <StickyNote className="h-5 w-5 text-gold-500" />
                        </div>
                        <div>
                          <h3 className="font-medium">{note.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {note.content.length > 150 ? note.content.substring(0, 150) + "..." : note.content}
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Created: {formatDate(note.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* PDF Preview Dialog */}
      {isPreviewOpen && previewUrl && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedBill?.provider} - {formatUtilityType(selectedBill?.utilityType || '')} Bill</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {/* Show PDF or image or fallback */}
              {(() => {
                const isPdf = previewUrl && (
                  previewUrl.endsWith('.pdf') ||
                  previewUrl.startsWith('blob:') ||
                  previewUrl.startsWith('data:application/pdf')
                );
                return isPdf ? (
                  <iframe 
                    src={previewUrl} 
                    className="w-full h-[70vh] border border-gold-200 dark:border-gold-800 rounded-md"
                    title="Bill Document"
                  />
                ) : (
                  <img 
                    src={previewUrl} 
                    alt="Bill Document" 
                    className="w-full max-h-[70vh] object-contain border border-gold-200 dark:border-gold-800 rounded-md mx-auto"
                  />
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PropertyDetailPage;

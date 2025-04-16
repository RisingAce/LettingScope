import React, { useState, useEffect, useMemo } from "react";
import { useAppData } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { CreditCard, Plus, Search, Building, ArrowUpDown, FileText, Edit, StickyNote } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CheckCircle, Trash2, Flag } from "lucide-react";
import { UtilityType, BillStatus } from "@/types";
import { useLocalDocStore, LocalDocMeta } from "@/hooks/useLocalDocStore";

// Custom hook for loading local bill thumbnails
function useBillThumbnail(localDocKey?: string) {
  const { getDoc, getPreviewUrl } = useLocalDocStore();
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    async function loadThumb() {
      console.log('BillThumbnail: localDocKey:', localDocKey);
      if (localDocKey) {
        const blob = await getDoc(localDocKey);
        console.log('BillThumbnail: blob:', blob);
        if (blob && active) {
          const url = getPreviewUrl(blob);
          console.log('BillThumbnail: previewUrl:', url);
          setThumbUrl(url);
        }
      } else {
        setThumbUrl(null);
      }
    }
    loadThumb();
    return () => { active = false; };
  }, [localDocKey, getDoc, getPreviewUrl]);
  return thumbUrl;
}

// New BillThumbnail component
function BillThumbnail({ localDocKey, bill, onClick }: { localDocKey?: string, bill: any, onClick: (bill: any) => void }) {
  const thumbUrl = useBillThumbnail(localDocKey);
  console.log('BillThumbnail render: bill:', bill, 'localDocKey:', localDocKey, 'thumbUrl:', thumbUrl);

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

const BillsPage: React.FC = () => {
  const { data, formatCurrency, formatDate, getNotesByBillId, addNote: addNoteToContext, updateNote, deleteNote } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "all">("all");
  const [utilityFilter, setUtilityFilter] = useState<string | "all">("all");
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof sortOptions;
    direction: "asc" | "desc";
  }>({
    key: "dueDate",
    direction: "desc",
  });
  const { getDoc, getPreviewUrl } = useLocalDocStore();
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [notesDialogBill, setNotesDialogBill] = useState<any | null>(null);
  const [addNoteOpen, setAddNoteOpen] = useState(false);

  const highlightId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("highlight");
  }, [location.search]);
  const highlightedRef = React.useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    if (highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      // Optionally, focus for accessibility:
      highlightedRef.current.focus({ preventScroll: true });
    }
  }, [highlightId]);

  const handleSort = (key: keyof typeof sortOptions) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const handleViewDocument = async (bill: any) => {
    setSelectedBill(bill);
    setIsPreviewOpen(true);
    let url = getBillDocumentUrl(bill);
    if (bill.localDocKeys?.[0]) {
      const blob = await getDoc(bill.localDocKeys[0]);
      if (blob) url = getPreviewUrl(blob);
    } else if (bill.localDocKey) {
      const blob = await getDoc(bill.localDocKey);
      if (blob) url = getPreviewUrl(blob);
    }
    setPreviewUrl(url);
  };

  const handleBillThumbnailClick = (bill: any) => {
    handleViewDocument(bill);
  };

  const sortOptions = {
    dueDate: (a: any, b: any) => a.dueDate - b.dueDate,
    amount: (a: any, b: any) => a.amount - b.amount,
    provider: (a: any, b: any) => a.provider.localeCompare(b.provider),
    status: (a: any, b: any) => a.status.localeCompare(b.status),
  };

  const formatUtilityType = (types: string) => {
    const arr = types.split(",");
    return arr.map(type =>
      type === "gasAndElectricity" ? "Gas & Electricity" :
      type === "councilTax" ? "Council Tax" :
      type.charAt(0).toUpperCase() + type.slice(1)
    ).join(", ");
  };

  const getBillDocumentUrl = (bill: any) => {
    if (!bill.documentUrl) return null;
    try {
      if (bill.documentUrl.startsWith("[")) {
        const docs = JSON.parse(bill.documentUrl);
        if (Array.isArray(docs) && docs[0]?.url) return docs[0].url;
      }
    } catch {}
    return bill.documentUrl;
  };

  const filteredBills = data.bills
    .filter(bill => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const property = data.properties.find(p => p.id === bill.propertyId);
        return (
          bill.provider.toLowerCase().includes(query) ||
          bill.utilityType.toLowerCase().includes(query) ||
          (property && property.name.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(bill => {
      if (statusFilter === "all") return true;
      return bill.status === statusFilter;
    })
    .filter(bill => {
      if (utilityFilter === "all") return true;
      if (bill.utilityType.includes(utilityFilter)) {
        return true;
      } else {
        return false;
      }
    })
    .sort((a, b) => {
      const sortFn = sortOptions[sortConfig.key];
      const result = sortFn(a, b);
      return sortConfig.direction === "asc" ? result : -result;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-3xl font-artdeco">Bills</h1>
        <Button asChild className="bg-gold-500 hover:bg-gold-600 text-white">
          <Link to="/bills/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Bill
          </Link>
        </Button>
      </div>

      <Card className="border-gold-200 dark:border-gold-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gold-500" />
            Bills
          </CardTitle>
          <CardDescription>Manage your property bills</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
                className="pl-8 border-gold-200 dark:border-gold-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as BillStatus | "all")}
            >
              <SelectTrigger className="w-full md:w-[180px] border-gold-200 dark:border-gold-800">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={utilityFilter}
              onValueChange={(value) => setUtilityFilter(value as string | "all")}
            >
              <SelectTrigger className="w-full md:w-[180px] border-gold-200 dark:border-gold-800">
                <SelectValue placeholder="Filter by utility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Utilities</SelectItem>
                <SelectItem value="electricity">Electricity</SelectItem>
                <SelectItem value="gas">Gas</SelectItem>
                <SelectItem value="gasAndElectricity">Gas & Electricity</SelectItem>
                <SelectItem value="water">Water</SelectItem>
                <SelectItem value="internet">Internet</SelectItem>
                <SelectItem value="councilTax">Council Tax</SelectItem>
                <SelectItem value="tv">TV</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bills Table */}
          {filteredBills.length > 0 ? (
            <div className="rounded-md border border-gold-200 dark:border-gold-800">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-medium px-0 hover:bg-transparent hover:text-gold-600"
                        onClick={() => handleSort("provider")}
                      >
                        Bill / Property
                        {sortConfig.key === "provider" && (
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-medium px-0 hover:bg-transparent hover:text-gold-600"
                        onClick={() => handleSort("amount")}
                      >
                        Amount
                        {sortConfig.key === "amount" && (
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-medium px-0 hover:bg-transparent hover:text-gold-600"
                        onClick={() => handleSort("dueDate")}
                      >
                        Due Date
                        {sortConfig.key === "dueDate" && (
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-medium px-0 hover:bg-transparent hover:text-gold-600"
                        onClick={() => handleSort("status")}
                      >
                        Status
                        {sortConfig.key === "status" && (
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => {
                    const property = data.properties.find(p => p.id === bill.propertyId);
                    const isHighlighted = highlightId === bill.id;
                    return (
                      <TableRow
                        key={bill.id}
                        ref={isHighlighted ? highlightedRef : undefined}
                        tabIndex={isHighlighted ? 0 : -1}
                        className={isHighlighted ? "ring-2 ring-gold-400 ring-offset-2 animate-pulse bg-gold-50 dark:bg-gold-900/30" : ""}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{bill.provider}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {property?.name || "Unknown Property"}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {formatUtilityType(bill.utilityType)}
                            </div>
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
                          }`}>
                            {bill.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <BillThumbnail localDocKey={bill.localDocKeys?.[0] || bill.localDocKey} bill={bill} onClick={handleBillThumbnailClick} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => navigate(`/bills/${bill.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {(bill.localDocKeys?.length || bill.localDocKey || bill.documentUrl) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewDocument(bill)}
                              >
                                View
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 border-gold-200 dark:border-gold-800"
                              asChild
                            >
                              <Link to={`/properties/${bill.propertyId}`}>
                                View Property
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-gold-200 dark:border-gold-800 flex items-center gap-1"
                              onClick={() => setNotesDialogBill(bill)}
                            >
                              <StickyNote className="w-4 h-4 mr-1" />
                              Notes
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No bills found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || statusFilter !== "all" || utilityFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by adding your first bill"}
              </p>
              {!searchQuery && statusFilter === "all" && utilityFilter === "all" && (
                <Button asChild className="mt-4 bg-gold-500 hover:bg-gold-600 text-white">
                  <Link to="/bills/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Bill
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Dialog - handles images, PDFs, text, and fallback download */}
      {isPreviewOpen && selectedBill && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedBill?.provider} - {formatUtilityType(selectedBill?.utilityType || '')} Bill
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <BillDocumentViewer bill={selectedBill} />
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Bill Notes Modal Dialog */}
      {notesDialogBill && (
        <Dialog open={!!notesDialogBill} onOpenChange={open => !open && setNotesDialogBill(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden shadow-2xl rounded-2xl border-0 bg-gradient-to-br from-gold-50 via-white to-gold-100 dark:from-gold-950 dark:via-gold-900 dark:to-gold-950">
            <DialogHeader className="bg-gradient-to-r from-gold-500 via-gold-400 to-yellow-300 text-white px-8 py-6 rounded-t-2xl shadow-md">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
                <StickyNote className="w-7 h-7 text-white drop-shadow" />
                Notes for Bill
                <span className="ml-2 bg-white/20 px-3 py-1 rounded-lg text-base font-semibold tracking-wide text-white shadow-sm">
                  {notesDialogBill.provider} <span className="opacity-80">({formatCurrency(notesDialogBill.amount)})</span>
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="bg-white dark:bg-gold-950 px-8 py-8">
              <ul className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2">
                {getNotesByBillId(notesDialogBill.id).length === 0 && (
                  <li className="text-center text-base text-muted-foreground italic py-8">No notes for this bill yet.</li>
                )}
                {getNotesByBillId(notesDialogBill.id).map(note => (
                  <li key={note.id} className={`bg-gold-50/80 dark:bg-gold-950/70 rounded-xl p-4 border border-gold-100 dark:border-gold-900 shadow-sm flex flex-col gap-1 relative transition-all ${note.completed ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <StickyNote className="w-4 h-4 text-gold-400" />
                      <span className={`font-semibold text-gold-900 dark:text-gold-100 text-base ${note.completed ? 'line-through' : ''}`}>{note.title}</span>
                      <div className="flex items-center gap-1 ml-2">
                        {/* Priority Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="w-7 h-7 p-0" title="Set Priority">
                              <Flag className={`w-4 h-4 ${note.priority === 'high' ? 'text-red-500' : note.priority === 'medium' ? 'text-yellow-500' : note.priority === 'low' ? 'text-green-500' : 'text-gray-400'}`} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => updateNote({ ...note, priority: undefined })}>
                              <Flag className="w-4 h-4 mr-2 text-gray-400" /> Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateNote({ ...note, priority: 'high' })}>
                              <Flag className="w-4 h-4 mr-2 text-red-500" /> High
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateNote({ ...note, priority: 'medium' })}>
                              <Flag className="w-4 h-4 mr-2 text-yellow-500" /> Medium
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateNote({ ...note, priority: 'low' })}>
                              <Flag className="w-4 h-4 mr-2 text-green-500" /> Low
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {/* Completed Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="w-7 h-7 p-0" title="Mark Complete">
                              <CheckCircle className={`w-4 h-4 ${note.completed ? 'text-green-600' : 'text-gray-400'}`} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => updateNote({ ...note, completed: false })}>
                              <CheckCircle className="w-4 h-4 mr-2 text-gray-400" /> Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateNote({ ...note, completed: true })}>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-600" /> Complete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {/* Delete Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="w-7 h-7 p-0" title="Delete Note">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => deleteNote(note.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2 text-destructive" /> Delete Note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className={`text-sm whitespace-pre-wrap text-gold-800 dark:text-gold-200 leading-relaxed ${note.completed ? 'line-through opacity-70' : ''}`}>{note.content}</div>
                    <div className="text-xs text-muted-foreground mt-1 text-right">{formatDate(note.createdAt)}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 text-right">
                <DropdownMenu open={addNoteOpen} onOpenChange={setAddNoteOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button size="lg" variant="outline" className="bg-gradient-to-r from-gold-100 to-gold-200 hover:from-gold-200 hover:to-yellow-100 text-gold-800 font-semibold rounded-lg shadow border-2 border-gold-200 px-6 py-2 transition-all">
                      {addNoteOpen ? 'Close Add Note' : 'Add Note'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[420px] p-6 rounded-2xl shadow-xl animate-fade-in bg-white dark:bg-gold-950 border-gold-200 dark:border-gold-900">
                    <div className="mb-4 text-lg font-bold text-gold-700 dark:text-gold-200 flex items-center gap-2">
                      <StickyNote className="w-5 h-5" />
                      Add a New Note
                    </div>
                    <form className="space-y-3" onSubmit={e => {
                      e.preventDefault();
                      if (!newNoteContent.trim() || !newNoteTitle.trim()) return;
                      addNoteToContext({ billId: notesDialogBill.id, title: newNoteTitle, content: newNoteContent });
                      setNewNoteContent("");
                      setNewNoteTitle("");
                      setAddNoteOpen(false);
                    }}>
                      <input
                        type="text"
                        className="w-full rounded-lg border-2 border-gold-200 dark:border-gold-800 px-4 py-2 text-base focus:ring-2 focus:ring-gold-400 transition-all shadow-sm bg-gold-50 dark:bg-gold-900 placeholder:text-gold-400"
                        placeholder="Note title (required)"
                        value={newNoteTitle}
                        onChange={e => setNewNoteTitle(e.target.value)}
                        required
                      />
                      <textarea
                        className="w-full rounded-lg border-2 border-gold-200 dark:border-gold-800 px-4 py-2 text-base focus:ring-2 focus:ring-gold-400 transition-all shadow-sm bg-gold-50 dark:bg-gold-900 placeholder:text-gold-400"
                        placeholder="Write your note here... (required)"
                        value={newNoteContent}
                        onChange={e => setNewNoteContent(e.target.value)}
                        rows={3}
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="lg" type="submit" className="bg-gradient-to-r from-gold-400 to-gold-600 text-white px-8 py-2 rounded-lg shadow font-semibold text-base hover:from-gold-500 hover:to-yellow-400 transition-all">Save Note</Button>
                        <Button size="lg" type="button" variant="ghost" className="font-semibold text-gold-600 hover:bg-gold-100 dark:hover:bg-gold-900" onClick={() => setAddNoteOpen(false)}>Cancel</Button>
                      </div>
                    </form>
                    {(!newNoteTitle.trim() || !newNoteContent.trim()) && (
                      <div className="mt-3 text-center text-base text-gold-500 italic animate-pulse">Start typing to add your note...</div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-8 text-right">
                <Button size="sm" variant="link" className="text-gold-700 underline font-medium text-base hover:text-gold-900" onClick={() => window.open('/notes?billId=' + notesDialogBill.id, '_blank')}>View all notes</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

function BillDocumentViewer({ bill }: { bill: any }) {
  const { getDoc } = useLocalDocStore();
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchDoc() {
      let key = bill.localDocKeys?.[0] || bill.localDocKey;
      if (!key) return;
      const b = await getDoc(key);
      if (!b || !active) return;
      setBlob(b);
      setMimeType(b.type || 'application/octet-stream');
      setFilename(key);
      const u = URL.createObjectURL(b);
      setUrl(u);
      // If text, load content
      if (b.type.startsWith('text/')) {
        const txt = await b.text();
        setTextContent(txt);
      }
    }
    fetchDoc();
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill]);

  if (!blob || !url) return <div className="text-center text-muted-foreground">No document found.</div>;

  if (mimeType?.startsWith('image/')) {
    return <img src={url} alt={filename || 'Bill Document'} style={{ maxWidth: '100%', maxHeight: '70vh', margin: '0 auto' }} />;
  }
  if (mimeType === 'application/pdf') {
    return <iframe src={url} title="PDF Viewer" style={{ width: '100%', height: '70vh', border: 'none' }} />;
  }
  if (mimeType?.startsWith('text/')) {
    return <pre className="bg-muted p-4 rounded max-h-[70vh] overflow-auto">{textContent || 'Loading...'}</pre>;
  }
  // Fallback: download
  return (
    <div className="text-center">
      <a href={url} download={filename || 'document'} className="text-gold-700 underline font-medium">Download file</a>
      <div className="text-xs text-muted-foreground mt-2">Cannot preview this file type.</div>
    </div>
  );
}

export default BillsPage;

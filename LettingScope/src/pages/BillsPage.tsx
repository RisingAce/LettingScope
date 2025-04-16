import React, { useState, useEffect, useMemo } from "react";
import { useAppData } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { CreditCard, Plus, Search, Building, ArrowUpDown, FileText, Edit } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const { data, formatCurrency, formatDate } = useAppData();
  const navigate = useNavigate();
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
                    return (
                      <TableRow key={bill.id}>
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

export default BillsPage;

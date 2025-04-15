import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building, FileText, CalendarIcon, DollarSign, Plus, Trash2, ImageIcon, PaperclipIcon, FilePlus2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppData } from "@/contexts/AppContext";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { extractTextFromPDF, parseBillData, ExtractedBillData, generatePDFThumbnail } from "@/utils/pdfUtils";
import { LoadingIcon } from "@/components/ui/loading-icon";
import type { UtilityType } from "@/types/index";

const utilitiesSchema = z.object({
  propertyId: z.string().min(1, "Property selection is required"),
  utilityType: z.array(z.enum(["electricity", "gas", "water", "internet", "councilTax", "tv", "other"])).optional(),
  provider: z.string().optional(),
  accountNumber: z.string().optional(),
  amount: z.number().optional(),
  issueDate: z.date().optional(),
  dueDate: z.date().optional(),
  status: z.enum(["pending", "paid", "overdue", "disputed"]).optional(),
  paid: z.boolean().optional(),
  paidDate: z.date().optional(),
  documentUrl: z.string().optional(),
  notes: z.string().optional(),
});

type BillFormValues = z.infer<typeof utilitiesSchema>;

interface DocumentPreview {
  name: string;
  url: string;
  thumbnail: string | null;
  isPdf: boolean;
}

const AddBillPage: React.FC = () => {
  const { addBill, updateBill, getBillById, data } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();
  const { billId } = useParams();
  
  const preselectedPropertyId = location.state?.propertyId;
  
  const [documents, setDocuments] = useState<DocumentPreview[]>([]);
  const [bills, setBills] = useState<BillFormValues[]>([]);
  const [currentBillIndex, setCurrentBillIndex] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  
  const form = useForm<BillFormValues>({
    resolver: zodResolver(utilitiesSchema),
    defaultValues: {
      propertyId: preselectedPropertyId || "",
      utilityType: ["electricity"],
      provider: "",
      accountNumber: "",
      amount: undefined as unknown as number,
      issueDate: new Date(),
      dueDate: new Date(),
      status: "pending",
      paid: false,
      paidDate: undefined,
      documentUrl: "",
      notes: "",
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachment = async (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    let thumbnail = null;
    if (isImage) {
      thumbnail = fileUrl;
    } else if (isPdf) {
      try {
        thumbnail = await generatePDFThumbnail(file);
        if (!thumbnail) {
          toast.warning('PDF thumbnail generation failed.');
        }
        console.log('PDF thumbnail result:', thumbnail);
      } catch (err) {
        console.error('Error generating PDF thumbnail:', err);
        thumbnail = null;
        toast.error('Error generating PDF thumbnail.');
      }
    }
    setDocuments(prev => [...prev, {
      name: file.name,
      url: fileUrl,
      thumbnail: thumbnail,
      isPdf: isPdf
    }]);
    if (isPdf) {
      console.log('PDF document added:', { name: file.name, url: fileUrl, thumbnail });
    }
  };

  const handleParsePdf = async (index: number) => {
    const doc = documents[index];
    if (!doc || !doc.isPdf) return;
    setIsParsing(true);
    toast.info("Analyzing PDF bill...");
    try {
      const response = await fetch(doc.url);
      const blob = await response.blob();
      const file = new File([blob], doc.name, { type: 'application/pdf' });
      const textContent = await extractTextFromPDF(file);
      const extractedData = parseBillData(textContent);
      updateFormWithExtractedData(extractedData);
      toast.success("Bill details extracted from PDF");
    } catch (error) {
      toast.error("Failed to analyze PDF");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    for (const file of Array.from(files)) {
      await handleAttachment(file);
    }
    
    event.target.value = '';
  };

  const updateFormWithExtractedData = (data: ExtractedBillData) => {
    if (data.amount && !form.getValues().amount) {
      form.setValue('amount', data.amount);
    }
    
    if (data.provider && !form.getValues().provider) {
      form.setValue('provider', data.provider);
    }
    
    if (data.accountNumber && !form.getValues().accountNumber) {
      form.setValue('accountNumber', data.accountNumber);
    }
    
    if (data.utilityType && form.getValues().utilityType.includes('electricity')) {
      const validUtilityType = data.utilityType as "electricity" | "gas" | "water" | "internet" | "councilTax" | "tv" | "other";
      form.setValue('utilityType', [...form.getValues().utilityType, validUtilityType]);
    }
    
    if (data.issueDate) {
      form.setValue('issueDate', data.issueDate);
    }
    
    if (data.dueDate) {
      form.setValue('dueDate', data.dueDate);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      if (updated[index].thumbnail) {
        URL.revokeObjectURL(updated[index].thumbnail);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const addCurrentBill = () => {
    if (!form.formState.isValid) {
      form.trigger();
      return;
    }
    
    const values = form.getValues();
    setBills(prev => [...prev, values]);
    
    form.reset({
      propertyId: values.propertyId,
      utilityType: ["electricity"],
      provider: "",
      accountNumber: "",
      amount: undefined as unknown as number,
      issueDate: new Date(),
      dueDate: new Date(),
      status: "pending",
      paid: false,
      paidDate: undefined,
      documentUrl: "",
      notes: "",
    });
    
    setDocuments([]);
    setCurrentBillIndex(prev => prev + 1);
    
    toast.success("Bill added to batch. You can add more bills or submit all.");
  };

  const removeBill = (index: number) => {
    setBills(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    
    if (bills.length === 1) {
      setCurrentBillIndex(0);
    }
    
    toast.success("Bill removed from batch.");
  };

  const submitAllBills = () => {
    console.log('submitAllBills called');
    console.log('form.formState:', form.formState);
    console.log('form.getValues():', form.getValues());
    let allBills = [...bills];
    // Always add the current form values if propertyId is present
    const currentValues = form.getValues();
    if (currentValues.propertyId && typeof currentValues.propertyId === 'string' && currentValues.propertyId.trim() !== '') {
      allBills.push(currentValues);
    }
    console.log('allBills after push:', allBills);

    if (allBills.length === 0) {
      toast.error("Please add at least one valid bill");
      return;
    }

    try {
      allBills.forEach(bill => {
        let documentUrl = bill.documentUrl || "";
        if (documents && documents.length > 0) {
          documentUrl = JSON.stringify(documents);
        }
        const billData = {
          propertyId: bill.propertyId,
          utilityType: Array.isArray(bill.utilityType)
            ? bill.utilityType.filter((ut) =>
                ["electricity","gas","water","internet","councilTax","tv","other"].includes(ut)
              ).join(",")
            : bill.utilityType && ["electricity","gas","water","internet","councilTax","tv","other"].includes(bill.utilityType)
              ? bill.utilityType
              : "electricity",
          provider: bill.provider || "Unknown",
          accountNumber: bill.accountNumber || "",
          amount: bill.amount ?? 0,
          issueDate: bill.issueDate instanceof Date ? bill.issueDate.getTime() : bill.issueDate,
          dueDate: bill.dueDate instanceof Date ? bill.dueDate.getTime() : bill.dueDate,
          status: bill.status || "pending",
          paid: bill.paid ?? false,
          paidDate: bill.paidDate ? (bill.paidDate instanceof Date ? bill.paidDate.getTime() : bill.paidDate) : undefined,
          documentUrl: documentUrl,
          notes: bill.notes || "",
        };
        addBill(billData);
      });

      toast.success(`${allBills.length} bill${allBills.length !== 1 ? 's' : ''} added successfully`);

      if (preselectedPropertyId) {
        navigate(`/properties/${preselectedPropertyId}`);
      } else {
        navigate("/properties");
      }
    } catch (error) {
      console.error("Error adding bills:", error);
      toast.error("Failed to add bills");
    }
  };

  const formatUtilityType = (types: string | string[]) => {
    if (Array.isArray(types)) {
      return types.map(type =>
        type === "gasAndElectricity" ? "Gas & Electricity" :
        type === "councilTax" ? "Council Tax" :
        type.charAt(0).toUpperCase() + type.slice(1)
      ).join(", ");
    } else {
      if (types === "councilTax") return "Council Tax";
      return types.charAt(0).toUpperCase() + types.slice(1);
    }
  };

  useEffect(() => {
    if (billId) {
      const bill = getBillById(billId);
      if (bill) {
        form.reset({
          ...bill,
          utilityType: Array.isArray(bill.utilityType)
            ? bill.utilityType.filter((ut) =>
                ["electricity","gas","water","internet","councilTax","tv","other"].includes(ut)
              )
            : bill.utilityType && ["electricity","gas","water","internet","councilTax","tv","other"].includes(bill.utilityType)
              ? [bill.utilityType]
              : ["electricity"],
          issueDate: bill.issueDate ? new Date(bill.issueDate) : undefined,
          dueDate: bill.dueDate ? new Date(bill.dueDate) : undefined,
          paidDate: bill.paidDate ? new Date(bill.paidDate) : undefined,
        });
        // Optionally set documents state if you want to show existing attachments
      }
    }
  }, [billId]);

  const onSubmit = async (values: BillFormValues) => {
    if (billId) {
      // Compose a Bill object for updateBill
      const bill = {
        ...getBillById(billId),
        ...values,
        utilityType: Array.isArray(values.utilityType)
          ? values.utilityType.filter((ut) =>
              ["electricity","gas","water","internet","councilTax","tv","other"].includes(ut)
            ).join(",")
          : values.utilityType && ["electricity","gas","water","internet","councilTax","tv","other"].includes(values.utilityType)
            ? values.utilityType
            : "electricity",
        issueDate: values.issueDate ? values.issueDate.valueOf() : undefined,
        dueDate: values.dueDate ? values.dueDate.valueOf() : undefined,
        paidDate: values.paidDate ? values.paidDate.valueOf() : undefined,
      };
      await updateBill(bill);
      toast.success("Bill updated successfully");
    } else {
      await addBill({
        ...values,
        propertyId: values.propertyId || preselectedPropertyId,
        utilityType: Array.isArray(values.utilityType)
          ? values.utilityType.filter((ut) =>
              ["electricity","gas","water","internet","councilTax","tv","other"].includes(ut)
            ).join(",")
          : values.utilityType && ["electricity","gas","water","internet","councilTax","tv","other"].includes(values.utilityType)
            ? values.utilityType
            : "electricity",
        status: values.status || "pending",
        paid: values.paid ?? false,
        provider: values.provider || "Unknown",
        amount: values.amount ?? 0,
        issueDate: values.issueDate ? values.issueDate.valueOf() : undefined,
        dueDate: values.dueDate ? values.dueDate.valueOf() : undefined,
        paidDate: values.paidDate ? values.paidDate.valueOf() : undefined,
      });
      toast.success("Bill added successfully");
    }
    navigate("/bills");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(preselectedPropertyId ? `/properties/${preselectedPropertyId}` : "/properties")}
            className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-artdeco">Add Utility Bills</h1>
        </div>
      </div>

      {bills.length > 0 && (
        <Card className="border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/20">
          <CardHeader className="py-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-4 w-4 text-gold-500" />
              Bills in Current Batch ({bills.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="space-y-2">
              {bills.map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md border border-gold-200 dark:border-gold-800">
                  <div>
                    <p className="font-medium">{bill.provider} - {formatUtilityType(bill.utilityType)}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(bill.dueDate, "PPP")} | Amount: £{bill.amount.toFixed(2)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeBill(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-gold-200 dark:border-gold-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gold-500" />
            Bill Details {bills.length > 0 ? `(${currentBillIndex + 1})` : ''}
          </CardTitle>
          <CardDescription>
            Add utility bills associated with a property. Upload PDF bills to automatically extract details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!!preselectedPropertyId}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gold-200 dark:border-gold-800">
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {data.properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>{property.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="utilityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Utility Type</FormLabel>
                      <div className="flex flex-wrap gap-2">
                        {(["electricity", "gas", "water", "internet", "councilTax", "tv", "other"] as UtilityType[]).map((type) => (
                          <label key={type} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={field.value.includes(type)}
                              onChange={() => {
                                if (field.value.includes(type)) {
                                  field.onChange(field.value.filter((t: UtilityType) => t !== type));
                                } else {
                                  field.onChange([...field.value, type]);
                                }
                              }}
                            />
                            {type === "councilTax" ? "Council Tax"
                              : type.charAt(0).toUpperCase() + type.slice(1)}
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter provider name" 
                          className="border-gold-200 dark:border-gold-800" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter account number" 
                          className="border-gold-200 dark:border-gold-800" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number" 
                            placeholder="0.00"
                            className="border-gold-200 dark:border-gold-800 pl-9"
                            onChange={e => field.onChange(parseFloat(e.target.value) || 0)} 
                            value={field.value || ""}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal border-gold-200 dark:border-gold-800",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal border-gold-200 dark:border-gold-800",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gold-200 dark:border-gold-800">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="disputed">Disputed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-gold-200 dark:border-gold-800">
                      <div className="space-y-0.5">
                        <FormLabel>Mark as Paid</FormLabel>
                        <CardDescription>
                          Toggle if this bill has been paid
                        </CardDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("paid") && (
                <FormField
                  control={form.control}
                  name="paidDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Payment Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal border-gold-200 dark:border-gold-800",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="mb-6">
                <label className="block font-medium mb-2">Attachments</label>
                <div
                  className="border-2 border-dashed border-gold-200 dark:border-gold-800 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gold-50 dark:hover:bg-gold-900/10 transition-colors mb-2"
                  onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={async e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = Array.from(e.dataTransfer.files);
                    for (const file of files) {
                      await handleAttachment(file);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label="Drop files here or click to upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PaperclipIcon className="h-8 w-8 text-gold-400 mb-2" />
                  <span className="text-sm text-muted-foreground">Drag and drop files here, or click to select</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {documents.map((doc, index) => (
                    <div key={doc.url} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden border border-gold-200 dark:border-gold-800 bg-white dark:bg-background flex items-center justify-center">
                        {doc.thumbnail ? (
                          <img src={doc.thumbnail} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4">
                            {doc.isPdf ? (
                              <FilePlus2 className="h-10 w-10 text-gold-500 mb-2" />
                            ) : (
                              <FileText className="h-10 w-10 text-gold-500 mb-2" />
                            )}
                            <p className="text-xs text-center truncate w-full">{doc.name}</p>
                            {doc.isPdf && (
                              <span className="text-xs font-medium text-gold-500 mt-1">PDF</span>
                            )}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                      {doc.isPdf && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-1"
                          onClick={() => handleParsePdf(index)}
                          disabled={isParsing}
                        >
                          {isParsing ? <LoadingIcon className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                          Extract Bill Data
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any additional notes about this bill" 
                        className="min-h-24 border-gold-200 dark:border-gold-800" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-between gap-2 px-0 pt-4 flex-wrap">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(preselectedPropertyId ? `/properties/${preselectedPropertyId}` : "/properties")}
                  className="border-gold-200 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/40"
                >
                  Cancel
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={addCurrentBill}
                    className="border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/20 hover:bg-gold-100 dark:hover:bg-gold-900/40"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Batch
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gold-500 hover:bg-gold-600 text-white"
                  >
                    Submit {bills.length > 0 ? `All (${bills.length + (form.formState.isValid && form.getValues().provider !== "" ? 1 : 0)})` : ""}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBillPage;

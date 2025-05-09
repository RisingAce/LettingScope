import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalDocStore } from "@/hooks/useLocalDocStore";
import { useAppData } from "@/contexts/AppContext";
import { extractTextFromPDF, parseBillData, generatePDFThumbnail, ExtractedBillData } from "@/utils/pdfUtils";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

// Preview type for thumbnails and parsed bill data
type FilePreview = { file: File; thumbnail?: string; data?: ExtractedBillData };

const BillParserXtremePage: React.FC = () => {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [processing, setProcessing] = useState(false);
  const appData = useAppData();
  const { addProperty, addBill, data, formatDate, formatCurrency } = appData;
  const { saveDoc } = useLocalDocStore();

  // Generate thumbnail and parse each selected PDF
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPreviews([]);
    for (const file of files) {
      try {
        const thumbnail = await generatePDFThumbnail(file);
        const text = await extractTextFromPDF(file);
        const parsed = parseBillData(text);
        setPreviews(prev => [...prev, { file, thumbnail, data: parsed }]);
      } catch (err) {
        console.error(err);
        toast.error(`Error parsing ${file.name}`);
      }
    }
  };

  // Add all parsed bills to context
  const handleParseAndAdd = async () => {
    if (!previews.length) {
      toast.error("No files selected");
      return;
    }
    setProcessing(true);
    for (const item of previews) {
      if (!item.data) {
        toast.error(`Skipping ${item.file.name}`);
        continue;
      }
      try {
        const key = await saveDoc(item.file);
        const d = item.data;
        const suggestion = d.propertySuggestion;
        let prop = suggestion
          ? data.properties.find(p => p.address.trim().toLowerCase() === suggestion.address.trim().toLowerCase())
          : undefined;
        if (!prop && suggestion) {
          prop = addProperty({ name: suggestion.name || suggestion.address, address: suggestion.address });
        }
        if (!prop) {
          toast.error(`No property for ${item.file.name}`);
          continue;
        }
        addBill({
          propertyId: prop.id,
          utilityType: d.utilityType || "other",
          provider: d.provider || "",
          accountNumber: d.accountNumber || "",
          amount: d.amount || 0,
          issueDate: d.issueDate?.getTime() || Date.now(),
          dueDate: d.dueDate?.getTime() || Date.now(),
          status: "pending",
          paid: false,
          localDocKeys: [key],
        });
        toast.success(`Added bill for ${prop.name}`);
      } catch (err) {
        console.error(err);
        toast.error(`Failed to add ${item.file.name}`);
      }
    }
    setProcessing(false);
    setPreviews([]);
  };

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-artdeco">BillParserXtreme</h1>
      <Card className="border-gold-200 dark:border-gold-800">
        <CardHeader>
          <CardTitle>Upload & Parse Bills in Xtreme Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="file"
            accept="application/pdf"
            multiple
            disabled={processing}
            onChange={handleFilesChange}
            className="hidden"
          />
          <label htmlFor="bill-upload" className="block w-full border-2 border-dashed border-cyan-500 dark:border-cyan-400 rounded-lg p-6 text-center cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900 transition mb-4">
            <UploadCloud className="mx-auto h-8 w-8 text-cyan-500 dark:text-cyan-400" />
            <p className="mt-2 text-sm text-muted-foreground">Drag & drop PDF(s) here, or click to browse</p>
            <input
              id="bill-upload"
              type="file"
              accept="application/pdf"
              multiple
              disabled={processing}
              onChange={handleFilesChange}
              className="hidden"
            />
          </label>
          {previews.length > 0 && (
            <>
              <div className="grid gap-4 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {previews.map((p, idx) => (
                  <Card key={idx} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-indigo-400/50 transition-shadow">
                    {p.thumbnail && <img src={p.thumbnail} alt={p.file.name} className="w-full h-32 object-cover" />}
                    <CardContent className="space-y-1">
                      <p className="font-bold truncate">{p.file.name}</p>
                      <div className="text-sm grid grid-cols-2 gap-1">
                        <span>Amt: {p.data?.amount ? formatCurrency(p.data.amount) : '-'}</span>
                        <span>Type: {p.data?.utilityType || '-'}</span>
                        <span>Issue: {p.data?.issueDate ? formatDate(p.data.issueDate.getTime()) : '-'}</span>
                        <span>Due: {p.data?.dueDate ? formatDate(p.data.dueDate.getTime()) : '-'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button onClick={handleParseAndAdd} disabled={processing} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                {processing ? "Adding..." : "Add All Bills"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillParserXtremePage;

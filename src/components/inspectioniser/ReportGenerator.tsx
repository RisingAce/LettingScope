import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Check, 
  X, 
  Send, 
  Camera, 
  Signature,
  Copy, 
  CheckCircle,
  FileImage,
  CalendarClock,
  Columns
} from 'lucide-react';
import { format } from 'date-fns';

// Import from our types
import { Inspection, Signature, Room, Issue } from '@/types/inspection';

interface ReportGeneratorProps {
  inspection: Inspection;
  onUpdateInspection: (updates: Partial<Inspection>) => void;
  onGenerateReport: () => void;
  onSendReport: (email: string) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  inspection,
  onUpdateInspection,
  onGenerateReport,
  onSendReport
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [signatureMode, setSignatureMode] = useState<'agent' | 'tenant' | 'landlord' | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [includeRooms, setIncludeRooms] = useState(true);
  const [includeIssues, setIncludeIssues] = useState(true);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeUtilities, setIncludeUtilities] = useState(true);
  const [includeCompliance, setIncludeCompliance] = useState(true);
  const [includePreviousComparison, setIncludePreviousComparison] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportSending, setReportSending] = useState(false);
  
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  
  // Initialize signature canvas
  const initSignatureCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    signatureCtxRef.current = ctx;
  };
  
  // Start drawing on mouse down
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureCtxRef.current) return;
    
    const rect = signatureCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    isDrawing.current = true;
    signatureCtxRef.current.beginPath();
    signatureCtxRef.current.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  
  // Draw line on mouse move
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !signatureCtxRef.current) return;
    
    const rect = signatureCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    signatureCtxRef.current.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    signatureCtxRef.current.stroke();
  };
  
  // Stop drawing on mouse up
  const stopDrawing = () => {
    isDrawing.current = false;
  };
  
  // Clear signature canvas
  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = signatureCtxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  // Save signature
  const saveSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const signature: Signature = {
      name: signatureMode === 'agent' ? inspection.agentName :
            signatureMode === 'tenant' ? inspection.tenantName :
            inspection.landlordName,
      role: signatureMode as string,
      dataUrl,
      timestamp: new Date().toISOString()
    };
    
    // Update the inspection with the new signature
    if (signatureMode === 'agent') {
      onUpdateInspection({ agentSignature: signature });
    } else if (signatureMode === 'tenant') {
      onUpdateInspection({ tenantSignature: signature });
    } else if (signatureMode === 'landlord') {
      onUpdateInspection({ landlordSignature: signature });
    }
    
    setSignatureMode(null);
  };
  
  // Start signature capture
  const startSignatureCapture = (mode: 'agent' | 'tenant' | 'landlord') => {
    setSignatureMode(mode);
    // Initialize canvas on next render
    setTimeout(initSignatureCanvas, 0);
  };
  
  // Handle report generation
  const handleGenerateReport = () => {
    setReportGenerating(true);
    
    // Create report options
    const reportOptions = {
      includeRooms,
      includeIssues,
      includePhotos,
      includeUtilities,
      includeCompliance,
      includePreviousComparison
    };
    
    // Call the parent's onGenerateReport function
    onGenerateReport();
    
    // Simulate report generation (this would be replaced with actual report generation)
    setTimeout(() => {
      setReportGenerating(false);
      onUpdateInspection({ 
        reportGenerated: true,
        reportUrl: `/reports/inspection-${inspection.id}.pdf`, // This would be a real URL in production
      });
      setActiveTab('download');
    }, 2000);
  };
  
  // Handle sending report
  const handleSendReport = () => {
    if (!recipientEmail) return;
    
    setReportSending(true);
    
    // Call the parent's onSendReport function
    onSendReport(recipientEmail);
    
    // Simulate sending the report (this would be replaced with actual email sending)
    setTimeout(() => {
      setReportSending(false);
      setRecipientEmail('');
      alert(`Report sent to ${recipientEmail}`);
    }, 1500);
  };
  
  return (
    <div className="report-generator w-full">
      {signatureMode ? (
        <Card className="border-gold-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="font-artdeco tracking-wide text-xl">
              {signatureMode === 'agent' ? 'Agent Signature' :
               signatureMode === 'tenant' ? 'Tenant Signature' :
               'Landlord Signature'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <div className="signature-canvas-container border border-dashed border-gold-400/50 rounded-lg bg-white dark:bg-slate-900 h-48">
              <canvas
                ref={signatureCanvasRef}
                className="w-full h-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              ></canvas>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Please sign above using your mouse or touchscreen
            </p>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSignatureMode(null)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button variant="outline" onClick={clearSignature}>
                <Copy className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            
            <Button 
              className="bg-gold-600 hover:bg-gold-700 text-white"
              onClick={saveSignature}
            >
              <Signature className="h-4 w-4 mr-1" />
              Save Signature
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-gold-400/30">
          <CardHeader className="pb-3">
            <CardTitle className="font-artdeco tracking-wide text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold-600" />
              Inspection Report
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="signatures">Signatures</TabsTrigger>
                <TabsTrigger value="download">Download</TabsTrigger>
              </TabsList>
              
              {/* Preview Tab */}
              <TabsContent value="preview" className="space-y-4">
                <div className="bg-gold-50 dark:bg-gold-950/20 border border-gold-100 dark:border-gold-950/50 p-4 rounded-lg">
                  <h3 className="text-lg font-artdeco tracking-wide text-gold-800 dark:text-gold-300 mb-2">
                    Inspection Report Overview
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium">Property Address</p>
                      <p className="text-sm text-muted-foreground">{inspection.propertyAddress}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Inspection Date</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(inspection.date), 'PPP')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Inspected By</p>
                      <p className="text-sm text-muted-foreground">{inspection.agentName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Tenant</p>
                      <p className="text-sm text-muted-foreground">{inspection.tenantName}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium">Report Contents</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeRooms" checked={includeRooms} onCheckedChange={(checked) => setIncludeRooms(checked as boolean)} />
                        <Label htmlFor="includeRooms">Room Conditions</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeIssues" checked={includeIssues} onCheckedChange={(checked) => setIncludeIssues(checked as boolean)} />
                        <Label htmlFor="includeIssues">Issues & Maintenance</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includePhotos" checked={includePhotos} onCheckedChange={(checked) => setIncludePhotos(checked as boolean)} />
                        <Label htmlFor="includePhotos">Photos</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeUtilities" checked={includeUtilities} onCheckedChange={(checked) => setIncludeUtilities(checked as boolean)} />
                        <Label htmlFor="includeUtilities">Utilities</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="includeCompliance" checked={includeCompliance} onCheckedChange={(checked) => setIncludeCompliance(checked as boolean)} />
                        <Label htmlFor="includeCompliance">Compliance</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="includePreviousComparison" 
                          checked={includePreviousComparison} 
                          onCheckedChange={(checked) => setIncludePreviousComparison(checked as boolean)}
                          disabled={!inspection.previousInspectionId}
                        />
                        <Label 
                          htmlFor="includePreviousComparison" 
                          className={!inspection.previousInspectionId ? "text-muted-foreground" : ""}
                        >
                          Previous Comparison
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 mt-2">
                  <h3 className="text-sm font-medium">Report Preview</h3>
                  
                  <div className="relative aspect-[3/4] bg-white dark:bg-slate-800 border border-border rounded-md overflow-hidden shadow-sm">
                    <div className="absolute inset-0 flex flex-col">
                      {/* Header */}
                      <div className="p-4 border-b border-gold-200 bg-gold-50 dark:border-gold-950/30 dark:bg-gold-950/10">
                        <div className="text-center">
                          <h2 className="text-lg font-artdeco tracking-wide text-gold-800 dark:text-gold-400">Property Inspection Report</h2>
                          <p className="text-xs text-muted-foreground">{inspection.propertyAddress}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(inspection.date), 'PPP')}</p>
                        </div>
                      </div>
                      
                      {/* Content Preview (simplified) */}
                      <div className="flex-1 p-4 overflow-hidden">
                        <div className="space-y-4">
                          <div className="border-b border-border pb-2">
                            <h3 className="text-sm font-artdeco">Property Details</h3>
                            <div className="h-6 bg-muted/30 rounded mt-1 w-full"></div>
                            <div className="h-6 bg-muted/30 rounded mt-1 w-3/4"></div>
                          </div>
                          
                          {includeRooms && (
                            <div className="border-b border-border pb-2">
                              <h3 className="text-sm font-artdeco">Room Conditions</h3>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                {inspection.rooms.slice(0, 4).map((room, index) => (
                                  <div key={index} className="h-8 bg-muted/30 rounded flex items-center px-2">
                                    <span className="text-xs text-muted-foreground truncate">{room.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {includeIssues && (
                            <div className="border-b border-border pb-2">
                              <h3 className="text-sm font-artdeco">Issues & Maintenance</h3>
                              <div className="h-20 bg-muted/30 rounded mt-1"></div>
                            </div>
                          )}
                          
                          {includePhotos && (
                            <div className="border-b border-border pb-2">
                              <h3 className="text-sm font-artdeco">Photo Documentation</h3>
                              <div className="grid grid-cols-3 gap-1 mt-1">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                  <div key={i} className="aspect-square bg-muted/30 rounded"></div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="p-2 border-t border-gold-200 bg-gold-50 dark:border-gold-950/30 dark:bg-gold-950/10 text-center">
                        <p className="text-[10px] text-muted-foreground">Generated by InspectSpace © 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateReport}
                  disabled={reportGenerating}
                  className="w-full bg-gold-600 hover:bg-gold-700 text-white"
                >
                  {reportGenerating ? (
                    <>Generating Report...</>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </TabsContent>
              
              {/* Signatures Tab */}
              <TabsContent value="signatures" className="space-y-4">
                <div className="space-y-6">
                  {/* Agent Signature */}
                  <Card className="border-gold-400/20">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Agent Signature</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {inspection.agentSignature ? (
                        <div className="flex flex-col items-center">
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-md border border-border mb-2">
                            <img 
                              src={inspection.agentSignature.dataUrl} 
                              alt="Agent Signature" 
                              className="h-20 max-w-full object-contain"
                            />
                          </div>
                          <div className="text-sm text-center">
                            <p>{inspection.agentSignature.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Signed on {format(new Date(inspection.agentSignature.timestamp), 'PP p')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Button 
                            variant="outline" 
                            className="h-24 w-full border-dashed border-gold-400/50"
                            onClick={() => startSignatureCapture('agent')}
                          >
                            <div className="flex flex-col items-center">
                              <Signature className="h-8 w-8 mb-2 text-gold-500" />
                              <span className="text-sm">Add Agent Signature</span>
                            </div>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Tenant Signature */}
                  <Card className="border-gold-400/20">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Tenant Signature</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {inspection.tenantSignature ? (
                        <div className="flex flex-col items-center">
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-md border border-border mb-2">
                            <img 
                              src={inspection.tenantSignature.dataUrl} 
                              alt="Tenant Signature" 
                              className="h-20 max-w-full object-contain"
                            />
                          </div>
                          <div className="text-sm text-center">
                            <p>{inspection.tenantSignature.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Signed on {format(new Date(inspection.tenantSignature.timestamp), 'PP p')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Button 
                            variant="outline" 
                            className="h-24 w-full border-dashed border-gold-400/50"
                            onClick={() => startSignatureCapture('tenant')}
                          >
                            <div className="flex flex-col items-center">
                              <Signature className="h-8 w-8 mb-2 text-gold-500" />
                              <span className="text-sm">Add Tenant Signature</span>
                            </div>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Landlord Signature */}
                  <Card className="border-gold-400/20">
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">Landlord Signature</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      {inspection.landlordSignature ? (
                        <div className="flex flex-col items-center">
                          <div className="bg-white dark:bg-slate-800 p-2 rounded-md border border-border mb-2">
                            <img 
                              src={inspection.landlordSignature.dataUrl} 
                              alt="Landlord Signature" 
                              className="h-20 max-w-full object-contain"
                            />
                          </div>
                          <div className="text-sm text-center">
                            <p>{inspection.landlordSignature.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Signed on {format(new Date(inspection.landlordSignature.timestamp), 'PP p')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Button 
                            variant="outline" 
                            className="h-24 w-full border-dashed border-gold-400/50"
                            onClick={() => startSignatureCapture('landlord')}
                          >
                            <div className="flex flex-col items-center">
                              <Signature className="h-8 w-8 mb-2 text-gold-500" />
                              <span className="text-sm">Add Landlord Signature</span>
                            </div>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab('preview')}>
                    <X className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab('download')}
                    className="bg-gold-600 hover:bg-gold-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Continue
                  </Button>
                </div>
              </TabsContent>
              
              {/* Download Tab */}
              <TabsContent value="download" className="space-y-4">
                {inspection.reportGenerated ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg flex items-center gap-3 border border-green-100 dark:border-green-900/30">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Report Generated Successfully</h3>
                        <p className="text-sm text-muted-foreground">Your report is ready to download or share</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-gold-400/20">
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Download Report</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 space-y-3">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gold-50 dark:bg-gold-900/20 rounded-lg">
                              <FileText className="h-10 w-10 text-gold-600 dark:text-gold-400" />
                            </div>
                            <div>
                              <p className="font-medium">Property Inspection Report</p>
                              <p className="text-sm text-muted-foreground">PDF Document • Generated {format(new Date(), 'PP')}</p>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full"
                            variant="outline"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download PDF
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-gold-400/20">
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Send Report</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="recipientEmail">Recipient Email</Label>
                            <Input
                              id="recipientEmail"
                              type="email"
                              placeholder="Enter email address"
                              value={recipientEmail}
                              onChange={(e) => setRecipientEmail(e.target.value)}
                            />
                          </div>
                          
                          <Button 
                            className="w-full bg-gold-600 hover:bg-gold-700 text-white"
                            onClick={handleSendReport}
                            disabled={!recipientEmail || reportSending}
                          >
                            {reportSending ? (
                              <>Sending...</>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-1" />
                                Send Report
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <h3 className="text-sm font-medium mb-2">Additional Options</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button variant="outline" className="justify-start">
                          <FileImage className="h-4 w-4 mr-2" />
                          Export Photos
                        </Button>
                        
                        <Button variant="outline" className="justify-start">
                          <CalendarClock className="h-4 w-4 mr-2" />
                          Schedule Follow-up
                        </Button>
                        
                        <Button variant="outline" className="justify-start">
                          <Columns className="h-4 w-4 mr-2" />
                          Compare Reports
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-medium mb-1">Report Not Generated</h3>
                    <p className="text-sm text-muted-foreground mb-4">Please generate a report first</p>
                    <Button 
                      onClick={() => setActiveTab('preview')}
                      variant="outline"
                    >
                      Go to Report Generation
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

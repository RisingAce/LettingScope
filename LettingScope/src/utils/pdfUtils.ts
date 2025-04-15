import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';

// Set the workerSrc to the public path for Vite compatibility
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

/**
 * Extract text content from a PDF file
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Get total number of pages
    const numPages = pdf.numPages;
    let fullText = '';
    
    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

/**
 * Generate thumbnail from the first page of PDF
 */
export const generatePDFThumbnail = async (file: File): Promise<string> => {
  try {
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('[PDF THUMB] Got ArrayBuffer', arrayBuffer.byteLength);
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log('[PDF THUMB] Loaded PDF, numPages:', pdf.numPages);
    // Get the first page
    const page = await pdf.getPage(1);
    console.log('[PDF THUMB] Got first page');
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('[PDF THUMB] Could not create canvas context');
      throw new Error('Could not create canvas context');
    }
    // Scale for the thumbnail (adjust for appropriate thumbnail size)
    const viewport = page.getViewport({ scale: 0.3 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    // Render the page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    console.log('[PDF THUMB] Rendered page to canvas');
    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL('image/png');
    console.log('[PDF THUMB] Created data URL');
    return dataUrl;
  } catch (error) {
    console.error('[PDF THUMB] Error generating PDF thumbnail:', error);
    return '';
  }
}

/**
 * Try to extract bill data from PDF text content
 */
export const parseBillData = (textContent: string): ExtractedBillData => {
  const data: ExtractedBillData = {};
  
  // Extract amount (look for currency symbols and numbers)
  const amountRegex = /(?:£|\$|USD|GBP|EUR|€|\bpounds\b|\btotal\b|\bamount\b|\bdue\b)[\s:]*([0-9,.]+)/i;
  const amountMatch = textContent.match(amountRegex);
  if (amountMatch && amountMatch[1]) {
    const extractedAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (!isNaN(extractedAmount)) {
      data.amount = extractedAmount;
    }
  }
  
  // Extract account number (look for keywords like account, customer, reference number)
  const accountNumberRegex = /(?:\baccount\s*(?:number|#|no)\b|\bcustomer\s*(?:id|number|#|no)\b|\breference\s*(?:number|#|no)\b)(?:\s*:\s*|\s+)([A-Za-z0-9-]+)/i;
  const accountMatch = textContent.match(accountNumberRegex);
  if (accountMatch && accountMatch[1]) {
    data.accountNumber = accountMatch[1].trim();
  }
  
  // Extract utility type (check for common utilities)
  const utilityTypes = [
    { type: "electricity" as const, keywords: ['electric', 'electricity', 'power', 'energy'] },
    { type: "gas" as const, keywords: ['gas', 'natural gas'] },
    { type: "gasAndElectricity" as const, keywords: ['gas and electric', 'gas & electric', 'dual fuel', 'gas & electricity', 'gas and electricity'] },
    { type: "water" as const, keywords: ['water', 'water supply'] },
    { type: "internet" as const, keywords: ['internet', 'broadband', 'wifi', 'fibre'] },
    { type: "councilTax" as const, keywords: ['council tax', 'council'] },
    { type: "tv" as const, keywords: ['tv license', 'television license', 'tv licence'] },
    { type: "other" as const, keywords: ['other'] }
  ];
  
  // Check for combined gas and electricity (dual fuel)
  const hasGas = utilityTypes[1].keywords.some(keyword => 
    textContent.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const hasElectricity = utilityTypes[0].keywords.some(keyword => 
    textContent.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasGas && hasElectricity) {
    data.utilityType = "gasAndElectricity";
  } else {
    // Check for other utility types
    for (const utility of utilityTypes) {
      const found = utility.keywords.some(keyword => 
        textContent.toLowerCase().includes(keyword.toLowerCase())
      );
      if (found) {
        data.utilityType = utility.type;
        break;
      }
    }
  }
  
  // Extract provider name (look for common bill provider prefixes/suffixes)
  const providerRegexes = [
    /([A-Za-z0-9\s&]+)\s*(?:Ltd|Limited|Inc|LLC|PLC|Corporation|Corp)/i,
    /(?:From|Bill from|Supplier|Provider|Billed by):\s*([A-Za-z0-9\s&]+)/i
  ];
  
  for (const regex of providerRegexes) {
    const match = textContent.match(regex);
    if (match && match[1]) {
      data.provider = match[1].trim();
      break;
    }
  }
  
  // Extract dates (look for due date, issue date, etc.)
  const dateRegexes = [
    { type: 'dueDate', regex: /(?:due\s*date|payment\s*due|pay\s*by|payment\s*by):\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i },
    { type: 'issueDate', regex: /(?:issue\s*date|bill\s*date|date\s*of\s*bill|statement\s*date):\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/i }
  ];
  
  for (const { type, regex } of dateRegexes) {
    const match = textContent.match(regex);
    if (match && match[1]) {
      try {
        const dateString = match[1].trim();
        const parsedDate = new Date(dateString);
        if (!isNaN(parsedDate.getTime())) {
          if (type === 'dueDate') data.dueDate = parsedDate;
          else if (type === 'issueDate') data.issueDate = parsedDate;
        }
      } catch (error) {
        console.error(`Error parsing ${type}:`, error);
      }
    }
  }
  
  return data;
}

export interface ExtractedBillData {
  amount?: number;
  provider?: string;
  issueDate?: Date;
  dueDate?: Date;
  accountNumber?: string;
  utilityType?: "electricity" | "gas" | "water" | "internet" | "councilTax" | "tv" | "gasAndElectricity" | "other";
}

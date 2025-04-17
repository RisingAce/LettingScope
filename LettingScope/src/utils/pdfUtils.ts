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
 * Try to extract bill data from PDF text content (enhanced with block parsing & debug)
 */
export const parseBillData = (textContent: string): ExtractedBillData => {
  const lines = textContent.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  console.debug('[PARSE] total lines:', lines.length);

  const data: ExtractedBillData = {};

  // Patterns to ignore specific office addresses
  const ignorePatterns = [/^4\s*jamaica\s+st(?:reet)?\.?$/i];

  // Identify address block before first label keyword
  const labelKeywords = ['bill date', 'your customer number', 'customer number', 'account number', 'invoice', 'amount due', 'supply address', 'payment overdue', 'outstanding debt'];
  let addressEndIndex = lines.findIndex(line =>
    labelKeywords.some(k => line.toLowerCase().includes(k))
  );
  if (addressEndIndex === -1) addressEndIndex = Math.min(5, lines.length);
  const addressLines = lines.slice(0, addressEndIndex);
  console.debug('[PARSE] address block:', addressLines);

  // Extract Supply Address via regex
  const supplyRe = /Supply\s+Address\s*:?\s*(.+?)(?=\s*(?:makeapayment|Free automated|Ways to pay|$))/i;
  const supplyMatch = supplyRe.exec(textContent);
  if (supplyMatch) {
    data.propertyAddress = supplyMatch[1].trim().replace(/\s+/g, ' ');
    console.debug('[PARSE] supplyAddress:', data.propertyAddress);
  }

  // Header fallback
  if (!data.propertyAddress && addressLines.length > 1) {
    data.accountHolder = addressLines[0];
    const rawHeader = addressLines.slice(1).join(' ');
    const hdPattern = /(\d{1,4}\s+[A-Za-z0-9\/\-]+(?:\s+[A-Za-z0-9\/\-]+)*\s+(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Close|Court|Grove))/i;
    const hdMatch = rawHeader.match(hdPattern);
    if (hdMatch) {
      data.propertyAddress = hdMatch[1].trim();
      console.debug('[PARSE] header-derived propertyAddress:', data.propertyAddress);
    }
  }

  // Helper for date parsing
  function safeParseDate(str: string): Date | undefined {
    const cleaned = str.replace(/(\d+)(st|nd|rd|th)/gi, '$1');
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) return parsed;
    return undefined;
  }

  // Improved account number regex: match more variants, skip non-digits before capturing number
  const accountNoPattern = /(?:your\s*customer\s*number|customer\s*number|account\s*number|account\s*no\.?|account\s*#|reference)\b[^\d]*(\d[\d\s]+)/i;
  for (const line of lines) {
    console.debug('[PARSE] checking for account number in line:', line);
    const m = line.match(accountNoPattern);
    if (m && m[1]) {
      // Post-process: keep only number parts longer than one digit to drop rogue '4'
      const raw = m[1];
      const parts = raw.trim().split(/\s+/).filter(p => p.length > 1);
      data.accountNumber = parts.join(' ');
      console.debug('[PARSE] accountNumber parts:', parts);
      console.debug('[PARSE] accountNumber:', data.accountNumber);
      break;
    }
  }

  // Helper for currency extraction
  function extractAmount(line: string): number | undefined {
    const match = line.match(/([£\$€])\s*([0-9.,]+)/);
    if (match) {
      return parseFloat(match[2].replace(/,/g, ''));
    }
    return undefined;
  }

  // Define patterns for other fields
  const patterns = [
    { field: 'issueDate', regex: /(?:bill\s*date|issue\s*date|statement\s*date|date):?\s*([\d\w\s\/\-\,]+)/i, processor: (m: RegExpMatchArray) => safeParseDate(m[1]) },
    { field: 'dueDate', regex: /(?:due\s*date|payment\s*due|pay\s*by|payment\s*by):?\s*([\d\w\s\/\-\,]+)/i, processor: (m: RegExpMatchArray) => safeParseDate(m[1]) },
    { field: 'amount', regex: /(?:outstanding\s*debt|total\s*(?:amount)?\s*due|amount\s*due|bill\s*amount|total|payment of)[:]?(.*)/i, processor: (m: RegExpMatchArray) => extractAmount(m[1]) },
    { field: 'utilityType', regex: /(gas\s*&?\s*electricity|electricity|gas|water|broadband|internet|council\s*tax|tv\s*license)/i, processor: (m: RegExpMatchArray) => {
        const v = m[1].toLowerCase();
        if (v.includes('gas') && v.includes('electric')) return 'gasAndElectricity';
        if (v.includes('electric')) return 'electricity';
        if (v.includes('gas')) return 'gas';
        if (v.includes('water')) return 'water';
        if (v.includes('broadband') || v.includes('internet')) return 'internet';
        if (v.includes('council')) return 'councilTax';
        if (v.includes('tv')) return 'tv';
        return 'other';
      }},
  ] as Array<{ field: keyof ExtractedBillData; regex: RegExp; processor?: (m: RegExpMatchArray) => any }>;

  for (const line of lines) {
    console.debug('[PARSE] line:', line);
    for (const { field, regex, processor } of patterns) {
      if (data[field] !== undefined) continue;
      const match = line.match(regex);
      if (match) {
        console.debug(`[PARSE] matched ${field}:`, match[1]);
        (data as any)[field] = processor ? processor(match) : match[1].trim();
      }
    }
  }

  // Provider detection via known names
  console.debug('[PARSE] starting provider mapping detection');
  const providerDefs = [
    { pattern: /british\s*gas/i, name: 'British Gas' },
    { pattern: /scottishpower/i, name: 'ScottishPower' },
    { pattern: /edf\b/i, name: 'EDF' },
    { pattern: /octopus/i, name: 'Octopus Energy' },
    { pattern: /e\.?\s?on/i, name: 'E.ON' },
    { pattern: /bulb/i, name: 'Bulb' },
    { pattern: /ovo/i, name: 'OVO' },
    { pattern: /shell\s*energy/i, name: 'Shell Energy' },
    { pattern: /sse/i, name: 'SSE' },
  ];
  if (!data.provider) {
    for (const { pattern, name } of providerDefs) {
      // Match known provider names regardless of digits in line
      const matchLine = lines.find(l => pattern.test(l));
      if (matchLine) {
        data.provider = name;
        console.debug(`[PARSE] provider detected via mapping: ${name}`);
        break;
      }
    }
  }
  if (!data.provider) console.debug('[PARSE] no provider mapping found');

  if (data.propertyAddress) {
    // Use trimmed accountHolder if available, else fallback to address
    const name = data.accountHolder?.trim() || data.propertyAddress;
    data.propertySuggestion = { address: data.propertyAddress, name };
  }

  // Exclude variants of office address from propertySuggestion
  if (data.propertySuggestion) {
    const addr = data.propertySuggestion.address.trim();
    if (ignorePatterns.some(p => p.test(addr))) {
      console.debug(`[PARSE] ignoring office address suggestion: ${addr}`);
      delete data.propertySuggestion;
    }
  }

  console.debug('[PARSE] final extracted data:', data);
  return data;
}

export interface ExtractedBillData {
  amount?: number;
  provider?: string;
  issueDate?: Date;
  dueDate?: Date;
  accountNumber?: string;
  utilityType?: "electricity" | "gas" | "water" | "internet" | "councilTax" | "tv" | "gasAndElectricity" | "other";
  accountHolder?: string;
  propertyAddress?: string;
  propertySuggestion?: { address: string; name?: string };
}

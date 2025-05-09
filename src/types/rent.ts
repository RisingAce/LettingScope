export interface Listing {
  id: string;
  area: number;          // m²
  beds: number;
  location: string;      // e.g. "Leith"
  condition: string;     // "High", "Above‑Avg", etc.
  epc: string;           // "A" – "G"
  broadband: number;     // Mbps
  agreedRent: number;    // final rent £pcm
  timestamp?: string;    // ISO (optional for now)
}

// Default coefficients for rent calculation
export const defaultCoefficients = {
  baseRate: 16.7,                 // £/m² (Recalculated from data)
  bedroomBeta: 0.03,              // +3% per extra bed (Additive)
  condition: {
    High: 0.15,     // +15%
    "Above‑Avg": 0.08, // +8%
    Average: 0.00,    // 0%
    "Below‑Avg": -0.05,// -5%
    Poor: -0.10,    // -10%
  },
  location: {
    // All Edinburgh areas sorted alphabetically
    Abbeyhill: 0.02,
    "Balerno": -0.02,
    "Barnton": 0.05,
    "Blackford": 0.07,
    "Blackhall": 0.06,
    "Bonaly": 0.04,
    "Broomhouse": -0.03,
    Bruntsfield: 0.08,
    "Cammo": 0.05,
    Cannonmills: 0.07,
    "Carrick Knowe": 0.01,
    "Chesser": -0.01,
    "Clermiston": 0.00,
    "Comely Bank": 0.10,
    Corstorphine: 0.03,
    Craigmillar: -0.05,
    "Currie": -0.01,
    Dalry: 0.01,
    "Dalmeny": 0.02,
    "Davidson's Mains": 0.04,
    "Dean Village": 0.12,
    "Drylaw": -0.02,
    Duddingston: 0.04,
    "East Craigs": 0.02,
    "Easter Road": 0.00,
    "Fairmilehead": 0.04,
    "Fernieside": -0.04,
    "Fountainbridge": 0.06,
    "Gilmerton": -0.04,
    Gorgie: 0.00,
    "Gracemount": -0.04,
    "Grange": 0.13,
    Granton: -0.05,
    "Greenbank": 0.07,
    Haymarket: 0.05,
    "Hunters Tryst": 0.00,
    "Ingliston": 0.01,
    "Inverleith": 0.11,
    "Joppa": 0.05,
    "Juniper Green": 0.04,
    Leith: 0.03,
    "Liberton": 0.02,
    "Lochend": -0.01,
    "Longstone": 0.00,
    Marchmont: 0.10,
    "Mayfield": 0.03,
    "Merchiston": 0.09,
    "Moredun": -0.03,
    Morningside: 0.10,
    "Mountcastle": 0.02,
    "Murrayfield": 0.10,
    "Newhaven": 0.04,
    "New Town": 0.15,
    Newington: 0.08,
    "Niddrie": -0.05,
    "Northfield": 0.01,
    "Old Town": 0.12,
    "Oxgangs": -0.01,
    "Pilrig": 0.02,
    "Polwarth": 0.06,
    Portobello: 0.05,
    "Prestonfield": 0.03,
    "Ratho": 0.00,
    "Restalrig": -0.01,
    "Roseburn": 0.06,
    Sciennes: 0.09,
    "Seafield": 0.01,
    "Shandon": 0.05,
    "Sighthill": -0.03,
    "Silverknowes": 0.04,
    Slateford: 0.01,
    "South Gyle": 0.00,
    "South Queensferry": 0.02,
    "Stenhouse": -0.02,
    Stockbridge: 0.12,
    "Swanston": 0.03,
    "The Meadows": 0.11,
    "The Shore": 0.07,
    Tollcross: 0.05,
    Trinity: 0.06,
    Viewforth: 0.03,
    "Warriston": 0.04,
    "West End": 0.13,
    "Wester Hailes": -0.05,
    "Willowbrae": 0.03,
  },
  epc: { A: 0.03, B: 0.03, C: 0.01, D: 0.00, E: -0.02, F: -0.03, G: -0.05 },
  broadbandSlope: 0.00005,       // Additive % per 1 Mbps over 80 (halved)
  calibrationFactor: 1.0,         // Remove final global reduction
  adjustmentScale: 0.75,          // Increase scale factor for adjustments (now 75%)
};

import { useQuery } from "@tanstack/react-query";
import { Listing } from "../types/rent";

// Define the type based on the default object structure
export type Coefficients = typeof defaultCoefficients;

export function useCoefficients() {
  return useQuery<
    Coefficients, // Specify the return type for useQuery
    Error
  >({
    queryKey: ["coefficients"],
    queryFn: async () => {
      const res = await fetch("/rent-data.json");
      if (!res.ok) throw new Error("fetch‑fail");
      const data: Listing[] = await res.json();

      // Calculate base rate (£/m²) from validated data, removing outliers
      let ratesPerSqMeter = data.map(d => {
        // --- Data Validation --- 
        if (
          !d ||
          typeof d.agreedRent !== 'number' || isNaN(d.agreedRent) ||
          typeof d.area !== 'number' || isNaN(d.area) || d.area <= 0
          // Only need rent and area for this base calculation
          // Other factors validated later or assumed default
        ) {
          return null; // Skip invalid listings
        }
        // --- Calculate Simple Rate (£/m²) --- 
        try {
          return d.agreedRent / d.area;
        } catch (error) {
          console.error("Error calculating rate per sq meter for listing:", d, error);
          return null; // Skip if calculation fails
        }
      }).filter((r): r is number => r !== null); // Filter out nulls

      // Remove outliers using IQR method
      if (ratesPerSqMeter.length < 10) { // Need enough data points
        console.warn("Not enough valid data points after filtering for IQR, using default base rate.");
        return defaultCoefficients; 
      } 
      ratesPerSqMeter.sort((a, b) => a - b);
      const q1Index = Math.floor(ratesPerSqMeter.length / 4);
      const q3Index = Math.floor(ratesPerSqMeter.length * 3 / 4);
      const q1 = ratesPerSqMeter[q1Index];
      const q3 = ratesPerSqMeter[q3Index];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      const filteredRates = ratesPerSqMeter.filter(r => r >= lowerBound && r <= upperBound);

      // Calculate MEDIAN from filtered rates (more robust to skew)
      if (filteredRates.length === 0) {
        console.warn("No data points remaining after IQR outlier removal, using default base rate.");
        return defaultCoefficients;
      }

      // Ensure rates are sorted for median calculation (already done for IQR)
      const midIndex = Math.floor(filteredRates.length / 2);
      let medianRate;
      if (filteredRates.length % 2 === 0) {
        // Even number of elements: average the two middle ones
        medianRate = (filteredRates[midIndex - 1] + filteredRates[midIndex]) / 2;
      } else {
        // Odd number of elements: take the middle one
        medianRate = filteredRates[midIndex];
      }

      return { ...defaultCoefficients, baseRate: medianRate };
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });
}

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
    // --- City Centre ---
    "New Town": 0.15,
    "Old Town": 0.12,
    "West End": 0.13,
    "Haymarket": 0.05,
    "Tollcross": 0.05,
    "The Meadows": 0.11,
    "Marchmont": 0.10,
    "Bruntsfield": 0.08,
    "Lauriston": 0.09,
    "Fountainbridge": 0.06,
    "Dean Village": 0.12,
    "Stockbridge": 0.12,
    "Comely Bank": 0.10,
    "Canonmills": 0.07,
    "Broughton": 0.08,
    "Leith Walk": 0.04,
    // --- North Edinburgh ---
    "Inverleith": 0.11,
    "Trinity": 0.06,
    "Newhaven": 0.04,
    "Granton": -0.05,
    "Silverknowes": 0.04,
    "Blackhall": 0.06,
    "Davidson's Mains": 0.04,
    "Barnton": 0.05,
    "Cramond": 0.07,
    "Muirhouse": -0.04,
    "Pilton": -0.05,
    "Warriston": 0.04,
    "Goldenacre": 0.05,
    "Craigleith": 0.05,
    "Kimmerghame": 0.04,
    "Drylaw": -0.02,
    "West Pilton": -0.06,
    "Granton Harbour": 0.03,
    "Ferry Road": 0.02,
    "Granton Road": 0.01,
    // --- West Edinburgh ---
    "Corstorphine": 0.03,
    "Murrayfield": 0.10,
    "Saughton": -0.01,
    "Stenhouse": -0.02,
    "Carrick Knowe": 0.01,
    "Clermiston": 0.00,
    "South Gyle": 0.00,
    "West Craigs": 0.01,
    "Ratho": 0.00,
    "Gogar": -0.02,
    "Ingliston": 0.01,
    "Cammo": 0.05,
    "Balerno": -0.02,
    "Currie": -0.01,
    "Juniper Green": 0.04,
    "Baberton": 0.02,
    "Wester Hailes": -0.05,
    "Sighthill": -0.03,
    "Broomhouse": -0.03,
    "Longstone": 0.00,
    "Slateford": 0.01,
    "Parkhead": -0.02,
    "Drumbrae": 0.00,
    "Barnton Park": 0.04,
    "East Craigs": 0.02,
    "Clermiston Park": 0.01,
    // --- South Edinburgh ---
    "Morningside": 0.10,
    "Grange": 0.13,
    "Blackford": 0.07,
    "Mayfield": 0.03,
    "Sciennes": 0.09,
    "Liberton": 0.02,
    "Liberton Mains": 0.01,
    "Gilmerton": -0.04,
    "Fernieside": -0.04,
    "Moredun": -0.03,
    "Craigmillar": -0.05,
    "Niddrie": -0.05,
    "Prestonfield": 0.03,
    "Newington": 0.08,
    "Southhouse": -0.04,
    "Kaimes": -0.02,
    "Oxgangs": -0.01,
    "Fairmilehead": 0.04,
    "Swanston": 0.03,
    "Buckstone": 0.02,
    "Comiston": 0.03,
    "Colinton": 0.05,
    "Colinton Mains": 0.01,
    "Craiglockhart": 0.08,
    "Craiglockhart Dell": 0.07,
    "Redhall": 0.00,
    "Woodhall": 0.00,
    "Alnwickhill": 0.01,
    "Liberton Brae": 0.01,
    "Burdiehouse": -0.04,
    "Viewforth": 0.03,
    // --- East Edinburgh ---
    "Portobello": 0.05,
    "Joppa": 0.05,
    "Duddingston": 0.04,
    "Mountcastle": 0.02,
    "Willowbrae": 0.03,
    "Seafield": 0.01,
    "Restalrig": -0.01,
    "Lochend": -0.01,
    "Craigentinny": -0.02,
    "Meadowbank": 0.02,
    "Abbeyhill": 0.02,
    "Easter Road": 0.00,
    "Leith": 0.03,
    "Pilrig": 0.02,
    "Bonnington": 0.03,
    "The Shore": 0.07,
    "Gracemount": -0.04,
    "Northfield": 0.01,
    // --- Southside & University ---
    "Southside": 0.08,
    "Marchmont Road": 0.09,
    "Morningside Park": 0.08,
    // --- Extra (to ensure coverage) ---
    "Saughtonhall": 0.01,
    "Wester Broom": 0.01,
    // --- Outskirts/Greater Edinburgh ---
    "Cramond Bridge": 0.00,
    "Queensferry": 0.01,
    "Kirkliston": -0.01,
    "Newcraighall": -0.02,
    "Musselburgh": -0.03,
    "Dalkeith": -0.04,
    "Loanhead": -0.03,
    "Penicuik": -0.05,
    "Roslin": -0.03,
    "Bonnyrigg": -0.03,
    "Gorebridge": -0.06,
    "Prestonpans": -0.04,
    "Tranent": -0.05,
    "East Calder": -0.03,
    "West Calder": -0.04,
    "Livingston": -0.06,
    "Broxburn": -0.05,
    "Bathgate": -0.06,
    "Linlithgow": -0.03,
    "Haddington": -0.03,
    "North Berwick": 0.02,
    "Dunbar": -0.04,
    "South Queensferry": 0.02,
    "Dalmeny": 0.02,
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

import type { Coefficients } from "../lib/coefficients";

/** Calculates additive percentage adjustment for broadband speed */
export const broadbandAdjustment = (speed: number, slope = 0.00005) =>
  Math.max(0, slope * (speed - 80)); // Cannot detract value, only add

/** Calculates additive percentage adjustment for number of bedrooms */
export const bedroomAdjustment = (beds: number, beta = 0.03) =>
  beta * Math.max(0, beds - 1); // No adjustment for 1 bed or less

// Factor to account for diminishing returns on value per sqm for larger areas
const areaScaleFactor = (area: number): number => {
  const lowerThreshold = 40;  // sqm
  const upperThreshold = 100; // sqm
  const minFactor = 0.75;
  const maxFactor = 1.05;

  if (area <= lowerThreshold) {
    return maxFactor;
  }
  if (area >= upperThreshold) {
    return minFactor;
  }
  // Linear interpolation between thresholds
  const slope = (minFactor - maxFactor) / (upperThreshold - lowerThreshold);
  return maxFactor + slope * (area - lowerThreshold);
};

export const calcFairRent = (
  coeff: Coefficients,
  {
    area,
    beds,
    location,
    condition,
    epc,
    broadband,
    additive = 0,
  }: {
    area: number;
    beds: number;
    location: string;
    condition: string;
    epc: string;
    broadband: number;
    additive?: number;
  }
) => {
  const baseValue = coeff.baseRate * area;

  // Sum of all additive percentage adjustments
  const totalAdjustment = (
    coeff.location[location] +
    coeff.condition[condition] +
    coeff.epc[epc] +
    bedroomAdjustment(beds, coeff.bedroomBeta) +
    broadbandAdjustment(broadband, coeff.broadbandSlope) +
    (additive || 0) // Include the form's additive field here
  );

  // Apply the total adjustment to the base value, scaled by adjustmentScale
  const adjustedValue = baseValue * (1 + totalAdjustment * coeff.adjustmentScale);

  // Apply area scaling and final calibration
  const finalValue = adjustedValue * areaScaleFactor(area) * coeff.calibrationFactor;

  // Return the rounded final value without the base offset
  return Math.round(finalValue);
};

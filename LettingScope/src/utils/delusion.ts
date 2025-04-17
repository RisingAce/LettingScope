/** returns [multiplier, label]  */
export function calcDelusion({
  anchoring = 0.15,
  btr = 0.1,
  cap = 0.05,
  demand = 0.05,
  agent = 0,
  scarcity = 0.1,
}) {
  // Simple sum of factors representing market pressures
  const value = anchoring + btr + cap + demand + agent + scarcity;

  return [1 + value, `${Math.round(value * 100)}% over‑list`];
}

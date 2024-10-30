export function taylorAtan(x: number, terms: number): number {
  // Hardcoded 3-term formula: x - x³/3 + x⁵/5
  const x2 = x * x;
  const x3 = x2 * x;
  const x5 = x3 * x2;
  let result = x - x3/3 + x5/5;
  
  // For higher orders, use previous result
  if (terms > 3) {
    let xPower = x5 * x2; // x⁷
    for (let n = 3; n < terms; n++) {
      const term = Math.pow(-1, n) * xPower / (2 * n + 1);
      result += term;
      xPower *= x2; // Increment power by 2 for next iteration
    }
  }
  
  return result;
}

export function generateDataPoints(terms: number) {
  return Array.from({ length: 200 }, (_, i) => {
    const x = -1 + (i * 2) / 199; // Range from -1 to 1
    const actualValue = Math.atan(x);
    const approximation = taylorAtan(x, terms);
    const relativeError = Math.abs((approximation - actualValue) / actualValue) * 100;
    return { x, error: relativeError };
  });
}
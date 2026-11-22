import crypto from 'crypto';

/**
 * Generates an array of `count` unique integers in [min, max] using CSPRNG.
 * Zero Math.random() usage.
 */
export function generateCsprngNumbers(count: number, min = 1, max = 45): number[] {
  if (count > max - min + 1) {
    throw new Error('Requested count exceeds available number pool size.');
  }

  const pool: number[] = [];
  for (let i = min; i <= max; i++) {
    pool.push(i);
  }

  const chosen: number[] = [];
  while (chosen.length < count) {
    const randomIndex = crypto.randomInt(0, pool.length);
    const selected = pool.splice(randomIndex, 1)[0];
    chosen.push(selected);
  }

  return chosen.sort((a, b) => a - b);
}

/**
 * Weighted sampling without replacement across [min, max].
 * Weight array or map: weight for each integer in [min, max].
 */
export function generateFrequencyWeightedNumbers(
  weights: Map<number, number>,
  count: number,
  min = 1,
  max = 45
): number[] {
  const available: number[] = [];
  for (let i = min; i <= max; i++) {
    available.push(i);
  }

  const chosen: number[] = [];

  while (chosen.length < count && available.length > 0) {
    // Calculate total weight of available numbers
    let totalWeight = 0;
    for (const num of available) {
      totalWeight += Math.max(weights.get(num) || 1, 1); // Minimum baseline smoothing 1
    }

    // Pick random float in [0, totalWeight) via CSPRNG 32-bit uint
    const randomInt32 = crypto.randomBytes(4).readUInt32BE(0);
    const randomFraction = randomInt32 / 0x100000000;
    let threshold = randomFraction * totalWeight;

    let selectedIndex = 0;
    for (let i = 0; i < available.length; i++) {
      const num = available[i];
      const w = Math.max(weights.get(num) || 1, 1);
      if (threshold < w) {
        selectedIndex = i;
        break;
      }
      threshold -= w;
    }

    const selected = available.splice(selectedIndex, 1)[0];
    chosen.push(selected);
  }

  return chosen.sort((a, b) => a - b);
}

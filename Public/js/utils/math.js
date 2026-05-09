export function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  if (min > max) return clamp(value, max, min);
  return Math.min(Math.max(value, min), max);
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function deltaLerp(current, target, speedPerSecond, deltaSeconds) {
  const safeSpeed = Math.max(0, speedPerSecond);
  const safeDelta = Math.max(0, deltaSeconds);

  if (safeSpeed === 0 || safeDelta === 0) {
    return current;
  }

  const factor = 1 - Math.exp(-safeSpeed * safeDelta);
  return lerp(current, target, factor);
}

export function easeOutCubic(t) {
  const x = clamp(t, 0, 1);
  return 1 - Math.pow(1 - x, 3);
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMin === inMax) {
    return outMin;
  }

  const normalized = (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, normalized);
}

// Public/js/renderer/Profiler.js
// Dev-only frame time profiler.
// Tracks a rolling 2-second sample window at the measured refresh rate.
// Zero cost in production - all methods are no-ops when DEBUG is false.
//
// API:
//   Profiler.init(refreshRate)  -> set sample window size
//   Profiler.begin()            -> mark frame start
//   Profiler.end()              -> mark frame end, record sample
//   Profiler.report()           -> { avg, max, p99, sampleCount }
//   Profiler.reset()            -> clear all samples
//
// Initialized in Phase 1. Overlay rendering added in Phase 5.

const DEBUG = typeof __DEBUG__ !== 'undefined' ? __DEBUG__ : true;

let samples = new Float32Array(240); // default: 120fps x 2s
let index = 0;
let sampleCount = 0;
let frameStart = 0;

function init(refreshRate) {
  if (!DEBUG) return;
  const windowSize = Math.ceil(refreshRate * 2); // 2-second window
  samples = new Float32Array(windowSize);
  index = 0;
  sampleCount = 0;
  if (DEBUG) console.log(`[Profiler] init - refreshRate:${refreshRate}fps window:${windowSize} frames`);
}

function begin() {
  if (!DEBUG) return;
  frameStart = performance.now();
}

function end() {
  if (!DEBUG) return;
  const ms = performance.now() - frameStart;
  samples[index % samples.length] = ms;
  index++;
  sampleCount = Math.min(sampleCount + 1, samples.length);
}

function report() {
  if (!DEBUG) return { avg: 0, max: 0, p99: 0, sampleCount: 0 };

  const active = Array.from(samples.subarray(0, sampleCount));
  if (active.length === 0) return { avg: 0, max: 0, p99: 0, sampleCount: 0 };

  const avg = active.reduce((a, b) => a + b, 0) / active.length;
  const max = Math.max(...active);
  const sorted = [...active].sort((a, b) => a - b);
  const p99 = sorted[Math.floor(sorted.length * 0.99)] ?? max;

  return { avg, max, p99, sampleCount };
}

function reset() {
  if (!DEBUG) return;
  samples.fill(0);
  index = 0;
  sampleCount = 0;
}

export const Profiler = { init, begin, end, report, reset };

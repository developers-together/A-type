// Public/js/renderer/Differ.js
// Scene graph differ. Snapshots node state each frame and produces a patch
// list of changed nodes. Uses an object pool to avoid GC in the hot path.
//
// Invariant 11: hot-path object reuse after Phase 5.
// Invariant 7: no silent failures in data pipeline.

// -- Pool ----------------------------------------------------------------------

const _patchPool = [];
let _poolHits = 0;
let _poolMisses = 0;

function acquirePatch() {
  if (_patchPool.length > 0) {
    _poolHits++;
    return _patchPool.pop();
  }
  _poolMisses++;
  return { node: null, x: 0, y: 0, width: 0, height: 0 };
}

function releasePatch(patch) {
  patch.node = null;
  patch.x = 0;
  patch.y = 0;
  patch.width = 0;
  patch.height = 0;
  _patchPool.push(patch);
}

// -- Snapshot ------------------------------------------------------------------

// Previous frame snapshot: Map<nodeId, snapshotKey>
let _prev = new Map();
// Current frame snapshot built during diff()
let _curr = new Map();

/**
 * Build a cheap snapshot key from the properties that affect rendering.
 * Must be fast — this runs every frame for every node.
 */
function snapshotKey(node) {
  // visible|opacity|x|y|w|h|fill|stroke|text|color|scrollOffset
  return `${node.visible ? 1 : 0}|${node.opacity ?? 1}|${node.x ?? 0}|${node.y ?? 0}|${node.width ?? 0}|${node.height ?? 0}|${node.fill ?? ''}|${node.stroke ?? ''}|${node.text ?? ''}|${node.color ?? ''}|${node.scrollOffset ?? 0}`;
}

/**
 * Walk the scene tree depth-first, collect all nodes into out array.
 */
function collectNodes(node, out) {
  if (!node) return;
  out.push(node);
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      collectNodes(child, out);
    }
  }
}

// -- Diff ----------------------------------------------------------------------

/**
 * Diff the scene tree against the previous frame snapshot.
 * Returns an array of patch objects (from pool) describing changed nodes.
 * Caller must call recyclePatchList(patches) after painting.
 *
 * @param {object} root - SceneGraph root node
 * @returns {Array<{node, x, y, width, height}>}
 */
function diff(root) {
  _curr.clear();

  const nodes = [];
  collectNodes(root, nodes);

  const patches = [];

  for (const node of nodes) {
    if (!node.id) continue;            // skip anonymous nodes — cannot diff without id
    const key = snapshotKey(node);
    _curr.set(node.id, key);

    const prevKey = _prev.get(node.id);
    if (prevKey === key) continue;     // unchanged

    // Node changed — produce a patch
    const bounds = node.bounds ?? node.getBounds?.() ?? null;
    if (!bounds) continue;             // no bounds = not renderable, skip

    const patch = acquirePatch();
    patch.node   = node;
    patch.x      = bounds.x;
    patch.y      = bounds.y;
    patch.width  = bounds.width;
    patch.height = bounds.height;
    patches.push(patch);
  }

  // Swap maps for next frame
  const tmp = _prev;
  _prev = _curr;
  _curr = tmp;

  return patches;
}

/**
 * Return all patches to the pool. Call after painting is done each frame.
 */
function recyclePatchList(patches) {
  for (const patch of patches) {
    releasePatch(patch);
  }
  patches.length = 0;
}

/**
 * Force a full-diff next frame (e.g. after theme change, resize).
 */
function invalidateAll() {
  _prev.clear();
}

// -- Pool metrics (for Profiler) -----------------------------------------------

function poolMetrics() {
  return { hits: _poolHits, misses: _poolMisses, poolSize: _patchPool.length };
}

// -- Export --------------------------------------------------------------------

export const Differ = {
  diff,
  recyclePatchList,
  invalidateAll,
  poolMetrics,
};

// Public/js/renderer/SceneGraph.js
// Scene graph manages the node tree and provides hit-testing.
// Nodes are pure data - SceneGraph owns the tree structure.
//
// API:
//   SceneGraph.setRoot(node)           -> replace entire tree
//   SceneGraph.getRoot()               -> current root node
//   SceneGraph.snapshot()              -> deep clone for diffing
//   SceneGraph.hitTest(x, y)           -> find interactive node at point
//   SceneGraph.traverse(fn)            -> depth-first traversal
//   SceneGraph.findById(id)            -> lookup node by id
//
// Phase 2 delivers:
//   - Tree management
//   - Hit-testing for interactive nodes
//   - Snapshot for Differ
//   - Traversal utilities
//
// Rule 5: Nodes are pure data + computed state. SceneGraph owns structure.

let _root = null;

// -- Tree management -----------------------------------------------------------

function setRoot(node) {
  _root = node;
}

function getRoot() {
  return _root;
}

// -- Snapshot (deep clone for Differ) ------------------------------------------

function snapshot() {
  if (!_root) return null;
  return cloneNode(_root);
}

function cloneNode(node) {
  if (!node) return null;
  
  const clone = { ...node };
  
  // Deep clone children array
  if (node.children && Array.isArray(node.children)) {
    clone.children = node.children.map(cloneNode);
  }
  
  // Deep clone bounds if present
  if (node.bounds) {
    clone.bounds = { ...node.bounds };
  }
  
  return clone;
}

// -- Traversal -----------------------------------------------------------------

function traverse(fn, node = _root) {
  if (!node) return;
  
  fn(node);
  
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      traverse(fn, child);
    }
  }
}

// -- Lookup --------------------------------------------------------------------

function findById(id, node = _root) {
  if (!node) return null;
  if (node.id === id) return node;
  
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findById(id, child);
      if (found) return found;
    }
  }
  
  return null;
}

// -- Hit-testing ---------------------------------------------------------------
// Rule 10: Interactive regions declare `interactive: true` and bounds.
// Returns the deepest (most specific) interactive node at point.

function hitTest(x, y, node = _root) {
  if (!node) return null;
  
  // Check children first (depth-first, deepest wins)
  if (node.children && Array.isArray(node.children)) {
    // Reverse order - later children are "on top"
    for (let i = node.children.length - 1; i >= 0; i--) {
      const hit = hitTest(x, y, node.children[i]);
      if (hit) return hit;
    }
  }
  
  // Check this node
  if (node.interactive && node.bounds) {
    const { x: bx, y: by, width, height } = node.bounds;
    if (x >= bx && x <= bx + width && y >= by && y <= by + height) {
      return node;
    }
  }
  
  return null;
}

// -- Validation (DEBUG only) ---------------------------------------------------

function validate(node = _root) {
  const DEBUG = typeof __DEBUG__ !== 'undefined' ? __DEBUG__ : true;
  if (!DEBUG) return true;
  
  if (!node) return true;
  
  const errors = [];
  
  // Whitelist of known node types
  const KNOWN_TYPES = ['container', 'rect', 'text', 'glyph', 'cursor', 'wordline', 'scroll', 'livegraph', 'textinput', 'slider', 'tooltip', 'pointer'];
  
  traverse(n => {
    // Every node must have a type
    if (!n.type) {
      errors.push(`Node missing type: ${JSON.stringify(n)}`);
    }
    
    // Warn on unknown types (not fatal, just informational)
    if (n.type && !KNOWN_TYPES.includes(n.type)) {
      console.warn(`[SceneGraph] Unknown node type: ${n.type} (add to KNOWN_TYPES if intentional)`);
    }
    
    // Interactive nodes must have bounds
    if (n.interactive && !n.bounds) {
      errors.push(`Interactive node missing bounds: ${n.type} ${n.id || ''}`);
    }
    
    // Bounds must be valid
    if (n.bounds) {
      const { x, y, width, height } = n.bounds;
      if (typeof x !== 'number' || typeof y !== 'number' ||
          typeof width !== 'number' || typeof height !== 'number') {
        errors.push(`Invalid bounds on ${n.type}: ${JSON.stringify(n.bounds)}`);
      }
    }
  }, node);
  
  if (errors.length > 0) {
    console.error('[SceneGraph] Validation errors:', errors);
    return false;
  }
  
  return true;
}

// -- Export --------------------------------------------------------------------

export const SceneGraph = {
  setRoot,
  getRoot,
  snapshot,
  traverse,
  findById,
  hitTest,
  validate,
};

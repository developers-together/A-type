// Public/js/renderer/nodes/BaseNode.js
// Base node factory - all nodes extend this.
// Nodes are pure data objects with computed layout/animation state.
//
// Rule 5: Nodes are pure data + computed runtime state. No canvas context ownership.
//
// Base node shape:
//   {
//     type: string           // node type identifier
//     id?: string            // optional unique id for lookup
//     children?: Node[]      // child nodes
//     bounds?: Rect          // computed layout bounds { x, y, width, height }
//     interactive?: boolean  // if true, participates in hit-testing
//     visible?: boolean      // if false, skip rendering (default true)
//     opacity?: number       // 0-1, applied to subtree (default 1)
//     zIndex?: number        // render order hint (default 0)
//   }

export function createBaseNode(type, props = {}) {
  // Spread props first, then enforce required fields that can't be overridden
  return {
    ...props,           // arbitrary props first
    type,               // enforced: node type identifier
    id: props.id ?? null,
    children: props.children ?? [],
    bounds: props.bounds ?? null,
    interactive: props.interactive ?? false,
    visible: props.visible ?? true,
    opacity: props.opacity ?? 1,
    zIndex: props.zIndex ?? 0,
  };
}

// -- Validation (DEBUG only) ---------------------------------------------------

export function validateNode(node) {
  const DEBUG = typeof __DEBUG__ !== 'undefined' ? __DEBUG__ : true;
  if (!DEBUG) return true;
  
  if (!node || typeof node !== 'object') {
    console.error('[BaseNode] Invalid node:', node);
    return false;
  }
  
  if (!node.type || typeof node.type !== 'string') {
    console.error('[BaseNode] Node missing type:', node);
    return false;
  }
  
  if (node.opacity !== undefined && (node.opacity < 0 || node.opacity > 1)) {
    console.warn(`[BaseNode] Invalid opacity ${node.opacity} on ${node.type}, clamping to 0-1`);
    node.opacity = Math.max(0, Math.min(1, node.opacity));
  }
  
  return true;
}

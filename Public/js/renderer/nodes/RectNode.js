// Public/js/renderer/nodes/RectNode.js
// Rectangle node - filled or stroked rect with optional border radius.
//
// Props:
//   x, y, width, height    - position and size (logical pixels)
//   fill?: string          - fill color (CSS color string)
//   stroke?: string        - stroke color
//   strokeWidth?: number   - stroke width in logical pixels
//   radius?: number        - border radius (all corners, or per-corner array [tl, tr, br, bl])

import { createBaseNode } from './BaseNode.js';

export function createRectNode(props) {
  const node = createBaseNode('rect', props);
  
  // Rect-specific props
  node.x = props.x ?? 0;
  node.y = props.y ?? 0;
  node.width = props.width ?? 0;
  node.height = props.height ?? 0;
  node.fill = props.fill ?? null;
  node.stroke = props.stroke ?? null;
  node.strokeWidth = props.strokeWidth ?? 1;
  node.radius = props.radius ?? 0;
  
  // Auto-compute bounds from rect dimensions
  node.bounds = {
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
  };
  
  return node;
}

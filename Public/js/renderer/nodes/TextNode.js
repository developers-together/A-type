// Public/js/renderer/nodes/TextNode.js
// Text node - renders text via GlyphCache (Phase 3) or fallback fillText (Phase 2).
//
// Props:
//   text: string           - text content
//   x, y: number           - baseline position (logical pixels)
//   font?: string          - font family (default 'JetBrains Mono')
//   size?: number          - font size in logical pixels (default 16)
//   weight?: number        - font weight (default 400)
//   color?: string         - text color (CSS color string, default '#d1d0c5')
//   align?: string         - text alignment: 'left' | 'center' | 'right' (default 'left')
//   baseline?: string      - text baseline: 'top' | 'middle' | 'alphabetic' | 'bottom' (default 'alphabetic')
//   maxWidth?: number      - optional max width for text wrapping (not implemented in Phase 2)

import { createBaseNode } from './BaseNode.js';

export function createTextNode(props) {
  const node = createBaseNode('text', props);
  
  // Text-specific props
  node.text = props.text ?? '';
  node.x = props.x ?? 0;
  node.y = props.y ?? 0;
  node.font = props.font ?? 'JetBrains Mono';
  node.size = props.size ?? 16;
  node.weight = props.weight ?? 400;
  node.color = props.color ?? '#d1d0c5';
  node.align = props.align ?? 'left';
  node.baseline = props.baseline ?? 'alphabetic';
  node.maxWidth = props.maxWidth ?? null;
  
  // Bounds computed during layout (Phase 4)
  // For Phase 2, we'll compute approximate bounds in Painter
  node.bounds = props.bounds ?? null;
  
  return node;
}

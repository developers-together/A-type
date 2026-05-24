// Public/js/renderer/nodes/ScrollContainerNode.js
// Scroll container node - vertically-scrollable container that clips children to bounds.
//
// Props:
//   x, y, width, height    - logical px, the visible clip rect
//   scrollOffset           - current logical scroll position (px), read-only externally (default 0)
//   contentHeight          - total height of stacked children (set by LayoutEngine)
//   id?                    - optional unique id for lookup
//
// Methods:
//   scrollTo(y)            - clamp and set scroll offset, returns clamped value
//   scrollBy(delta)        - scroll by a delta (positive = scroll down)
//   scrollIntoView(child)  - scroll so child node is fully visible within container

import { createBaseNode } from './BaseNode.js';

export function createScrollContainerNode(props) {
  const node = createBaseNode('scroll-container', props);
  
  // Scroll container-specific props
  node.x = props.x ?? 0;
  node.y = props.y ?? 0;
  node.width = props.width ?? 0;
  node.height = props.height ?? 0;
  node.scrollOffset = props.scrollOffset ?? 0;
  node.contentHeight = props.contentHeight ?? 0;
  node.interactive = true;            // enables hit-testing in PointerNode
  
  // Methods
  
  /**
   * Clamp and set scroll offset.
   * Returns the clamped value.
   */
  node.scrollTo = function(y) {
    const max = Math.max(0, this.contentHeight - this.height);
    this.scrollOffset = Math.max(0, Math.min(y, max));
    this.dirty = true;
    return this.scrollOffset;
  };
  
  /**
   * Scroll by a delta.
   * Positive delta = scroll down.
   */
  node.scrollBy = function(delta) {
    return this.scrollTo(this.scrollOffset + delta);
  };
  
  /**
   * Scroll so that a child node is fully visible within this container.
   * childNode must be a direct child with computed .y and .height set by LayoutEngine.
   */
  node.scrollIntoView = function(childNode) {
    if (!childNode) return;
    const contentTop    = (childNode.y - this.y) + this.scrollOffset;
    const contentBottom = contentTop + (childNode.height ?? 0);
    if (contentTop < this.scrollOffset) {
      this.scrollTo(contentTop);
    } else if (contentBottom > this.scrollOffset + this.height) {
      this.scrollTo(contentBottom - this.height);
    }
  };
  
  /**
   * Bounds rect used by hit-testing and Painter clip.
   * Logical px.
   */
  node.getBounds = function() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  };
  
  return node;
}

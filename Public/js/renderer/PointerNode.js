// Public/js/renderer/PointerNode.js
// Centralized pointer event manager. Singleton.
// Attaches to canvas and distributes hover/click events via EventBus.
// No view or node attaches raw pointer listeners directly (Rule 22).
//
// API:
//   PointerNode.init(canvas)   -> attach listeners, begin tracking
//   PointerNode.destroy()      -> detach all listeners
//   PointerNode.x              -> current logical pointer x
//   PointerNode.y              -> current logical pointer y
//   PointerNode.down           -> boolean, is primary button held
//   PointerNode.hoveredKey     -> key of currently hovered interactive node, or null
//
// Full hit-testing and hover event emission implemented in Phase 2.
// Touch passthrough implemented in Phase 7.

import { EventBus, EVENTS } from '../core/EventBus.js';

let _canvas = null;
let _x = 0;
let _y = 0;
let _down = false;
let _hoveredKey = null;

// Stub handlers - replaced with full hit-test logic in Phase 2
function onMouseMove(e) {
  _x = e.offsetX;
  _y = e.offsetY;
  // Phase 2: SceneGraph.hitTest(_x, _y) -> hover events
}

function onMouseDown() {
  _down = true;
}

function onMouseUp() {
  _down = false;
}

function onClick(e) {
  _x = e.offsetX;
  _y = e.offsetY;
  // Phase 2: SceneGraph.hitTest + NODE_CLICK emit
}

function init(canvas) {
  _canvas = canvas;
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('click', onClick);
  // Phase 7: touchstart / touchend passthrough
  if (typeof __DEBUG__ !== 'undefined' && __DEBUG__) {
    console.log('[PointerNode] init - listeners attached');
  }
}

function destroy() {
  if (!_canvas) return;
  _canvas.removeEventListener('mousemove', onMouseMove);
  _canvas.removeEventListener('mousedown', onMouseDown);
  _canvas.removeEventListener('mouseup', onMouseUp);
  _canvas.removeEventListener('click', onClick);
  _canvas = null;
  _hoveredKey = null;
}

export const PointerNode = {
  init,
  destroy,
  get x() {
    return _x;
  },
  get y() {
    return _y;
  },
  get down() {
    return _down;
  },
  get hoveredKey() {
    return _hoveredKey;
  },
};

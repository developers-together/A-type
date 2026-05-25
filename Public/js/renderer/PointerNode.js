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

import { EventBus, EVENTS } from "../core/EventBus.js";
import { SceneGraph } from "./SceneGraph.js";
import { LayoutEngine } from "./LayoutEngine.js";

let _canvas = null;
let _x = 0;
let _y = 0;
let _down = false;
let _hoveredKey = null;

function updatePointerPosition(e) {
  const rect = _canvas.getBoundingClientRect();
  _x = e.clientX !== undefined ? e.clientX - rect.left : e.offsetX;
  _y = e.clientY !== undefined ? e.clientY - rect.top : e.offsetY;
}

function hitTestCurrent() {
  LayoutEngine.layout(SceneGraph.getRoot());
  return SceneGraph.hitTest(_x, _y);
}

function nodeKey(node) {
  return node?.id ?? null;
}

function onMouseMove(e) {
  updatePointerPosition(e);

  const hit = hitTestCurrent();
  const nextKey = nodeKey(hit);
  if (nextKey === _hoveredKey) return;

  if (_hoveredKey) {
    EventBus.emit(EVENTS.NODE_HOVER_OUT, {
      id: _hoveredKey,
      x: _x,
      y: _y,
      originalEvent: e,
    });
  }

  _hoveredKey = nextKey;
  _canvas.style.cursor = hit ? "pointer" : "";

  if (hit) {
    EventBus.emit(EVENTS.NODE_HOVER_IN, {
      node: hit,
      id: nextKey,
      x: _x,
      y: _y,
      originalEvent: e,
    });
  }
}

function onMouseDown(e) {
  updatePointerPosition(e);
  _down = true;
}

function onMouseUp(e) {
  updatePointerPosition(e);
  _down = false;
}

function onClick(e) {
  updatePointerPosition(e);
  const hit = hitTestCurrent();
  if (!hit) return;
  EventBus.emit(EVENTS.NODE_CLICK, {
    node: hit,
    id: nodeKey(hit),
    x: _x,
    y: _y,
    originalEvent: e,
  });
}

function init(canvas) {
  _canvas = canvas;
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("click", onClick);
  // Phase 7: touchstart / touchend passthrough
  if (typeof __DEBUG__ !== "undefined" && __DEBUG__) {
    console.log("[PointerNode] init - listeners attached");
  }
}

function destroy() {
  if (!_canvas) return;
  _canvas.removeEventListener("mousemove", onMouseMove);
  _canvas.removeEventListener("mousedown", onMouseDown);
  _canvas.removeEventListener("mouseup", onMouseUp);
  _canvas.removeEventListener("click", onClick);
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

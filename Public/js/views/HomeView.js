// Public/js/views/HomeView.js
// Hardcoded home view for Phase 2 proof-of-concept.
// Renders "the quick brown fox" to prove SceneGraph + Painter pipeline works.
//
// Full HomeView with mode selection, settings, etc. comes in Phase 6+.

import { EventBus, EVENTS } from "../core/EventBus.js";
import { SceneGraph } from "../renderer/SceneGraph.js";
import { LayoutEngine } from "../renderer/LayoutEngine.js";
import { Renderer } from "../renderer/Renderer.js";
import { createRectNode } from "../renderer/nodes/RectNode.js";
import { createTextNode } from "../renderer/nodes/TextNode.js";

let unsubscribeTestButtonClick = null;

export function mountHomeView(logicalW, logicalH) {
  // Build a simple scene tree
  const root = {
    type: "container",
    id: "root",
    visible: true,
    children: [
      // Background rect
      createRectNode({
        id: "background",
        x: 0,
        y: 0,
        width: logicalW,
        height: logicalH,
        fill: "#0a0a0a",
      }),

      // Title text
      createTextNode({
        id: "title",
        text: "a-type",
        x: logicalW / 2,
        y: logicalH / 2 - 60,
        size: 32,
        weight: 600,
        color: "#e2b714",
        align: "center",
        baseline: "middle",
      }),

      // Proof-of-concept text
      createTextNode({
        id: "demo-text",
        text: "the quick brown fox jumps over the lazy dog",
        x: logicalW / 2,
        y: logicalH / 2,
        size: 20,
        weight: 400,
        color: "#d1d0c5",
        align: "center",
        baseline: "middle",
      }),

      // Status text
      createTextNode({
        id: "status",
        text: "Phase 2: SceneGraph + Painter working ✓",
        x: logicalW / 2,
        y: logicalH / 2 + 40,
        size: 14,
        weight: 400,
        color: "#646669",
        align: "center",
        baseline: "middle",
      }),

      // Interactive button (for hit-test demo)
      createRectNode({
        id: "test-button",
        x: logicalW / 2 - 60,
        y: logicalH / 2 + 80,
        width: 120,
        height: 40,
        fill: "#2c2e31",
        stroke: "#646669",
        strokeWidth: 1,
        radius: 4,
        interactive: true,
      }),

      createTextNode({
        id: "button-label",
        text: "Click me",
        x: logicalW / 2,
        y: logicalH / 2 + 100,
        size: 14,
        weight: 400,
        color: "#d1d0c5",
        align: "center",
        baseline: "middle",
      }),
    ],
  };

  SceneGraph.setRoot(root);

  if (unsubscribeTestButtonClick) {
    unsubscribeTestButtonClick();
  }

  unsubscribeTestButtonClick = EventBus.on(EVENTS.NODE_CLICK, ({ node }) => {
    if (node?.id !== "test-button") return;

    const label = SceneGraph.findById("button-label");
    if (label) {
      label.text = label.text === "Clicked!" ? "Click me" : "Clicked!";
    }

    node.fill = node.fill === "#2c2e31" ? "#3a3c40" : "#2c2e31";
    LayoutEngine.invalidateAll();
    Renderer.forceRepaint();
  });

  console.log("[HomeView] mounted - scene tree:", root);
  console.log(
    "[HomeView] validation:",
    SceneGraph.validate() ? "passed" : "FAILED",
  );
}

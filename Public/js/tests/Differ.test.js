// Public/js/tests/Differ.test.js
// Unit tests for Differ module.
// Run via the project test runner: Public/js/tests/runner.js

import { Differ } from '../renderer/Differ.js';

export const differTests = [

  {
    name: 'diff returns empty array when nothing changed',
    run() {
      const root = { id: 'root', type: 'container', visible: true, children: [], bounds: { x:0,y:0,width:100,height:100 } };
      Differ.invalidateAll();
      Differ.diff(root);                   // first frame — all "new", patches returned
      const patches = Differ.diff(root);   // second frame — nothing changed
      Differ.recyclePatchList(patches);
      console.assert(patches.length === 0, 'Expected 0 patches on unchanged frame');
    },
  },

  {
    name: 'diff detects changed node',
    run() {
      const node = { id: 'n1', type: 'rect', visible: true, x: 0, y: 0, width: 50, height: 50, fill: '#fff', bounds: { x:0,y:0,width:50,height:50 } };
      const root = { id: 'root', type: 'container', visible: true, children: [node], bounds: null };
      Differ.invalidateAll();
      Differ.diff(root);                   // baseline
      node.x = 10;                         // mutate
      const patches = Differ.diff(root);
      const changed = patches.some(p => p.node === node);
      Differ.recyclePatchList(patches);
      console.assert(changed, 'Expected patch for mutated node');
    },
  },

  {
    name: 'nodes without id are skipped',
    run() {
      const node = { type: 'rect', visible: true, x: 0, y: 0, width: 50, height: 50, bounds: { x:0,y:0,width:50,height:50 } };
      // no id
      const root = { id: 'root', type: 'container', visible: true, children: [node], bounds: null };
      Differ.invalidateAll();
      const patches = Differ.diff(root);
      Differ.recyclePatchList(patches);
      const hadAnon = patches.some(p => p.node === node);
      console.assert(!hadAnon, 'Anonymous node should be skipped');
    },
  },

  {
    name: 'recyclePatchList returns patches to pool',
    run() {
      const node = { id: 'p1', type: 'rect', visible: true, x:0, y:0, width:10, height:10, fill:'#f00', bounds:{x:0,y:0,width:10,height:10} };
      const root = { id: 'root', type: 'container', visible: true, children: [node], bounds: null };
      Differ.invalidateAll();
      const patches = Differ.diff(root);
      const before = Differ.poolMetrics().poolSize;
      Differ.recyclePatchList(patches);
      const after = Differ.poolMetrics().poolSize;
      console.assert(after >= before, 'Pool should grow after recycle');
    },
  },

  {
    name: 'invalidateAll forces full re-diff',
    run() {
      const node = { id: 'inv1', type: 'rect', visible: true, x:0, y:0, width:10, height:10, fill:'#f00', bounds:{x:0,y:0,width:10,height:10} };
      const root = { id: 'root', type: 'container', visible: true, children: [node], bounds: null };
      Differ.invalidateAll();
      Differ.diff(root);                    // baseline
      Differ.recyclePatchList(Differ.diff(root)); // stable
      Differ.invalidateAll();               // force reset
      const patches = Differ.diff(root);   // should re-report node as changed
      const changed = patches.some(p => p.node === node);
      Differ.recyclePatchList(patches);
      console.assert(changed, 'invalidateAll should cause re-diff');
    },
  },

];

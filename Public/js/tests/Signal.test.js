// Public/js/tests/Signal.test.js
// Tests for Signal.js reactive primitives

import { describe, it, expect } from './runner.js';
import { createSignal, createEffect, createMemo } from '../core/Signal.js';

export function signalTests() {
  describe('Signal', () => {
    it('creates signal with initial value', () => {
      const [count] = createSignal(0);
      expect(count()).toBe(0);
    });

    it('updates signal value', () => {
      const [count, setCount] = createSignal(0);
      setCount(5);
      expect(count()).toBe(5);
    });

    it('skips update if value unchanged', () => {
      const [count, setCount] = createSignal(0);
      let effectRuns = 0;
      createEffect(() => {
        count();
        effectRuns++;
      });
      setCount(0); // same value
      expect(effectRuns).toBe(1); // only initial run
    });

    it('notifies subscribers on change', () => {
      const [count, setCount] = createSignal(0);
      let observed = 0;
      createEffect(() => {
        observed = count();
      });
      setCount(10);
      expect(observed).toBe(10);
    });

    it('supports multiple subscribers', () => {
      const [count, setCount] = createSignal(0);
      let a = 0, b = 0;
      createEffect(() => { a = count(); });
      createEffect(() => { b = count(); });
      setCount(7);
      expect(a).toBe(7);
      expect(b).toBe(7);
    });

    it('creates computed memo', () => {
      const [count, setCount] = createSignal(2);
      const doubled = createMemo(() => count() * 2);
      expect(doubled()).toBe(4);
      setCount(5);
      expect(doubled()).toBe(10);
    });

    it('memo updates when dependency changes', () => {
      const [a, setA] = createSignal(1);
      const [b, setB] = createSignal(2);
      const sum = createMemo(() => a() + b());
      expect(sum()).toBe(3);
      setA(10);
      expect(sum()).toBe(12);
      setB(20);
      expect(sum()).toBe(30);
    });

    it('effect runs immediately', () => {
      let ran = false;
      createEffect(() => { ran = true; });
      expect(ran).toBeTruthy();
    });

    it('handles nested effects', () => {
      const [outer, setOuter] = createSignal(1);
      const [inner, setInner] = createSignal(2);
      let result = 0;
      createEffect(() => {
        const o = outer();
        createEffect(() => {
          result = o + inner();
        });
      });
      expect(result).toBe(3);
      setInner(5);
      expect(result).toBe(6);
    });

    it('supports object values', () => {
      const [state, setState] = createSignal({ count: 0 });
      expect(state().count).toBe(0);
      setState({ count: 10 });
      expect(state().count).toBe(10);
    });

    it('does not leak inner effect subscriptions on outer re-run', () => {
      const [outer, setOuter] = createSignal(1);
      const [inner, setInner] = createSignal(2);
      let fireCount = 0;

      createEffect(() => {
        outer();
        createEffect(() => {
          inner();
          fireCount++;
        });
      });

      expect(fireCount).toBe(1);

      setOuter(2);

      const beforeInner = fireCount;
      setInner(10);
      expect(fireCount).toBe(beforeInner + 1);
    });
  });
}

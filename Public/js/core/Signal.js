// Public/js/core/Signal.js
// Fine-grained reactivity primitive.
// No dependencies. No DOM. No canvas. Pure JS.
//
// API:
//   createSignal(initialValue) -> [getter, setter]
//   createEffect(fn)           -> runs fn immediately, re-runs when signals it read change
//   createMemo(fn)             -> like createEffect but returns a getter for the computed value
//
// Invariant: no signal read/write cycles. Effects that write signals they also read
// will cause infinite loops. This is not guarded - design state to avoid it.

// -- Tracking context ----------------------------------------------------------

let currentEffect = null; // the effect currently being executed, if any

// -- createSignal --------------------------------------------------------------

export function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  function get() {
    // If an effect is running and reads this signal, subscribe it
    if (currentEffect !== null) {
      subscribers.add(currentEffect);
      // Track this signal in the effect's subscriptions for cleanup
      if (currentEffect.subscriptions) {
        currentEffect.subscriptions.add(get);
      }
    }
    return value;
  }

  function set(newValue) {
    // Skip if value hasn't changed (referential equality)
    if (Object.is(value, newValue)) return;
    value = newValue;
    // Notify all subscribers - iterate a snapshot to allow unsubscription mid-notify
    for (const effect of [...subscribers]) {
      effect();
    }
  }

  // Expose subscribers for cleanup
  get.subscribers = subscribers;

  return [get, set];
}

// -- createEffect --------------------------------------------------------------

export function createEffect(fn) {
  const subscriptions = new Set(); // track which signals this effect subscribed to
  const children = new Set(); // nested effects created during this effect run

  function cleanup() {
    // Dispose nested child effects first so their subscriptions are removed.
    for (const child of [...children]) {
      child.dispose();
    }
    children.clear();

    // Unsubscribe from all previous dependencies.
    for (const signal of subscriptions) {
      signal.subscribers.delete(effect);
    }
    subscriptions.clear();
  }

  function effect() {
    cleanup();

    const prevEffect = currentEffect;
    currentEffect = effect;
    effect.subscriptions = subscriptions; // expose for signal to register
    effect.children = children;
    try {
      fn();
    } finally {
      currentEffect = prevEffect; // restore outer tracking context
    }
  }

  effect.dispose = cleanup;

  // If this effect was created inside another effect, register it as a child so
  // parent cleanup can dispose stale nested effects before re-running.
  if (currentEffect !== null && currentEffect.children) {
    currentEffect.children.add(effect);
  }

  // Run immediately to collect dependencies
  effect();
}

// -- createMemo ----------------------------------------------------------------

export function createMemo(fn) {
  // A memo is a signal whose value is computed by fn
  // It re-computes whenever its dependencies change
  const [get, set] = createSignal(undefined);

  createEffect(() => {
    set(fn());
  });

  return get; // caller reads the memoized value via get()
}

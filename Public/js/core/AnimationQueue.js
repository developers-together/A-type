// Public/js/core/AnimationQueue.js
// Concurrent animation registry with canvas-state conflict ownership.
// Prevents two animations from fighting over shared ctx state (e.g. globalAlpha).
//
// API:
//   AnimationQueue.init()
//   AnimationQueue.add(id, animation)   -> register animation
//   AnimationQueue.remove(id)           -> cancel animation
//   AnimationQueue.tick(deltaSeconds)   -> advance all animations (called by Renderer)
//   AnimationQueue.has(id)              -> boolean
//   AnimationQueue.clear()              -> remove all (tests only)
//
// Animation shape:
//   {
//     tick(deltaSeconds) -> boolean   // return true when animation is done
//     owned?:  string[]              // canvas state props this animation owns
//     evict?:  boolean               // true = new animation removes conflicting old one
//                                    // false = update() called on existing animation
//     update?: (newConfig) => void   // called when evict:false and conflict detected
//   }
//
// Full conflict resolution and dissolve/slide animations implemented in Phase 9/10.

const animations = new Map(); // id -> animation object

function init() {
  animations.clear();
  if (typeof __DEBUG__ !== 'undefined' && __DEBUG__) {
    console.log('[AnimationQueue] init');
  }
}

function add(id, animation) {
  // Check for owned-state conflicts
  if (animation.owned?.length) {
    for (const [existingId, existing] of animations) {
      if (existingId === id) continue;
      const conflict = animation.owned.some(prop => existing.owned?.includes(prop));

      if (conflict) {
        if (animation.evict === false && typeof existing.update === 'function') {
          // Non-evict: update the existing animation's target instead
          existing.update(animation);
          return; // do not register new animation
        } else {
          // Evict: remove the old animation, new one wins
          if (typeof __DEBUG__ !== 'undefined' && __DEBUG__) {
            console.warn(`[AnimationQueue] '${id}' evicts '${existingId}' on owned:`, animation.owned);
          }
          animations.delete(existingId);
        }
      }
    }
  }

  animations.set(id, animation);
}

function remove(id) {
  animations.delete(id);
}

function tick(deltaSeconds) {
  if (animations.size === 0) return;

  for (const [id, anim] of animations) {
    try {
      const done = anim.tick(deltaSeconds);
      if (done) animations.delete(id);
    } catch (err) {
      console.error(`[AnimationQueue] Error in animation '${id}':`, err);
      animations.delete(id); // remove broken animation, preserve loop
    }
  }
}

function has(id) {
  return animations.has(id);
}

function clear() {
  animations.clear();
}

export const AnimationQueue = { init, add, remove, tick, has, clear };

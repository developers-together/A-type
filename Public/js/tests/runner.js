// Public/js/tests/runner.js
// Minimal test runner - no dependencies, runs in browser console or Node
// Usage: import and call runTests() with test modules

const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

let currentSuite = '';
let currentTest = '';

export function describe(name, fn) {
  currentSuite = name;
  console.log(`\n📦 ${name}`);
  fn();
  currentSuite = '';
}

export function it(name, fn) {
  currentTest = name;
  try {
    fn();
    results.passed++;
    results.tests.push({ suite: currentSuite, test: name, passed: true });
    console.log(`  ✅ ${name}`);
  } catch (err) {
    results.failed++;
    results.tests.push({ suite: currentSuite, test: name, passed: false, error: err.message });
    console.error(`  ❌ ${name}`);
    console.error(`     ${err.message}`);
  }
  currentTest = '';
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value, got ${JSON.stringify(actual)}`);
      }
    },
    toThrow() {
      if (typeof actual !== 'function') {
        throw new Error('toThrow() requires a function');
      }
      try {
        actual();
        throw new Error('Expected function to throw, but it did not');
      } catch (err) {
        // Expected - function threw
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
  };
}

export function runTests(testModules) {
  console.log('🧪 Running A-Type Canvas Renderer Tests\n');
  results.passed = 0;
  results.failed = 0;
  results.tests = [];

  for (const module of testModules) {
    module();
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Total:  ${results.passed + results.failed}`);
  console.log('='.repeat(50));

  return results;
}

const assert = require('assert');
const shelf_merge = require('./index.js');

function runTests() {
    console.log("Running shelf_merge tests...");

    const testCases = [
        {
            name: "Initial merge",
            shelf: [null, null],
            merge: { hello: "world" },
            final: [{ hello: "world" }, [1, { hello: 1 }]],
            change: [{ hello: "world" }, [1, { hello: 1 }]]
        },
        {
            name: "Merge with higher version",
            shelf: [{ hello: "world" }, [1, { hello: 1 }]],
            merge: [{ hello: "updated" }, [2, { hello: 2 }]],
            final: [{ hello: "updated" }, [2, { hello: 2 }]],
            change: [{ hello: "updated" }, [2, { hello: 2 }]]
        },
        {
            name: "Merge with lower version (no change)",
            shelf: [{ hello: "world" }, [2, { hello: 2 }]],
            merge: [{ hello: "old" }, [1, { hello: 1 }]],
            final: [{ hello: "world" }, [2, { hello: 2 }]],
            change: null
        },
        {
            name: "Merge new property",
            shelf: [{ hello: "world" }, [1, { hello: 1 }]],
            merge: { newProp: "value" },
            final: [{ hello: "world", newProp: "value" }, [1, { hello: 1, newProp: 1 }]],
            change: [{ newProp: "value" }, [1, { newProp: 1 }]]
        },
        {
            name: "Merge nested objects",
            shelf: [{ nested: { a: 1 } }, [1, { nested: [1, { a: 1 }] }]],
            merge: { nested: { b: 2 } },
            final: [{ nested: { a: 1, b: 2 } }, [1, { nested: [1, { a: 1, b: 1 }] }]],
            change: [{ nested: { b: 2 } }, [1, { nested: [1, { b: 1 }] }]]
        },
        {
            name: "Merge array (treated as primitive)",
            shelf: [{ arr: [1, 2, 3] }, [1, { arr: 1 }]],
            merge: { arr: [4, 5, 6] },
            final: [{ arr: [4, 5, 6] }, [1, { arr: 2 }]],
            change: [{ arr: [4, 5, 6] }, [1, { arr: 2 }]]
        },
        {
            name: "Delete property (set to null)",
            shelf: [{ a: 1, b: 2 }, [1, { a: 1, b: 1 }]],
            merge: { b: null },
            final: [{ a: 1 }, [1, { a: 1, b: 2 }]],
            change: [{ b: null }, [1, { b: 2 }]]
        },
        {
            name: "Merge with empty object (no change)",
            shelf: [{ a: 1 }, [1, { a: 1 }]],
            merge: {},
            final: [{ a: 1 }, [1, { a: 1 }]],
            change: null
        },
        {
            name: "Merge primitives with different types",
            shelf: [{ a: 1 }, [1, { a: 1 }]],
            merge: { a: "string" },
            final: [{ a: "string" }, [1, { a: 2 }]],
            change: [{ a: "string" }, [1, { a: 2 }]]
        },
        {
            name: "Merge with null value",
            shelf: [{ a: 1, b: 2 }, [1, { a: 1, b: 1 }]],
            merge: { a: null, c: 3 },
            final: [{ b: 2, c: 3 }, [1, { a: 2, b: 1, c: 1 }]],
            change: [{ a: null, c: 3 }, [1, { a: 2, c: 1 }]]
        },
        {
            name: "Merge with same value",
            shelf: [{ a: 7 }, [1, { a: 1 }]],
            merge: { a: 7, b: 2 },
            final: [{ a: 7, b: 2 }, [1, { a: 1, b: 1 }]],
            change: [{ b: 2 }, [1, { b: 1 }]]
        },
        {
            name: "Merge with same value and version",
            shelf: [{ a: 7 }, [1, { a: 1 }]],
            merge: [{ a: 7, b: 2 }, [1, { a: 1, b: 1 }]],
            final: [{ a: 7, b: 2 }, [1, { a: 1, b: 1 }]],
            change: [{ b: 2 }, [1, { b: 1 }]]
        },
        {
            name: "Merging with undefined values",
            shelf: [{ a: 1, b: 2 }, [1, { a: 1, b: 1 }]],
            merge: { a: undefined, c: 3 },
            final: [{ a: 1, b: 2, c: 3 }, [1, { a: 1, b: 1, c: 1 }]],
            change: [{ c: 3 }, [1, { c: 1 }]]
        },
        {
            name: "Deep nested object merging",
            shelf: [{ a: { b: { c: 1 } } }, [1, { a: [1, { b: [1, { c: 1 }] }] }]],
            merge: { a: { b: { d: 2 } } },
            final: [{ a: { b: { c: 1, d: 2 } } }, [1, { a: [1, { b: [1, { c: 1, d: 1 }] }] }]],
            change: [{ a: { b: { d: 2 } } }, [1, { a: [1, { b: [1, { d: 1 }] }] }]]
        }
    ];

    testCases.forEach((testCase, index) => {
        console.log(`Running test ${index + 1}: ${testCase.name}`);
        const result = shelf_merge(testCase.shelf, testCase.merge);
        assert.deepStrictEqual(testCase.shelf, testCase.final, `Test ${index + 1} failed: ${testCase.name} (shelf)`);
        assert.deepStrictEqual(result, testCase.change, `Test ${index + 1} failed: ${testCase.name} (result)`);
    });

    console.log("All tests passed successfully!");
}

runTests();

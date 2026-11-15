// Run with: node tests/store.test.js
// Loads js/store.js with a minimal localStorage stub (no dependencies needed).
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const mem = {};
global.localStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: (k) => { delete mem[k]; }
};

const src = fs.readFileSync(path.join(__dirname, "..", "js", "store.js"), "utf8");
const Store = new Function(`${src}; return Store;`)();

// seeds 5 students
assert.strictEqual(Store.getData().students.length, 5);

// add: valid
assert.deepStrictEqual(Store.addStudent(" 106 ", "  Meera   Iyer "), { ok: true });
const added = Store.getData().students.find((s) => s.roll === "106");
assert.strictEqual(added.name, "Meera Iyer"); // trimmed + whitespace collapsed

// add: rejects empty, duplicate (case-insensitive), bad characters
assert.strictEqual(Store.addStudent("", "X").ok, false);
assert.strictEqual(Store.addStudent("107", "   ").ok, false);
assert.strictEqual(Store.addStudent("106", "Someone Else").ok, false);
assert.strictEqual(Store.addStudent("a1", "A One").ok, true);
assert.strictEqual(Store.addStudent("A1", "A Dup").ok, false);
assert.strictEqual(Store.addStudent("10 7", "Space Roll").ok, false);

// remove: also cleans records and leaves
const d = Store.getData();
d.records = { DSA: { "2026-11-15": { "101": "Present", "102": "Absent" } } };
d.leaves = [
  { id: 1, roll: "101", subjectId: "DSA", date: "2026-11-16", reason: "x", status: "Pending" },
  { id: 2, roll: "102", subjectId: "DSA", date: "2026-11-16", reason: "y", status: "Pending" }
];
Store.saveData(d);

assert.deepStrictEqual(Store.removeStudent("101"), { ok: true });
const after = Store.getData();
assert.ok(!after.students.some((s) => s.roll === "101"));
assert.deepStrictEqual(after.records.DSA["2026-11-15"], { "102": "Absent" });
assert.deepStrictEqual(after.leaves.map((l) => l.roll), ["102"]);

// remove: unknown roll
assert.strictEqual(Store.removeStudent("999").ok, false);

console.log("All store tests passed.");
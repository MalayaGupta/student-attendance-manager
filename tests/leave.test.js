// Run with: node tests/leave.test.js
const fs = require("fs");
const path = require("path");
const assert = require("assert");

const mem = {};
global.localStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); }
};

const src = fs.readFileSync(path.join(__dirname, "..", "js", "store.js"), "utf8");
const Store = new Function(`${src}; return Store;`)();

const FUTURE = "2099-01-15";

// valid request is saved as Pending with an id
assert.deepStrictEqual(Store.applyLeave("101", "DSA", FUTURE, "  Medical   appointment "), { ok: true });
let leaves = Store.getLeavesForStudent("101");
assert.strictEqual(leaves.length, 1);
assert.strictEqual(leaves[0].status, "Pending");
assert.strictEqual(leaves[0].reason, "Medical appointment"); // whitespace cleaned
assert.strictEqual(leaves[0].id, 1);

// today is allowed, past dates are not
assert.strictEqual(Store.applyLeave("101", "NS", Store.todayString(), "Family event").ok, true);
assert.strictEqual(Store.applyLeave("101", "OOP", "2000-01-01", "Too late").ok, false);

// missing fields, impossible dates, unknown student/subject, too-long reason
assert.strictEqual(Store.applyLeave("101", "DSA", "", "x").ok, false);
assert.strictEqual(Store.applyLeave("101", "DSA", FUTURE, "   ").ok, false);
assert.strictEqual(Store.applyLeave("101", "DSA", "2099-02-30", "x").ok, false);
assert.strictEqual(Store.applyLeave("999", "DSA", FUTURE, "x").ok, false);
assert.strictEqual(Store.applyLeave("101", "XYZ", FUTURE, "x").ok, false);
assert.strictEqual(Store.applyLeave("101", "DBMS", FUTURE, "a".repeat(201)).ok, false);

// duplicate pending request is blocked
assert.strictEqual(Store.applyLeave("101", "DSA", FUTURE, "Again").ok, false);

// a rejected request can be re-submitted
const d = Store.getData();
d.leaves.find((l) => l.subjectId === "DSA").status = "Rejected";
Store.saveData(d);
assert.strictEqual(Store.applyLeave("101", "DSA", FUTURE, "Trying again").ok, true);

// another student's leaves are separate; ids keep increasing; newest date first
assert.strictEqual(Store.applyLeave("102", "DSA", FUTURE, "Sick").ok, true);
assert.strictEqual(Store.getLeavesForStudent("102").length, 1);
const ids = Store.getData().leaves.map((l) => l.id);
assert.strictEqual(new Set(ids).size, ids.length);
leaves = Store.getLeavesForStudent("101");
assert.ok(leaves[0].date >= leaves[leaves.length - 1].date);

// removing a student also removes their leave requests (manage-students)
Store.removeStudent("102");
assert.strictEqual(Store.getLeavesForStudent("102").length, 0);

console.log("All leave tests passed.");
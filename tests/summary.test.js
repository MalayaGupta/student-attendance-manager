// Run with: node tests/summary.test.js
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

const d = Store.getData();
d.records = {
  DSA: {
    "2026-11-02": { "101": "Present" },
    "2026-11-03": { "101": "Present" },
    "2026-11-04": { "101": "Present" },
    "2026-11-05": { "101": "Absent" }
  },
  NS: {
    "2026-11-02": { "101": "Present" },
    "2026-11-03": { "101": "Leave" },   // excluded from total
    "2026-11-04": { "101": "Absent" }
  },
  DBMS: {
    "2026-11-02": { "102": "Present" }  // nothing recorded for 101
  }
};
Store.saveData(d);

const byId = Object.fromEntries(Store.getAttendanceSummary("101").map((s) => [s.id, s]));
assert.strictEqual(byId.DSA.percent, 75);
assert.strictEqual(byId.DSA.total, 4);
assert.strictEqual(byId.NS.total, 2);        // leave day not counted
assert.strictEqual(byId.NS.percent, 50);
assert.strictEqual(byId.DBMS.percent, null); // no data
assert.strictEqual(byId.OOP.percent, null);  // no records at all
assert.strictEqual(Store.getAttendanceSummary("101").length, 4);

console.log("All summary tests passed.");
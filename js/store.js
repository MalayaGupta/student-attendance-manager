const STORAGE_KEY = "sam_data_v1";

const INITIAL_DATA = {
  subjects: [
    { id: "DSA", name: "Data Structures & Algorithms" },
    { id: "NS", name: "Network Science" },
    { id: "DBMS", name: "Database Management Systems" },
    { id: "OOP", name: "Object-Oriented Programming" }
  ],
  students: [
    { roll: "101", name: "Aarav Sharma" },
    { roll: "102", name: "Diya Verma" },
    { roll: "103", name: "Rohan Mehta" },
    { roll: "104", name: "Sneha Nair" },
    { roll: "105", name: "Kabir Das" }
  ],
  // Structure: records[subjectId][date][roll] = "Present" | "Absent" | "Leave"
  records: {},
  // Structure: { id, roll, subjectId, date, reason, status: "Pending" | "Approved" | "Rejected" }
  leaves: []
};

const Store = {
  getData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveData(INITIAL_DATA);
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
    return JSON.parse(raw);
  },

  saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Returns { ok: true } or { ok: false, error: "message" }
  addStudent(roll, name) {
    roll = String(roll || "").trim();
    name = String(name || "").trim().replace(/\s+/g, " ");

    if (!roll || !name) {
      return { ok: false, error: "Roll number and name are both required." };
    }
    if (!/^[A-Za-z0-9-]+$/.test(roll)) {
      return { ok: false, error: "Roll number may only contain letters, digits and hyphens." };
    }

    const data = this.getData();
    const exists = data.students.some(
      (s) => s.roll.toLowerCase() === roll.toLowerCase()
    );
    if (exists) {
      return { ok: false, error: `Roll number ${roll} already exists.` };
    }

    data.students.push({ roll, name });
    this.saveData(data);
    return { ok: true };
  },

  // Removes the student and every trace of them in records and leaves,
  // so percentages and leave lists never point at a missing student.
  removeStudent(roll) {
    const data = this.getData();
    const before = data.students.length;
    data.students = data.students.filter((s) => s.roll !== roll);
    if (data.students.length === before) {
      return { ok: false, error: `No student with roll number ${roll}.` };
    }

    Object.values(data.records).forEach((byDate) => {
      Object.values(byDate).forEach((byRoll) => {
        delete byRoll[roll];
      });
    });
    data.leaves = data.leaves.filter((l) => l.roll !== roll);

    this.saveData(data);
    return { ok: true };
  }
};
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
  },

  // Attendance summary for one student: one entry per subject.
  // Days marked "Leave" are excluded from the total class count.
  getAttendanceSummary(roll) {
    const data = this.getData();
    return data.subjects.map((subject) => {
      const byDate = data.records[subject.id] || {};
      let present = 0;
      let total = 0;
      Object.values(byDate).forEach((byRoll) => {
        const status = byRoll[roll];
        if (status === "Present") {
          present++;
          total++;
        } else if (status === "Absent") {
          total++;
        }
      });
      const percent = total === 0 ? null : Math.round((present / total) * 1000) / 10;
            return { id: subject.id, name: subject.name, present, total, percent };
    });
  },

  // Today's date as YYYY-MM-DD in the local timezone
  todayString() {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  },

  // A student applies for leave on one date for one subject.
  // Returns { ok: true } or { ok: false, error: "message" }
  applyLeave(roll, subjectId, date, reason) {
    date = String(date || "").trim();
    reason = String(reason || "").trim().replace(/\s+/g, " ");

    if (!subjectId || !date || !reason) {
      return { ok: false, error: "Subject, date and reason are all required." };
    }

    // Must be a real calendar date such as 2026-11-20 (rejects 2026-02-30)
    const parsed = new Date(date + "T00:00:00Z");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date
    ) {
      return { ok: false, error: "Please enter a valid date." };
    }
    if (date < this.todayString()) {
      return { ok: false, error: "Leave cannot be applied for a past date." };
    }
    if (reason.length > 200) {
      return { ok: false, error: "Reason must be 200 characters or fewer." };
    }

    const data = this.getData();
    if (!data.students.some((s) => s.roll === roll)) {
      return { ok: false, error: "Student not found." };
    }
    if (!data.subjects.some((s) => s.id === subjectId)) {
      return { ok: false, error: "Subject not found." };
    }

    // A rejected request can be re-submitted; pending/approved ones cannot be duplicated
    const duplicate = data.leaves.some(
      (l) =>
        l.roll === roll &&
        l.subjectId === subjectId &&
        l.date === date &&
        l.status !== "Rejected"
    );
    if (duplicate) {
      return { ok: false, error: "You already have a leave request for this subject on that date." };
    }

    const nextId = data.leaves.reduce((max, l) => Math.max(max, l.id), 0) + 1;
    data.leaves.push({ id: nextId, roll, subjectId, date, reason, status: "Pending" });
    this.saveData(data);
    return { ok: true };
  },

  // All leave requests of one student, newest date first
  getLeavesForStudent(roll) {
    return this.getData()
      .leaves.filter((l) => l.roll === roll)
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }
};
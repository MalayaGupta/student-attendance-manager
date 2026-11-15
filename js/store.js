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
  }
};
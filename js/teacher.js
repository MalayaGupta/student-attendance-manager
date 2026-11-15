
const TeacherView = {
  init() {
    const container = document.getElementById("teacher-content");
    const data = Store.getData();

    container.innerHTML = `
      <p class="muted">
        Loaded ${data.students.length} students across
        ${data.subjects.length} subjects.
      </p>

      <div id="attendance-section"></div>
      <div id="roster-section"></div>
    `;

    this.renderAttendance();
    this.renderRoster();
  },

  // FEATURE 1: MARK ATTENDANCE

  renderAttendance() {
    const section = document.getElementById("attendance-section");
    const data = Store.getData();

    const subjectOptions = data.subjects.map(subject => `
      <option value="${this.escape(subject.id)}">
        ${this.escape(subject.name)}
      </option>
    `).join("");

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    section.innerHTML = `
      <h3 class="section-title">Mark Attendance</h3>

      <div class="attendance-controls">
        <div>
          <label for="attendance-subject">Select Subject</label>
          <select id="attendance-subject">
            ${subjectOptions}
          </select>
        </div>

        <div>
          <label for="attendance-date">Select Date</label>
          <input type="date" id="attendance-date"
                 value="${localDate}">
        </div>
      </div>

      <div class="table-scroll">
        <table class="attendance-table">
          <thead>
            <tr>
              <th>Roll No.</th>
              <th>Student Name</th>
              <th>Attendance</th>
            </tr>
          </thead>

          <tbody id="attendance-body"></tbody>
        </table>
      </div>

      <p id="attendance-message" class="form-msg"></p>

      <button type="button" id="save-attendance"
              class="btn btn-primary">
        Save Attendance
      </button>
    `;

    document.getElementById("attendance-subject")
      .addEventListener("change", () => this.renderAttendanceTable());

    document.getElementById("attendance-date")
      .addEventListener("change", () => this.renderAttendanceTable());

    document.getElementById("save-attendance")
      .addEventListener("click", () => this.saveAttendance());

    this.renderAttendanceTable();
  },

  renderAttendanceTable() {
    const data = Store.getData();

    const subjectId =
      document.getElementById("attendance-subject").value;

    const date =
      document.getElementById("attendance-date").value;

    const tbody = document.getElementById("attendance-body");

    const existingRecords =
      data.records?.[subjectId]?.[date] || {};

    if (data.students.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3">No students available.</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = data.students.map(student => {
      const status = existingRecords[student.roll] || "";

      return `
        <tr>
          <td>${this.escape(student.roll)}</td>

          <td>${this.escape(student.name)}</td>

          <td class="attendance-buttons"
              data-roll="${this.escape(student.roll)}"
              data-status="${status}">

            <button type="button"
              class="attendance-btn present-btn
              ${status === "Present" ? "selected" : ""}"
              data-status="Present">
              Present
            </button>

            <button type="button"
              class="attendance-btn absent-btn
              ${status === "Absent" ? "selected" : ""}"
              data-status="Absent">
              Absent
            </button>

          </td>
        </tr>
      `;
    }).join("");

    // Add click events to Present and Absent buttons
    tbody.querySelectorAll(".attendance-btn").forEach(button => {
      button.addEventListener("click", () => {
        const cell = button.closest(".attendance-buttons");
        const newStatus = button.dataset.status;

        cell.dataset.status = newStatus;

        // Remove selected style from both buttons
        cell.querySelectorAll("button").forEach(btn => {
          btn.classList.remove("selected");
        });

        // Highlight the clicked button
        button.classList.add("selected");
      });
    });
  },

  saveAttendance() {
    const subjectId =
      document.getElementById("attendance-subject").value;

    const date =
      document.getElementById("attendance-date").value;

    const message =
      document.getElementById("attendance-message");

    if (!date) {
      message.textContent = "Please select a date.";
      message.className = "form-msg err";
      return;
    }

    const cells = document.querySelectorAll(
      "#attendance-body .attendance-buttons"
    );

    const attendanceData = {};

    // Check whether every student has been marked
    for (const cell of cells) {
      const roll = cell.dataset.roll;
      const status = cell.dataset.status;

      if (!status) {
        message.textContent =
          "Please mark every student Present or Absent.";

        message.className = "form-msg err";
        return;
      }

      attendanceData[roll] = status;
    }

    // Get existing application data
    const data = Store.getData();

    // Create subject record if it doesn't exist
    if (!data.records[subjectId]) {
      data.records[subjectId] = {};
    }

    // Create date record if it doesn't exist
    if (!data.records[subjectId][date]) {
      data.records[subjectId][date] = {};
    }

    // Save attendance for every student
    data.records[subjectId][date] = attendanceData;

    Store.saveData(data);

    message.textContent = "Attendance saved successfully!";
    message.className = "form-msg ok";
  },

  // EXISTING FEATURE: MANAGE STUDENTS
  // This code is retained from Malaya's original teacher.js.

  renderRoster(message) {
    const section = document.getElementById("roster-section");
    const students = Store.getData().students;

    const rows = students.length
      ? students.map(s => `
          <tr>
            <td>${this.escape(s.roll)}</td>
            <td>${this.escape(s.name)}</td>
            <td>
              <button type="button"
                class="btn btn-danger"
                data-remove="${this.escape(s.roll)}">
                Remove
              </button>
            </td>
          </tr>
        `).join("")
      : `<tr><td colspan="3" class="muted">
           No students yet. Add one above.
         </td></tr>`;

    section.innerHTML = `
      <h3 class="section-title">Manage Students</h3>

      <form id="add-student-form" class="inline-form"
            autocomplete="off">

        <input id="new-roll" type="text"
          placeholder="Roll No" aria-label="Roll number" />

        <input id="new-name" type="text"
          placeholder="Full name" aria-label="Student name" />

        <button type="submit" class="btn btn-primary">
          Add Student
        </button>
      </form>

      <p id="roster-msg"
        class="form-msg ${message && message.ok ? "ok" : "err"}">
        ${message ? this.escape(message.text) : ""}
      </p>

      <table class="roster-table">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>${rows}</tbody>
      </table>
    `;

    document.getElementById("add-student-form")
      .addEventListener("submit", e => {
        e.preventDefault();
        this.handleAdd();
      });

    section.querySelectorAll("[data-remove]").forEach(btn => {
      btn.addEventListener("click", () => {
        this.handleRemove(btn.dataset.remove);
      });
    });
  },

  handleAdd() {
    const roll = document.getElementById("new-roll").value;
    const name = document.getElementById("new-name").value;

    const result = Store.addStudent(roll, name);

    if (result.ok) {
      this.renderRoster({ ok: true, text: "Student added." });
      this.renderAttendanceTable();
    } else {
      this.renderRoster({ ok: false, text: result.error });

      document.getElementById("new-roll").value = roll;
      document.getElementById("new-name").value = name;
    }
  },

  handleRemove(roll) {
    const student = Store.getData().students.find(
      s => s.roll === roll
    );

    if (!student) return;

    const ok = window.confirm(
      `Remove ${student.name} (${roll})? Their attendance records and leave requests will be deleted too.`
    );

    if (!ok) return;

    const result = Store.removeStudent(roll);

    this.renderRoster(
      result.ok
        ? { ok: true, text: `${student.name} removed.` }
        : { ok: false, text: result.error }
    );

    this.renderAttendanceTable();
  },

  escape(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }
};

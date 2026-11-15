const TeacherView = {
  init() {
    const container = document.getElementById("teacher-content");
    const data = Store.getData();
    container.innerHTML = `<p style="margin-top: 1rem;">Loaded <strong>${data.students.length}</strong> students across <strong>${data.subjects.length}</strong> subjects. Ready for features!</p>
      <div id="roster-section"></div>`;
    this.renderRoster();
  },

  // ---- Manage Students (feature/manage-students) ----
  renderRoster(message) {
    const section = document.getElementById("roster-section");
    const students = Store.getData().students;

    const rows = students.length
      ? students
          .map(
            (s) => `
        <tr>
          <td>${this.escape(s.roll)}</td>
          <td>${this.escape(s.name)}</td>
          <td><button type="button" class="btn btn-danger" data-remove="${this.escape(s.roll)}">Remove</button></td>
        </tr>`
          )
          .join("")
      : `<tr><td colspan="3" class="muted">No students yet. Add one above.</td></tr>`;

    section.innerHTML = `
      <h3 class="section-title">Manage Students</h3>
      <form id="add-student-form" class="inline-form" autocomplete="off">
        <input id="new-roll" type="text" placeholder="Roll No" aria-label="Roll number" />
        <input id="new-name" type="text" placeholder="Full name" aria-label="Student name" />
        <button type="submit" class="btn btn-primary">Add Student</button>
      </form>
      <p id="roster-msg" class="form-msg ${message && message.ok ? "ok" : "err"}">${message ? this.escape(message.text) : ""}</p>
      <table class="roster-table">
        <thead><tr><th>Roll No</th><th>Name</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;

    document.getElementById("add-student-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleAdd();
    });
    section.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => this.handleRemove(btn.dataset.remove));
    });
  },

  handleAdd() {
    const roll = document.getElementById("new-roll").value;
    const name = document.getElementById("new-name").value;
    const result = Store.addStudent(roll, name);
    if (result.ok) {
      this.renderRoster({ ok: true, text: "Student added." });
      document.getElementById("new-roll").focus();
    } else {
      this.renderRoster({ ok: false, text: result.error });
      // keep what the teacher typed so they can fix it
      document.getElementById("new-roll").value = roll;
      document.getElementById("new-name").value = name;
    }
  },

  handleRemove(roll) {
    const student = Store.getData().students.find((s) => s.roll === roll);
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
  },

  escape(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
};
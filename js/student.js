const ATTENDANCE_THRESHOLD = 75;

const StudentView = {

  // One-time message shown under the leave form after a submit
  leaveMessage: null,

  init() {

    const container = document.getElementById("student-content");

    // Remember which student was selected so a refresh keeps the same profile
    const previous = document.getElementById("student-selector");
    const previousRoll = previous ? previous.value : null;

    // Get all students from the existing Store
    const students = Store.getData().students;

    if (students.length === 0) {
      container.innerHTML = `
        <p class="muted">No students available.</p>
      `;
      return;
    }

    // Create student dropdown options
    const options = students.map(student => `
      <option value="${this.escape(student.roll)}">
        ${this.escape(student.name)} (${this.escape(student.roll)})
      </option>
    `).join("");

    container.innerHTML = `

      <div class="student-selection">

        <label for="student-selector">
          Select Student Profile:
        </label>

        <select id="student-selector">
          ${options}
        </select>

      </div>

      <div id="student-profile"></div>

    `;

    // Restore the previous selection if that student still exists
    const selector = document.getElementById("student-selector");
    if (previousRoll && students.some(s => s.roll === previousRoll)) {
      selector.value = previousRoll;
    }

    // Display the selected student initially
    this.renderProfile();

    // Change profile when another student is selected
    selector.addEventListener("change", () => {
      this.renderProfile();
    });

  },

  renderProfile() {

    const selector = document.getElementById("student-selector");
    if (!selector) return;

    const roll = selector.value;

    const students = Store.getData().students;

    // Find the selected student
    const student = students.find(s => s.roll === roll);

    const profile = document.getElementById("student-profile");

    if (!student) {
      profile.innerHTML = `
        <p class="muted">Student profile not found.</p>
      `;
      return;
    }

    // Display student information and attendance percentages
    profile.innerHTML = `

      <div class="student-profile-card">

        <h3>Welcome, ${this.escape(student.name)}!</h3>

        <p>
          <strong>Roll Number:</strong>
          ${this.escape(student.roll)}
        </p>

        <p class="muted">
          You are currently viewing the Student Portal.
        </p>

      </div>

      ${this.renderAttendance(student.roll)}

      ${this.renderLeaveSection(student.roll)}

    `;

    this.bindLeaveForm(student.roll);

  },

  // ---- Attendance percentage cards (feature/student-percentage-view) ----
  renderAttendance(roll) {

    const summary = Store.getAttendanceSummary(roll);

    const lowCount = summary.filter(
      s => s.percent !== null && s.percent < ATTENDANCE_THRESHOLD
    ).length;

    const banner = lowCount
      ? `<p class="alert alert-low">${lowCount} subject${lowCount > 1 ? "s are" : " is"} below ${ATTENDANCE_THRESHOLD}% attendance.</p>`
      : `<p class="alert alert-ok">All subjects are at or above ${ATTENDANCE_THRESHOLD}%.</p>`;

    return `
      <h3 class="section-title">My Attendance</h3>
      ${banner}
      <div class="card-grid">${summary.map(s => this.card(s)).join("")}</div>`;

  },

  card(s) {

    const hasData = s.percent !== null;
    const low = hasData && s.percent < ATTENDANCE_THRESHOLD;
    const state = !hasData ? "no-data" : low ? "low" : "good";

    return `
      <div class="subject-card ${state}">
        <h4>${this.escape(s.name)}</h4>
        <div class="percent">${hasData ? s.percent + "%" : "&mdash;"}</div>
        <div class="bar"><div class="bar-fill" style="width:${hasData ? s.percent : 0}%"></div></div>
        <p class="muted">${hasData ? `${s.present} of ${s.total} classes attended` : "No classes recorded yet"}</p>
        ${low ? `<p class="warn">Below ${ATTENDANCE_THRESHOLD}% &ndash; attendance shortage</p>` : ""}
      </div>`;

  },

  // ---- Leave application (feature/leave-application) ----
  renderLeaveSection(roll) {

    const data = Store.getData();

    const subjectOptions = data.subjects.map(subject => `
      <option value="${this.escape(subject.id)}">${this.escape(subject.name)}</option>
    `).join("");

    // Show the one-time message, then clear it
    const message = this.leaveMessage;
    this.leaveMessage = null;

    const subjectName = id => {
      const subject = data.subjects.find(s => s.id === id);
      return subject ? subject.name : id;
    };

    const leaves = Store.getLeavesForStudent(roll);

    const rows = leaves.length
      ? leaves.map(leave => `
        <tr>
          <td>${this.escape(leave.date)}</td>
          <td>${this.escape(subjectName(leave.subjectId))}</td>
          <td>${this.escape(leave.reason)}</td>
          <td>
            <span class="status-badge status-${this.escape(leave.status.toLowerCase())}">
              ${this.escape(leave.status)}
            </span>
          </td>
        </tr>`).join("")
      : `<tr><td colspan="4" class="muted">No leave requests yet.</td></tr>`;

    return `
      <h3 class="section-title">Apply for Leave</h3>

      <form id="leave-form" class="leave-form" autocomplete="off">

        <div>
          <label for="leave-subject">Subject</label>
          <select id="leave-subject">${subjectOptions}</select>
        </div>

        <div>
          <label for="leave-date">Date</label>
          <input type="date" id="leave-date" min="${Store.todayString()}" />
        </div>

        <div class="leave-reason">
          <label for="leave-reason">Reason</label>
          <input type="text" id="leave-reason" maxlength="200"
                 placeholder="e.g. Medical appointment" />
        </div>

        <button type="submit" class="btn btn-primary">Submit Request</button>

      </form>

      <p id="leave-msg" class="form-msg ${message && message.ok ? "ok" : "err"}">${message ? this.escape(message.text) : ""}</p>

      <h3 class="section-title">My Leave Requests</h3>

      <div class="table-scroll">
        <table class="roster-table">
          <thead>
            <tr><th>Date</th><th>Subject</th><th>Reason</th><th>Status</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

  },

  bindLeaveForm(roll) {

    const form = document.getElementById("leave-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {

      e.preventDefault();

      const subjectId = document.getElementById("leave-subject").value;
      const date = document.getElementById("leave-date").value;
      const reason = document.getElementById("leave-reason").value;

      const result = Store.applyLeave(roll, subjectId, date, reason);

      if (result.ok) {
        this.leaveMessage = { ok: true, text: "Leave request submitted. Status: Pending." };
        this.renderProfile();
      } else {
        this.leaveMessage = { ok: false, text: result.error };
        this.renderProfile();

        // Keep what the student typed so they can fix it
        document.getElementById("leave-subject").value = subjectId;
        document.getElementById("leave-date").value = date;
        document.getElementById("leave-reason").value = reason;
      }

    });

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
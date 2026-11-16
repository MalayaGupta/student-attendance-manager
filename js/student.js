const ATTENDANCE_THRESHOLD = 75;

const StudentView = {

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

    `;

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
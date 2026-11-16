const ATTENDANCE_THRESHOLD = 75;

const StudentView = {
  // Roll number of the logged-in student. The role switcher can change it
  // later by calling StudentView.setStudent(roll).
  currentRoll: null,

  init() {
    const students = Store.getData().students;
    if (!this.currentRoll && students.length) {
      this.currentRoll = students[0].roll;
    }
    this.render();
  },

  setStudent(roll) {
    this.currentRoll = roll;
    this.render();
  },

  render() {
    const container = document.getElementById("student-content");
    const student = Store.getData().students.find((s) => s.roll === this.currentRoll);
    if (!student) {
      container.innerHTML = `<p class="muted">No student selected.</p>`;
      return;
    }

    const summary = Store.getAttendanceSummary(student.roll);
    const lowCount = summary.filter(
      (s) => s.percent !== null && s.percent < ATTENDANCE_THRESHOLD
    ).length;

    const banner = lowCount
      ? `<p class="alert alert-low">${lowCount} subject${lowCount > 1 ? "s are" : " is"} below ${ATTENDANCE_THRESHOLD}% attendance.</p>`
      : `<p class="alert alert-ok">All subjects are at or above ${ATTENDANCE_THRESHOLD}%.</p>`;

    container.innerHTML = `
      <p class="muted">Logged in as <strong>${this.escape(student.name)}</strong> (Roll ${this.escape(student.roll)})</p>
      ${banner}
      <div class="card-grid">${summary.map((s) => this.card(s)).join("")}</div>`;
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
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
};
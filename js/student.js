
const StudentView = {

  init() {

    const container = document.getElementById("student-content");

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

    // Display the first student initially
    this.renderProfile();

    // Change profile when another student is selected
    document.getElementById("student-selector")
      .addEventListener("change", () => {
        this.renderProfile();
      });

  },

  renderProfile() {

    const roll = document.getElementById("student-selector").value;

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

    // Display student information
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

    `;

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

const TeacherView = {
  init() {
    const container = document.getElementById("teacher-content");
    const data = Store.getData();
    container.innerHTML = `<p style="margin-top: 1rem;">Loaded <strong>${data.students.length}</strong> students across <strong>${data.subjects.length}</strong> subjects. Ready for features!</p>`;
  }
};
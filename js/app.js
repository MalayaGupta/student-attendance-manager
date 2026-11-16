
document.addEventListener("DOMContentLoaded", () => {

  // Initialize both dashboards
  TeacherView.init();
  StudentView.init();

  // Find the role selection dropdown
  const viewSelector = document.getElementById("view-selector");

  // Run this function whenever the dropdown changes
  viewSelector.addEventListener("change", () => {

    const selectedView = viewSelector.value;

    const teacherView = document.getElementById("teacher-view");
    const studentView = document.getElementById("student-view");

    if (selectedView === "teacher") {

      // Display Teacher Dashboard
      teacherView.classList.remove("hidden");

      // Hide Student Portal
      studentView.classList.add("hidden");

    } else {

      // Hide Teacher Dashboard
      teacherView.classList.add("hidden");

      // Display Student Portal
      studentView.classList.remove("hidden");

    }

  });

});

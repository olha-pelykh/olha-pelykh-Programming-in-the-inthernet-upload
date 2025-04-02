/* jshint esversion: 6 */
/* jshint esversion: 11 */

let students = JSON.parse(localStorage.getItem("students")) || [];
document.addEventListener("DOMContentLoaded", updateTable);

const studentsTable = document.getElementById("students-table");
const notificationButton = document.getElementById("notifications-button");
const profileButton = document.getElementById("user-name");
const profileIcon = document.getElementById("user-logo");
const addStudentButton = document.getElementById("add-student-btn");
const addStudentModalWrapper = document.getElementById("add-student");
const addStudentForm = document.getElementById("add-student-form");
const cancelAddStudentButton = document.getElementById("add-student-btn-close");
const deleteWarnModal = document.getElementById("delete-warn-student");
const notificationModal = document.getElementById("modal-notifications");

const selectAllCheckbox = document.getElementById("select-all");
const deleteSelectedButton = document.getElementById("delete-selected-btn");
const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const confirmDeleteButton = document.getElementById("confirm-delete-btn");
const cancelDeleteButton = document.getElementById("cancel-delete-btn");
const cancelAddStudentButtonSmall = document.getElementById("close-modal-btn");

const deleteWarnText = deleteWarnModal.querySelector("h2");
const confirmDeleteWarnButton = document.getElementById("delete-modal-btn");

// notificationDot.style.display = "block";
let closeTimeout; // Variable to store the timer

notificationButton.addEventListener("mouseenter", () => {
  notificationButton.classList.remove("fa-solid");
  notificationButton.classList.add("fa-regular");
});

notificationButton.addEventListener("mouseleave", () => {});

if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener("change", () => {
    const isChecked = selectAllCheckbox.checked;
    const checkboxes = studentsTable.querySelectorAll(
      "tbody input[type='checkbox']"
    );

    checkboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  });

  studentsTable.addEventListener("change", (event) => {
    if (event.target.type === "checkbox" && event.target.id !== "select-all") {
      const checkboxes = studentsTable.querySelectorAll(
        "tbody input[type='checkbox']"
      );
      const checkedCheckboxes = studentsTable.querySelectorAll(
        "tbody input[type='checkbox']:checked"
      );

      // If all are manually selected, set the main checkbox
      selectAllCheckbox.checked =
        checkboxes.length === checkedCheckboxes.length;
    }
  });
}

if (deleteSelectedButton) {
  deleteSelectedButton.addEventListener("click", () => {
    const selectedStudents = getSelectedStudents();

    if (selectedStudents.length === 0) {
      showNotification("No selected items of table.");
      return;
    }

    const studentsList = selectedStudents
      .map((student) => `${student.name} ${student.surname}`)
      .join(", ");

    deleteConfirmModal.querySelector("h2").innerHTML = `
      Delete ${selectedStudents.length} students?<br>
      <small>${studentsList}</small>
    `;

    show(deleteConfirmModal);
  });

  confirmDeleteButton.addEventListener("click", () => {
    const selectedStudents = getSelectedStudents();
    students = students.filter(
      (student) => !selectedStudents.some((s) => s.id === student.id)
    );

    updateLocalStorage();
    updateTable();
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
    hide(deleteConfirmModal);
  });

  cancelDeleteButton.addEventListener("click", () => {
    hide(deleteConfirmModal);
  });
}

// Helper function to get selected students
function getSelectedStudents() {
  return Array.from(
    studentsTable.querySelectorAll('tbody input[type="checkbox"]:checked')
  )
    .map((checkbox) => {
      const studentId = parseInt(checkbox.dataset.id);
      return students.find((student) => student.id === studentId);
    })
    .filter((student) => student !== undefined);
}

if (notificationButton) {
  notificationButton.addEventListener("dblclick", () => {
    notificationButton.animate(
      [
        { transform: "rotate(0)" },
        { transform: "rotate(-30deg)" },
        { transform: "rotate(30deg)" },
        { transform: "rotate(0)" },
      ],
      {
        duration: 500,
        iterations: 1,
      }
    );
    setTimeout(() => {
      window.location.href = "messages.html";
    }, 500);
  });

  notificationButton.addEventListener("mouseover", () => {
    show(notificationModal);
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
  });

  notificationButton.addEventListener("mouseleave", () => {
    closeTimeout = setTimeout(() => {
      if (!notificationModal.matches(":hover")) {
        // Check if the mouse is not over the modal window
        hide(notificationModal);
      }
    }, 300); // Delay of 300 ms
  });

  notificationModal.addEventListener("mouseenter", () => {
    show(notificationModal); // Keep the window open
    // If there is a timer to close, reset it
    if (closeTimeout) {
      clearTimeout(closeTimeout);
    }
  });

  notificationModal.addEventListener("mouseleave", () => {
    closeTimeout = setTimeout(() => {
      hide(notificationModal); // Close the window after the delay
    }, 300); // Delay of 300 ms
  });
}

if (profileButton || profileIcon) {
  // Check if either the username or icon is present
  const toggleModal = (event) => {
    const modal = document.getElementById("modal-profile");
    const isProfileOpened = profileButton.dataset.isProfileOpened === "true";

    if (isProfileOpened) {
      hide(modal);
      profileButton.dataset.isProfileOpened = "false";
      document.removeEventListener("click", closeOnClickOutside);
    } else {
      show(modal);
      profileButton.dataset.isProfileOpened = "true";

      // Add the click event listener to close the modal if clicking outside
      setTimeout(() => {
        document.addEventListener("click", closeOnClickOutside);
      }, 0);
    }

    event.stopPropagation(); // Prevent triggering the document click handler immediately
  };

  // Add event listeners to both the profile button and profile icon
  profileButton.addEventListener("click", toggleModal);
  profileIcon.addEventListener("click", toggleModal);

  const closeOnClickOutside = (event) => {
    const modal = document.getElementById("modal-profile");
    if (
      !modal.contains(event.target) &&
      event.target !== profileButton &&
      event.target !== profileIcon
    ) {
      hide(modal);
      profileButton.dataset.isProfileOpened = "false";
      document.removeEventListener("click", closeOnClickOutside);
    }
  };
}

if (addStudentButton && addStudentForm) {
  addStudentButton.addEventListener("click", () => {
    document.getElementById("student-id").value = "";
    addStudentModalWrapper.querySelector("h2").textContent = "Add Student";
    addStudentForm.reset(); // Clear form fields when opening
    clearFieldErrors(); // Clear highlighting errors
    show(addStudentModalWrapper);
  });

  addStudentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const studentData = Object.fromEntries(formData);
    const studentId = studentData.id;

    if (validateStudentData(studentData)) {
      if (studentId) {
        // Editing an existing student
        updateStudent(studentId, studentData);
      } else {
        // Adding a new student
        addStudent(studentData);
      }
      hide(addStudentModalWrapper);
    } else {
      //showNotification("Please fill in all fields correctly.");
      highlightInvalidFields(studentData);
    }
  });

  cancelAddStudentButton.addEventListener("click", () =>
    hide(addStudentModalWrapper)
  );

  cancelAddStudentButtonSmall.addEventListener("click", () =>
    hide(addStudentModalWrapper)
  );
}

function updateStudent(id, newData) {
  const index = students.findIndex((student) => student.id == id);
  if (index !== -1) {
    const originalStudent = students[index];
    const updatedStudent = {
      ...originalStudent,
      ...newData,
      id: originalStudent.id, // Keep the original ID
    };

    students[index] = updatedStudent;
    updateLocalStorage();
    updateTable();

    // Output JSON to the console with indentation
    console.log(
      "Edited student:",
      JSON.stringify(
        {
          id: updatedStudent.id,
          name: updatedStudent.name,
          surname: updatedStudent.surname,
          group: updatedStudent.group,
          gender: updatedStudent.gender,
          birthday: updatedStudent.birthday,
          status: updatedStudent.status,
        },
        null,
        2
      )
    );
  }
}

// Validation of data
function validateStudentData({ group, name, surname, gender, birthday }) {
  let isValid = true;
  const nameRegex = /^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ\s'-]+$/u;

  if (!group?.trim()) {
    isValid = false;
  }
  if (!name?.trim()) {
    isValid = false;
  } else if (!nameRegex.test(name)) {
    isValid = false;
  }
  if (!surname?.trim()) {
    isValid = false;
  } else if (!nameRegex.test(surname)) {
    isValid = false;
  }
  if (!gender) {
    isValid = false;
  }
  if (!birthday) {
    isValid = false;
  } else {
    const birthDate = new Date(birthday);
    const minDate = new Date("1900-01-01");
    const currentDate = new Date();

    const maxDate = new Date(
      currentDate.getFullYear() - 15,
      currentDate.getMonth(),
      currentDate.getDate()
    );

    if (isNaN(birthDate.getTime())) {
      isValid = false;
    } else if (birthDate < minDate || birthDate > maxDate) {
      isValid = false;
    }
  }
  return isValid;
}

function highlightInvalidFields(studentData) {
  const nameRegex = /^[A-Za-zА-Яа-яЁёЇїІіЄєҐґ\s'-]+$/u;

  clearFieldErrors();

  const fieldValidations = {
    group: {
      isValid: !!studentData.group?.trim(),
      errorMessage: "Group is required",
    },
    name: {
      isValid: studentData.name?.trim() && nameRegex.test(studentData.name),
      errorMessage: studentData.name?.trim()
        ? "Name contains unacceptable characters"
        : "Name is required",
    },
    surname: {
      isValid:
        studentData.surname?.trim() && nameRegex.test(studentData.surname),
      errorMessage: studentData.surname?.trim()
        ? "Surname contains unacceptable characters"
        : "Surname is required",
    },
    gender: {
      isValid: !!studentData.gender,
      errorMessage: "Select gender",
    },
    birthday: {
      isValid: (() => {
        if (!studentData.birthday) return false;

        const birthDate = new Date(studentData.birthday);
        if (isNaN(birthDate.getTime())) return false;

        const minDate = new Date("1900-01-01");
        const currentDate = new Date();
        const maxDate = new Date(
          currentDate.getFullYear() - 15,
          currentDate.getMonth(),
          currentDate.getDate()
        );

        return birthDate >= minDate && birthDate <= maxDate;
      })(),
      errorMessage: (() => {
        if (!studentData.birthday) return "Date of birth is required";

        const birthDate = new Date(studentData.birthday);
        if (isNaN(birthDate.getTime())) return "Invalid date format";

        const currentDate = new Date();
        const maxDate = new Date(
          currentDate.getFullYear() - 15,
          currentDate.getMonth(),
          currentDate.getDate()
        );

        return `Date must be between 01.01.1900 and ${maxDate.toLocaleDateString()}`;
      })(),
    },
  };

  Object.entries(fieldValidations).forEach(([fieldName, validation]) => {
    const inputField = addStudentForm.querySelector(`[name="${fieldName}"]`);
    if (inputField && !validation.isValid) {
      // Find the parent element for positioning
      const fieldContainer =
        inputField.closest(".form-field") || inputField.parentNode;

      // Add error class to the field
      inputField.classList.add("error-field");

      // Create an element for the error
      let errorElement = fieldContainer.querySelector(".error-message");
      if (!errorElement) {
        errorElement = document.createElement("div");
        errorElement.className = "error-message";
        // Insert before the input field
        fieldContainer.insertBefore(errorElement, inputField);
      }
      errorElement.textContent = validation.errorMessage;

      // Remove the error on focus
      inputField.addEventListener(
        "focus",
        () => {
          inputField.classList.remove("error-field");
          if (errorElement) {
            errorElement.remove();
          }
        },
        { once: true }
      );
    }
  });
}

function clearFieldErrors() {
  const errorMessages = addStudentForm.querySelectorAll(".error-message");
  errorMessages.forEach((msg) => msg.remove());

  const fields = addStudentForm.querySelectorAll("input, select");
  fields.forEach((field) => field.classList.remove("error-field"));
}
// Show notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Add student to the table
function addStudent({ group, name, surname, gender, birthday }) {
  const newStudent = {
    id: generateUniqueId(),
    group,
    name,
    surname,
    gender,
    birthday,
    status: "inactive",
  };
  // if (name === "Olha" && surname === "Pelykh") {
  //   newStudent.status = "active";
  // }
  students.push(newStudent);
  updateLocalStorage();
  updateTable();
}

function generateUniqueId() {
  let newId;
  do {
    newId = Date.now();
  } while (students.some((student) => student.id === newId));
  return newId;
}

function updateTable() {
  const tbody = studentsTable.querySelector("tbody");
  tbody.innerHTML = "";

  students.forEach((student) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-id="${student.id}"></td>
      <td class="hidden-id">${student.id}</td>
      <td>${student.group}</td>
      <td>${student.name} ${student.surname}</td>
      <td>${student.gender}</td>
      <td>${student.birthday}</td>
      <td><i class="fa fa-circle" style="color: ${
        student.name === "Olha" && student.surname === "Pelykh"
          ? "#6b9a67"
          : "#d8d8d8"
      }"></i></td>
      <td class="table_buttons">
          <button class="student__btn edit-btn" data-id="${student.id}">
              <i class="fa fa-pencil btn__icon"></i>
          </button>
          <button class="student__btn delete-btn" data-id="${student.id}">
              <i class="fa-solid fa-trash"></i>
          </button>
      </td>
    `;

    // Add delete handler for each new button
    tr.querySelector(".delete-btn").addEventListener("click", (event) => {
      const studentId = parseInt(
        event.target.closest(".delete-btn").dataset.id
      );
      const student = students.find((s) => s.id === studentId);

      if (!student) return;

      deleteWarnText.innerHTML = `Delete student:<br><b>${student.name} ${student.surname}</b>?`;
      show(deleteWarnModal);

      // Confirm deletion
      confirmDeleteWarnButton.onclick = () => {
        students = students.filter((s) => s.id !== studentId);
        updateLocalStorage();
        updateTable(); // Update the table
        hide(deleteWarnModal);
      };
    });

    // Add event listener for editing
    tr.querySelector(".edit-btn").addEventListener("click", () => {
      addStudentForm.reset(); // Clear form fields when opening
      clearFieldErrors(); // Clear highlighting errors

      document.getElementById("student-id").value = student.id;
      document.getElementById("group").value = student.group;
      document.getElementById("name").value = student.name;
      document.getElementById("surname").value = student.surname;
      document.getElementById("gender").value = student.gender;
      document.getElementById("birthday").value = student.birthday;
      addStudentModalWrapper.querySelector("h2").textContent = "Edit Student";

      show(addStudentModalWrapper);
    });

    tbody.appendChild(tr);
  });
}

// Handler for the cancel delete button (remains outside the function as it does not require tr)
document.getElementById("cancel-modal-btn").addEventListener("click", () => {
  hide(deleteWarnModal);
});

// Add event listeners to delete buttons
tr.querySelector(".delete-btn").addEventListener("click", () => {
  // Find the student ID
  const studentId = student.id;

  // Find the full name of the student
  const fullName = `${student.name} ${student.surname}`;

  // Update the modal window text
  deleteWarnText.innerHTML = `Delete student:<br><b>${fullName}</b>?`;

  // Show the modal window
  show(deleteWarnModal);

  // Remove old event handlers
  confirmDeleteWarnButton.replaceWith(confirmDeleteWarnButton.cloneNode(true));

  // Add a new handler for the confirm button
  document.getElementById("delete-modal-btn").addEventListener("click", () => {
    students = students.filter((s) => s.id !== studentId);
    updateLocalStorage();
    updateTable();
    hide(deleteWarnModal);
  });
});

// Handler for the cancel delete button
document.getElementById("cancel-modal-btn").addEventListener("click", () => {
  hide(deleteWarnModal);
});

function updateLocalStorage() {
  localStorage.setItem("students", JSON.stringify(students));
}

// Show modal window
function show(modalWindow) {
  modalWindow?.classList.remove("hidden");
}

// Hide modal window
function hide(modalWindow) {
  modalWindow?.classList.add("hidden");
}

// Function to show delete confirmation for a specific student
function confirmDeleteStudent(studentRow) {
  const studentName = studentRow.querySelector("td:nth-child(3)").textContent;
  deleteWarnText.innerHTML = `Delete student named<br>${studentName}?`;

  show(deleteWarnModal);

  // Remove previous event listeners to prevent multiple bindings
  const newConfirmDeleteWarnButton = confirmDeleteWarnButton.cloneNode(true);
  confirmDeleteWarnButton.replaceWith(newConfirmDeleteWarnButton);
  newConfirmDeleteWarnButton.addEventListener("click", () => {
    studentRow.remove();
    hide(deleteWarnModal);
  });

  // confirmDeleteWarnButton.addEventListener("click", () => {
  //   studentRow.remove();
  //   hide(deleteWarnModal);
  // });
}

// Adding event listeners to delete buttons
studentsTable.addEventListener("click", (event) => {
  if (event.target.closest(".delete-btn")) {
    const studentRow = event.target.closest("tr");
    const studentId = parseInt(
      studentRow.querySelector('input[type="checkbox"]').dataset.id
    );

    students = students.filter((s) => s.id !== studentId);
    updateLocalStorage();
    updateTable();
    hide(deleteWarnModal);
  }
});

// // Cancel delete modal
// cancelDeleteWarnButton.addEventListener("click", () => {
//   hide(deleteWarnModal);
// });

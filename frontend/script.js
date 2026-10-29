const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTable");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const countBadge = document.getElementById("count");
const toastEl = document.getElementById("toast");
let students = [];

function toast(message, isError = false) {
  toastEl.textContent = message;
  toastEl.className = "show" + (isError ? " error" : "");
  setTimeout(() => (toastEl.className = ""), 2800);
}

async function loadStudents() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Bad response");
    students = await res.json();
  } catch (err) {
    toast("Cannot reach the backend. Render may be waking up, try again in a minute.", true);
    return;
  }
  renderStudents();
}

function renderStudents() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  tableBody.innerHTML = "";
  let shown = 0;

  students.forEach((s, index) => {
    const matches = [s.name, s.email, s.course].some((v) =>
      (v || "").toLowerCase().includes(q)
    );
    if (!matches) return;
    shown++;

    const tr = document.createElement("tr");

    [s.name, s.email, s.course, s.age ?? ""].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    const actions = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn-edit";
    editBtn.onclick = () => editStudent(index);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn-delete";
    delBtn.onclick = () => deleteStudent(s._id);

    actions.append(editBtn, delBtn);
    tr.appendChild(actions);
    tableBody.appendChild(tr);
  });

  countBadge.textContent = shown;

  if (shown === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 6;
    td.className = "empty";
    td.textContent = q ? "No matching students found." : "No students yet. Add your first student above.";
    tr.appendChild(td);
    tableBody.appendChild(tr);
  }
}

function resetForm() {
  form.reset();
  document.getElementById("studentId").value = "";
  submitBtn.textContent = "Add Student";
  formTitle.textContent = "Add New Student";
  cancelBtn.style.display = "none";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("studentId").value;
  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    course: document.getElementById("course").value,
    age: Number(document.getElementById("age").value) || undefined,
  };

  try {
    const res = await fetch(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Request failed");
    toast(id ? "Student updated" : "Student added");
  } catch (err) {
    toast("Could not save student. Check backend and CORS.", true);
    return;
  }

  resetForm();
  loadStudents();
});

cancelBtn.addEventListener("click", resetForm);

function editStudent(index) {
  const s = students[index];
  document.getElementById("studentId").value = s._id;
  document.getElementById("name").value = s.name;
  document.getElementById("email").value = s.email;
  document.getElementById("course").value = s.course;
  document.getElementById("age").value = s.age ?? "";
  submitBtn.textContent = "Update Student";
  formTitle.textContent = "Edit Student";
  cancelBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Request failed");
    toast("Student deleted");
  } catch (err) {
    toast("Could not delete student.", true);
    return;
  }
  loadStudents();
}

document.getElementById("search").addEventListener("input", renderStudents);
loadStudents();
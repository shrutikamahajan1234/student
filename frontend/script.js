const form = document.getElementById("studentForm");
const tableBody = document.getElementById("studentTable");
const submitBtn = document.getElementById("submitBtn");
let students = [];

async function loadStudents() {
  try {
    const res = await fetch(API_URL);
    students = await res.json();
  } catch (err) {
    alert("Cannot reach the backend. Check API_URL and CORS.");
    return;
  }

  tableBody.innerHTML = "";
  students.forEach((s, index) => {
    const tr = document.createElement("tr");

    [s.name, s.email, s.course, s.age ?? ""].forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.appendChild(td);
    });

    const actions = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => editStudent(index);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteStudent(s._id);

    actions.append(editBtn, delBtn);
    tr.appendChild(actions);
    tableBody.appendChild(tr);
  });
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

  await fetch(id ? `${API_URL}/${id}` : API_URL, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  form.reset();
  document.getElementById("studentId").value = "";
  submitBtn.textContent = "Add Student";
  loadStudents();
});

function editStudent(index) {
  const s = students[index];
  document.getElementById("studentId").value = s._id;
  document.getElementById("name").value = s.name;
  document.getElementById("email").value = s.email;
  document.getElementById("course").value = s.course;
  document.getElementById("age").value = s.age ?? "";
  submitBtn.textContent = "Update Student";
}

async function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  loadStudents();
}

loadStudents();
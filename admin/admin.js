const $ = (id) => document.getElementById(id);

function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function safeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showSection(name) {
  document.querySelectorAll(".section").forEach(section => {
    section.style.display = section.id === name ? "block" : "none";
  });

  document.querySelectorAll("[data-section]").forEach(button => {
    button.classList.toggle("active", button.dataset.section === name);
  });
}

function renderProjects() {
  const projects = getData("yash_projects");
  const list = $("projectList");
  if (!list) return;

  list.innerHTML = projects.map((project, index) => `
    <div class="item">
      <strong>${safeText(project.name)}</strong>
      <p>${safeText(project.description)}</p>
      <button onclick="deleteProject(${index})">Delete</button>
    </div>
  `).join("") || "<p>No projects added yet.</p>";

  if ($("projectCount")) $("projectCount").textContent = projects.length;
}

function addProject(event) {
  event.preventDefault();

  const name = $("projectName").value.trim();
  const description = $("projectDescription").value.trim();

  if (!name) return alert("Enter project name.");

  const projects = getData("yash_projects");
  projects.push({ name, description });
  saveData("yash_projects", projects);

  $("projectName").value = "";
  $("projectDescription").value = "";
  renderProjects();
}

function deleteProject(index) {
  const projects = getData("yash_projects");
  projects.splice(index, 1);
  saveData("yash_projects", projects);
  renderProjects();
}

function renderAnnouncements() {
  const announcements = getData("yash_announcements");
  const list = $("announcementList");
  if (!list) return;

  list.innerHTML = announcements.map((item, index) => `
    <div class="item">
      <p>${safeText(item)}</p>
      <button onclick="deleteAnnouncement(${index})">Delete</button>
    </div>
  `).join("") || "<p>No announcements yet.</p>";

  if ($("announcementCount")) {
    $("announcementCount").textContent = announcements.length;
  }
}

function addAnnouncement(event) {
  event.preventDefault();

  const input = $("announcementText");
  const message = input.value.trim();

  if (!message) return alert("Enter announcement.");

  const announcements = getData("yash_announcements");
  announcements.push(message);
  saveData("yash_announcements", announcements);

  input.value = "";
  renderAnnouncements();
}

function deleteAnnouncement(index) {
  const announcements = getData("yash_announcements");
  announcements.splice(index, 1);
  saveData("yash_announcements", announcements);
  renderAnnouncements();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-section]").forEach(button => {
    button.addEventListener("click", () => {
      showSection(button.dataset.section);
    });
  });

  if ($("projectForm")) {
    $("projectForm").addEventListener("submit", addProject);
  }

  if ($("announcementForm")) {
    $("announcementForm").addEventListener("submit", addAnnouncement);
  }

  renderProjects();
  renderAnnouncements();
  showSection("overview");
});

window.deleteProject = deleteProject;
window.deleteAnnouncement = deleteAnnouncement;

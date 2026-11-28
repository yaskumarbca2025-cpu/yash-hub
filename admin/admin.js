const $ = id => document.getElementById(id);
const db = window.supabaseClient;

function showSection(name) {
  document.querySelectorAll(".section").forEach(section => {
    section.style.display = section.id === name ? "block" : "none";
  });
  document.querySelectorAll("[data-section]").forEach(button => {
    button.classList.toggle("active", button.dataset.section === name);
  });
}
window.showSection = showSection;

function showMessage(message) {
  $("loginMessage").textContent = message;
}

function makeItem(title, description, deleteAction) {
  const item = document.createElement("div");
  item.className = "item";

  const heading = document.createElement("strong");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.textContent = description || "";

  const button = document.createElement("button");
  button.textContent = "Delete";
  button.addEventListener("click", deleteAction);

  item.append(heading, paragraph, button);
  return item;
}

async function renderProjects() {
  const list = $("projectList");
  list.replaceChildren();

  const { data, error } = await db
    .from("yash_projects")
    .select("id,name,description")
    .order("created_at", { ascending: false });

  if (error) {
    list.textContent = "Could not load projects: " + error.message;
    return;
  }

  $("projectCount").textContent = data.length;

  if (!data.length) {
    list.textContent = "No projects added yet.";
    return;
  }

  data.forEach(project => {
    list.appendChild(makeItem(project.name, project.description, async () => {
      if (!confirm("Delete this project?")) return;
      const { error } = await db.from("yash_projects").delete().eq("id", project.id);
      if (error) alert(error.message);
      else await refreshDashboard();
    }));
  });
}

async function renderAnnouncements() {
  const list = $("announcementList");
  list.replaceChildren();

  const { data, error } = await db
    .from("yash_announcements")
    .select("id,message")
    .order("created_at", { ascending: false });

  if (error) {
    list.textContent = "Could not load announcements: " + error.message;
    return;
  }

  $("announcementCount").textContent = data.length;

  if (!data.length) {
    list.textContent = "No announcements yet.";
    return;
  }

  data.forEach(item => {
    list.appendChild(makeItem("Announcement", item.message, async () => {
      if (!confirm("Delete this announcement?")) return;
      const { error } = await db.from("yash_announcements").delete().eq("id", item.id);
      if (error) alert(error.message);
      else await refreshDashboard();
    }));
  });
}

async function refreshDashboard() {
  await Promise.all([renderProjects(), renderAnnouncements()]);
}

async function addProject(event) {
  event.preventDefault();

  const name = $("projectName").value.trim();
  const description = $("projectDescription").value.trim();
  if (!name) return;

  const { error } = await db.from("yash_projects").insert({
    name,
    description,
    is_published: true
  });

  if (error) {
    alert("Project could not be added: " + error.message);
    return;
  }

  $("projectForm").reset();
  await refreshDashboard();
  alert("Project added successfully!");
}

async function addAnnouncement(event) {
  event.preventDefault();

  const message = $("announcementText").value.trim();
  if (!message) return;

  const { error } = await db.from("yash_announcements").insert({
    message,
    is_published: true
  });

  if (error) {
    alert("Announcement could not be published: " + error.message);
    return;
  }

  $("announcementForm").reset();
  await refreshDashboard();
  alert("Announcement published successfully!");
}

async function verifyAdmin(user) {
  const { data, error } = await db
    .from("yash_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return !error && !!data;
}

async function enterDashboard(user) {
  const allowed = await verifyAdmin(user);

  if (!allowed) {
    await db.auth.signOut();
    $("dashboard").hidden = true;
    $("loginGate").hidden = false;
    showMessage("This account is not registered as an admin.");
    return;
  }

  $("loginGate").hidden = true;
  $("dashboard").hidden = false;
  showMessage("");
  showSection("overview");
  await refreshDashboard();
}

async function login(event) {
  event.preventDefault();

  if (!db) {
    showMessage("Supabase configuration is missing. Check your config file.");
    return;
  }

  $("loginButton").disabled = true;
  showMessage("Signing in...");

  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;

  const { data, error } = await db.auth.signInWithPassword({ email, password });

  $("loginButton").disabled = false;

  if (error) {
    showMessage("Login failed: " + error.message);
    return;
  }

  await enterDashboard(data.user);
}

async function logout() {
  const { error } = await db.auth.signOut();
  if (error) {
    alert("Logout failed: " + error.message);
    return;
  }
  $("dashboard").hidden = true;
  $("loginGate").hidden = false;
  $("loginForm").reset();
  showMessage("Logged out successfully.");
}

document.addEventListener("DOMContentLoaded", async () => {
  $("loginForm").addEventListener("submit", login);
  $("logoutButton").addEventListener("click", logout);
  $("projectForm").addEventListener("submit", addProject);
  $("announcementForm").addEventListener("submit", addAnnouncement);

  document.querySelectorAll("[data-section]").forEach(button => {
    button.addEventListener("click", () => showSection(button.dataset.section));
  });

  if (!db) {
    showMessage("Supabase did not initialize. Check the Project URL and Publishable Key.");
    return;
  }

  const { data, error } = await db.auth.getSession();

  if (error) {
    showMessage("Could not check login session: " + error.message);
    return;
  }

  if (data.session) {
    await enterDashboard(data.session.user);
  }
});

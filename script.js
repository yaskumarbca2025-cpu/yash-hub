
// Mobile navigation
const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

menuBtn.addEventListener("click", () => {
  navbar.classList.toggle("active");
});

document.querySelectorAll("#navbar a").forEach(link => {
  link.addEventListener("click", () => {
    navbar.classList.remove("active");
  });
});

// Current year
document.getElementById("year").textContent =
  new Date().getFullYear();

// Calculator
function calculate() {
  const input = document.getElementById("calcInput").value.trim();
  const result = document.getElementById("calcResult");

  if (!input) {
    result.textContent = "Please enter a calculation.";
    return;
  }

  if (!/^[0-9+\-*/().%\s]+$/.test(input)) {
    result.textContent = "Invalid calculation!";
    return;
  }

  try {
    const answer = Function('"use strict"; return (' + input + ')')();

    if (!Number.isFinite(answer)) {
      throw new Error("Invalid result");
    }

    result.textContent = "Result: " + answer;
  } catch {
    result.textContent = "Please enter a valid calculation.";
  }
}

// Text converter
function convertText(type) {
  const text = document.getElementById("textInput").value;
  const result = document.getElementById("textResult");

  if (!text.trim()) {
    result.textContent = "Please enter some text.";
    return;
  }

  result.textContent =
    type === "upper" ? text.toUpperCase() : text.toLowerCase();
}

// Quiz questions
const questions = [
  {
    q: "Which language is used to create web page structure?",
    a: ["Python", "HTML", "SQL", "C++"],
    correct: 1
  },
  {
    q: "Which language is used for web page styling?",
    a: ["CSS", "Java", "PHP", "SQL"],
    correct: 0
  },
  {
    q: "Which language adds interactivity to websites?",
    a: ["HTML", "CSS", "JavaScript", "SQL"],
    correct: 2
  },
  {
    q: "Which one is a database management system?",
    a: ["MySQL", "HTML", "CSS", "Photoshop"],
    correct: 0
  },
  {
    q: "What does CPU stand for?",
    a: [
      "Central Processing Unit",
      "Computer Personal Unit",
      "Central Program Utility",
      "Control Processing User"
    ],
    correct: 0
  }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

function showQuestion() {
  const item = questions[currentQuestion];

  document.getElementById("question").textContent =
    (currentQuestion + 1) + ". " + item.q;

  const answers = document.getElementById("answers");
  answers.innerHTML = "";

  item.a.forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = answer;

    button.addEventListener("click", () => {
      checkAnswer(index);
    });

    answers.appendChild(button);
  });

  document.getElementById("quizResult").textContent =
    "Choose your answer!";

  document.getElementById("nextQuestion").textContent =
    currentQuestion === questions.length - 1 ? "Restart Quiz" : "Next Question";

  answered = false;
}

function checkAnswer(index) {
  if (answered) return;

  answered = true;

  const correct = questions[currentQuestion].correct;
  const buttons = document.querySelectorAll("#answers button");

  buttons.forEach(button => button.disabled = true);

  if (index === correct) {
    score++;
    document.getElementById("quizResult").textContent =
      "Correct answer! Great job.";
  } else {
    document.getElementById("quizResult").textContent =
      "Incorrect. Correct answer: " + questions[currentQuestion].a[correct];
  }

  document.getElementById("score").textContent =
    "Score: " + score + " / " + questions.length;
}

function nextQuestion() {
  if (!answered) {
    document.getElementById("quizResult").textContent =
      "Please select an answer first.";
    return;
  }

  currentQuestion++;

  if (currentQuestion >= questions.length) {
    alert("Quiz completed! Your score: " + score + "/" + questions.length);

    currentQuestion = 0;
    score = 0;

    document.getElementById("score").textContent = "Score: 0";
  }

  showQuestion();
}

// Start quiz
showQuestion();

// YASH HUB: Admin Dashboard Data Sync
function renderAdminContent() {
  const projectsBox = document.getElementById("dynamicProjects");
  const announcementsBox = document.getElementById("publicAnnouncements");

  let projects = [];
  let announcements = [];

  try {
    projects = JSON.parse(localStorage.getItem("yash_projects")) || [];
    announcements = JSON.parse(localStorage.getItem("yash_announcements")) || [];
  } catch (error) {
    console.error("Unable to load admin data:", error);
  }

  if (projectsBox) {
    projectsBox.innerHTML = projects.map(project => {
      const card = document.createElement("article");
      card.className = "card";

      const heading = document.createElement("h3");
      heading.textContent = project.name || "Untitled Project";

      const description = document.createElement("p");
      description.textContent = project.description || "";

      const tag = document.createElement("span");
      tag.className = "project-tag";
      tag.textContent = "Admin Project";

      card.append(heading, description, tag);
      return card;
    }).reduce((html, card) => html + card.outerHTML, "");

    if (!projects.length) {
      projectsBox.innerHTML = '<p>No additional projects added yet.</p>';
    }
  }

  if (announcementsBox) {
    announcementsBox.innerHTML = "";

    announcements.forEach(message => {
      const card = document.createElement("article");
      card.className = "card";

      const heading = document.createElement("h3");
      heading.textContent = "📢 Announcement";

      const paragraph = document.createElement("p");
      paragraph.textContent = message;

      card.append(heading, paragraph);
      announcementsBox.appendChild(card);
    });

    if (!announcements.length) {
      announcementsBox.innerHTML = '<p>No announcements yet.</p>';
    }
  }
}

document.addEventListener("DOMContentLoaded", renderAdminContent);
window.addEventListener("storage", renderAdminContent);

let current = 0;
let answers = [];
let questions = [];
let username = "";

// ============= Soal Generator =============
function makeQuestions(n = 50) {
  const all = [];
  for (let i = 0; i < n; i++) {
    const type = i % 5;
    let q;
    switch (type) {
      case 0: q = genAddSub(); break;
      case 1: q = genMulDiv(); break;
      case 2: q = genFraction(); break;
      case 3: q = genDecimal(); break;
      case 4: q = genStory(); break;
    }
    all.push(q);
  }
  return shuffleArray(all);
}

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ----- contoh generator soal sederhana -----
function genAddSub() {
  const a = Math.floor(Math.random() * 50) + 1;
  const b = Math.floor(Math.random() * 50) + 1;
  return {
    question: `${a} + ${b} = ...?`,
    options: [a+b, a+b+1, a+b-1, a+b+2],
    answer: a+b
  };
}

function genMulDiv() {
  const a = Math.floor(Math.random() * 12) + 2;
  const b = Math.floor(Math.random() * 12) + 2;
  return {
    question: `${a} × ${b} = ...?`,
    options: [a*b, a*b+2, a*b-2, a*b+5],
    answer: a*b
  };
}

function genFraction() {
  return {
    question: `Pecahan manakah yang lebih besar?`,
    options: ["1/2", "1/3", "1/4", "1/5"],
    answer: "1/2"
  };
}

function genDecimal() {
  return {
    question: `0.75 = ...%`,
    options: ["75%", "7.5%", "0.75%", "25%"],
    answer: "75%"
  };
}

function genStory() {
  return {
    question: `Budi punya 12 apel. Dia makan 3. Berapa sisa apel?`,
    options: ["9", "12", "3", "15"],
    answer: "9"
  };
}

// ============= UI Logic =============
const startBtn = document.getElementById("start");
const quizBox = document.getElementById("quiz-box");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const progressEl = document.getElementById("progress");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const finishBtn = document.getElementById("finish");
const resultEl = document.getElementById("result");
const historyEl = document.getElementById("history");

// back to home button
const backHomeBtn = document.getElementById("backHomeBtn");

let loginBox;

// buat form login
function showLogin() {
  loginBox = document.createElement("div");
  loginBox.innerHTML = `
    <h2>Login Username</h2>
    <input id="usernameInput" type="text" placeholder="Masukkan username" />
    <button id="loginBtn">Login</button>
  `;
  loginBox.classList.add("bubble-box");
  document.getElementById("app").prepend(loginBox);

  document.getElementById("loginBtn").addEventListener("click", () => {
    const input = document.getElementById("usernameInput").value.trim();
    if (!input) return alert("Isi username dulu!");
    username = input;
    localStorage.setItem("anbkUsername", username);
    loginBox.remove();
    startBtn.classList.remove("hidden");
  });
}

// cek apakah sudah ada username tersimpan
window.addEventListener("load", () => {
  const saved = localStorage.getItem("anbkUsername");
  if (saved) {
    username = saved;
    startBtn.classList.remove("hidden");
  } else {
    showLogin();
  }
});

startBtn.addEventListener("click", () => {
  startBtn.classList.add("hidden");
  quizBox.classList.remove("hidden");
  questions = makeQuestions(50);
  answers = Array(questions.length).fill(null);
  showQuestion();
});

function showQuestion() {
  const q = questions[current];
  questionEl.innerText = q.question;
  progressEl.innerHTML = `
    Soal ${current+1} / ${questions.length}
    <div class="progress-bar">
      <div class="progress-fill" style="width:${((current+1)/questions.length)*100}%"></div>
    </div>
  `;

  optionsEl.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.classList.add("fade-in");
    if (answers[current] === opt) {
      btn.style.background = "#a0e7a0";
    }
    btn.addEventListener("click", () => {
      answers[current] = opt;
      showQuestion();
    });
    optionsEl.appendChild(btn);
  });

  prevBtn.disabled = current === 0;
  nextBtn.classList.toggle("hidden", current === questions.length - 1);
  finishBtn.classList.toggle("hidden", current !== questions.length - 1);
}

prevBtn.addEventListener("click", () => {
  if (current > 0) current--;
  showQuestion();
});

nextBtn.addEventListener("click", () => {
  if (current < questions.length - 1) current++;
  showQuestion();
});

finishBtn.addEventListener("click", () => {
  let benar = 0;
  questions.forEach((q, i) => {
    if (answers[i] == q.answer) benar++;
  });
  let salah = questions.length - benar;
  let skor = Math.round((benar / questions.length) * 100);

  resultEl.innerHTML = `
    <h2>Hasil:</h2>
    <p><b>User:</b> ${username}</p>
    <p>Benar: ${benar}</p>
    <p>Salah: ${salah}</p>
    <p>Skor: ${skor}%</p>
  `;
  resultEl.classList.remove("hidden");

  // simpan riwayat di localStorage per user
  let allHistory = JSON.parse(localStorage.getItem("anbkHistory") || "{}");
  if (!allHistory[username]) allHistory[username] = [];
  allHistory[username].push({ benar, salah, skor, waktu: new Date().toLocaleString() });
  localStorage.setItem("anbkHistory", JSON.stringify(allHistory));

  showHistory();

  // show back to home button
  if (backHomeBtn) backHomeBtn.classList.remove('hidden');
});

// back to home handler
if (backHomeBtn) {
  backHomeBtn.addEventListener('click', () => {
    // hide quiz and results
    quizBox.classList.add('hidden');
    resultEl.classList.add('hidden');
    historyEl.classList.add('hidden');
    backHomeBtn.classList.add('hidden');

    // reset state
    questions = [];
    answers = [];
    current = 0;

    // clear UI
    progressEl.innerHTML = '';
    questionEl.innerText = '';
    optionsEl.innerHTML = '';

    // show start or login depending on saved username
    const saved = localStorage.getItem("anbkUsername");
    if (saved) {
      startBtn.classList.remove('hidden');
    } else {
      startBtn.classList.add('hidden');
      // if you used the static login box, show it
      const staticLogin = document.getElementById('login-box');
      if (staticLogin) staticLogin.classList.remove('hidden');
      else showLogin();
    }
  });
}

function showHistory() {
  let allHistory = JSON.parse(localStorage.getItem("anbkHistory") || "{}");
  let history = allHistory[username] || [];
  historyEl.innerHTML = `<h3>Riwayat Nilai (${username})</h3>`;
  history.forEach(h => {
    historyEl.innerHTML += `<p>${h.waktu}: Skor ${h.skor}% (Benar ${h.benar}, Salah ${h.salah})</p>`;
  });
  historyEl.innerHTML += `<button id="clearHistory">Hapus Riwayat</button>`;
  historyEl.classList.remove("hidden");

  document.getElementById("clearHistory").addEventListener("click", () => {
    delete allHistory[username];
    localStorage.setItem("anbkHistory", JSON.stringify(allHistory));
    historyEl.innerHTML = `<h3>Riwayat Nilai (${username})</h3><p>Belum ada riwayat.</p>`;
  });
}

// ============= Login Functionality =============
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the default form submission
  const usernameInput = document.getElementById('username').value;
  const passwordInput = document.getElementById('password').value;

  // Here you can add your login logic (e.g., validation)
  if (usernameInput && passwordInput) {
    username = usernameInput; // Store the username
    alert(`Welcome, ${username}!`); // Simple welcome message
    document.getElementById('login-box').classList.add('hidden'); // Hide login box
    document.getElementById('quiz-box').classList.remove('hidden'); // Show quiz box
  } else {
    alert('Please enter both username and password.');
  }
});

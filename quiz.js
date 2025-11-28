// =============================
// GESTION DE SESSION POUR RECOMMENCER LE QUIZ
// =============================
window.addEventListener("load", () => {
    if (sessionStorage.getItem("quizStarted")) {
        resetQuizSession();
    }
    sessionStorage.setItem("quizStarted", "true");
});

function resetQuizSession() {
    sessionStorage.removeItem("quizStarted");
    sessionStorage.removeItem("currentQuestion");
    sessionStorage.removeItem("score");
    sessionStorage.removeItem("shuffledQuestions");
    window.location.href = "index.html";
}

// =============================
// SYSTÈME ANTI-TRICHE
// =============================
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") resetQuizSession();
});
window.addEventListener("blur", resetQuizSession);
document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("keydown", (e) => {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
        (e.ctrlKey && e.key === "U")
    ) {
        e.preventDefault();
        resetQuizSession();
    }
});

// =============================
// MUSIQUE DE FOND
// =============================
function startMusic() {
    const audio = document.getElementById("bgMusic");
    audio.volume = 0.4;
    audio.muted = false;
    audio.play().catch(() => {});
}

function stopMusic() {
    const audio = document.getElementById("bgMusic");
    audio.pause();
    audio.currentTime = 0;
}

// =============================
// VARIABLES
// =============================
let user = { nom: "", prenom: "" };
let current = 0;
let score = 0;
let shuffledQuestions = [];

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function shuffleQuestions() {
    return questions.map((q) => ({
        ...q,
        options: shuffleArray(q.options)
    }));
}

// =============================
// VERSION KAHOOT — SANS BOUTONS RADIO
// =============================
let selectedAnswer = null;
let selectedButton = null;

// clic sur un bouton réponse
function selectAnswer(answer, btn) {
    selectedAnswer = answer;

    document.querySelectorAll(".kahoot-btn").forEach((b) =>
        b.classList.remove("selected")
    );

    btn.classList.add("selected");
    selectedButton = btn;
}

// affichage question
function showQuestion() {
    const question = shuffledQuestions[current];

    let optionsHTML = question.options
        .map(
            (option) => `
        <button class="kahoot-btn" onclick="selectAnswer('${option}', this)">
            ${option}
        </button>`
        )
        .join("");

    document.getElementById("quiz").innerHTML = `
        <h2>${question.question}</h2>
        <div class="options">${optionsHTML}</div>
        <button class="validate" onclick="validateAnswer()">Valider</button>
        <div id="explication"></div>
    `;

    selectedAnswer = null;
    selectedButton = null;
}

// validation réponse
function validateAnswer() {
    if (!selectedAnswer) {
        document.getElementById("explication").innerHTML =
            "Veuillez sélectionner une réponse.";
        return;
    }

    const q = shuffledQuestions[current];

    if (selectedAnswer === q.bonne_reponse) {
        score++;
        selectedButton.classList.add("answer-correct");
        document.getElementById("explication").innerHTML =
            `<span class='success'>Bonne réponse !</span> ${q.explication}`;
    } else {
        selectedButton.classList.add("answer-wrong");
        document.getElementById("explication").innerHTML =
            `<span class='fail'>Mauvaise réponse.</span> ${q.explication}`;

        document.querySelectorAll(".kahoot-btn").forEach((btn) => {
            if (btn.innerText.trim() === q.bonne_reponse.trim()) {
                btn.classList.add("answer-correct-auto");
            }
        });
    }

    document.getElementById("score").innerText =
        `Score actuel : ${score} / ${shuffledQuestions.length}`;

    current++;

    if (current < shuffledQuestions.length) {
        setTimeout(showQuestion, 2500);
    } else {
        setTimeout(endQuiz, 2500);
    }
}

// fin du quiz
function endQuiz() {
    document.getElementById("quiz").innerHTML = `
        <h2>Quiz terminé !</h2>
        <p>Score final : ${score} / ${shuffledQuestions.length}</p>`;
}

// lancement du quiz
document.getElementById("startQuiz").addEventListener("click", () => {
    startMusic();

    const nom = document.getElementById("nom").value.trim();
    const prenom = document.getElementById("prenom").value.trim();

    if (!nom || !prenom) {
        alert("Merci de renseigner votre nom et prénom avant de commencer.");
        return;
    }

    user.nom = nom;
    user.prenom = prenom;

    shuffledQuestions = shuffleQuestions();
    current = 0;
    score = 0;

    document.getElementById("userForm").style.display = "none";
    document.getElementById("quiz").style.display = "block";

    showQuestion();
});

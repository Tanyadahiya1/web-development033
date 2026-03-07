// Quiz Questions
var questions = [
    {
        question: "Which language is used to structure web pages?",
        options: ["CSS", "HTML", "Python", "Java"],
        answer: 1
    },
    {
        question: "Which language adds interactivity to websites?",
        options: ["HTML", "CSS", "JavaScript", "C++"],
        answer: 2
    },
    {
        question: "Which CSS property changes text color?",
        options: ["background", "font-size", "color", "margin"],
        answer: 2
    }
];

var currentQuestion = 0;
var score = 0;

var questionElement = document.getElementById("question");
var optionsElement = document.getElementById("options");
var nextButton = document.getElementById("nextBtn");
var resultBox = document.getElementById("resultBox");
var quizBox = document.getElementById("quizBox");
var finalScore = document.getElementById("finalScore");
var finalMessage = document.getElementById("finalMessage");
var restartButton = document.getElementById("restartBtn");

// Load Question
function loadQuestion() {
    var q = questions[currentQuestion];
    questionElement.innerText = q.question;
    optionsElement.innerHTML = "";

    for (var i = 0; i < q.options.length; i++) {
        var btn = document.createElement("button");
        btn.innerText = q.options[i];
        btn.setAttribute("data-index", i);
        btn.onclick = selectAnswer;
        optionsElement.appendChild(btn);
    }
}

// Select Answer
function selectAnswer() {
    var selectedIndex = this.getAttribute("data-index");

    if (selectedIndex == questions[currentQuestion].answer) {
        score++;
    }

    nextButton.style.display = "block";
}

// Next Question
nextButton.onclick = function() {
    currentQuestion++;

    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
};

// Show Result
function showResult() {
    quizBox.style.display = "none";
    resultBox.style.display = "block";

    finalScore.innerText = "Your Score: " + score + " / " + questions.length;

    if (score == questions.length) {
        finalMessage.innerText = "Excellent Performance!";
    } else if (score >= 2) {
        finalMessage.innerText = "Good Job!";
    } else {
        finalMessage.innerText = "Try Again!";
    }
}

// Restart Quiz
restartButton.onclick = function() {
    currentQuestion = 0;
    score = 0;
    resultBox.style.display = "none";
    quizBox.style.display = "block";
    loadQuestion();
};

// Start Quiz
loadQuestion();

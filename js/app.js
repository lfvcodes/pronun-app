let words = [];
let currentWordIndex = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let usedIndices = new Set();
let totalWords = 0;
let showPhonetic = false;

const spanishWordElement = document.getElementById('spanishWord');
const englishHintElement = document.getElementById('englishHint');
const englishInputElement = document.getElementById('englishInput');
const suggestionsElement = document.getElementById('suggestions');
const resultElement = document.getElementById('result');
const ruleHintElement = document.getElementById('ruleHint');
const checkBtn = document.getElementById('checkBtn');
const nextBtn = document.getElementById('nextBtn');
const hintBtn = document.getElementById('hintBtn');
const phoneticBtn = document.getElementById('phoneticBtn');
const progressStatsElement = document.getElementById('progressStats');
const progressBarElement = document.getElementById('progressBar');
const correctCountElement = document.getElementById('correctCount');
const incorrectCountElement = document.getElementById('incorrectCount');
const remainingCountElement = document.getElementById('remainingCount');

async function loadWords() {
    try {
        const response = await fetch('api/get_words.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.success) {
            words = data.words;
            totalWords = words.length;
            console.log(`Cargadas ${totalWords} palabras`);
            loadWord();
        } else {
            console.error('Error al cargar palabras:', data.message);
            loadBackupWords();
        }
    } catch (error) {
        console.error('Error al cargar palabras:', error);
        loadBackupWords();
    }
}

function loadBackupWords() {
    words = [
        { spanish: "ver", english: "see", phonetic: "si", rule: "EE → I" },
        { spanish: "calle", english: "street", phonetic: "strit", rule: "EE → I" },
        { spanish: "pies", english: "feet", phonetic: "fit", rule: "EE → I" },
        { spanish: "dije", english: "said", phonetic: "sed", rule: "AI → E" },
        { spanish: "aire", english: "air", phonetic: "er", rule: "AI → E" },
        { spanish: "silla", english: "chair", phonetic: "cher", rule: "AI → E" }
    ];
    totalWords = words.length;
    console.log('Usando palabras de respaldo');
    loadWord();
}

function getRandomWord() {
    if (usedIndices.size >= totalWords) {
        usedIndices.clear();
        correctAnswers = 0;
        incorrectAnswers = 0;
    }

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * totalWords);
    } while (usedIndices.has(randomIndex));

    usedIndices.add(randomIndex);
    return randomIndex;
}

function loadWord() {
    currentWordIndex = getRandomWord();
    const word = words[currentWordIndex];

    spanishWordElement.textContent = word.spanish;

    if (showPhonetic) {
        englishHintElement.textContent = `Pronunciación: "${word.phonetic}"`;
    } else {
        englishHintElement.textContent = `Pista: ${getHint(word.english)}`;
    }

    ruleHintElement.textContent = `Regla aplicada: ${word.rule}`;

    englishInputElement.value = '';
    suggestionsElement.innerHTML = '';
    suggestionsElement.style.display = 'none';
    resultElement.className = 'result';
    resultElement.style.display = 'none';

    updateStats();
    englishInputElement.focus();
}

function getHint(word) {
    if (word.length <= 3) {
        return "_".repeat(word.length);
    }

    const hintLength = Math.max(2, Math.floor(word.length / 3));
    let hint = word.charAt(0);

    for (let i = 1; i < word.length; i++) {
        if (i < hintLength) {
            hint += word.charAt(i);
        } else {
            hint += "_";
        }
    }

    return hint;
}

function checkAnswer() {
    const userAnswer = englishInputElement.value.trim().toLowerCase();
    const correctAnswer = words[currentWordIndex].english.toLowerCase();

    resultElement.style.display = 'block';

    if (userAnswer === correctAnswer) {
        resultElement.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ¡Correcto! "${words[currentWordIndex].spanish}" en inglés es 
            <strong>"${words[currentWordIndex].english}"</strong>
            <div class="phonetic-guide mt-1">Pronunciación: ${words[currentWordIndex].phonetic}</div>
        `;
        resultElement.className = 'result correct';
        correctAnswers++;
    } else {
        resultElement.innerHTML = `
            <i class="fas fa-times-circle me-2"></i>
            Incorrecto. La respuesta correcta es 
            <strong>"${words[currentWordIndex].english}"</strong> (${words[currentWordIndex].phonetic})
            <div class="phonetic-guide mt-1">${words[currentWordIndex].rule}</div>
        `;
        resultElement.className = 'result incorrect';
        incorrectAnswers++;
    }

    updateStats();
    nextBtn.style.display = 'inline-block';
}

function updateStats() {
    const progress = Math.round((usedIndices.size / totalWords) * 100);
    progressStatsElement.textContent = `${usedIndices.size}/${totalWords}`;
    progressBarElement.style.width = `${progress}%`;
    progressBarElement.setAttribute('aria-valuenow', progress);

    correctCountElement.textContent = correctAnswers;
    incorrectCountElement.textContent = incorrectAnswers;
    remainingCountElement.textContent = totalWords - usedIndices.size;
}

function showSuggestions() {
    const input = englishInputElement.value.toLowerCase();
    if (input.length < 1) {
        suggestionsElement.style.display = 'none';
        return;
    }

    const matches = words.filter(word =>
        word.english.toLowerCase().startsWith(input)
    ).slice(0, 5);

    if (matches.length === 0) {
        suggestionsElement.style.display = 'none';
        return;
    }

    suggestionsElement.innerHTML = '';
    matches.forEach(word => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = word.english;
        div.addEventListener('click', function () {
            englishInputElement.value = word.english;
            suggestionsElement.style.display = 'none';
        });
        suggestionsElement.appendChild(div);
    });

    suggestionsElement.style.display = 'block';
}

// Función para mostrar/ocultar pronunciación
function togglePhonetic() {
    showPhonetic = !showPhonetic;

    if (showPhonetic) {
        phoneticBtn.innerHTML = '<i class="fas fa-eye-slash me-1"></i>Ocultar pronunciación';
        if (words[currentWordIndex]) {
            englishHintElement.textContent = `Pronunciación: "${words[currentWordIndex].phonetic}"`;
        }
    } else {
        phoneticBtn.innerHTML = '<i class="fas fa-volume-up me-1"></i>Mostrar pronunciación';
        if (words[currentWordIndex]) {
            englishHintElement.textContent = `Pista: ${getHint(words[currentWordIndex].english)}`;
        }
    }
}

// Event Listeners
checkBtn.addEventListener('click', checkAnswer);

nextBtn.addEventListener('click', function () {
    loadWord();
    nextBtn.style.display = 'none';
});

hintBtn.addEventListener('click', function () {
    if (words[currentWordIndex]) {
        const hint = getHint(words[currentWordIndex].english);
        englishHintElement.textContent = `Pista: ${hint}`;
    }
});

phoneticBtn.addEventListener('click', togglePhonetic);

englishInputElement.addEventListener('input', showSuggestions);

englishInputElement.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

document.addEventListener('click', function (e) {
    if (!suggestionsElement.contains(e.target) && e.target !== englishInputElement) {
        suggestionsElement.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    loadWords();
});
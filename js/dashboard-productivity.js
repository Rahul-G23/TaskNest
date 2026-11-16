// Dashboard Productivity Component

async function loadDashboardProductivity() {

    const container = document.getElementById("productivity-container");

    try {

        const response = await fetch("../components/dashboard-productivity.html");

        if (!response.ok) {
            throw new Error("Unable to load productivity component");
        }

        container.innerHTML = await response.text();

        initializeProductivityTimer();

        initializeCategoryButton();

    } catch (error) {

        console.error("Productivity loading error:", error);

    }

}


// Productivity Timer

function initializeProductivityTimer() {

    const timerDisplay = document.getElementById("timerDisplay");
    const timerStatus = document.getElementById("timerStatus");

    const startButton = document.getElementById("startTimer");
    const pauseButton = document.getElementById("pauseTimer");
    const resetButton = document.getElementById("resetTimer");

    let elapsedSeconds = 0;
    let timerInterval = null;

    // Convert seconds into HH:MM:SS
    function formatTime(seconds) {

        const hours = Math.floor(seconds / 3600);

        const minutes = Math.floor((seconds % 3600) / 60);

        const remainingSeconds = seconds % 60;

        return [
            hours,
            minutes,
            remainingSeconds
        ].map(value => String(value).padStart(2, "0")).join(":");

    }


    // Update timer display
    function updateDisplay() {

        timerDisplay.textContent = formatTime(elapsedSeconds);

    }


    // Start timer
    startButton.addEventListener("click", () => {

        if (timerInterval !== null) return;

        timerStatus.textContent = "Focus session in progress";

        timerInterval = setInterval(() => {

            elapsedSeconds++;

            updateDisplay();

        }, 1000);

    });


    // Pause timer
    pauseButton.addEventListener("click", () => {

        if (timerInterval === null) return;

        clearInterval(timerInterval);

        timerInterval = null;

        timerStatus.textContent = "Timer paused";

    });


    // Reset timer
    resetButton.addEventListener("click", () => {

        clearInterval(timerInterval);

        timerInterval = null;

        elapsedSeconds = 0;

        updateDisplay();

        timerStatus.textContent = "Ready to focus?";

    });

}


// Category Button

function initializeCategoryButton() {

    const button = document.getElementById("addCategoryBtn");

    button.addEventListener("click", () => {

        alert("Custom categories will be available in a future update.");

    });

}


loadDashboardProductivity();
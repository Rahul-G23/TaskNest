// Load Dashboard Overview Component

async function loadDashboardOverview() {

    const container = document.getElementById("overview-container");

    try {

        const response = await fetch("../components/dashboard-overview.html");

        if (!response.ok) {
            throw new Error("Unable to load dashboard overview");
        }

        container.innerHTML = await response.text();

        initializeOverviewButtons();

    } catch (error) {

        console.error("Dashboard Overview Error:", error);

    }

}


// Initialize Dashboard Buttons

function initializeOverviewButtons() {

    const addTaskBtn = document.getElementById("addTaskBtn");
    const viewTasksBtn = document.getElementById("viewTasksBtn");

    addTaskBtn.addEventListener("click", () => {
        console.log("Add Task button clicked");
    });

    viewTasksBtn.addEventListener("click", () => {
        window.location.href = "tasks.html";
    });

}


loadDashboardOverview();
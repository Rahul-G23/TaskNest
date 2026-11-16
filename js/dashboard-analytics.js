// TaskNest - Dashboard Analytics

let productivityChartInstance = null;

// Load the analytics component
async function loadDashboardAnalytics() {
    const container = document.getElementById("analytics-container");

    try {
        const response = await fetch("../components/dashboard-analytics.html");

        if (!response.ok) {
            throw new Error("Unable to load dashboard analytics");
        }

        container.innerHTML = await response.text();

        initializeProductivityChart();
        updateAnalyticsStats();
        updateUpcomingTasks();

        // Update analytics whenever tasks change
        window.addEventListener("tasksUpdated", () => {
            updateProductivityChart();
            updateAnalyticsStats();
            updateUpcomingTasks();
        });

    } catch (error) {
        console.error("Dashboard Analytics Error:", error);
    }
}


// Get the date in local YYYY-MM-DD format
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Get the last seven days
function getLastSevenDays() {
    const days = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);

        days.push({
            date: getLocalDateString(date),
            label: date.toLocaleDateString("en-US", {
                weekday: "short"
            })
        });
    }

    return days;
}


// Calculate tasks created on each of the last seven days
function getDailyTaskData() {
    const tasks = getTasks();
    const days = getLastSevenDays();

    return days.map(day => {
        const count = tasks.filter(task => {
            if (!task.createdAt) return false;

            const createdDate = new Date(task.createdAt);

            if (Number.isNaN(createdDate.getTime())) return false;

            return getLocalDateString(createdDate) === day.date;
        }).length;

        return count;
    });
}


// Initialize the productivity chart
function initializeProductivityChart() {
    const canvas = document.getElementById("productivityChart");

    if (!canvas) return;

    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded");
        return;
    }

    const days = getLastSevenDays();
    const taskData = getDailyTaskData();

    if (productivityChartInstance) {
        productivityChartInstance.destroy();
    }

    productivityChartInstance = new Chart(canvas, {
        type: "line",

        data: {
            labels: days.map(day => day.label),

            datasets: [{
                label: "Tasks Created",
                data: taskData,
                borderColor: "#7655e8",
                backgroundColor: "rgba(118, 85, 232, 0.12)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "#7655e8"
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const count = context.parsed.y;
                            return `${count} ${count === 1 ? "task" : "tasks"} created`;
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        color: "#eeeeee"
                    }
                },

                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}


// Refresh the chart with current task data
function updateProductivityChart() {
    if (!productivityChartInstance) {
        initializeProductivityChart();
        return;
    }

    const days = getLastSevenDays();

    productivityChartInstance.data.labels = days.map(day => day.label);
    productivityChartInstance.data.datasets[0].data = getDailyTaskData();

    productivityChartInstance.update();
}


// Update analytics summary cards
function updateAnalyticsStats() {
    const tasks = getTasks();

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.status === "completed"
    ).length;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    const completedElement = document.getElementById("analyticsCompleted");
    const totalElement = document.getElementById("analyticsTotal");
    const percentageElement = document.getElementById("completionPercentage");

    if (completedElement) {
        completedElement.textContent = completed;
    }

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (percentageElement) {
        percentageElement.textContent = `${percentage}%`;
    }
}


// Display the next active task
function updateUpcomingTasks() {
    const tasks = getTasks();

    const upcomingTasks = tasks
        .filter(task => task.status === "active" && task.dueDate)
        .sort((a, b) => {
            const dateComparison = a.dueDate.localeCompare(b.dueDate);

            if (dateComparison !== 0) {
                return dateComparison;
            }

            return (a.dueTime || "").localeCompare(b.dueTime || "");
        });

    const dateElement = document.getElementById("upcomingDate");
    const titleElement = document.getElementById("upcomingTaskTitle");
    const descriptionElement = document.getElementById("upcomingTaskDescription");

    if (!dateElement || !titleElement || !descriptionElement) return;

    if (upcomingTasks.length === 0) {
        dateElement.textContent = "No pending tasks";
        titleElement.textContent = "You're all caught up!";
        descriptionElement.textContent = "Add a task to see your upcoming schedule here.";
        return;
    }

    const nextTask = upcomingTasks[0];

    // Parse the date without timezone shifting
    const [year, month, day] = nextTask.dueDate.split("-").map(Number);

    const dueDate = new Date(year, month - 1, day);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(year, month - 1, day);
    taskDate.setHours(0, 0, 0, 0);

    let dateText = dueDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    if (taskDate.getTime() < today.getTime()) {
        dateText = `Overdue · ${dateText}`;
    } else if (taskDate.getTime() === today.getTime()) {
        dateText = `Today · ${dateText}`;
    }

    if (nextTask.dueTime) {
        dateText += ` at ${nextTask.dueTime}`;
    }

    dateElement.textContent = dateText;
    titleElement.textContent = nextTask.title;
    descriptionElement.textContent =
        nextTask.description || `${nextTask.category} · ${nextTask.priority} priority`;
}


// Open the My Tasks page
document.addEventListener("click", function(event) {
    if (event.target.closest("#upcomingViewBtn")) {
        window.location.href = "tasks.html";
    }
});


// Start the dashboard analytics
loadDashboardAnalytics();
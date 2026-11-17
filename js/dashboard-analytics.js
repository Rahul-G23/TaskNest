// ========================================
// TaskNest - Dashboard Analytics
// ========================================

let productivityChartInstance = null;


// ========================================
// Load Analytics Component
// ========================================

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
        updateWeeklySummary();

        window.addEventListener("tasksUpdated", () => {

            updateProductivityChart();
            updateAnalyticsStats();
            updateUpcomingTasks();
            updateWeeklySummary();

        });

    } catch (error) {

        console.error("Dashboard Analytics Error:", error);

    }

}


// ========================================
// Date Helper Functions
// ========================================

// Get local date in YYYY-MM-DD format

function getLocalDateString(date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// Get Monday of the current week

function getWeekStart(date) {

    const weekStart = new Date(date);

    weekStart.setHours(0, 0, 0, 0);

    const day = weekStart.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    weekStart.setDate(weekStart.getDate() + difference);

    return weekStart;

}


// Get Monday to Sunday dates

function getWeekDays(startDate) {

    const days = [];

    for (let i = 0; i < 7; i++) {

        const date = new Date(startDate);

        date.setDate(date.getDate() + i);

        days.push({

            date: getLocalDateString(date),

            label: date.toLocaleDateString("en-US", {
                weekday: "short"
            })

        });

    }

    return days;

}


// ========================================
// Daily Completed Tasks
// ========================================

function getDailyCompletedTasks() {

    const tasks = getTasks();

    const weekStart = getWeekStart(new Date());

    const days = getWeekDays(weekStart);

    return days.map(day => {

        return tasks.filter(task => {

            if (task.status !== "completed" || !task.completedAt) {
                return false;
            }

            const completedDate = new Date(task.completedAt);

            if (Number.isNaN(completedDate.getTime())) {
                return false;
            }

            return getLocalDateString(completedDate) === day.date;

        }).length;

    });

}


// ========================================
// Productivity Chart
// ========================================

function initializeProductivityChart() {

    const canvas = document.getElementById("productivityChart");

    if (!canvas) return;

    if (typeof Chart === "undefined") {

        console.error("Chart.js is not loaded");

        return;

    }

    const weekStart = getWeekStart(new Date());

    const days = getWeekDays(weekStart);

    const completedData = getDailyCompletedTasks();

    if (productivityChartInstance) {
        productivityChartInstance.destroy();
    }

    productivityChartInstance = new Chart(canvas, {

        type: "line",

        data: {

            labels: days.map(day => day.label),

            datasets: [{

                label: "Tasks Completed",

                data: completedData,

                borderColor: "#7655e8",

                backgroundColor: "rgba(118, 85, 232, 0.12)",

                borderWidth: 3,

                fill: true,

                tension: 0.4,

                pointRadius: 5,

                pointHoverRadius: 7,

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

                            return `${count} ${count === 1 ? "task" : "tasks"} completed`;

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


// Update chart automatically

function updateProductivityChart() {

    if (!productivityChartInstance) {

        initializeProductivityChart();

        return;

    }

    const weekStart = getWeekStart(new Date());

    const days = getWeekDays(weekStart);

    productivityChartInstance.data.labels =
        days.map(day => day.label);

    productivityChartInstance.data.datasets[0].data =
        getDailyCompletedTasks();

    productivityChartInstance.update();

}


// ========================================
// Overall Analytics Statistics
// ========================================

function updateAnalyticsStats() {

    const tasks = getTasks();

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.status === "completed"
    ).length;

    const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    document.getElementById("analyticsCompleted").textContent = completed;

    document.getElementById("analyticsTotal").textContent = total;

    document.getElementById("completionPercentage").textContent =
        `${percentage}%`;

}


// ========================================
// Weekly Productivity Summary
// ========================================

// Get completed tasks within a date range

function getCompletedTasksInRange(startDate, endDate) {

    const tasks = getTasks();

    const start = getLocalDateString(startDate);

    const end = getLocalDateString(endDate);

    return tasks.filter(task => {

        if (task.status !== "completed" || !task.completedAt) {
            return false;
        }

        const completedDate = new Date(task.completedAt);

        if (Number.isNaN(completedDate.getTime())) {
            return false;
        }

        const dateString = getLocalDateString(completedDate);

        return dateString >= start && dateString <= end;

    });

}


// Calculate weekly summary

function updateWeeklySummary() {

    const today = new Date();

    const currentWeekStart = getWeekStart(today);

    const currentWeekEnd = new Date(currentWeekStart);

    currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);


    // Previous week dates

    const previousWeekStart = new Date(currentWeekStart);

    previousWeekStart.setDate(previousWeekStart.getDate() - 7);

    const previousWeekEnd = new Date(currentWeekStart);

    previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);


    // Get completed tasks

    const currentWeekTasks = getCompletedTasksInRange(
        currentWeekStart,
        currentWeekEnd
    );

    const previousWeekTasks = getCompletedTasksInRange(
        previousWeekStart,
        previousWeekEnd
    );


    // 1. Total tasks completed this week

    const weeklyCompleted = currentWeekTasks.length;


    // 2. Most productive day

    const weekDays = getWeekDays(currentWeekStart);

    const dailyCounts = weekDays.map(day => {

        const count = currentWeekTasks.filter(task => {

            const completedDate = new Date(task.completedAt);

            return getLocalDateString(completedDate) === day.date;

        }).length;

        return {

            day: day.label,

            count: count

        };

    });


    const mostProductive = dailyCounts.reduce((maximum, current) => {

        return current.count > maximum.count ? current : maximum;

    }, { day: "--", count: 0 });


    const mostProductiveDay = mostProductive.count > 0
        ? mostProductive.day
        : "--";


    // 3. Daily average

    const dailyAverage = (weeklyCompleted / 7).toFixed(1);


    // 4. Previous week comparison

    const previousCompleted = previousWeekTasks.length;

    let comparisonText;


    if (previousCompleted === 0 && weeklyCompleted === 0) {

        comparisonText = "0%";

    } else if (previousCompleted === 0) {

        comparisonText = "New";

    } else {

        const difference = weeklyCompleted - previousCompleted;

        const percentage = Math.round(
            (Math.abs(difference) / previousCompleted) * 100
        );

        if (difference > 0) {

            comparisonText = `↑ ${percentage}%`;

        } else if (difference < 0) {

            comparisonText = `↓ ${percentage}%`;

        } else {

            comparisonText = "No change";

        }

    }


    // Display weekly summary

    document.getElementById("weeklyCompleted").textContent =
        weeklyCompleted;

    document.getElementById("mostProductiveDay").textContent =
        mostProductiveDay;

    document.getElementById("dailyAverage").textContent =
        dailyAverage;

    document.getElementById("weeklyComparison").textContent =
        comparisonText;

}


// ========================================
// Upcoming Tasks
// ========================================

function updateUpcomingTasks() {

    const tasks = getTasks();

    const upcomingTasks = tasks

        .filter(task =>
            task.status === "active" && task.dueDate
        )

        .sort((a, b) => {

            const dateComparison =
                a.dueDate.localeCompare(b.dueDate);

            if (dateComparison !== 0) {
                return dateComparison;
            }

            return (a.dueTime || "").localeCompare(b.dueTime || "");

        });


    const dateElement = document.getElementById("upcomingDate");

    const titleElement = document.getElementById("upcomingTaskTitle");

    const descriptionElement =
        document.getElementById("upcomingTaskDescription");


    if (upcomingTasks.length === 0) {

        dateElement.textContent = "No pending tasks";

        titleElement.textContent = "You're all caught up!";

        descriptionElement.textContent =
            "Add a task to see your upcoming schedule here.";

        return;

    }


    const nextTask = upcomingTasks[0];

    const [year, month, day] =
        nextTask.dueDate.split("-").map(Number);

    const dueDate = new Date(year, month - 1, day);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const taskDate = new Date(year, month - 1, day);

    taskDate.setHours(0, 0, 0, 0);


    let dateText = dueDate.toLocaleDateString("en-IN", {

        day: "numeric",

        month: "short",

        year: "numeric"

    });


    if (taskDate < today) {

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
        nextTask.description ||
        `${nextTask.category} · ${nextTask.priority} priority`;

}


// ========================================
// Upcoming Tasks Button
// ========================================

document.addEventListener("click", function(event) {

    if (event.target.closest("#upcomingViewBtn")) {

        window.location.href = "tasks.html";

    }

});


// ========================================
// Start Analytics
// ========================================

loadDashboardAnalytics();
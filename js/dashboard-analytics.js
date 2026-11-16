// Load Dashboard Analytics Component

async function loadDashboardAnalytics() {

    const container = document.getElementById("analytics-container");

    try {

        const response = await fetch("../components/dashboard-analytics.html");

        if (!response.ok) {
            throw new Error("Unable to load analytics component");
        }

        container.innerHTML = await response.text();

        initializeAnalyticsChart();
        initializeUpcomingButton();

    } catch (error) {

        console.error("Analytics loading error:", error);

    }

}


// Initialize Weekly Productivity Chart

function initializeAnalyticsChart() {

    const chartCanvas = document.getElementById("productivityChart");

    if (!chartCanvas) return;

    const chartContext = chartCanvas.getContext("2d");

    const gradient = chartContext.createLinearGradient(0, 0, 0, 150);

    gradient.addColorStop(0, "rgba(151, 62, 224, 0.45)");
    gradient.addColorStop(1, "rgba(151, 62, 224, 0.02)");

    new Chart(chartContext, {

        type: "line",

        data: {

            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

            datasets: [{

                label: "Completed Tasks",

                data: [2, 4, 3, 6, 5, 8, 10],

                borderColor: "#873bd8",

                backgroundColor: gradient,

                fill: true,

                tension: 0.4,

                borderWidth: 2,

                pointRadius: 0,

                pointHoverRadius: 5

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }

            },

            scales: {

                x: {
                    display: false
                },

                y: {
                    display: false,
                    beginAtZero: true
                }

            }

        }

    });

}


// Upcoming Tasks Button

function initializeUpcomingButton() {

    const button = document.getElementById("upcomingViewBtn");

    button.addEventListener("click", () => {

        window.location.href = "tasks.html";

    });

}


loadDashboardAnalytics();
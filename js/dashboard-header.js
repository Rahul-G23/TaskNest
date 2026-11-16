async function loadDashboardHeader() {

    const container = document.getElementById("header-container");

    try {
        const response = await fetch("../components/dashboard-header.html");

        if (!response.ok) {
            throw new Error("Unable to load dashboard header");
        }

        container.innerHTML = await response.text();

    } catch (error) {
        console.error("Header loading error:", error);
    }

}

loadDashboardHeader();
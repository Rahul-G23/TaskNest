// ========================================
// TaskNest - Dashboard Header Component
// ========================================

async function loadDashboardHeader() {

    const container = document.getElementById("header-container");

    if (!container) return;

    try {
        const response = await fetch("../components/dashboard-header.html");

        if (!response.ok) {
            throw new Error("Unable to load dashboard header");
        }

        container.innerHTML = await response.text();

        populateHeaderUserProfile();

    } catch (error) {
        console.error("Header loading error:", error);
    }

}


// Display the logged-in user's name, email, and initial avatar

function populateHeaderUserProfile() {

    try {
        const rawUser = localStorage.getItem("tasknest_current_user");
        if (!rawUser) return;

        const user = JSON.parse(rawUser);
        if (!user || !user.name) return;

        const avatarEl = document.querySelector(".user-profile .user-avatar");
        const nameEl = document.querySelector(".user-profile .user-details h4");
        const emailEl = document.querySelector(".user-profile .user-details p");

        if (avatarEl) {
            avatarEl.textContent = user.name.trim().charAt(0).toUpperCase();
        }

        if (nameEl) {
            nameEl.textContent = user.name;
        }

        if (emailEl && user.email) {
            emailEl.textContent = user.email;
        }

    } catch (error) {
        console.error("Error populating header user profile:", error);
    }

}


loadDashboardHeader();
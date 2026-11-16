// Load the reusable sidebar component

async function loadSidebar() {

    const sidebarContainer = document.getElementById("sidebar-container");

    try {

        const response = await fetch("../components/sidebar.html");

        if (!response.ok) {
            throw new Error("Unable to load sidebar");
        }

        const sidebarHTML = await response.text();

        sidebarContainer.innerHTML = sidebarHTML;

        setActiveNavigation();

    } catch (error) {

        console.error("Sidebar loading error:", error);

    }

}


// Highlight only the current page

function setActiveNavigation() {

    const currentPage = window.location.pathname.split("/").pop();

    const navigationLinks = document.querySelectorAll(".nav-link");

    navigationLinks.forEach(link => {

        const linkPage = link.getAttribute("href");

        link.classList.toggle(
            "active",
            linkPage === currentPage
        );

    });

}


loadSidebar();
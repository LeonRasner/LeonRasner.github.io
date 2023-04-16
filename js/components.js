function loadComponent (componentName, targetEl) {
    return fetch(componentName)
        .then((response) => {
            return response.text();
        })
        .then((html) => {
            targetEl.innerHTML = html;
        })
        .catch((error) => {
            console.error("Error Loading Component: ", componentName, error);
        });
}

function setActiveNavLink() {
    const currentPage = window.location.pathname;
    let activeLinkId;

    if (currentPage === '/index.html' || currentPage === '/') {
        activeLinkId = "homeLink";
    } else if (currentPage.includes("project")) {
        activeLinkId = "projectsLink";
    }

    if (activeLinkId) {
        activeLinkId = document.getElementById(activeLinkId);
        activeLinkId.classList.add("activeNav");
      }

}

document.addEventListener('DOMContentLoaded', () => {
    const headerEl = document.querySelector('[data-component="header"]');
    const footerEl = document.querySelector('[data-component="footer"]');

    if (headerEl) {
        loadComponent('/components/header.html', headerEl).then(() => {
            setActiveNavLink();
        });
        
    }
    if (footerEl) {
        loadComponent('/components/footer.html', footerEl);
    }
})


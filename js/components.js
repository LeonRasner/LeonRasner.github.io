function loadComponent (componentName, targetEl) {
    fetch(componentName)
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

document.addEventListener('DOMContentLoaded', () => {
    const headerEl = document.querySelector('[data-component="header"]');

    if (headerEl) {
        loadComponent('components/header.html', headerEl);
    }
})
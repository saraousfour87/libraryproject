// guard.js - Protection des routes
document.addEventListener('DOMContentLoaded', () => {
    const publicPages = ['index.html', 'login.html'];
    const currentPage = window.location.pathname.split('/').pop();
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser && !publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
        return;
    }
    
    if (currentUser && publicPages.includes(currentPage)) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    if (currentUser) {
        displayUserInfo();
    }
});

function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    document.querySelectorAll('[data-user="name"]').forEach(el => {
        el.textContent = user.name;
    });
    
    document.querySelectorAll('[data-user="avatar"]').forEach(el => {
        if (el.tagName === 'IMG') el.src = user.avatar;
    });
    
    if (user.role !== 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}
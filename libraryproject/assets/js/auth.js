// auth.js - Gestion de l'authentification avec avatar UI Avatars

// Gestion de la soumission du formulaire
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorDiv = document.getElementById('error');
    
    // Afficher/Masquer mot de passe
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const password = document.getElementById('password');
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
    
    // Gestion du login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Vérifier si les champs sont vides
            if (!email || !password) {
                if (errorDiv) {
                    errorDiv.textContent = 'Veuillez remplir les champs';
                    errorDiv.style.display = 'block';
                    
                    setTimeout(() => {
                        errorDiv.style.display = 'none';
                    }, 2000);
                }
                return;
            }
            
            // Déterminer le rôle basé sur l'email
            let role = 'user';
            if (email.toLowerCase().includes('admin')) {
                role = 'admin';
            }
            
            // Créer un nom à partir de l'email
            const name = email.split('@')[0] || 'Utilisateur';
            
            // Créer une session avec avatar UI Avatars (FONCTIONNE À 100%)
            const session = {
                id: Date.now().toString(),
                email: email,
                name: name,
                role: role,
                // Avatar UI Avatars - généré automatiquement sans fichiers
                avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=3498db&color=fff&size=100&bold=true&length=2',
                loginTime: new Date().toISOString()
            };
            
            // Sauvegarder dans localStorage
            localStorage.setItem('currentUser', JSON.stringify(session));
            
            // Message de succès
            if (errorDiv) {
                errorDiv.textContent = 'Connexion réussie !';
                errorDiv.style.display = 'block';
                errorDiv.className = 'alert success';
                
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 1500);
            }
            
            // Redirection vers dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        });
    }
});

// Déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Vérification de l'authentification
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    const publicPages = ['index.html', 'login.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!currentUser && !publicPages.includes(currentPage)) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (currentUser && publicPages.includes(currentPage)) {
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// Obtenir l'utilisateur courant
function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Afficher les informations utilisateur dans la navbar
function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Mettre à jour le nom d'utilisateur
    const userNameElements = document.querySelectorAll('.user-name, [data-user="name"]');
    userNameElements.forEach(el => {
        el.textContent = user.name;
    });
    
    // Mettre à jour le rôle
    const userRoleElements = document.querySelectorAll('.user-role, [data-user="role"]');
    userRoleElements.forEach(el => {
        el.textContent = user.role === 'admin' ? 'Administrateur' : 'Membre';
    });
    
    // Mettre à jour l'avatar (version corrigée qui fonctionne)
    const avatarElements = document.querySelectorAll('.user-avatar, [data-user="avatar"]');
    avatarElements.forEach(el => {
        if (el.tagName === 'IMG') {
            // Utiliser l'avatar de la session ou générer un nouveau
            if (user.avatar) {
                el.src = user.avatar;
            } else {
                // Générer un avatar UI Avatars si pas d'avatar
                el.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User') + '&background=3498db&color=fff&size=100&bold=true&length=2';
            }
            el.alt = user.name || 'Avatar';
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.borderRadius = '50%';
            el.style.objectFit = 'cover';
            el.style.border = '2px solid #3498db';
        }
    });
}

// Vérifier si l'utilisateur est admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Initialiser la page après chargement
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification
    checkAuth();
    
    // Afficher les infos utilisateur si connecté
    if (getCurrentUser()) {
        displayUserInfo();
    }
});

// Exporter les fonctions pour utilisation globale
window.logout = logout;
window.checkAuth = checkAuth;
window.getCurrentUser = getCurrentUser;
window.displayUserInfo = displayUserInfo;
window.isAdmin = isAdmin;
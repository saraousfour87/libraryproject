// dashboard.js - Tableau de bord avec rafraîchissement automatique

// Variables pour les graphiques
let pieChart, donutChart, barChart, lineChart, radarChart;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Dashboard chargé');
    
    // Vérifier l'authentification
    if (typeof checkAuth === 'function') {
        checkAuth();
    }
    
    // Afficher les informations utilisateur
    displayUserInfo();
    
    // CHARGER LES DONNÉES À CHAQUE VISITE
    loadDashboardData();
    
    // Initialiser les graphiques
    setTimeout(() => {
        initCharts();
    }, 100);
    
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
            document.getElementById('mainContent').classList.toggle('expanded');
        });
    }
});

// Afficher les informations utilisateur
function displayUserInfo() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = user.name || 'Utilisateur';
    if (userRole) userRole.textContent = user.role === 'admin' ? 'Administrateur' : 'Membre';
    if (userAvatar) {
        userAvatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3498db&color=fff&size=100`;
    }
}

// CHARGER TOUTES LES DONNÉES FRAÎCHES
function loadDashboardData() {
    console.log('🔄 Rechargement des données...');
    
    // Récupérer les données DIRECTEMENT du localStorage
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const members = JSON.parse(localStorage.getItem('members')) || [];
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    console.log('📚 Livres:', books.length);
    console.log('👥 Membres:', members.length);
    console.log('📋 Emprunts:', loans.length);
    console.log('🏷️ Catégories:', categories.length);
    
    // Calculer les statistiques
    const totalBooks = books.length;
    const totalMembers = members.filter(m => m && m.status === 'actif').length;
    const activeLoans = loans.filter(l => l && l.status === 'en cours').length;
    
    // Emprunts en retard
    const today = new Date();
    const overdueLoans = loans.filter(l => {
        if (!l || l.status !== 'en cours') return false;
        if (!l.dueDate) return false;
        const dueDate = new Date(l.dueDate);
        return dueDate < today;
    }).length;
    
    const availableBooks = books.reduce((sum, book) => sum + (book.available || 0), 0);
    const totalCategories = categories.length;
    
    // Générer les cartes KPI
    generateKPICards({
        totalBooks,
        totalMembers,
        activeLoans,
        overdueLoans,
        availableBooks,
        totalCategories
    });
    
    // Mettre à jour les graphiques avec les nouvelles données
    updateChartsWithData(books, loans, categories, members);
}

// Générer les cartes KPI
function generateKPICards(stats) {
    const kpiGrid = document.getElementById('kpiGrid');
    if (!kpiGrid) return;
    
    kpiGrid.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-icon primary">
                <i class="fas fa-book"></i>
            </div>
            <div class="kpi-content">
                <div class="kpi-value">${stats.totalBooks}</div>
                <div class="kpi-label">Total des livres</div>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon success">
                <i class="fas fa-users"></i>
            </div>
            <div class="kpi-content">
                <div class="kpi-value">${stats.totalMembers}</div>
                <div class="kpi-label">Membres actifs</div>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon warning">
                <i class="fas fa-hand-holding-heart"></i>
            </div>
            <div class="kpi-content">
                <div class="kpi-value">${stats.activeLoans}</div>
                <div class="kpi-label">Emprunts en cours</div>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon danger">
                <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="kpi-content">
                <div class="kpi-value">${stats.overdueLoans}</div>
                <div class="kpi-label">Emprunts en retard</div>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon info">
                <i class="fas fa-book-open"></i>
            </div>
            <div class="kpi-content">
                <div class="kpi-value">${stats.availableBooks}</div>
                <div class="kpi-label">Livres disponibles</div>
            </div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon secondary">
                <i class="fas fa-tags"></i>
            </div>
            <div class="kpi-content">
                <div class="kpi-value">${stats.totalCategories}</div>
                <div class="kpi-label">Catégories</div>
            </div>
        </div>
    `;
}

// Mettre à jour les graphiques avec les données
function updateChartsWithData(books, loans, categories, members) {
    // Détruire les anciens graphiques s'ils existent
    if (pieChart) pieChart.destroy();
    if (donutChart) donutChart.destroy();
    if (barChart) barChart.destroy();
    if (lineChart) lineChart.destroy();
    if (radarChart) radarChart.destroy();
    
    // Préparer les données pour le pie chart (catégories)
    let categoryNames = [];
    let categoryCounts = [];
    
    if (categories.length > 0) {
        categoryNames = categories.map(c => c.name || 'Sans nom');
        categoryCounts = categories.map(c => {
            return books.filter(b => b && b.category === c.id).length;
        });
    } else {
        categoryNames = ['Fiction', 'Science-Fiction', 'Classique', 'Histoire', 'Poésie'];
        categoryCounts = [12, 8, 15, 5, 3];
    }
    
    // Pie Chart
    const pieCtx = document.getElementById('pieChart');
    if (pieCtx) {
        pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: categoryNames,
                datasets: [{
                    data: categoryCounts,
                    backgroundColor: ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#1abc9c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Donut Chart (statut des emprunts)
    const donutCtx = document.getElementById('donutChart');
    if (donutCtx) {
        const enCours = loans.filter(l => l && l.status === 'en cours').length;
        const retard = loans.filter(l => l && l.status === 'retard').length;
        const termine = loans.filter(l => l && l.status === 'terminé').length;
        
        donutChart = new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                labels: ['En cours', 'En retard', 'Terminés'],
                datasets: [{
                    data: [enCours || 1, retard || 1, termine || 1],
                    backgroundColor: ['#2ecc71', '#e74c3c', '#3498db'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Bar Chart (emprunts par mois)
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
        // Compter les emprunts par mois
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
        const monthlyData = [0, 0, 0, 0, 0, 0];
        
        loans.forEach(loan => {
            if (loan && loan.loanDate) {
                const month = new Date(loan.loanDate).getMonth();
                if (month >= 0 && month < 6) {
                    monthlyData[month]++;
                }
            }
        });
        
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Emprunts',
                    data: monthlyData,
                    backgroundColor: '#3498db',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    // Line Chart (nouveaux membres)
    const lineCtx = document.getElementById('lineChart');
    if (lineCtx) {
        // Compter les nouveaux membres par mois
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
        const monthlyMembers = [0, 0, 0, 0, 0, 0];
        
        members.forEach(member => {
            if (member && member.registeredAt) {
                const month = new Date(member.registeredAt).getMonth();
                if (month >= 0 && month < 6) {
                    monthlyMembers[month]++;
                }
            }
        });
        
        lineChart = new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Nouveaux membres',
                    data: monthlyMembers,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    // Radar Chart (auteurs populaires)
    const radarCtx = document.getElementById('radarChart');
    if (radarCtx) {
        const authors = JSON.parse(localStorage.getItem('authors')) || [];
        const authorNames = authors.slice(0, 5).map(a => a.name || 'Auteur');
        const authorBooks = authors.slice(0, 5).map(a => a.bookCount || 5);
        
        radarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: authorNames.length ? authorNames : ['Victor Hugo', 'George Orwell', 'Saint-Exupéry', 'Albert Camus', 'J.K. Rowling'],
                datasets: [{
                    label: 'Livres',
                    data: authorBooks.length ? authorBooks : [15, 12, 10, 8, 20],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: '#3498db',
                    pointBackgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: { beginAtZero: true }
                }
            }
        });
    }
}

// Initialiser les graphiques (appelé au chargement)
function initCharts() {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const members = JSON.parse(localStorage.getItem('members')) || [];
    
    updateChartsWithData(books, loans, categories, members);
}

// Rafraîchir le dashboard (à appeler manuellement si besoin)
function refreshDashboard() {
    loadDashboardData();
}

// Exporter les fonctions
window.refreshDashboard = refreshDashboard;
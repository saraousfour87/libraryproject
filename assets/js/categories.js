// categories.js - Gestion des catégories avec détails style CRUD

let categories = [];
let currentPage = 1;
let perPage = 10;
let sortField = 'name';
let sortDirection = 'asc';
let filters = { search: '' };

// Images pour les catégories
const categoryImages = {
    '1': 'https://picsum.photos/id/20/100/100',  // Fiction
    '2': 'https://picsum.photos/id/21/100/100',  // Science-Fiction
    '3': 'https://picsum.photos/id/22/100/100',  // Classique
    '4': 'https://picsum.photos/id/23/100/100',  // Histoire
    '5': 'https://picsum.photos/id/24/100/100',  // Poésie
    '6': 'https://picsum.photos/id/25/100/100',  // Jeunesse
    'default': 'https://picsum.photos/id/26/100/100'
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('categories.js chargé');
    
    if (typeof checkAuth === 'function') checkAuth();
    loadCategories();
    initEventListeners();
    initModals();
    if (typeof displayUserInfo === 'function') displayUserInfo();
});

function loadCategories() {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
        console.log('Catégories chargées:', categories.length);
    } else {
        categories = getDemoCategories();
        localStorage.setItem('categories', JSON.stringify(categories));
        console.log('Catégories de démonstration créées:', categories.length);
    }
    renderTable();
}

function getDemoCategories() {
    return [
        { 
            id: '1', 
            name: 'Fiction', 
            description: 'Romans, nouvelles et littérature générale. Cette catégorie regroupe tous les ouvrages de fiction, y compris les romans contemporains, les nouvelles et la littérature générale.', 
            bookCount: 45, 
            color: '#3498db', 
            createdAt: '2025-01-01' 
        },
        { 
            id: '2', 
            name: 'Science-Fiction', 
            description: 'Univers futuristes, voyages spatiaux, technologies avancées. Explorez des mondes imaginaires, des dystopies et des aventures interstellaires.', 
            bookCount: 28, 
            color: '#2ecc71', 
            createdAt: '2025-01-01' 
        },
        { 
            id: '3', 
            name: 'Classique', 
            description: 'Œuvres littéraires reconnues du patrimoine mondial. Des grands auteurs comme Victor Hugo, Balzac, Zola et bien d\'autres.', 
            bookCount: 32, 
            color: '#f1c40f', 
            createdAt: '2025-01-01' 
        },
        { 
            id: '4', 
            name: 'Histoire', 
            description: 'Livres d\'histoire, biographies historiques et essais. Plongez dans le passé avec des récits captivants et des analyses approfondies.', 
            bookCount: 19, 
            color: '#e74c3c', 
            createdAt: '2025-01-05' 
        },
        { 
            id: '5', 
            name: 'Poésie', 
            description: 'Recueils de poèmes et anthologies poétiques. Des vers classiques aux poèmes contemporains, laissez-vous emporter par la beauté des mots.', 
            bookCount: 12, 
            color: '#9b59b6', 
            createdAt: '2025-01-10' 
        },
        { 
            id: '6', 
            name: 'Jeunesse', 
            description: 'Livres pour enfants et adolescents. Des albums illustrés aux romans pour ados, une sélection adaptée aux jeunes lecteurs.', 
            bookCount: 37, 
            color: '#1abc9c', 
            createdAt: '2025-01-15' 
        }
    ];
}

function initEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            filters.search = searchInput.value;
            currentPage = 1;
            renderTable();
        }, 300));
    }
    
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            const field = this.dataset.sort;
            if (sortField === field) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortDirection = 'asc';
            }
            document.querySelectorAll('th.sortable').forEach(el => {
                el.classList.remove('sort-asc', 'sort-desc');
            });
            this.classList.add(`sort-${sortDirection}`);
            renderTable();
        });
    });
    
    const perPageSelect = document.getElementById('perPage');
    if (perPageSelect) {
        perPageSelect.addEventListener('change', () => {
            perPage = parseInt(perPageSelect.value);
            currentPage = 1;
            renderTable();
        });
    }
    
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
            document.getElementById('mainContent').classList.toggle('expanded');
        });
    }
}

function initModals() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal();
            closeDeleteModal();
        });
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
                closeDeleteModal();
            }
        });
    });
}

function renderTable() {
    let filteredCategories = [...categories];
    
    if (filters.search && filters.search.trim() !== '') {
        const searchLower = filters.search.toLowerCase().trim();
        filteredCategories = filteredCategories.filter(cat => 
            cat.name.toLowerCase().includes(searchLower) ||
            (cat.description && cat.description.toLowerCase().includes(searchLower))
        );
    }
    
    filteredCategories = sortCategories(filteredCategories, sortField, sortDirection);
    const paginated = paginateData(filteredCategories, currentPage, perPage);
    
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (paginated.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucune catégorie trouvée</td></tr>';
    } else {
        tbody.innerHTML = paginated.data.map(cat => {
            // Compter le nombre de livres dans cette catégorie
            const books = JSON.parse(localStorage.getItem('books')) || [];
            const bookCount = books.filter(b => b.category === cat.id).length;
            
            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center;">
                            <img src="${categoryImages[cat.id] || categoryImages.default}" 
                                 alt="${cat.name}" 
                                 style="width: 45px; height: 45px; border-radius: 5px; margin-right: 10px; object-fit: cover;">
                            <span style="display: flex; align-items: center;">
                                <span style="display:inline-block; width:16px; height:16px; background:${cat.color || '#3498db'}; border-radius:4px; margin-right:8px;"></span>
                                ${escapeHtml(cat.name)}
                            </span>
                        </div>
                    </td>
                    <td>${escapeHtml(cat.description ? (cat.description.length > 50 ? cat.description.substring(0,50) + '...' : cat.description) : '')}</td>
                    <td style="text-align: center; font-weight: 600; color: #3498db;">${bookCount}</td>
                    <td>${formatDate(cat.createdAt)}</td>
                    <td class="table-actions">
                        <button class="btn-icon view" onclick="viewCategory('${cat.id}')" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit admin-only" onclick="editCategory('${cat.id}')" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete admin-only" onclick="deleteCategory('${cat.id}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    updatePagination(paginated);
}

function sortCategories(data, field, direction) {
    return [...data].sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (field === 'bookCount') {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
        }
        
        if (field === 'createdAt') {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }
        
        if (typeof valA === 'string' && typeof valB === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (direction === 'asc') {
            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        } else {
            if (valB < valA) return -1;
            if (valB > valA) return 1;
            return 0;
        }
    });
}

function paginateData(data, page, perPage) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
        data: data.slice(start, end),
        total: data.length,
        page: page,
        perPage: perPage,
        totalPages: Math.ceil(data.length / perPage)
    };
}

function updatePagination(paginated) {
    const paginationInfo = document.getElementById('paginationInfo');
    if (paginationInfo) {
        if (paginated.total === 0) {
            paginationInfo.textContent = 'Aucune catégorie';
        } else {
            const start = ((paginated.page - 1) * paginated.perPage) + 1;
            const end = Math.min(start + paginated.perPage - 1, paginated.total);
            paginationInfo.textContent = `Affichage ${start}-${end} de ${paginated.total} catégories`;
        }
    }
    
    const paginationButtons = document.getElementById('paginationButtons');
    if (!paginationButtons) return;
    
    if (paginated.totalPages <= 1) {
        paginationButtons.innerHTML = '';
        return;
    }
    
    let buttons = `<button class="page-btn" ${paginated.page === 1 ? 'disabled' : ''} onclick="changePage(${paginated.page - 1})"><i class="fas fa-chevron-left"></i></button>`;
    
    for (let i = 1; i <= paginated.totalPages; i++) {
        if (i === 1 || i === paginated.totalPages || (i >= paginated.page - 2 && i <= paginated.page + 2)) {
            buttons += `<button class="page-btn ${i === paginated.page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === paginated.page - 3 || i === paginated.page + 3) {
            buttons += `<button class="page-btn" disabled>...</button>`;
        }
    }
    
    buttons += `<button class="page-btn" ${paginated.page === paginated.totalPages ? 'disabled' : ''} onclick="changePage(${paginated.page + 1})"><i class="fas fa-chevron-right"></i></button>`;
    paginationButtons.innerHTML = buttons;
}

function changePage(page) {
    currentPage = page;
    renderTable();
}

function changePerPage() {
    perPage = parseInt(document.getElementById('perPage').value);
    currentPage = 1;
    renderTable();
}

function openCreateModal() {
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Ajouter une catégorie';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    
    const colorInput = document.getElementById('color');
    if (colorInput) {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        colorInput.value = randomColor;
    }
    
    document.getElementById('categoryModal').classList.add('active');
}

function closeModal() {
    document.getElementById('categoryModal').classList.remove('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

function saveCategory() {
    const categoryData = {
        id: document.getElementById('categoryId')?.value || Date.now().toString(),
        name: document.getElementById('name')?.value,
        description: document.getElementById('description')?.value || '',
        color: document.getElementById('color')?.value || '#3498db',
        updatedAt: new Date().toISOString()
    };
    
    if (!validateCategory(categoryData)) return;
    
    if (document.getElementById('categoryId')?.value) {
        const index = categories.findIndex(c => c.id === categoryData.id);
        if (index !== -1) {
            categories[index] = { ...categories[index], ...categoryData };
        }
    } else {
        categoryData.bookCount = 0;
        categoryData.createdAt = new Date().toISOString().split('T')[0];
        categories.push(categoryData);
    }
    
    localStorage.setItem('categories', JSON.stringify(categories));
    closeModal();
    renderTable();
    Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: document.getElementById('categoryId')?.value ? 'Catégorie modifiée' : 'Catégorie ajoutée',
        timer: 2000,
        showConfirmButton: false
    });
}

function validateCategory(category) {
    if (!category.name || category.name.trim() === '') {
        Swal.fire('Erreur', 'Le nom est requis', 'error');
        return false;
    }
    return true;
}

function editCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier la catégorie';
    document.getElementById('categoryId').value = cat.id;
    document.getElementById('name').value = cat.name;
    document.getElementById('description').value = cat.description || '';
    document.getElementById('color').value = cat.color || '#3498db';
    document.getElementById('categoryModal').classList.add('active');
}

// ===== FONCTION D'EXPORT PDF POUR UNE CATÉGORIE =====
function exportCategoryToPDF(category) {
    if (!category) return;
    
    // Récupérer les livres de cette catégorie
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const categoryBooks = books.filter(b => b.category === category.id);
    
    // Préparer la liste des livres
    const booksList = categoryBooks.length > 0 
        ? categoryBooks.map(b => `- ${b.title} (${b.author})`).join('\n') 
        : 'Aucun livre dans cette catégorie';
    
    // Préparer les données formatées pour le PDF
    const categoryData = {
        'Nom de la catégorie': category.name,
        'Description': category.description || 'Non renseignée',
        'Couleur': category.color,
        'Date de création': formatDate(category.createdAt),
        'Nombre de livres': categoryBooks.length,
        'Livres dans cette catégorie': booksList
    };
    
    // Appeler la fonction d'export du fichier export.js
    if (typeof exportSingleToPDF === 'function') {
        exportSingleToPDF(categoryData, 'categorie', `Détails - ${category.name}`);
    } else {
        console.error('Fonction exportSingleToPDF non trouvée');
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'La fonction d\'export PDF n\'est pas disponible'
        });
    }
}

// ===== VUE DÉTAILLÉE AVEC BOUTON PDF =====
function viewCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    
    // Récupérer les livres de cette catégorie
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const categoryBooks = books.filter(b => b.category === id);
    
    // Créer la liste des livres
    const booksList = categoryBooks.length > 0 
        ? categoryBooks.map(b => `<li style="text-align: left; margin-bottom: 5px;">📚 ${b.title} - <em>${b.author}</em></li>`).join('') 
        : '<p style="color: #7f8c8d;">Aucun livre dans cette catégorie</p>';
    
    const categoryImage = categoryImages[cat.id] || categoryImages.default;
    
    Swal.fire({
        title: 'Détails de la catégorie',
        html: `
            <div style="text-align: center;">
                <img src="${categoryImage}" alt="${cat.name}" 
                     style="width: 120px; height: 120px; border-radius: 10px; margin-bottom: 15px; object-fit: cover; border: 3px solid ${cat.color};">
                <h3 style="color: #2c3e50; margin-bottom: 15px;">${cat.name}</h3>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: left;">
                    <p style="margin-bottom: 8px;"><strong style="color: #3498db;">Description :</strong></p>
                    <p style="color: #34495e; line-height: 1.5;">${cat.description || 'Aucune description'}</p>
                </div>
                
                <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: ${cat.color};">${categoryBooks.length}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">Livres</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: ${cat.color};">${formatDate(cat.createdAt)}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">Date création</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="width: 30px; height: 30px; background: ${cat.color}; border-radius: 5px; margin: 0 auto;"></div>
                        <div style="font-size: 12px; color: #7f8c8d;">Couleur</div>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: left;">
                    <p style="margin-bottom: 8px;"><strong style="color: #3498db;">Livres dans cette catégorie :</strong></p>
                    <ul style="list-style: none; padding-left: 0;">
                        ${booksList}
                    </ul>
                </div>
            </div>
        `,
        icon: 'info',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: '<i class="fas fa-file-pdf"></i> Exporter PDF',
        cancelButtonText: 'Fermer',
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#3498db',
        width: '600px',
        preConfirm: () => {
            exportCategoryToPDF(cat);
        }
    });
}

// ===== EXPORT CSV (LISTE COMPLÈTE) =====
function exportToCSV() {
    const exportData = categories.map(cat => {
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const bookCount = books.filter(b => b.category === cat.id).length;
        
        return {
            'Nom': cat.name,
            'Description': cat.description || '',
            'Nombre de livres': bookCount,
            'Couleur': cat.color,
            'Date de création': formatDate(cat.createdAt)
        };
    });
    
    if (typeof window.exportToCSV === 'function') {
        window.exportToCSV(
            exportData, 
            'categories', 
            ['Nom', 'Description', 'Nombre de livres', 'Couleur', 'Date de création']
        );
    } else {
        console.log('Données à exporter:', exportData);
        Swal.fire({
            icon: 'warning',
            title: 'Export CSV',
            text: 'Fonction d\'export non disponible'
        });
    }
}

// ===== EXPORT PDF (LISTE COMPLÈTE) =====
function exportToPDF() {
    const exportData = categories.map(cat => {
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const bookCount = books.filter(b => b.category === cat.id).length;
        
        return {
            'Nom': cat.name,
            'Description': cat.description || '',
            'Livres': bookCount,
            'Couleur': cat.color,
            'Création': formatDate(cat.createdAt)
        };
    });
    
    if (typeof window.exportToPDF === 'function') {
        window.exportToPDF(
            exportData, 
            'categories', 
            ['Nom', 'Description', 'Livres', 'Couleur', 'Création'],
            'Liste des catégories'
        );
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Export PDF',
            text: 'Fonction d\'export non disponible'
        });
    }
}

function deleteCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    
    // Vérifier si des livres utilisent cette catégorie
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const booksInCategory = books.filter(b => b.category === id);
    
    if (booksInCategory.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Suppression impossible',
            text: `${booksInCategory.length} livre(s) utilisent cette catégorie`,
            confirmButtonColor: '#3498db'
        });
        return;
    }
    
    Swal.fire({
        title: 'Confirmation',
        text: `Supprimer la catégorie "${cat.name}" ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#3498db',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            categories = categories.filter(c => c.id !== id);
            localStorage.setItem('categories', JSON.stringify(categories));
            renderTable();
            Swal.fire('Supprimé!', 'La catégorie a été supprimée.', 'success');
        }
    });
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Rendre les fonctions disponibles globalement
window.openCreateModal = openCreateModal;
window.closeModal = closeModal;
window.closeDeleteModal = closeDeleteModal;
window.saveCategory = saveCategory;
window.editCategory = editCategory;
window.viewCategory = viewCategory;
window.deleteCategory = deleteCategory;
window.changePage = changePage;
window.changePerPage = changePerPage;
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.exportCategoryToPDF = exportCategoryToPDF;
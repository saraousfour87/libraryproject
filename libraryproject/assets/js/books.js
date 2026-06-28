// books.js - Gestion des livres avec exports CSV/PDF et style détaillé

let books = [];
let categories = [];
let currentPage = 1;
let perPage = 10;
let sortField = 'title';
let sortDirection = 'asc';
let filters = { search: '', category: '', availability: '' };

// Images des livres (Picsum - 100% fiables)
const bookImages = {
    '1': 'https://picsum.photos/id/100/100/100',
    '2': 'https://picsum.photos/id/101/100/100',
    '3': 'https://picsum.photos/id/102/100/100',
    '4': 'https://picsum.photos/id/103/100/100',
    '5': 'https://picsum.photos/id/104/100/100',
    '6': 'https://picsum.photos/id/106/100/100',
    '7': 'https://picsum.photos/id/107/100/100',
    'default': 'https://picsum.photos/id/1/100/100'
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkAuth === 'function') checkAuth();
    loadBooks();
    loadCategories();
    initEventListeners();
    initModals();
    if (typeof displayUserInfo === 'function') displayUserInfo();
});

function loadBooks() {
    const storedBooks = localStorage.getItem('books');
    if (storedBooks) {
        books = JSON.parse(storedBooks);
    } else {
        books = getDemoBooks();
        localStorage.setItem('books', JSON.stringify(books));
    }
    renderTable();
}

function getDemoBooks() {
    return [
        { 
            id: '1', 
            title: 'Le Petit Prince', 
            author: 'Antoine de Saint-Exupéry', 
            isbn: '9782070612758', 
            category: '1', 
            year: 1943, 
            copies: 5, 
            available: 3, 
            createdAt: '2025-01-15',
            description: 'Le Petit Prince est une œuvre de langue française, la plus connue d\'Antoine de Saint-Exupéry.'
        },
        { 
            id: '2', 
            title: '1984', 
            author: 'George Orwell', 
            isbn: '9780451524935', 
            category: '2', 
            year: 1949, 
            copies: 3, 
            available: 1, 
            createdAt: '2025-01-20',
            description: '1984 est un roman de science-fiction dystopique.'
        },
        { 
            id: '3', 
            title: 'Les Misérables', 
            author: 'Victor Hugo', 
            isbn: '9782253096344', 
            category: '3', 
            year: 1862, 
            copies: 2, 
            available: 2, 
            createdAt: '2025-02-01',
            description: 'Les Misérables décrit la vie de pauvres gens dans Paris.'
        },
        { 
            id: '4', 
            title: 'Dune', 
            author: 'Frank Herbert', 
            isbn: '9780441013593', 
            category: '2', 
            year: 1965, 
            copies: 4, 
            available: 4, 
            createdAt: '2025-02-10',
            description: 'Dune se déroule dans un futur lointain.'
        },
        { 
            id: '5', 
            title: 'Notre-Dame de Paris', 
            author: 'Victor Hugo', 
            isbn: '9782253006572', 
            category: '3', 
            year: 1831, 
            copies: 2, 
            available: 0, 
            createdAt: '2025-02-15',
            description: 'Notre-Dame de Paris raconte l\'histoire de la bohémienne Esmeralda.'
        },
        { 
            id: '6', 
            title: 'L\'Étranger', 
            author: 'Albert Camus', 
            isbn: '9782070360024', 
            category: '3', 
            year: 1942, 
            copies: 3, 
            available: 2, 
            createdAt: '2025-03-01',
            description: 'L\'Étranger met en scène un personnage-narrateur, Meursault.'
        },
        { 
            id: '7', 
            title: 'Harry Potter', 
            author: 'J.K. Rowling', 
            isbn: '9782070541270', 
            category: '6', 
            year: 1997, 
            copies: 6, 
            available: 3, 
            createdAt: '2025-03-05',
            description: 'Harry Potter découvre qu\'il est un sorcier.'
        }
    ];
}

function loadCategories() {
    const storedCategories = localStorage.getItem('categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    } else {
        categories = [
            { id: '1', name: 'Fiction' },
            { id: '2', name: 'Science-Fiction' },
            { id: '3', name: 'Classique' },
            { id: '4', name: 'Histoire' },
            { id: '5', name: 'Poésie' },
            { id: '6', name: 'Jeunesse' }
        ];
    }
    populateCategorySelects();
}

function populateCategorySelects() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categorySelect = document.getElementById('category');
    
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="">Toutes catégories</option>';
        categories.forEach(cat => {
            categoryFilter.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
    }
    
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
        categories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
    }
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
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            filters.category = categoryFilter.value;
            currentPage = 1;
            renderTable();
        });
    }
    
    const availabilityFilter = document.getElementById('availabilityFilter');
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', () => {
            filters.availability = availabilityFilter.value;
            currentPage = 1;
            renderTable();
        });
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
    let filteredBooks = [...books];
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchLower) ||
            book.author.toLowerCase().includes(searchLower) ||
            book.isbn.includes(filters.search)
        );
    }
    
    if (filters.category) {
        filteredBooks = filteredBooks.filter(book => book.category === filters.category);
    }
    
    if (filters.availability === 'available') {
        filteredBooks = filteredBooks.filter(book => book.available > 0);
    } else if (filters.availability === 'unavailable') {
        filteredBooks = filteredBooks.filter(book => book.available === 0);
    }
    
    filteredBooks = sortData(filteredBooks, sortField, sortDirection);
    const paginated = paginateData(filteredBooks, currentPage, perPage);
    
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (paginated.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Aucun livre trouvé</td></tr>';
    } else {
        tbody.innerHTML = paginated.data.map(book => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center;">
                        <img src="${bookImages[book.id] || bookImages.default}" 
                             alt="${book.title}" 
                             style="width: 45px; height: 45px; border-radius: 5px; margin-right: 10px; object-fit: cover;">
                        ${escapeHtml(book.title)}
                    </div>
                </td>
                <td>${escapeHtml(book.author)}</td>
                <td>${getCategoryName(book.category)}</td>
                <td>${book.isbn}</td>
                <td>${book.year}</td>
                <td>${book.copies}</td>
                <td><span class="status-badge ${book.available > 0 ? 'active' : 'inactive'}">${book.available}/${book.copies}</span></td>
                <td class="table-actions">
                    <button class="btn-icon view" onclick="viewBook('${book.id}')" title="Voir détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit admin-only" onclick="editBook('${book.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete admin-only" onclick="deleteBook('${book.id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    updatePagination(paginated);
}

function getCategoryName(categoryId) {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Non catégorisé';
}

function sortData(data, field, direction) {
    return [...data].sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (field === 'year' || field === 'copies' || field === 'available') {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
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
        const start = ((paginated.page - 1) * paginated.perPage) + 1;
        const end = Math.min(start + paginated.perPage - 1, paginated.total);
        paginationInfo.textContent = `Affichage ${start}-${end} de ${paginated.total} livres`;
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
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Ajouter un livre';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    document.getElementById('bookModal').classList.add('active');
}

function closeModal() {
    document.getElementById('bookModal').classList.remove('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

function saveBook() {
    const bookData = {
        id: document.getElementById('bookId')?.value || Date.now().toString(),
        title: document.getElementById('title')?.value,
        author: document.getElementById('author')?.value,
        isbn: document.getElementById('isbn')?.value,
        category: document.getElementById('category')?.value,
        year: parseInt(document.getElementById('year')?.value),
        copies: parseInt(document.getElementById('copies')?.value),
        available: parseInt(document.getElementById('available')?.value),
        description: document.getElementById('description')?.value || '',
        updatedAt: new Date().toISOString()
    };
    
    if (!validateBook(bookData)) return;
    
    if (document.getElementById('bookId')?.value) {
        // MODIFICATION : Mettre à jour le livre existant
        const index = books.findIndex(b => b.id === bookData.id);
        if (index !== -1) {
            books[index] = { ...books[index], ...bookData };
        }
    } else {
        // AJOUT : Créer un nouveau livre
        bookData.createdAt = new Date().toISOString().split('T')[0];
        books.push(bookData);
    }
    
    localStorage.setItem('books', JSON.stringify(books));
    closeModal();
    renderTable();
    Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: document.getElementById('bookId')?.value ? 'Livre modifié' : 'Livre ajouté',
        timer: 2000,
        showConfirmButton: false
    });
}

function validateBook(book) {
    if (!book.title) { Swal.fire('Erreur', 'Titre requis', 'error'); return false; }
    if (!book.author) { Swal.fire('Erreur', 'Auteur requis', 'error'); return false; }
    if (!book.isbn) { Swal.fire('Erreur', 'ISBN requis', 'error'); return false; }
    if (!book.category) { Swal.fire('Erreur', 'Catégorie requise', 'error'); return false; }
    if (!book.year || book.year < 1800 || book.year > 2026) { 
        Swal.fire('Erreur', 'Année invalide (1800-2026)', 'error'); 
        return false; 
    }
    if (!book.copies || book.copies < 1) { 
        Swal.fire('Erreur', 'Nombre d\'exemplaires invalide', 'error'); 
        return false; 
    }
    if (book.available < 0 || book.available > book.copies) { 
        Swal.fire('Erreur', 'Nombre disponible invalide', 'error'); 
        return false; 
    }
    return true;
}

// ===== FONCTION ÉDITER CORRIGÉE =====
function editBook(id) {
    console.log('Édition du livre:', id);
    
    const book = books.find(b => b.id === id);
    if (!book) {
        console.error('Livre non trouvé');
        Swal.fire('Erreur', 'Livre non trouvé', 'error');
        return;
    }
    
    // Remplir le formulaire avec les données du livre
    document.getElementById('bookId').value = book.id;
    document.getElementById('title').value = book.title;
    document.getElementById('author').value = book.author;
    document.getElementById('isbn').value = book.isbn;
    document.getElementById('category').value = book.category;
    document.getElementById('year').value = book.year;
    document.getElementById('copies').value = book.copies;
    document.getElementById('available').value = book.available;
    if (document.getElementById('description')) {
        document.getElementById('description').value = book.description || '';
    }
    
    // Changer le titre du modal
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier le livre';
    
    // Ouvrir le modal
    document.getElementById('bookModal').classList.add('active');
    
    console.log('Formulaire rempli avec:', book);
}

function exportBookToPDF(book) {
    if (!book) return;
    
    const bookData = {
        'Titre': book.title,
        'Auteur': book.author,
        'ISBN': book.isbn,
        'Catégorie': getCategoryName(book.category),
        'Année de publication': book.year,
        'Nombre d\'exemplaires': book.copies,
        'Exemplaires disponibles': book.available,
        'Date d\'ajout': formatDate(book.createdAt),
        'Description': book.description || 'Aucune description'
    };
    
    if (typeof exportSingleToPDF === 'function') {
        exportSingleToPDF(bookData, 'livre', `Détails - ${book.title}`);
    } else {
        console.error('Fonction exportSingleToPDF non trouvée');
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'La fonction d\'export PDF n\'est pas disponible'
        });
    }
}

function viewBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    const bookImage = bookImages[book.id] || bookImages.default;
    const categoryName = getCategoryName(book.category);
    
    Swal.fire({
        title: 'Détails du livre',
        html: `
            <div style="text-align: center; padding: 10px;">
                <div style="position: relative; display: inline-block; margin-bottom: 20px;">
                    <div style="position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; background: linear-gradient(135deg, #3498db, #2ecc71); border-radius: 50%; opacity: 0.3; filter: blur(5px);"></div>
                    <img src="${bookImage}" alt="${book.title}" 
                         style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 10px 25px rgba(52,152,219,0.3); position: relative; z-index: 1;">
                </div>
                
                <h2 style="color: #2c3e50; margin-bottom: 5px; font-size: 28px;">${book.title}</h2>
                <p style="color: #7f8c8d; margin-bottom: 20px; font-size: 16px;">par <strong>${book.author}</strong></p>
                
                <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
                    <span style="background: #3498db; color: white; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 500;">
                        <i class="fas fa-calendar" style="margin-right: 5px;"></i> ${book.year}
                    </span>
                    <span style="background: ${book.available > 0 ? '#2ecc71' : '#e74c3c'}; color: white; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 500;">
                        <i class="fas fa-book-open" style="margin-right: 5px;"></i> ${book.available}/${book.copies} disponibles
                    </span>
                    <span style="background: #f39c12; color: white; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 500;">
                        <i class="fas fa-tag" style="margin-right: 5px;"></i> ${categoryName}
                    </span>
                </div>
                
                <div style="background: linear-gradient(135deg, #f8f9fa, #ffffff); border-radius: 20px; padding: 25px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
                        <div style="text-align: left;">
                            <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">ISBN</p>
                            <p style="color: #2c3e50; font-size: 16px; font-weight: 600;">${book.isbn}</p>
                        </div>
                        <div style="text-align: left;">
                            <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">Date d'ajout</p>
                            <p style="color: #2c3e50; font-size: 16px; font-weight: 600;">${formatDate(book.createdAt)}</p>
                        </div>
                    </div>
                    
                    <div style="text-align: left; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eef2f6;">
                        <p style="color: #2c3e50; font-size: 14px; line-height: 1.6;">${book.description || 'Aucune description disponible pour ce livre.'}</p>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-around; background: #f8f9fa; border-radius: 15px; padding: 15px; margin-bottom: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">${book.copies}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">Exemplaires</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">${book.available}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">Disponibles</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${book.copies - book.available}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">Empruntés</div>
                    </div>
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
        width: '700px',
        background: 'white',
        backdrop: 'rgba(0,0,0,0.6)',
        preConfirm: () => {
            exportBookToPDF(book);
        }
    });
}

function exportToCSV() {
    const exportData = books.map(book => ({
        Titre: book.title,
        Auteur: book.author,
        ISBN: book.isbn,
        Catégorie: getCategoryName(book.category),
        Année: book.year,
        Exemplaires: book.copies,
        Disponibles: book.available,
        Description: book.description || ''
    }));
    
    if (typeof window.exportToCSV === 'function') {
        window.exportToCSV(
            exportData, 
            'livres', 
            ['Titre', 'Auteur', 'ISBN', 'Catégorie', 'Année', 'Exemplaires', 'Disponibles', 'Description']
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

function exportToPDF() {
    const exportData = books.map(book => ({
        Titre: book.title,
        Auteur: book.author,
        ISBN: book.isbn,
        Catégorie: getCategoryName(book.category),
        Année: book.year,
        Exemplaires: book.copies,
        Disponibles: book.available
    }));
    
    if (typeof window.exportToPDF === 'function') {
        window.exportToPDF(
            exportData, 
            'livres', 
            ['Titre', 'Auteur', 'ISBN', 'Catégorie', 'Année', 'Exemplaires', 'Disponibles'],
            'Liste des livres'
        );
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Export PDF',
            text: 'Fonction d\'export non disponible'
        });
    }
}

function deleteBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    Swal.fire({
        title: 'Confirmation',
        text: `Supprimer "${book.title}" ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#3498db',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        width: '500px',
        background: 'white',
        backdrop: 'rgba(0,0,0,0.6)'
    }).then((result) => {
        if (result.isConfirmed) {
            books = books.filter(b => b.id !== id);
            localStorage.setItem('books', JSON.stringify(books));
            renderTable();
            Swal.fire({
                icon: 'success',
                title: 'Supprimé!',
                text: 'Le livre a été supprimé.',
                timer: 2000,
                showConfirmButton: false
            });
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
window.saveBook = saveBook;
window.editBook = editBook;
window.viewBook = viewBook;
window.deleteBook = deleteBook;
window.changePage = changePage;
window.changePerPage = changePerPage;
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.exportBookToPDF = exportBookToPDF;
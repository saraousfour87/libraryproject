// authors.js - Gestion des auteurs avec style de détails

let authors = [];
let currentPage = 1;
let perPage = 10;
let sortField = 'name';
let sortDirection = 'asc';
let filters = { search: '', nationality: '', century: '' };

// Images UI Avatars pour les auteurs
const authorImages = {
    '1': 'https://ui-avatars.com/api/?name=Saint-Exupéry&background=2c3e50&color=fff&size=200',
    '2': 'https://ui-avatars.com/api/?name=Orwell&background=34495e&color=fff&size=200',
    '3': 'https://ui-avatars.com/api/?name=Hugo&background=8B4513&color=fff&size=200',
    '4': 'https://ui-avatars.com/api/?name=Camus&background=1C1C1C&color=fff&size=200',
    '5': 'https://ui-avatars.com/api/?name=Rowling&background=4A148C&color=fff&size=200',
    '6': 'https://ui-avatars.com/api/?name=Herbert&background=DAA520&color=fff&size=200',
    'default': 'https://ui-avatars.com/api/?name=Auteur&background=95a5a6&color=fff&size=200'
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkAuth === 'function') checkAuth();
    loadAuthors();
    initEventListeners();
    initModals();
    if (typeof displayUserInfo === 'function') displayUserInfo();
});

function loadAuthors() {
    const storedAuthors = localStorage.getItem('authors');
    if (storedAuthors) {
        authors = JSON.parse(storedAuthors);
    } else {
        authors = getDemoAuthors();
        localStorage.setItem('authors', JSON.stringify(authors));
    }
    renderTable();
}

function getDemoAuthors() {
    return [
        { 
            id: '1', 
            name: 'Antoine de Saint-Exupéry', 
            birthDate: '1900-06-29', 
            deathDate: '1944-07-31', 
            nationality: 'Française', 
            biography: 'Écrivain, poète et aviateur français. Auteur du "Petit Prince".',
            bookCount: 15,
            notableWorks: 'Le Petit Prince, Vol de nuit',
            awards: 'Grand Prix du roman de l\'Académie française'
        },
        { 
            id: '2', 
            name: 'George Orwell', 
            birthDate: '1903-06-25', 
            deathDate: '1950-01-21', 
            nationality: 'Britannique', 
            biography: 'Écrivain britannique, auteur de "1984".',
            bookCount: 22,
            notableWorks: '1984, La Ferme des animaux',
            awards: 'Prix Prometheus'
        },
        { 
            id: '3', 
            name: 'Victor Hugo', 
            birthDate: '1802-02-26', 
            deathDate: '1885-05-22', 
            nationality: 'Française', 
            biography: 'Poète, dramaturge et romancier français.',
            bookCount: 45,
            notableWorks: 'Les Misérables, Notre-Dame de Paris',
            awards: 'Membre de l\'Académie française'
        },
        { 
            id: '4', 
            name: 'Albert Camus', 
            birthDate: '1913-11-07', 
            deathDate: '1960-01-04', 
            nationality: 'Française', 
            biography: 'Écrivain, philosophe et journaliste.',
            bookCount: 18,
            notableWorks: 'L\'Étranger, La Peste',
            awards: 'Prix Nobel de littérature'
        },
        { 
            id: '5', 
            name: 'J.K. Rowling', 
            birthDate: '1965-07-31', 
            deathDate: null, 
            nationality: 'Britannique', 
            biography: 'Romancière britannique, auteure de Harry Potter.',
            bookCount: 32,
            notableWorks: 'Harry Potter',
            awards: 'Prix Hugo'
        },
        { 
            id: '6', 
            name: 'Frank Herbert', 
            birthDate: '1920-10-08', 
            deathDate: '1986-02-11', 
            nationality: 'Américaine', 
            biography: 'Écrivain de science-fiction américain.',
            bookCount: 28,
            notableWorks: 'Dune',
            awards: 'Prix Hugo, Prix Nebula'
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
    
    const nationalityFilter = document.getElementById('nationalityFilter');
    if (nationalityFilter) {
        nationalityFilter.innerHTML = '<option value="">Toutes nationalités</option>' +
            '<option value="Française">Française</option>' +
            '<option value="Britannique">Britannique</option>' +
            '<option value="Américaine">Américaine</option>';
            
        nationalityFilter.addEventListener('change', () => {
            filters.nationality = nationalityFilter.value;
            currentPage = 1;
            renderTable();
        });
    }
    
    const centuryFilter = document.getElementById('centuryFilter');
    if (centuryFilter) {
        centuryFilter.innerHTML = '<option value="">Tous les siècles</option>' +
            '<option value="19">XIXe siècle</option>' +
            '<option value="20">XXe siècle</option>' +
            '<option value="21">XXIe siècle</option>';
            
        centuryFilter.addEventListener('change', () => {
            filters.century = centuryFilter.value;
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
    let filteredAuthors = [...authors];
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredAuthors = filteredAuthors.filter(author => 
            author.name.toLowerCase().includes(searchLower) ||
            (author.biography && author.biography.toLowerCase().includes(searchLower))
        );
    }
    
    if (filters.nationality) {
        filteredAuthors = filteredAuthors.filter(author => 
            author.nationality === filters.nationality
        );
    }
    
    if (filters.century) {
        filteredAuthors = filteredAuthors.filter(author => {
            if (!author.birthDate) return false;
            const year = new Date(author.birthDate).getFullYear();
            const century = Math.floor(year / 100) + 1;
            return century == filters.century;
        });
    }
    
    filteredAuthors = sortAuthors(filteredAuthors, sortField, sortDirection);
    const paginated = paginateData(filteredAuthors, currentPage, perPage);
    
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (paginated.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun auteur trouvé</td></tr>';
    } else {
        tbody.innerHTML = paginated.data.map(author => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center;">
                        <img src="${authorImages[author.id] || authorImages.default}" 
                             alt="${author.name}"
                             style="width: 45px; height: 45px; border-radius: 50%; margin-right: 10px; object-fit: cover; border: 2px solid #3498db;">
                        ${escapeHtml(author.name)}
                    </div>
                </td>
                <td>${formatDate(author.birthDate)}</td>
                <td>${escapeHtml(author.nationality || '')}</td>
                <td>${escapeHtml((author.biography || '').substring(0, 50))}...</td>
                <td>${author.bookCount || 0}</td>
                <td class="table-actions">
                    <button class="btn-icon view" onclick="viewAuthor('${author.id}')" title="Voir détails">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit admin-only" onclick="editAuthor('${author.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete admin-only" onclick="deleteAuthor('${author.id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    updatePagination(paginated);
}

function sortAuthors(data, field, direction) {
    return [...data].sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (field === 'birthDate') {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }
        
        if (field === 'bookCount') {
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
        if (paginated.total === 0) {
            paginationInfo.textContent = 'Aucun auteur';
        } else {
            const start = ((paginated.page - 1) * paginated.perPage) + 1;
            const end = Math.min(start + paginated.perPage - 1, paginated.total);
            paginationInfo.textContent = `Affichage ${start}-${end} de ${paginated.total} auteurs`;
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
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Ajouter un auteur';
    document.getElementById('authorForm').reset();
    document.getElementById('authorId').value = '';
    document.getElementById('authorModal').classList.add('active');
}

function closeModal() {
    document.getElementById('authorModal').classList.remove('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

function saveAuthor() {
    const authorData = {
        id: document.getElementById('authorId')?.value || Date.now().toString(),
        name: document.getElementById('name')?.value,
        birthDate: document.getElementById('birthDate')?.value,
        deathDate: document.getElementById('deathDate')?.value || null,
        nationality: document.getElementById('nationality')?.value,
        biography: document.getElementById('biography')?.value || '',
        notableWorks: document.getElementById('notableWorks')?.value || '',
        awards: document.getElementById('awards')?.value || '',
        bookCount: 0,
        updatedAt: new Date().toISOString()
    };
    
    if (!validateAuthor(authorData)) return;
    
    if (document.getElementById('authorId')?.value) {
        // MODIFICATION : Mettre à jour l'auteur existant
        const index = authors.findIndex(a => a.id === authorData.id);
        if (index !== -1) {
            authors[index] = { ...authors[index], ...authorData };
        }
    } else {
        // AJOUT : Créer un nouvel auteur
        authors.push(authorData);
    }
    
    localStorage.setItem('authors', JSON.stringify(authors));
    closeModal();
    renderTable();
    Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: document.getElementById('authorId')?.value ? 'Auteur modifié' : 'Auteur ajouté',
        timer: 2000,
        showConfirmButton: false
    });
}

function validateAuthor(author) {
    if (!author.name) { Swal.fire('Erreur', 'Nom requis', 'error'); return false; }
    if (!author.birthDate) { Swal.fire('Erreur', 'Date de naissance requise', 'error'); return false; }
    if (!author.nationality) { Swal.fire('Erreur', 'Nationalité requise', 'error'); return false; }
    return true;
}

// ===== FONCTION ÉDITER CORRIGÉE =====
function editAuthor(id) {
    console.log('Édition de l\'auteur:', id);
    
    const author = authors.find(a => a.id === id);
    if (!author) {
        console.error('Auteur non trouvé');
        Swal.fire('Erreur', 'Auteur non trouvé', 'error');
        return;
    }
    
    // Remplir le formulaire avec les données de l'auteur
    document.getElementById('authorId').value = author.id;
    document.getElementById('name').value = author.name;
    document.getElementById('birthDate').value = author.birthDate;
    document.getElementById('deathDate').value = author.deathDate || '';
    document.getElementById('nationality').value = author.nationality;
    document.getElementById('biography').value = author.biography || '';
    if (document.getElementById('notableWorks')) {
        document.getElementById('notableWorks').value = author.notableWorks || '';
    }
    if (document.getElementById('awards')) {
        document.getElementById('awards').value = author.awards || '';
    }
    
    // Changer le titre du modal
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier l\'auteur';
    
    // Ouvrir le modal
    document.getElementById('authorModal').classList.add('active');
    
    console.log('Formulaire rempli avec:', author);
}

function exportAuthorToPDF(author) {
    if (!author) return;
    
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const authorBooks = books.filter(b => b.author === author.name);
    
    const booksList = authorBooks.length > 0 
        ? authorBooks.map(b => `- ${b.title} (${b.year})`).join('\n') 
        : 'Aucun livre trouvé pour cet auteur';
    
    const authorData = {
        'Nom': author.name,
        'Date de naissance': formatDate(author.birthDate),
        'Date de décès': author.deathDate ? formatDate(author.deathDate) : 'N/A',
        'Nationalité': author.nationality,
        'Biographie': author.biography || 'Non renseignée',
        'Œuvres notables': author.notableWorks || 'Non renseigné',
        'Prix et distinctions': author.awards || 'Non renseigné',
        'Nombre de livres': author.bookCount || authorBooks.length,
        'Livres dans la bibliothèque': booksList
    };
    
    if (typeof exportSingleToPDF === 'function') {
        exportSingleToPDF(authorData, 'auteur', `Détails - ${author.name}`);
    } else {
        console.error('Fonction exportSingleToPDF non trouvée');
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'La fonction d\'export PDF n\'est pas disponible'
        });
    }
}

function viewAuthor(id) {
    const author = authors.find(a => a.id === id);
    if (!author) return;
    
    const authorImage = authorImages[author.id] || authorImages.default;
    
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const authorBooks = books.filter(b => b.author === author.name);
    
    const booksList = authorBooks.length > 0 
        ? authorBooks.map(b => `<li style="text-align: left; margin-bottom: 8px; padding: 8px; background: #f8f9fa; border-radius: 8px;">
            <strong>${b.title}</strong> (${b.year}) - ${b.available}/${b.copies} disponibles
          </li>`).join('') 
        : '<p style="color: #7f8c8d; text-align: center;">Aucun livre trouvé pour cet auteur</p>';
    
    Swal.fire({
        title: 'Détails de l\'auteur',
        html: `
            <div style="text-align: center; padding: 10px;">
                <div style="position: relative; display: inline-block; margin-bottom: 20px;">
                    <div style="position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; background: linear-gradient(135deg, #3498db, #9b59b6); border-radius: 50%; opacity: 0.3; filter: blur(5px);"></div>
                    <img src="${authorImage}" alt="${author.name}" 
                         style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 10px 25px rgba(52,152,219,0.3); position: relative; z-index: 1;">
                </div>
                
                <h2 style="color: #2c3e50; margin-bottom: 5px; font-size: 28px;">${author.name}</h2>
                
                <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
                    <span style="background: #3498db; color: white; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 500;">
                        <i class="fas fa-calendar" style="margin-right: 5px;"></i> Naissance: ${formatDate(author.birthDate)}
                    </span>
                    ${author.deathDate ? `
                    <span style="background: #e74c3c; color: white; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 500;">
                        <i class="fas fa-calendar-times" style="margin-right: 5px;"></i> Décès: ${formatDate(author.deathDate)}
                    </span>` : ''}
                    <span style="background: #f39c12; color: white; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 500;">
                        <i class="fas fa-globe" style="margin-right: 5px;"></i> ${author.nationality}
                    </span>
                </div>
                
                <div style="background: linear-gradient(135deg, #f8f9fa, #ffffff); border-radius: 20px; padding: 25px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                    
                    <div style="text-align: left; margin-bottom: 20px;">
                        <p style="color: #2c3e50; font-size: 14px; line-height: 1.6; font-style: italic;">
                            "${author.biography}"
                        </p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px;">
                        <div style="text-align: left;">
                            <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">Œuvres notables</p>
                            <p style="color: #2c3e50; font-size: 14px; font-weight: 500;">${author.notableWorks || 'Non renseigné'}</p>
                        </div>
                        <div style="text-align: left;">
                            <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">Prix et distinctions</p>
                            <p style="color: #2c3e50; font-size: 14px; font-weight: 500;">${author.awards || 'Non renseigné'}</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 15px; padding: 20px; margin-bottom: 10px;">
                    <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px; text-align: left;">
                        <i class="fas fa-book" style="color: #3498db; margin-right: 8px;"></i>
                        Livres de cet auteur (${authorBooks.length})
                    </h3>
                    <div style="max-height: 200px; overflow-y: auto; padding-right: 5px;">
                        <ul style="list-style: none; padding-left: 0;">
                            ${booksList}
                        </ul>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-around; background: linear-gradient(135deg, #3498db, #2980b9); border-radius: 15px; padding: 15px; color: white;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${author.bookCount || authorBooks.length}</div>
                        <div style="font-size: 12px; opacity: 0.9;">Livres</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${authorBooks.reduce((sum, b) => sum + (b.copies || 0), 0)}</div>
                        <div style="font-size: 12px; opacity: 0.9;">Exemplaires</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold;">${authorBooks.reduce((sum, b) => sum + (b.available || 0), 0)}</div>
                        <div style="font-size: 12px; opacity: 0.9;">Disponibles</div>
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
            exportAuthorToPDF(author);
        }
    });
}

function exportToCSV() {
    const exportData = authors.map(author => ({
        Nom: author.name,
        'Date naissance': formatDate(author.birthDate),
        'Date décès': author.deathDate ? formatDate(author.deathDate) : '',
        Nationalité: author.nationality,
        Biographie: (author.biography || '').substring(0, 100),
        'Œuvres notables': author.notableWorks || '',
        'Prix': author.awards || '',
        Livres: author.bookCount || 0
    }));
    
    if (typeof window.exportToCSV === 'function') {
        window.exportToCSV(
            exportData, 
            'auteurs', 
            ['Nom', 'Date naissance', 'Date décès', 'Nationalité', 'Biographie', 'Œuvres notables', 'Prix', 'Livres']
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
    const exportData = authors.map(author => ({
        Nom: author.name,
        'Naissance': formatDate(author.birthDate),
        'Décès': author.deathDate ? formatDate(author.deathDate) : '',
        Nationalité: author.nationality,
        Livres: author.bookCount || 0
    }));
    
    if (typeof window.exportToPDF === 'function') {
        window.exportToPDF(
            exportData, 
            'auteurs', 
            ['Nom', 'Naissance', 'Décès', 'Nationalité', 'Livres'],
            'Liste des auteurs'
        );
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Export PDF',
            text: 'Fonction d\'export non disponible'
        });
    }
}

function deleteAuthor(id) {
    const author = authors.find(a => a.id === id);
    if (!author) return;
    
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const authorBooks = books.filter(b => b.author === author.name);
    
    if (authorBooks.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Suppression impossible',
            text: `${authorBooks.length} livre(s) sont associés à cet auteur`,
            confirmButtonColor: '#3498db'
        });
        return;
    }
    
    Swal.fire({
        title: 'Confirmation',
        text: `Supprimer "${author.name}" ?`,
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
            authors = authors.filter(a => a.id !== id);
            localStorage.setItem('authors', JSON.stringify(authors));
            renderTable();
            Swal.fire({
                icon: 'success',
                title: 'Supprimé!',
                text: 'L\'auteur a été supprimé.',
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
window.saveAuthor = saveAuthor;
window.editAuthor = editAuthor;
window.viewAuthor = viewAuthor;
window.deleteAuthor = deleteAuthor;
window.changePage = changePage;
window.changePerPage = changePerPage;
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.exportAuthorToPDF = exportAuthorToPDF;
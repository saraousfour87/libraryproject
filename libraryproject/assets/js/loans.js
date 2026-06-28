// loans.js - Gestion des emprunts avec style de détails

let loans = [];
let books = [];
let members = [];
let currentPage = 1;
let perPage = 10;
let sortField = 'loanDate';
let sortDirection = 'desc';
let filters = { search: '', status: '', period: '' };

// Images pour les livres et membres
const loanImages = {
    books: {
        '1': 'https://picsum.photos/id/100/100/100',
        '2': 'https://picsum.photos/id/101/100/100',
        '3': 'https://picsum.photos/id/102/100/100',
        '4': 'https://picsum.photos/id/103/100/100',
        '5': 'https://picsum.photos/id/104/100/100',
        '6': 'https://picsum.photos/id/106/100/100',
        '7': 'https://picsum.photos/id/107/100/100',
        'default': 'https://picsum.photos/id/1/100/100'
    },
    members: {
        '1': 'https://ui-avatars.com/api/?name=Jean+Dupont&background=3498db&color=fff&size=100',
        '2': 'https://ui-avatars.com/api/?name=Marie+Martin&background=e74c3c&color=fff&size=100',
        '3': 'https://ui-avatars.com/api/?name=Pierre+Durand&background=2ecc71&color=fff&size=100',
        '4': 'https://ui-avatars.com/api/?name=Sophie+Bernard&background=9b59b6&color=fff&size=100',
        '5': 'https://ui-avatars.com/api/?name=Lucas+Petit&background=f39c12&color=fff&size=100',
        'default': 'https://ui-avatars.com/api/?name=?&background=95a5a6&color=fff&size=100'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('loans.js chargé');
    
    if (typeof checkAuth === 'function') checkAuth();
    
    loadData();
    initEventListeners();
    initModals();
    populateSelects();
    
    if (typeof displayUserInfo === 'function') displayUserInfo();
    
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
            document.getElementById('mainContent').classList.toggle('expanded');
        });
    }
});

function loadData() {
    // Charger les emprunts
    const storedLoans = localStorage.getItem('loans');
    if (storedLoans) {
        loans = JSON.parse(storedLoans);
        console.log('Emprunts chargés:', loans.length);
    } else {
        loans = getDemoLoans();
        localStorage.setItem('loans', JSON.stringify(loans));
        console.log('Emprunts de démonstration créés:', loans.length);
    }
    
    // Charger les livres
    const storedBooks = localStorage.getItem('books');
    if (storedBooks) {
        books = JSON.parse(storedBooks);
    }
    
    // Charger les membres
    const storedMembers = localStorage.getItem('members');
    if (storedMembers) {
        members = JSON.parse(storedMembers);
    }
    
    renderTable();
}

function getDemoLoans() {
    const today = new Date();
    
    // Fonction pour générer une date
    const getDate = (daysOffset) => {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        return date.toISOString().split('T')[0];
    };
    
    return [
        { 
            id: '1', 
            bookId: '1', 
            bookTitle: 'Le Petit Prince', 
            memberId: '1', 
            memberName: 'Jean Dupont', 
            loanDate: getDate(-5), 
            dueDate: getDate(9), 
            returnDate: null, 
            status: 'en cours', 
            notes: 'Premier emprunt pour ce membre. Livre en bon état.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '2', 
            bookId: '2', 
            bookTitle: '1984', 
            memberId: '2', 
            memberName: 'Marie Martin', 
            loanDate: getDate(-10), 
            dueDate: getDate(4), 
            returnDate: null, 
            status: 'en cours', 
            notes: 'À renouveler peut-être. Membre intéressé par la dystopie.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '3', 
            bookId: '7', 
            bookTitle: 'Harry Potter', 
            memberId: '4', 
            memberName: 'Sophie Bernard', 
            loanDate: getDate(-3), 
            dueDate: getDate(11), 
            returnDate: null, 
            status: 'en cours', 
            notes: 'Pour son enfant. Très demandé.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '4', 
            bookId: '4', 
            bookTitle: 'Dune', 
            memberId: '5', 
            memberName: 'Lucas Petit', 
            loanDate: getDate(-7), 
            dueDate: getDate(7), 
            returnDate: null, 
            status: 'en cours', 
            notes: 'Fan de science-fiction. A déjà lu toute la série.',
            renewed: true,
            renewalCount: 1
        },
        { 
            id: '5', 
            bookId: '6', 
            bookTitle: 'L\'Étranger', 
            memberId: '3', 
            memberName: 'Pierre Durand', 
            loanDate: getDate(-12), 
            dueDate: getDate(-2), 
            returnDate: null, 
            status: 'retard', 
            notes: 'Étudiant en philosophie. Relance effectuée 2 fois.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '6', 
            bookId: '3', 
            bookTitle: 'Les Misérables', 
            memberId: '1', 
            memberName: 'Jean Dupont', 
            loanDate: getDate(-25), 
            dueDate: getDate(-11), 
            returnDate: null, 
            status: 'retard', 
            notes: 'Relance effectuée 3 fois. Risque de suspension.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '7', 
            bookId: '5', 
            bookTitle: 'Notre-Dame de Paris', 
            memberId: '2', 
            memberName: 'Marie Martin', 
            loanDate: getDate(-30), 
            dueDate: getDate(-16), 
            returnDate: null, 
            status: 'retard', 
            notes: 'Appel sans réponse. Dernier avertissement.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '8', 
            bookId: '1', 
            bookTitle: 'Le Petit Prince', 
            memberId: '4', 
            memberName: 'Sophie Bernard', 
            loanDate: '2025-01-10', 
            dueDate: '2025-01-24', 
            returnDate: '2025-01-22', 
            status: 'terminé', 
            notes: 'Retourné en bon état. Membre satisfaite.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '9', 
            bookId: '2', 
            bookTitle: '1984', 
            memberId: '5', 
            memberName: 'Lucas Petit', 
            loanDate: '2025-01-15', 
            dueDate: '2025-01-29', 
            returnDate: '2025-01-28', 
            status: 'terminé', 
            notes: 'Retourné avant la date. Membre ponctuel.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '10', 
            bookId: '3', 
            bookTitle: 'Les Misérables', 
            memberId: '3', 
            memberName: 'Pierre Durand', 
            loanDate: '2025-02-01', 
            dueDate: '2025-02-15', 
            returnDate: '2025-02-14', 
            status: 'terminé', 
            notes: 'Retourné avec quelques pages cornées.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '11', 
            bookId: '4', 
            bookTitle: 'Dune', 
            memberId: '1', 
            memberName: 'Jean Dupont', 
            loanDate: '2025-02-05', 
            dueDate: '2025-02-19', 
            returnDate: '2025-02-20', 
            status: 'terminé', 
            notes: 'Retourné avec 1 jour de retard. Pénalité appliquée.',
            renewed: false,
            renewalCount: 0
        },
        { 
            id: '12', 
            bookId: '7', 
            bookTitle: 'Harry Potter', 
            memberId: '2', 
            memberName: 'Marie Martin', 
            loanDate: '2025-02-10', 
            dueDate: '2025-02-24', 
            returnDate: '2025-02-23', 
            status: 'terminé', 
            notes: 'Retourné en excellent état.',
            renewed: false,
            renewalCount: 0
        }
    ];
}

function populateSelects() {
    const bookSelect = document.getElementById('bookId');
    const memberSelect = document.getElementById('memberId');
    
    if (bookSelect) {
        bookSelect.innerHTML = '<option value="">Sélectionner un livre</option>';
        books.forEach(book => {
            if (book.available > 0) {
                bookSelect.innerHTML += `<option value="${book.id}">${escapeHtml(book.title)} (${book.available} dispo)</option>`;
            }
        });
    }
    
    if (memberSelect) {
        memberSelect.innerHTML = '<option value="">Sélectionner un membre</option>';
        members.forEach(member => {
            if (member.status === 'actif') {
                memberSelect.innerHTML += `<option value="${member.id}">${escapeHtml(member.name)}</option>`;
            }
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
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.innerHTML = '<option value="">Tous les statuts</option>' +
            '<option value="en cours">En cours</option>' +
            '<option value="retard">En retard</option>' +
            '<option value="terminé">Terminés</option>';
            
        statusFilter.addEventListener('change', () => {
            filters.status = statusFilter.value;
            currentPage = 1;
            renderTable();
        });
    }
    
    const periodFilter = document.getElementById('periodFilter');
    if (periodFilter) {
        periodFilter.innerHTML = '<option value="">Toutes périodes</option>' +
            '<option value="today">Aujourd\'hui</option>' +
            '<option value="week">Cette semaine</option>' +
            '<option value="month">Ce mois</option>';
            
        periodFilter.addEventListener('change', () => {
            filters.period = periodFilter.value;
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
}

function initModals() {
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal();
            closeReturnModal();
            closeDeleteModal();
        });
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
                closeReturnModal();
                closeDeleteModal();
            }
        });
    });
}

function renderTable() {
    let filteredLoans = [...loans];
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLoans = filteredLoans.filter(loan => 
            (loan.bookTitle && loan.bookTitle.toLowerCase().includes(searchLower)) ||
            (loan.memberName && loan.memberName.toLowerCase().includes(searchLower))
        );
    }
    
    if (filters.status) {
        filteredLoans = filteredLoans.filter(loan => loan.status === filters.status);
    }
    
    if (filters.period) {
        const today = new Date();
        filteredLoans = filteredLoans.filter(loan => {
            const loanDate = new Date(loan.loanDate);
            if (filters.period === 'today') {
                return loanDate.toDateString() === today.toDateString();
            } else if (filters.period === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return loanDate >= weekAgo;
            } else if (filters.period === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return loanDate >= monthAgo;
            }
            return true;
        });
    }
    
    filteredLoans = sortLoans(filteredLoans, sortField, sortDirection);
    const paginated = paginateData(filteredLoans, currentPage, perPage);
    
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (paginated.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Aucun emprunt trouvé</td></tr>';
    } else {
        tbody.innerHTML = paginated.data.map(loan => {
            const isOverdue = loan.status === 'en cours' && new Date(loan.dueDate) < new Date();
            const displayStatus = isOverdue ? 'retard' : loan.status;
            const statusClass = displayStatus === 'retard' ? 'danger' : (displayStatus === 'terminé' ? 'success' : 'warning');
            const statusColor = displayStatus === 'retard' ? '#e74c3c' : (displayStatus === 'terminé' ? '#2ecc71' : '#f39c12');
            
            return `
                <tr>
                    <td>#${loan.id}</td>
                    <td>
                        <div style="display: flex; align-items: center;">
                            <img src="${loanImages.books[loan.bookId] || loanImages.books.default}" 
                                 alt="${loan.bookTitle}" 
                                 style="width: 40px; height: 40px; border-radius: 5px; margin-right: 10px; object-fit: cover;">
                            ${escapeHtml(loan.bookTitle || '')}
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center;">
                            <img src="${loanImages.members[loan.memberId] || loanImages.members.default}" 
                                 alt="${loan.memberName}" 
                                 style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px; object-fit: cover; border: 2px solid ${statusColor};">
                            ${escapeHtml(loan.memberName || '')}
                        </div>
                    </td>
                    <td>${formatDate(loan.loanDate)}</td>
                    <td>${formatDate(loan.dueDate)}</td>
                    <td>${loan.returnDate ? formatDate(loan.returnDate) : '-'}</td>
                    <td><span class="badge badge-${statusClass}" style="background: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor};">${displayStatus}</span></td>
                    <td class="table-actions">
                        ${loan.status !== 'terminé' ? 
                            `<button class="btn-icon success" onclick="returnBook('${loan.id}')" title="Retour">
                                <i class="fas fa-undo"></i>
                            </button>` : ''}
                        <button class="btn-icon view" onclick="viewLoan('${loan.id}')" title="Voir détails">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon delete admin-only" onclick="deleteLoan('${loan.id}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    updatePagination(paginated);
}

function sortLoans(data, field, direction) {
    return [...data].sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (field === 'loanDate' || field === 'dueDate' || field === 'returnDate') {
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
            paginationInfo.textContent = 'Aucun emprunt';
        } else {
            const start = ((paginated.page - 1) * paginated.perPage) + 1;
            const end = Math.min(start + paginated.perPage - 1, paginated.total);
            paginationInfo.textContent = `Affichage ${start}-${end} de ${paginated.total} emprunts`;
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
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus"></i> Nouvel emprunt';
    document.getElementById('loanForm').reset();
    document.getElementById('loanId').value = '';
    
    const today = new Date().toISOString().split('T')[0];
    const loanDate = document.getElementById('loanDate');
    if (loanDate) loanDate.value = today;
    
    const dueDate = document.getElementById('dueDate');
    if (dueDate) {
        const due = new Date();
        due.setDate(due.getDate() + 14);
        dueDate.value = due.toISOString().split('T')[0];
    }
    
    document.getElementById('loanModal').classList.add('active');
}

function closeModal() {
    document.getElementById('loanModal').classList.remove('active');
}

function closeReturnModal() {
    document.getElementById('returnModal').classList.remove('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

function updateBookAvailability() {
    const bookId = document.getElementById('bookId').value;
    const book = books.find(b => b.id === bookId);
    const availabilitySpan = document.getElementById('bookAvailability');
    if (availabilitySpan && book) {
        availabilitySpan.textContent = `Disponible: ${book.available} exemplaire(s)`;
    }
}

function saveLoan() {
    const bookId = document.getElementById('bookId')?.value;
    const memberId = document.getElementById('memberId')?.value;
    const loanDate = document.getElementById('loanDate')?.value;
    const dueDate = document.getElementById('dueDate')?.value;
    const notes = document.getElementById('notes')?.value || '';
    
    if (!bookId || !memberId || !loanDate || !dueDate) {
        Swal.fire('Erreur', 'Veuillez remplir tous les champs', 'error');
        return;
    }
    
    const book = books.find(b => b.id === bookId);
    const member = members.find(m => m.id === memberId);
    
    if (!book || !member) {
        Swal.fire('Erreur', 'Livre ou membre non trouvé', 'error');
        return;
    }
    
    if (book.available <= 0) {
        Swal.fire('Erreur', 'Ce livre n\'est pas disponible', 'error');
        return;
    }
    
    const loanData = {
        id: Date.now().toString(),
        bookId: bookId,
        bookTitle: book.title,
        memberId: memberId,
        memberName: member.name,
        loanDate: loanDate,
        dueDate: dueDate,
        returnDate: null,
        status: 'en cours',
        notes: notes,
        renewed: false,
        renewalCount: 0
    };
    
    loans.push(loanData);
    book.available = book.available - 1;
    
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('loans', JSON.stringify(loans));
    
    closeModal();
    renderTable();
    populateSelects();
    
    Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Emprunt enregistré',
        timer: 2000,
        showConfirmButton: false
    });
}

function returnBook(id) {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;
    
    document.getElementById('returnBookTitle').textContent = loan.bookTitle;
    document.getElementById('returnMemberName').textContent = loan.memberName;
    document.getElementById('returnDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('returnCondition').value = 'bon';
    document.getElementById('returnNotes').value = '';
    document.getElementById('applyPenalty').checked = false;
    
    document.getElementById('returnModal').classList.add('active');
    window.loanToReturn = id;
}

function confirmReturn() {
    const id = window.loanToReturn;
    if (!id) return;
    
    const loan = loans.find(l => l.id === id);
    if (!loan) return;
    
    const returnDate = document.getElementById('returnDate').value;
    const condition = document.getElementById('returnCondition')?.value || 'bon';
    const returnNotes = document.getElementById('returnNotes')?.value || '';
    const applyPenalty = document.getElementById('applyPenalty')?.checked || false;
    
    const dueDate = new Date(loan.dueDate);
    const actualReturnDate = new Date(returnDate);
    const daysLate = Math.max(0, Math.ceil((actualReturnDate - dueDate) / (1000 * 60 * 60 * 24)));
    
    loan.returnDate = returnDate;
    loan.status = 'terminé';
    loan.condition = condition;
    loan.returnNotes = returnNotes;
    loan.daysLate = daysLate;
    loan.penalty = applyPenalty ? daysLate * 0.5 : 0;
    
    const book = books.find(b => b.id === loan.bookId);
    if (book) {
        book.available = book.available + 1;
        localStorage.setItem('books', JSON.stringify(books));
    }
    
    localStorage.setItem('loans', JSON.stringify(loans));
    
    closeReturnModal();
    renderTable();
    populateSelects();
    
    let message = 'Retour enregistré';
    if (daysLate > 0) {
        message += `. Retard de ${daysLate} jour(s)`;
        if (applyPenalty) message += ` - Pénalité: ${(daysLate * 0.5).toFixed(2)}€`;
    }
    
    Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: message,
        timer: 2000,
        showConfirmButton: false
    });
}

// ===== FONCTION D'EXPORT PDF POUR UN EMPRUNT =====
function exportLoanToPDF(loan) {
    if (!loan) return;
    
    const isOverdue = loan.status === 'en cours' && new Date(loan.dueDate) < new Date();
    const displayStatus = isOverdue ? 'retard' : loan.status;
    
    // Calculer les jours de retard si terminé
    let daysLate = 0;
    let penalty = 0;
    if (loan.returnDate && loan.dueDate) {
        const due = new Date(loan.dueDate);
        const ret = new Date(loan.returnDate);
        daysLate = Math.max(0, Math.ceil((ret - due) / (1000 * 60 * 60 * 24)));
        penalty = daysLate * 0.5;
    }
    
    // Préparer les données formatées pour le PDF
    const loanData = {
        'ID Emprunt': `#${loan.id}`,
        'Livre': loan.bookTitle,
        'Membre': loan.memberName,
        "Date d'emprunt": formatDate(loan.loanDate),
        'Date de retour prévue': formatDate(loan.dueDate),
        'Date de retour effective': loan.returnDate ? formatDate(loan.returnDate) : 'Non retourné',
        'Statut': displayStatus,
        'Jours de retard': daysLate > 0 ? daysLate : 'Aucun',
        'Pénalité': penalty > 0 ? `${penalty.toFixed(2)} €` : 'Aucune',
        'Renouvellements': loan.renewalCount || 0,
        'État du livre': loan.condition || 'Non spécifié',
        'Notes': loan.notes || 'Aucune',
        'Notes de retour': loan.returnNotes || 'Aucune'
    };
    
    // Appeler la fonction d'export du fichier export.js
    if (typeof exportSingleToPDF === 'function') {
        exportSingleToPDF(loanData, 'emprunt', `Emprunt #${loan.id}`);
    } else {
        console.error('Fonction exportSingleToPDF non trouvée');
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'La fonction d\'export PDF n\'est pas disponible'
        });
    }
}

// ===== VUE DÉTAILLÉE AVEC STYLE COMME LES AUTRES CRUD =====
function viewLoan(id) {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;
    
    const bookImage = loanImages.books[loan.bookId] || loanImages.books.default;
    const memberImage = loanImages.members[loan.memberId] || loanImages.members.default;
    
    const isOverdue = loan.status === 'en cours' && new Date(loan.dueDate) < new Date();
    const displayStatus = isOverdue ? 'retard' : loan.status;
    
    const statusColor = displayStatus === 'retard' ? '#e74c3c' : 
                        (displayStatus === 'terminé' ? '#2ecc71' : '#f39c12');
    const statusIcon = displayStatus === 'retard' ? 'fa-exclamation-triangle' : 
                       (displayStatus === 'terminé' ? 'fa-check-circle' : 'fa-clock');
    
    // Calculer les jours de retard si terminé
    let daysLate = 0;
    let penalty = 0;
    if (loan.returnDate && loan.dueDate) {
        const due = new Date(loan.dueDate);
        const ret = new Date(loan.returnDate);
        daysLate = Math.max(0, Math.ceil((ret - due) / (1000 * 60 * 60 * 24)));
        penalty = daysLate * 0.5;
    }
    
    Swal.fire({
        title: `Détails de l'emprunt #${loan.id}`,
        html: `
            <div style="text-align: center; padding: 10px;">
                <!-- En-tête avec statut -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 15px; background: ${statusColor}10; border-radius: 15px; border: 1px solid ${statusColor};">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas ${statusIcon}" style="font-size: 24px; color: ${statusColor};"></i>
                        <span style="font-size: 18px; font-weight: bold; color: ${statusColor};">${displayStatus.toUpperCase()}</span>
                    </div>
                    <span style="font-size: 14px; color: #7f8c8d;">ID: #${loan.id}</span>
                </div>
                
                <!-- Images côte à côte -->
                <div style="display: flex; justify-content: space-around; gap: 20px; margin-bottom: 25px;">
                    <!-- Livre -->
                    <div style="flex: 1; text-align: center;">
                        <div style="position: relative; display: inline-block;">
                            <div style="position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; background: linear-gradient(135deg, #3498db, #2ecc71); border-radius: 15px; opacity: 0.2;"></div>
                            <img src="${bookImage}" alt="${loan.bookTitle}" 
                                 style="width: 120px; height: 120px; border-radius: 15px; object-fit: cover; border: 3px solid white; box-shadow: 0 5px 15px rgba(0,0,0,0.2); position: relative; z-index: 1;">
                        </div>
                        <h3 style="color: #2c3e50; margin-top: 10px; font-size: 16px;">${loan.bookTitle}</h3>
                        <p style="color: #7f8c8d; font-size: 12px;">Livre</p>
                    </div>
                    
                    <!-- Membre -->
                    <div style="flex: 1; text-align: center;">
                        <div style="position: relative; display: inline-block;">
                            <div style="position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; background: linear-gradient(135deg, ${statusColor}, #9b59b6); border-radius: 50%; opacity: 0.2;"></div>
                            <img src="${memberImage}" alt="${loan.memberName}" 
                                 style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid white; box-shadow: 0 5px 15px rgba(0,0,0,0.2); position: relative; z-index: 1;">
                        </div>
                        <h3 style="color: #2c3e50; margin-top: 10px; font-size: 16px;">${loan.memberName}</h3>
                        <p style="color: #7f8c8d; font-size: 12px;">Membre</p>
                    </div>
                </div>
                
                <!-- Carte d'information principale -->
                <div style="background: linear-gradient(135deg, #f8f9fa, #ffffff); border-radius: 20px; padding: 25px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                    
                    <!-- Dates -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: center;">
                            <div style="background: #3498db20; border-radius: 10px; padding: 10px;">
                                <i class="fas fa-calendar-plus" style="color: #3498db; font-size: 20px; margin-bottom: 5px; display: block;"></i>
                                <p style="color: #7f8c8d; font-size: 11px; margin-bottom: 5px;">Date d'emprunt</p>
                                <p style="color: #2c3e50; font-size: 16px; font-weight: 600;">${formatDate(loan.loanDate)}</p>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="background: #f39c1220; border-radius: 10px; padding: 10px;">
                                <i class="fas fa-calendar-check" style="color: #f39c12; font-size: 20px; margin-bottom: 5px; display: block;"></i>
                                <p style="color: #7f8c8d; font-size: 11px; margin-bottom: 5px;">Retour prévu</p>
                                <p style="color: #2c3e50; font-size: 16px; font-weight: 600;">${formatDate(loan.dueDate)}</p>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="background: ${loan.returnDate ? '#2ecc7120' : '#e74c3c20'}; border-radius: 10px; padding: 10px;">
                                <i class="fas fa-calendar-times" style="color: ${loan.returnDate ? '#2ecc71' : '#e74c3c'}; font-size: 20px; margin-bottom: 5px; display: block;"></i>
                                <p style="color: #7f8c8d; font-size: 11px; margin-bottom: 5px;">Retour effectué</p>
                                <p style="color: #2c3e50; font-size: 16px; font-weight: 600;">${loan.returnDate ? formatDate(loan.returnDate) : 'Non retourné'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Informations supplémentaires -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding-top: 15px; border-top: 1px solid #eef2f6;">
                        <div style="text-align: left;">
                            <p style="color: #7f8c8d; font-size: 11px; margin-bottom: 5px;">Renouvellements</p>
                            <p style="color: #2c3e50; font-size: 14px; font-weight: 500;">${loan.renewalCount || 0} fois</p>
                        </div>
                        <div style="text-align: left;">
                            <p style="color: #7f8c8d; font-size: 11px; margin-bottom: 5px;">État du livre</p>
                            <p style="color: #2c3e50; font-size: 14px; font-weight: 500;">${loan.condition || 'Non spécifié'}</p>
                        </div>
                        ${loan.returnDate ? `
                        <div style="text-align: left;">
                            <p style="color: #7f8c8d; font-size: 11px; margin-bottom: 5px;">Jours de retard</p>
                            <p style="color: ${daysLate > 0 ? '#e74c3c' : '#2ecc71'}; font-size: 14px; font-weight: 600;">${daysLate > 0 ? daysLate + ' jour(s)' : 'Aucun'}</p>
                        </div>
                        <div style="text-align: left;">
                            <p style="color: #7f8c8d; font-size: 11px; margin-bottom: 5px;">Pénalité</p>
                            <p style="color: ${penalty > 0 ? '#e74c3c' : '#2ecc71'}; font-size: 14px; font-weight: 600;">${penalty > 0 ? penalty.toFixed(2) + ' €' : '0 €'}</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Notes -->
                <div style="background: #f8f9fa; border-radius: 15px; padding: 20px; margin-bottom: 10px;">
                    <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 16px; text-align: left;">
                        <i class="fas fa-sticky-note" style="color: #3498db; margin-right: 8px;"></i>
                        Notes
                    </h3>
                    <div style="text-align: left;">
                        <p style="color: #34495e; margin-bottom: 15px; padding: 10px; background: white; border-radius: 8px; border-left: 3px solid #3498db;">
                            <strong>Notes d'emprunt:</strong> ${loan.notes || 'Aucune'}
                        </p>
                        ${loan.returnNotes ? `
                        <p style="color: #34495e; padding: 10px; background: white; border-radius: 8px; border-left: 3px solid #2ecc71;">
                            <strong>Notes de retour:</strong> ${loan.returnNotes}
                        </p>
                        ` : ''}
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
        customClass: {
            popup: 'animated-modal'
        },
        preConfirm: () => {
            exportLoanToPDF(loan);
        }
    });
}

// ===== FONCTION DE RENOUVELLEMENT D'EMPRUNT =====
function renewLoan(id) {
    const loan = loans.find(l => l.id === id);
    if (!loan || loan.status !== 'en cours') return;
    
    Swal.fire({
        title: 'Renouvellement',
        text: 'Voulez-vous prolonger cet emprunt de 14 jours ?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3498db',
        cancelButtonColor: '#e74c3c',
        confirmButtonText: 'Oui, renouveler',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            const newDueDate = new Date(loan.dueDate);
            newDueDate.setDate(newDueDate.getDate() + 14);
            loan.dueDate = newDueDate.toISOString().split('T')[0];
            loan.renewed = true;
            loan.renewalCount = (loan.renewalCount || 0) + 1;
            loan.notes += ` (Renouvelé le ${new Date().toLocaleDateString()})`;
            
            localStorage.setItem('loans', JSON.stringify(loans));
            renderTable();
            
            Swal.fire({
                icon: 'success',
                title: 'Renouvelé',
                text: 'Emprunt prolongé de 14 jours',
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
}

// ===== EXPORT CSV (LISTE COMPLÈTE) =====
function exportToCSV() {
    const exportData = loans.map(loan => {
        const isOverdue = loan.status === 'en cours' && new Date(loan.dueDate) < new Date();
        const displayStatus = isOverdue ? 'retard' : loan.status;
        
        return {
            ID: loan.id,
            Livre: loan.bookTitle,
            Membre: loan.memberName,
            'Date emprunt': formatDate(loan.loanDate),
            'Retour prévu': formatDate(loan.dueDate),
            'Date retour': loan.returnDate ? formatDate(loan.returnDate) : '',
            Statut: displayStatus,
            Renouvellements: loan.renewalCount || 0,
            Notes: loan.notes || ''
        };
    });
    
    if (typeof window.exportToCSV === 'function') {
        window.exportToCSV(
            exportData, 
            'emprunts', 
            ['ID', 'Livre', 'Membre', 'Date emprunt', 'Retour prévu', 'Date retour', 'Statut', 'Renouvellements', 'Notes']
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
    const exportData = loans.map(loan => {
        const isOverdue = loan.status === 'en cours' && new Date(loan.dueDate) < new Date();
        const displayStatus = isOverdue ? 'retard' : loan.status;
        
        return {
            ID: loan.id,
            Livre: loan.bookTitle,
            Membre: loan.memberName,
            'Emprunt': formatDate(loan.loanDate),
            'Retour': formatDate(loan.dueDate),
            Statut: displayStatus
        };
    });
    
    if (typeof window.exportToPDF === 'function') {
        window.exportToPDF(
            exportData, 
            'emprunts', 
            ['ID', 'Livre', 'Membre', 'Emprunt', 'Retour', 'Statut'],
            'Liste des emprunts'
        );
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Export PDF',
            text: 'Fonction d\'export non disponible'
        });
    }
}

function deleteLoan(id) {
    const loan = loans.find(l => l.id === id);
    if (!loan) return;
    
    Swal.fire({
        title: 'Confirmation',
        text: `Supprimer l'emprunt #${loan.id} (${loan.bookTitle}) ?`,
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
            if (loan.status !== 'terminé') {
                const book = books.find(b => b.id === loan.bookId);
                if (book) {
                    book.available = book.available + 1;
                    localStorage.setItem('books', JSON.stringify(books));
                }
            }
            
            loans = loans.filter(l => l.id !== id);
            localStorage.setItem('loans', JSON.stringify(loans));
            renderTable();
            populateSelects();
            
            Swal.fire({
                icon: 'success',
                title: 'Supprimé!',
                text: 'Emprunt supprimé',
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
window.closeReturnModal = closeReturnModal;
window.closeDeleteModal = closeDeleteModal;
window.updateBookAvailability = updateBookAvailability;
window.saveLoan = saveLoan;
window.returnBook = returnBook;
window.confirmReturn = confirmReturn;
window.viewLoan = viewLoan;
window.renewLoan = renewLoan;
window.deleteLoan = deleteLoan;
window.changePage = changePage;
window.changePerPage = changePerPage;
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.exportLoanToPDF = exportLoanToPDF;
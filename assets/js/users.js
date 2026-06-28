// users.js - Gestion des membres (VERSION ANCIENNE COMPLÈTE)

let members = [];
let currentPage = 1;
let perPage = 10;
let sortField = 'name';
let sortDirection = 'asc';
let filters = { search: '', status: '', membership: '' };

// Images UI Avatars pour les membres
const memberImages = {
    '1': 'https://ui-avatars.com/api/?name=Jean+Dupont&background=3498db&color=fff&size=200',
    '2': 'https://ui-avatars.com/api/?name=Marie+Martin&background=e74c3c&color=fff&size=200',
    '3': 'https://ui-avatars.com/api/?name=Pierre+Durand&background=2ecc71&color=fff&size=200',
    '4': 'https://ui-avatars.com/api/?name=Sophie+Bernard&background=9b59b6&color=fff&size=200',
    '5': 'https://ui-avatars.com/api/?name=Lucas+Petit&background=f39c12&color=fff&size=200',
    'default': 'https://ui-avatars.com/api/?name=Membre&background=95a5a6&color=fff&size=200'
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof checkAuth === 'function') checkAuth();
    loadMembers();
    initEventListeners();
    initModals();
    if (typeof displayUserInfo === 'function') displayUserInfo();
});

function loadMembers() {
    const storedMembers = localStorage.getItem('members');
    if (storedMembers) {
        members = JSON.parse(storedMembers);
        console.log('Membres chargés:', members.length);
    } else {
        members = getDemoMembers();
        localStorage.setItem('members', JSON.stringify(members));
        console.log('Membres de démonstration créés:', members.length);
    }
    renderTable();
}

function getDemoMembers() {
    return [
        { 
            id: '1', 
            name: 'Jean Dupont', 
            email: 'jean.dupont@email.com', 
            phone: '0612345678', 
            address: '15 Rue de Paris, 75001 Paris', 
            birthDate: '1985-06-15', 
            registeredAt: '2025-01-15', 
            status: 'actif', 
            membershipType: 'premium', 
            notes: 'Membre fidèle, préfère les romans classiques',
            loansCount: 2,
            favoriteCategory: 'Classique',
            totalLoans: 24,
            lateReturns: 1
        },
        { 
            id: '2', 
            name: 'Marie Martin', 
            email: 'marie.martin@email.com', 
            phone: '0687654321', 
            address: '8 Avenue Victor Hugo, 69002 Lyon', 
            birthDate: '1990-03-22', 
            registeredAt: '2025-02-20', 
            status: 'actif', 
            membershipType: 'standard', 
            notes: 'Intéressée par la science-fiction',
            loansCount: 1,
            favoriteCategory: 'Science-Fiction',
            totalLoans: 8,
            lateReturns: 0
        },
        { 
            id: '3', 
            name: 'Pierre Durand', 
            email: 'pierre.durand@email.com', 
            phone: '0678912345', 
            address: '23 Rue de la République, 13001 Marseille', 
            birthDate: '1978-11-08', 
            registeredAt: '2024-11-10', 
            status: 'inactif', 
            membershipType: 'standard', 
            notes: 'En vacances jusqu\'à juin',
            loansCount: 0,
            favoriteCategory: 'Histoire',
            totalLoans: 15,
            lateReturns: 2
        },
        { 
            id: '4', 
            name: 'Sophie Bernard', 
            email: 'sophie.bernard@email.com', 
            phone: '0645678901', 
            address: '5 Rue des Lilas, 31000 Toulouse', 
            birthDate: '1995-09-30', 
            registeredAt: '2025-03-05', 
            status: 'actif', 
            membershipType: 'student', 
            notes: 'Étudiante en littérature',
            loansCount: 3,
            favoriteCategory: 'Poésie',
            totalLoans: 12,
            lateReturns: 0
        },
        { 
            id: '5', 
            name: 'Lucas Petit', 
            email: 'lucas.petit@email.com', 
            phone: '0623456789', 
            address: '12 Rue Voltaire, 44000 Nantes', 
            birthDate: '1988-12-03', 
            registeredAt: '2025-01-25', 
            status: 'actif', 
            membershipType: 'premium', 
            notes: 'Passionné de science-fiction',
            loansCount: 4,
            favoriteCategory: 'Science-Fiction',
            totalLoans: 32,
            lateReturns: 3
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
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.innerHTML = '<option value="">Tous les statuts</option>' +
            '<option value="actif">Actif</option>' +
            '<option value="inactif">Inactif</option>';
            
        statusFilter.addEventListener('change', () => {
            filters.status = statusFilter.value;
            currentPage = 1;
            renderTable();
        });
    }
    
    const membershipFilter = document.getElementById('membershipFilter');
    if (membershipFilter) {
        membershipFilter.innerHTML = '<option value="">Tous les types</option>' +
            '<option value="premium">Premium</option>' +
            '<option value="standard">Standard</option>' +
            '<option value="student">Étudiant</option>';
            
        membershipFilter.addEventListener('change', () => {
            filters.membership = membershipFilter.value;
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
    let filteredMembers = [...members];
    
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredMembers = filteredMembers.filter(member => 
            member.name.toLowerCase().includes(searchLower) ||
            member.email.toLowerCase().includes(searchLower) ||
            (member.phone && member.phone.includes(filters.search))
        );
    }
    
    if (filters.status) {
        filteredMembers = filteredMembers.filter(member => member.status === filters.status);
    }
    
    if (filters.membership) {
        filteredMembers = filteredMembers.filter(member => member.membershipType === filters.membership);
    }
    
    filteredMembers = sortMembers(filteredMembers, sortField, sortDirection);
    const paginated = paginateData(filteredMembers, currentPage, perPage);
    
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (paginated.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">Aucun membre trouvé</td></tr>';
    } else {
        tbody.innerHTML = paginated.data.map(member => {
            const borderColor = member.status === 'actif' ? '#2ecc71' : '#e74c3c';
            
            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center;">
                            <img src="${memberImages[member.id] || memberImages.default}" 
                                 alt="${member.name}"
                                 style="width: 45px; height: 45px; border-radius: 50%; margin-right: 10px; object-fit: cover; border: 2px solid ${borderColor};">
                            <span style="font-weight: bold;">#${member.id}</span>
                        </div>
                    </td>
                    <td>${escapeHtml(member.name)}</td>
                    <td>${escapeHtml(member.email)}</td>
                    <td>${escapeHtml(member.phone || '')}</td>
                    <td>${formatDate(member.registeredAt)}</td>
                    <td><span class="status-badge" style="background: ${borderColor}20; color: ${borderColor}; border: 1px solid ${borderColor}; padding: 4px 8px; border-radius: 20px;">${member.status || 'inactif'}</span></td>
                    <td style="text-align: center;">${member.loansCount || 0}</td>
                    <td class="table-actions">
                        <button class="btn-icon view" onclick="viewMember('${member.id}')"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon edit" onclick="editMember('${member.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete" onclick="deleteMember('${member.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    updatePagination(paginated);
}

function sortMembers(data, field, direction) {
    return [...data].sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (field === 'registeredAt' || field === 'birthDate') {
            valA = valA ? new Date(valA).getTime() : 0;
            valB = valB ? new Date(valB).getTime() : 0;
        }
        
        if (field === 'loansCount' || field === 'id') {
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
            paginationInfo.textContent = 'Aucun membre';
        } else {
            const start = ((paginated.page - 1) * paginated.perPage) + 1;
            const end = Math.min(start + paginated.perPage - 1, paginated.total);
            paginationInfo.textContent = `Affichage ${start}-${end} de ${paginated.total} membres`;
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
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Ajouter un membre';
    document.getElementById('memberForm').reset();
    document.getElementById('memberId').value = '';
    document.getElementById('memberModal').classList.add('active');
}

function closeModal() {
    document.getElementById('memberModal').classList.remove('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

function saveMember() {
    const memberId = document.getElementById('memberId')?.value;
    const memberData = {
        id: memberId || Date.now().toString(),
        name: document.getElementById('name')?.value,
        email: document.getElementById('email')?.value,
        phone: document.getElementById('phone')?.value,
        address: document.getElementById('address')?.value,
        birthDate: document.getElementById('birthDate')?.value,
        status: document.getElementById('status')?.value || 'actif',
        membershipType: document.getElementById('membershipType')?.value || 'standard',
        notes: document.getElementById('notes')?.value || '',
        favoriteCategory: document.getElementById('favoriteCategory')?.value || '',
        loansCount: 0,
        totalLoans: 0,
        lateReturns: 0,
        updatedAt: new Date().toISOString()
    };
    
    if (!validateMember(memberData)) return;
    
    if (memberId) {
        const index = members.findIndex(m => m.id === memberId);
        if (index !== -1) {
            members[index] = { ...members[index], ...memberData };
        }
    } else {
        memberData.registeredAt = new Date().toISOString().split('T')[0];
        members.push(memberData);
    }
    
    localStorage.setItem('members', JSON.stringify(members));
    closeModal();
    renderTable();
    Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: memberId ? 'Membre modifié' : 'Membre ajouté',
        timer: 2000,
        showConfirmButton: false
    });
}

function validateMember(member) {
    if (!member.name) { Swal.fire('Erreur', 'Nom requis', 'error'); return false; }
    if (!member.email) { Swal.fire('Erreur', 'Email requis', 'error'); return false; }
    if (!member.email.includes('@')) { Swal.fire('Erreur', 'Email invalide', 'error'); return false; }
    if (!member.phone) { Swal.fire('Erreur', 'Téléphone requis', 'error'); return false; }
    if (!member.address) { Swal.fire('Erreur', 'Adresse requise', 'error'); return false; }
    return true;
}

// ===== FONCTION ÉDITER CORRIGÉE (COMME LES AUTRES CRUD) =====
function editMember(id) {
    console.log('Édition du membre ID:', id);
    
    const member = members.find(m => m.id === id);
    if (!member) {
        console.error('Membre non trouvé!');
        Swal.fire('Erreur', 'Membre non trouvé', 'error');
        return;
    }
    
    document.getElementById('memberId').value = member.id || '';
    document.getElementById('name').value = member.name || '';
    document.getElementById('email').value = member.email || '';
    document.getElementById('phone').value = member.phone || '';
    document.getElementById('address').value = member.address || '';
    document.getElementById('birthDate').value = member.birthDate || '';
    document.getElementById('status').value = member.status || 'actif';
    document.getElementById('membershipType').value = member.membershipType || 'standard';
    document.getElementById('notes').value = member.notes || '';
    if (document.getElementById('favoriteCategory')) {
        document.getElementById('favoriteCategory').value = member.favoriteCategory || '';
    }
    
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Modifier le membre';
    document.getElementById('memberModal').classList.add('active');
}

// ===== VUE DÉTAILLÉE COMPLÈTE =====
function viewMember(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    const memberImage = memberImages[member.id] || memberImages.default;
    const borderColor = member.status === 'actif' ? '#2ecc71' : '#e74c3c';
    
    Swal.fire({
        title: 'Détails du membre',
        html: `
            <div style="text-align: center; padding: 10px;">
                <div style="position: relative; display: inline-block; margin-bottom: 20px;">
                    <div style="position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; background: linear-gradient(135deg, ${borderColor}, #3498db); border-radius: 50%; opacity: 0.3; filter: blur(5px);"></div>
                    <img src="${memberImage}" alt="${member.name}" 
                         style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid white; box-shadow: 0 10px 25px rgba(52,152,219,0.3); position: relative; z-index: 1;">
                </div>
                
                <h2 style="color: #2c3e50; margin-bottom: 5px; font-size: 28px;">${member.name}</h2>
                <p style="color: #7f8c8d; margin-bottom: 20px; font-size: 14px;">Membre depuis ${formatDate(member.registeredAt)}</p>
                
                <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
                    <span style="background: ${borderColor}; color: white; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 500;">
                        <i class="fas fa-circle" style="margin-right: 5px;"></i> ${member.status}
                    </span>
                    <span style="background: #f39c12; color: white; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 500;">
                        <i class="fas fa-tag" style="margin-right: 5px;"></i> ${member.membershipType}
                    </span>
                    <span style="background: #3498db; color: white; padding: 8px 16px; border-radius: 30px; font-size: 13px; font-weight: 500;">
                        <i class="fas fa-id-card" style="margin-right: 5px;"></i> #${member.id}
                    </span>
                </div>
                
                <div style="background: linear-gradient(135deg, #f8f9fa, #ffffff); border-radius: 20px; padding: 25px; margin-bottom: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                        <div style="text-align: left; padding: 10px; background: #f8f9fa; border-radius: 10px;">
                            <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">Email</p>
                            <p style="color: #2c3e50; font-size: 14px; font-weight: 500;">${member.email}</p>
                        </div>
                        <div style="text-align: left; padding: 10px; background: #f8f9fa; border-radius: 10px;">
                            <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">Téléphone</p>
                            <p style="color: #2c3e50; font-size: 14px; font-weight: 500;">${member.phone}</p>
                        </div>
                        <div style="text-align: left; grid-column: span 2; padding: 10px; background: #f8f9fa; border-radius: 10px;">
                            <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">Adresse</p>
                            <p style="color: #2c3e50; font-size: 14px; font-weight: 500;">${member.address}</p>
                        </div>
                        <div style="text-align: left; padding: 10px; background: #f8f9fa; border-radius: 10px;">
                            <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">Date naissance</p>
                            <p style="color: #2c3e50; font-size: 14px; font-weight: 500;">${formatDate(member.birthDate)}</p>
                        </div>
                        <div style="text-align: left; padding: 10px; background: #f8f9fa; border-radius: 10px;">
                            <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">Catégorie favorite</p>
                            <p style="color: #2c3e50; font-size: 14px; font-weight: 500;">${member.favoriteCategory || 'Non spécifiée'}</p>
                        </div>
                    </div>
                    
                    <div style="text-align: left; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eef2f6;">
                        <p style="color: #7f8c8d; font-size: 12px; margin-bottom: 5px;">Notes</p>
                        <p style="color: #2c3e50; font-size: 14px; line-height: 1.6; font-style: italic;">"${member.notes || 'Aucune note'}"</p>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-around; background: #f8f9fa; border-radius: 15px; padding: 15px; margin-bottom: 10px;">
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #3498db;">${member.loansCount || 0}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">Emprunts en cours</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">${member.totalLoans || 0}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">Total emprunts</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; font-weight: bold; color: #e74c3c;">${member.lateReturns || 0}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">Retards</div>
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
        width: '600px',
        background: 'white',
        backdrop: 'rgba(0,0,0,0.6)',
        preConfirm: () => {
            exportMemberToPDF(member);
        }
    });
}

function exportMemberToPDF(member) {
    if (!member) return;
    
    const memberData = {
        'ID Membre': `#${member.id}`,
        'Nom complet': member.name,
        'Email': member.email,
        'Téléphone': member.phone,
        'Adresse': member.address,
        'Date de naissance': formatDate(member.birthDate),
        "Date d'inscription": formatDate(member.registeredAt),
        'Statut': member.status,
        "Type d'abonnement": member.membershipType,
        'Catégorie favorite': member.favoriteCategory || 'Non spécifiée',
        'Emprunts en cours': member.loansCount || 0,
        'Total des emprunts': member.totalLoans || 0,
        'Retards': member.lateReturns || 0,
        'Notes': member.notes || 'Aucune note'
    };
    
    if (typeof exportSingleToPDF === 'function') {
        exportSingleToPDF(memberData, 'membre', `Détails - ${member.name}`);
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'La fonction d\'export PDF n\'est pas disponible'
        });
    }
}

function deleteMember(id) {
    const member = members.find(m => m.id === id);
    if (!member) return;
    
    Swal.fire({
        title: 'Confirmation',
        text: `Supprimer "${member.name}" ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#3498db',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            members = members.filter(m => m.id !== id);
            localStorage.setItem('members', JSON.stringify(members));
            renderTable();
            Swal.fire('Supprimé!', 'Le membre a été supprimé.', 'success');
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

window.openCreateModal = openCreateModal;
window.closeModal = closeModal;
window.closeDeleteModal = closeDeleteModal;
window.saveMember = saveMember;
window.editMember = editMember;
window.viewMember = viewMember;
window.deleteMember = deleteMember;
window.changePage = changePage;
window.changePerPage = changePerPage;
window.exportMemberToPDF = exportMemberToPDF;
// i18n.js - Gestion des traductions
const translations = {
    fr: {
        'app.name': 'LibraryProject',
        'nav.dashboard': 'Tableau de bord',
        'nav.books': 'Livres',
        'nav.authors': 'Auteurs',
        'nav.members': 'Membres',
        'nav.loans': 'Emprunts',
        'nav.categories': 'Catégories',
        'nav.logout': 'Déconnexion',
        'login.title': 'Connexion',
        'login.email': 'Email',
        'login.password': 'Mot de passe',
        'login.submit': 'Se connecter',
        'login.welcome': 'Bienvenue !',
        'dashboard.title': 'Tableau de bord',
        'dashboard.totalBooks': 'Total des livres',
        'dashboard.totalMembers': 'Membres actifs',
        'dashboard.activeLoans': 'Emprunts en cours',
        'dashboard.overdueLoans': 'Emprunts en retard',
        'dashboard.availableBooks': 'Livres disponibles',
        'dashboard.popularCategories': 'Catégories populaires',
        'actions.save': 'Enregistrer',
        'actions.cancel': 'Annuler',
        'actions.delete': 'Supprimer',
        'actions.edit': 'Modifier',
        'actions.view': 'Voir',
        'actions.search': 'Rechercher...'
    },
    en: {
        'app.name': 'LibraryProject',
        'nav.dashboard': 'Dashboard',
        'nav.books': 'Books',
        'nav.authors': 'Authors',
        'nav.members': 'Members',
        'nav.loans': 'Loans',
        'nav.categories': 'Categories',
        'nav.logout': 'Logout',
        'login.title': 'Login',
        'login.email': 'Email',
        'login.password': 'Password',
        'login.submit': 'Sign in',
        'login.welcome': 'Welcome!',
        'dashboard.title': 'Dashboard',
        'dashboard.totalBooks': 'Total Books',
        'dashboard.totalMembers': 'Active Members',
        'dashboard.activeLoans': 'Active Loans',
        'dashboard.overdueLoans': 'Overdue Loans',
        'dashboard.availableBooks': 'Available Books',
        'dashboard.popularCategories': 'Popular Categories',
        'actions.save': 'Save',
        'actions.cancel': 'Cancel',
        'actions.delete': 'Delete',
        'actions.edit': 'Edit',
        'actions.view': 'View',
        'actions.search': 'Search...'
    },
    ar: {
        'app.name': 'مكتبتي',
        'nav.dashboard': 'لوحة التحكم',
        'nav.books': 'الكتب',
        'nav.authors': 'المؤلفون',
        'nav.members': 'الأعضاء',
        'nav.loans': 'الإعارات',
        'nav.categories': 'التصنيفات',
        'nav.logout': 'تسجيل الخروج',
        'login.title': 'تسجيل الدخول',
        'login.email': 'البريد الإلكتروني',
        'login.password': 'كلمة المرور',
        'login.submit': 'دخول',
        'login.welcome': 'مرحباً',
        'dashboard.title': 'لوحة التحكم',
        'dashboard.totalBooks': 'إجمالي الكتب',
        'dashboard.totalMembers': 'الأعضاء النشطون',
        'dashboard.activeLoans': 'الإعارات الحالية',
        'dashboard.overdueLoans': 'الإعارات المتأخرة',
        'dashboard.availableBooks': 'الكتب المتاحة',
        'dashboard.popularCategories': 'التصنيفات الشائعة',
        'actions.save': 'حفظ',
        'actions.cancel': 'إلغاء',
        'actions.delete': 'حذف',
        'actions.edit': 'تعديل',
        'actions.view': 'عرض',
        'actions.search': 'بحث...'
    }
};

let currentLang = localStorage.getItem('language') || 'fr';

document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
    applyDirection(currentLang);
    translatePage();
});

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('language', lang);
    applyDirection(lang);
    translatePage();
}

function applyDirection(lang) {
    const html = document.documentElement;
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang);
}

function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getTranslation(key);
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        }
    });
}

function getTranslation(key) {
    const keys = key.split('.');
    let value = translations[currentLang];
    for (const k of keys) {
        if (value && value[k]) {
            value = value[k];
        } else {
            return key;
        }
    }
    return value;
}
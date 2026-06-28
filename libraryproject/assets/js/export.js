// export.js - Fonctions d'export CSV et PDF

// ===== EXPORT CSV =====
function exportToCSV(data, filename, columns) {
    if (!data || data.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Export impossible',
            text: 'Aucune donnée à exporter',
            confirmButtonColor: '#3498db'
        });
        return;
    }

    // Définir les colonnes
    const headers = columns || Object.keys(data[0]);
    
    // Créer le contenu CSV
    let csvContent = headers.join(';') + '\n';
    
    data.forEach(item => {
        const row = headers.map(header => {
            let value = item[header] || '';
            // Échapper les points-virgules et guillemets
            if (typeof value === 'string' && (value.includes(';') || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvContent += row.join(';') + '\n';
    });

    // Créer et télécharger le fichier
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    Swal.fire({
        icon: 'success',
        title: 'Export réussi',
        text: `Fichier ${filename}.csv téléchargé`,
        timer: 2000,
        showConfirmButton: false
    });
}

// ===== EXPORT PDF (TABLEAU) =====
function exportToPDF(data, filename, columns, title) {
    if (!data || data.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Export impossible',
            text: 'Aucune donnée à exporter',
            confirmButtonColor: '#3498db'
        });
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Titre du document
    doc.setFontSize(16);
    doc.setTextColor(52, 152, 219);
    doc.text(title || filename, 14, 15);
    
    // Date d'export
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const today = new Date();
    doc.text(`Exporté le : ${today.toLocaleDateString()}`, 14, 22);

    // Préparer les données pour le tableau
    const headers = columns || Object.keys(data[0]);
    const rows = data.map(item => 
        headers.map(header => String(item[header] || ''))
    );

    // Générer le tableau
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 25,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        margin: { top: 25 }
    });

    // Télécharger le PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    Swal.fire({
        icon: 'success',
        title: 'Export réussi',
        text: `Fichier ${filename}.pdf téléchargé`,
        timer: 2000,
        showConfirmButton: false
    });
}

// ===== EXPORT PDF POUR UN ÉLÉMENT UNIQUE (DÉTAILS) =====
function exportSingleToPDF(item, filename, title) {
    if (!item) {
        Swal.fire({
            icon: 'warning',
            title: 'Export impossible',
            text: 'Aucune donnée à exporter',
            confirmButtonColor: '#3498db'
        });
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Titre
    doc.setFontSize(18);
    doc.setTextColor(52, 152, 219);
    doc.text(title || 'Détails', 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Exporté le : ${new Date().toLocaleDateString()}`, 14, 27);

    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 30, 196, 30);

    // Afficher les détails
    let y = 40;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Exclure certains champs
    const excludeFields = ['id', 'password', '__v', '_id'];
    
    Object.entries(item).forEach(([key, value]) => {
        if (!excludeFields.includes(key) && value && typeof value !== 'object') {
            doc.setFont(undefined, 'bold');
            doc.text(`${key}:`, 14, y);
            doc.setFont(undefined, 'normal');
            
            // Gérer les longs textes
            const valueStr = String(value);
            if (valueStr.length > 50) {
                doc.text(valueStr.substring(0, 50) + '...', 60, y);
            } else {
                doc.text(valueStr, 60, y);
            }
            y += 8;
            
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
        }
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    Swal.fire({
        icon: 'success',
        title: 'Export réussi',
        text: `Fichier ${filename}.pdf téléchargé`,
        timer: 2000,
        showConfirmButton: false
    });
}

// ===== EXPORT PDF AVANCÉ AVEC MISE EN FORME =====
function exportAdvancedPDF(data, filename, config) {
    if (!data || data.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Export impossible',
            text: 'Aucune donnée à exporter',
            confirmButtonColor: '#3498db'
        });
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: config?.orientation || 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(52, 152, 219);
    doc.text(config?.title || filename, 14, 15);
    
    // Sous-titre
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 22);
    
    if (config?.subtitle) {
        doc.text(config.subtitle, 14, 27);
    }

    // Préparer les données
    const headers = config?.columns || Object.keys(data[0]);
    const rows = data.map(item => 
        headers.map(header => {
            let value = item[header] || '';
            if (config?.formatters && config.formatters[header]) {
                value = config.formatters[header](value);
            }
            return String(value);
        })
    );

    // Tableau
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 30,
        styles: {
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        ...config?.tableOptions
    });

    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} sur ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    Swal.fire({
        icon: 'success',
        title: 'Export réussi',
        text: `Fichier ${filename}.pdf téléchargé`,
        timer: 2000,
        showConfirmButton: false
    });
}

// ===== UTILITAIRES =====
function formatDateForExport(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Exporter les fonctions globalement
window.exportToCSV = exportToCSV;
window.exportToPDF = exportToPDF;
window.exportSingleToPDF = exportSingleToPDF;
window.exportAdvancedPDF = exportAdvancedPDF;
window.formatDateForExport = formatDateForExport;
window.formatCurrency = formatCurrency;
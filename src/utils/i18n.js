// Multi-language support
const translations = {
  en: {
    dashboard: "Dashboard",
    addProduct: "Add Product",
    inventory: "Inventory",
    expired: "Expired",
    expiringSoon: "Expiring Soon",
    safe: "Safe",
    totalItems: "Total Items",
    search: "Search",
    filter: "Filter",
    location: "Location",
    category: "Category",
    status: "Status",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    remove: "Remove",
    duplicate: "Duplicate",
    print: "Print",
    export: "Export",
    import: "Import",
    settings: "Settings",
    save: "Save",
    cancel: "Cancel",
    name: "Name",
    quantity: "Quantity",
    price: "Price",
    expiryDate: "Expiry Date",
    barcode: "Barcode",
    supplier: "Supplier",
    notes: "Notes",
  },
  es: {
    dashboard: "Panel",
    addProduct: "Agregar Producto",
    inventory: "Inventario",
    expired: "Vencido",
    expiringSoon: "Por Vencer",
    safe: "Seguro",
    totalItems: "Total de Artículos",
    search: "Buscar",
    filter: "Filtrar",
    location: "Ubicación",
    category: "Categoría",
    status: "Estado",
    actions: "Acciones",
    edit: "Editar",
    delete: "Eliminar",
    remove: "Quitar",
    duplicate: "Duplicar",
    print: "Imprimir",
    export: "Exportar",
    import: "Importar",
    settings: "Configuración",
    save: "Guardar",
    cancel: "Cancelar",
    name: "Nombre",
    quantity: "Cantidad",
    price: "Precio",
    expiryDate: "Fecha de Vencimiento",
    barcode: "Código de Barras",
    supplier: "Proveedor",
    notes: "Notas",
  },
  fr: {
    dashboard: "Tableau de bord",
    addProduct: "Ajouter un produit",
    inventory: "Inventaire",
    expired: "Expiré",
    expiringSoon: "Expire bientôt",
    safe: "Sûr",
    totalItems: "Total des articles",
    search: "Rechercher",
    filter: "Filtrer",
    location: "Emplacement",
    category: "Catégorie",
    status: "Statut",
    actions: "Actions",
    edit: "Modifier",
    delete: "Supprimer",
    remove: "Retirer",
    duplicate: "Dupliquer",
    print: "Imprimer",
    export: "Exporter",
    import: "Importer",
    settings: "Paramètres",
    save: "Enregistrer",
    cancel: "Annuler",
    name: "Nom",
    quantity: "Quantité",
    price: "Prix",
    expiryDate: "Date d'expiration",
    barcode: "Code-barres",
    supplier: "Fournisseur",
    notes: "Notes",
  },
};

export function getLanguage() {
  const saved = localStorage.getItem("verishelf-language");
  return saved || "en";
}

export function setLanguage(lang) {
  localStorage.setItem("verishelf-language", lang);
}

export function t(key, lang = null) {
  const currentLang = lang || getLanguage();
  const translation = translations[currentLang] || translations.en;
  return translation[key] || key;
}

export function getAvailableLanguages() {
  return Object.keys(translations).map((code) => ({
    code,
    name: {
      en: "English",
      es: "Español",
      fr: "Français",
    }[code] || code,
  }));
}


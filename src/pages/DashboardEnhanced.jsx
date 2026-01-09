import { useState, useMemo, useEffect, useRef } from "react";
import AddItem from "../components/AddItem";
import InventoryTable from "../components/InventoryTable";
import StatsCards from "../components/StatsCards";
import LocationSelector from "../components/LocationSelector";
import SearchAndFilters from "../components/SearchAndFilters";
import AlertBanner from "../components/AlertBanner";
import EditItemModal from "../components/EditItemModal";
import BulkOperations from "../components/BulkOperations";
import { getStatus } from "../utils/expiry";
import { exportToCSV, importFromCSV, backupData, restoreData } from "../utils/export";
import { addHistoryEntry, getHistory } from "../utils/history";
import { requestNotificationPermission, checkExpiredItems } from "../utils/notifications";
import { getSettings, saveSettings } from "../utils/settings";
import { startExpiryEngine, stopExpiryEngine, getLastCheckTime, getNextCheckTime } from "../utils/expiryEngine";
import { createAuditLog, getAuditLogs, exportAuditLogsToCSV, exportAuditLogsToPDF, getComplianceReport } from "../utils/audit";
import { syncOfflineQueue, setupOfflineListener, getSyncStatus } from "../utils/offlineSync";
import { sendWebhookEvent } from "../utils/integrations";
import BarcodeScanner from "../components/BarcodeScanner";
import MultiLocationDashboard from "../components/MultiLocationDashboard";
import AuditLogsModal from "../components/AuditLogsModal";
import { getTemplates, saveTemplate } from "../utils/templates";
import { setupKeyboardShortcuts } from "../utils/keyboard";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { printLabel } from "../utils/print";
import StoreManager from "../components/StoreManager";
import { getStores } from "../utils/stores";
import { generatePDFReport } from "../utils/pdf";
import QRCodeGenerator from "../components/QRCodeGenerator";
import ExpiryCalendar from "../components/ExpiryCalendar";
import ProductHistoryTimeline from "../components/ProductHistoryTimeline";
import AlertsPanel from "../components/AlertsPanel";
import CostAnalysis from "../components/CostAnalysis";
import ProductComparison from "../components/ProductComparison";
import ThemeToggle from "../components/ThemeToggle";
import RecentItems from "../components/RecentItems";
import SavedSearches from "../components/SavedSearches";
import ImportWizard from "../components/ImportWizard";
import TemplateLibrary from "../components/TemplateLibrary";
import ProductGroups from "../components/ProductGroups";
import { saveSearch } from "../utils/savedSearches";
import { t, getLanguage, setLanguage, getAvailableLanguages } from "../utils/i18n";
import { formatCurrency, getCurrencies } from "../utils/currency";
import { getTimezones } from "../utils/timezone";
import { initSupabase, checkAuth, getCurrentUserProfile, getUserSubscription, loadItems, saveItem, deleteItem as deleteItemFromSupabase, logout } from "../utils/supabase";

export default function DashboardEnhanced() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStoreManager, setShowStoreManager] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  // Debug: Log state changes for panels
  useEffect(() => {
    console.log('Panel states changed:', {
      showCalendar,
      showCostAnalysis,
      showAlerts
    });
    // Force a re-render check
    if (showCalendar || showCostAnalysis || showAlerts) {
      console.log('At least one panel should be visible!');
    }
  }, [showCalendar, showCostAnalysis, showAlerts]);
  const [showHistory, setShowHistory] = useState(null);
  const [showQRCode, setShowQRCode] = useState(null);
  const [comparingItems, setComparingItems] = useState([]);
  const [showRecentItems, setShowRecentItems] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showProductGroups, setShowProductGroups] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [settings, setSettings] = useState(getSettings);
  const [stores, setStores] = useState(getStores);
  const [language, setLanguageState] = useState(getLanguage());
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showMultiLocation, setShowMultiLocation] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [expiryEngineStatus, setExpiryEngineStatus] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("verishelf-theme");
    return saved || "dark";
  });
  const searchInputRef = useRef(null);

  // Initialize Supabase and check authentication on mount
  useEffect(() => {
    async function initializeAuth() {
      try {
        // Initialize Supabase
        initSupabase();
        
        // Check authentication
        const authData = await checkAuth();
        if (!authData || !authData.user) {
          // Not authenticated - redirect to website (index.html)
          window.location.replace('/');
          return;
        }

        // Get user ID
        const userId = authData.user.id || authData.user?.id || JSON.parse(localStorage.getItem('verishelf_user') || '{}').id;
        if (!userId) {
          window.location.replace('/');
          return;
        }

        // Load user profile
        const userProfile = await getCurrentUserProfile();
        setUser(userProfile);

        // Load subscription
        const userSubscription = await getUserSubscription(userId);
        
        // Also check localStorage as fallback (for users who signed up before Supabase integration)
        const localSubscription = JSON.parse(localStorage.getItem('verishelf_subscription') || '{}');
        
        // Use subscription from database or fallback to localStorage
        const finalSubscription = userSubscription && Object.keys(userSubscription).length > 0 
          ? userSubscription 
          : (localSubscription && Object.keys(localSubscription).length > 0 ? localSubscription : null);
        
        setSubscription(finalSubscription);

        // Check if user has active subscription
        const hasActiveSubscription = 
          (finalSubscription && finalSubscription.status === 'active') ||
          (userProfile && userProfile.id); // Allow access if user exists (for development/testing)

        if (!hasActiveSubscription && (!finalSubscription || finalSubscription.status !== 'active')) {
          // No active subscription - show warning but allow access for now
          console.warn('No active subscription found for user:', userId);
          // For now, allow access but could redirect in production
          // alert('Please complete your subscription to access the dashboard.');
          // window.location.replace('/');
          // return;
        }

        // Load items from Supabase
        const userItems = await loadItems(userId);
        setItems(userItems);

        setLoading(false);
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Fallback to localStorage if Supabase fails
        const localUser = JSON.parse(localStorage.getItem('verishelf_user') || '{}');
        if (localUser.loggedIn) {
          setUser(localUser);
          const saved = localStorage.getItem('verishelf-items');
          setItems(saved ? JSON.parse(saved) : []);
        } else {
          window.location.replace('/');
        }
        setLoading(false);
      }
    }

    initializeAuth();
  }, []);

  // Close More menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showMoreMenu && !event.target.closest('.more-menu-container')) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  // Save items to Supabase when they change
  useEffect(() => {
    if (!user || !user.id || items.length === 0) return;

    // Debounce saves to avoid too many API calls
    const timeoutId = setTimeout(async () => {
      try {
        // Save each item to Supabase
        for (const item of items) {
          await saveItem(user.id, item);
        }
        // Also keep localStorage as backup
        localStorage.setItem("verishelf-items", JSON.stringify(items));
      } catch (error) {
        console.error('Error saving items:', error);
        // Fallback to localStorage
        localStorage.setItem("verishelf-items", JSON.stringify(items));
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [items, user]);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      setTheme(currentTheme);
    };
    
    // Check theme on mount
    handleThemeChange();
    
    // Watch for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    
    return () => observer.disconnect();
  }, []);

  // Theme-aware class helpers
  const btnClass = theme === "light" 
    ? "px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg text-sm transition-colors border border-gray-400"
    : "px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors";
  
  const btnClassFlex = theme === "light"
    ? "px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg text-sm transition-colors flex items-center gap-1.5 border border-gray-400"
    : "px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1.5";
  
  const dropdownClass = theme === "light"
    ? "bg-white border border-gray-400 rounded-lg shadow-xl p-1 min-w-[150px]"
    : "bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-1 min-w-[150px]";
  
  const dropdownItemClass = theme === "light"
    ? "w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-200 rounded"
    : "w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 rounded";
  
  const textSecondaryClass = theme === "light"
    ? "text-gray-700"
    : "text-slate-400";
  
  const btnClassMobile = theme === "light"
    ? "px-3 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 border border-gray-400"
    : "px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2";
  
  const mobileMenuBorderClass = theme === "light"
    ? "border-gray-400"
    : "border-slate-800";

  // Items are now saved via the useEffect above that syncs to Supabase

  // Setup Automated Expiry Engine (15-minute checks)
  useEffect(() => {
    requestNotificationPermission();
    
    if (settings.enableExpiryEngine !== false) {
      const interval = startExpiryEngine(items, settings, (results) => {
        setExpiryEngineStatus({
          lastCheck: getLastCheckTime(),
          nextCheck: getNextCheckTime(),
          expired: results.expired.length,
          expiringSoon: results.expiringSoon.length,
        });
        
        // Send webhook if configured
        if (results.expired.length > 0) {
          sendWebhookEvent("items_expired", results);
        }
      });
      
      return () => {
        stopExpiryEngine();
        if (interval) clearInterval(interval);
      };
    }
  }, [items, settings]);

  // Setup offline sync listener
  useEffect(() => {
    setupOfflineListener(
      () => {
        // Online - sync queue
        syncOfflineQueue(async (item) => {
          if (item.action === "add") {
            setItems((prev) => [...prev, { ...item.data, id: Date.now() }]);
          } else if (item.action === "update") {
            setItems((prev) => prev.map((i) => (i.id === item.data.id ? item.data : i)));
          }
        });
      },
      () => {
        console.log("Device went offline");
      }
    );
  }, []);

  // Setup keyboard shortcuts
  useEffect(() => {
    if (settings.enableKeyboardShortcuts) {
      return setupKeyboardShortcuts({
        onNewItem: () => document.querySelector('input[placeholder="Enter product name"]')?.focus(),
        onFocusSearch: () => searchInputRef.current?.focus(),
        onExport: handleExport,
        onSettings: () => setShowSettings(true),
        onEscape: () => {
          setEditingItem(null);
          setSelectedItems([]);
        },
      });
    }
  }, [settings.enableKeyboardShortcuts]);

  const addItem = async (item) => {
    if (!user || !user.id) return;

    const newItem = {
      ...item,
      id: Date.now(),
      location: selectedLocation === "All Locations" ? (stores[0]?.name || settings.defaultLocation) : selectedLocation,
      addedAt: new Date().toISOString(),
      removed: false,
    };
    
    // Save to Supabase immediately
    if (user.id) {
      const result = await saveItem(user.id, newItem);
      if (result.success && result.data) {
        newItem.id = result.data.id; // Use database ID
      }
    }
    
    setItems([...items, newItem]);
    addHistoryEntry("added", newItem.id, newItem.name);
    createAuditLog("added", newItem.id, newItem.name, {
      location: newItem.location,
      notes: "Product added via dashboard",
    });
    sendWebhookEvent("item_added", newItem);
  };

  const updateItem = async (updatedItem) => {
    if (!user || !user.id) return;

    // Save to Supabase
    if (user.id) {
      await saveItem(user.id, updatedItem);
    }

    setItems(items.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    addHistoryEntry("edited", updatedItem.id, updatedItem.name, { changes: "Product updated" });
    setEditingItem(null);
  };

  const removeItem = (id) => {
    const item = items.find((i) => i.id === id);
    setItems(
      items.map((i) =>
        i.id === id ? { ...i, removed: true, removedAt: new Date().toISOString() } : i
      )
    );
    addHistoryEntry("removed", id, item?.name || "");
    createAuditLog("removed", id, item?.name || "", {
      location: item?.location,
      notes: "Item removed from shelf",
    });
    sendWebhookEvent("item_removed", { ...item, removedAt: new Date().toISOString() });
  };

  const deleteItem = async (id, skipConfirmation = false) => {
    if (!skipConfirmation && !window.confirm("Are you sure you want to permanently delete this item?")) {
      return;
    }

    // Delete from Supabase
    if (user && user.id) {
      await deleteItemFromSupabase(user.id, id);
    }
    const item = items.find((i) => i.id === id);
    setItems(items.filter((i) => i.id !== id));
    addHistoryEntry("deleted", id, item?.name || "");
  };

  const duplicateItem = (id) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      const duplicated = {
        ...item,
        id: Date.now(),
        name: `${item.name} (Copy)`,
        addedAt: new Date().toISOString(),
        removed: false,
      };
      setItems([...items, duplicated]);
      addHistoryEntry("added", duplicated.id, duplicated.name, { duplicated: true });
    }
  };

  const handleBulkRemove = () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Remove ${selectedItems.length} item(s) from shelf?`)) {
      selectedItems.forEach((id) => removeItem(id));
      setSelectedItems([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Permanently delete ${selectedItems.length} item(s)? This action cannot be undone.`)) {
      // Delete all selected items at once, skipping individual confirmations
      const itemsToDelete = items.filter((i) => selectedItems.includes(i.id));
      itemsToDelete.forEach((item) => {
        addHistoryEntry("deleted", item.id, item.name || "");
      });
      setItems(items.filter((i) => !selectedItems.includes(i.id)));
      setSelectedItems([]);
    }
  };

  const handleExport = () => {
    const activeItems = items.filter((i) => !i.removed);
    exportToCSV(activeItems);
  };

  const handleExportPDF = (reportType = "full") => {
    const activeItems = items.filter((i) => !i.removed);
    generatePDFReport(activeItems, reportType);
  };

  const handleSaveSearch = () => {
    const name = window.prompt("Name for this search:");
    if (name) {
      saveSearch(name, {
        searchQuery,
        statusFilter,
        categoryFilter,
        selectedLocation,
      });
      alert("Search saved!");
    }
  };

  const handleLoadSearch = (filters) => {
    setSearchQuery(filters.searchQuery || "");
    setStatusFilter(filters.statusFilter || "all");
    setCategoryFilter(filters.categoryFilter || "all");
    setSelectedLocation(filters.selectedLocation || "All Locations");
    setShowSavedSearches(false);
  };

  const handleDateClick = (date, itemsForDate) => {
    if (itemsForDate.length > 0) {
      setSearchQuery("");
      setStatusFilter("all");
      // Filter to show items for this date
      alert(`${itemsForDate.length} item(s) expiring on ${date.toLocaleDateString()}`);
    }
  };

  const handleImport = async (file) => {
    try {
      const importedItems = await importFromCSV(file);
      setItems([...items, ...importedItems]);
      alert(`Successfully imported ${importedItems.length} items`);
    } catch (error) {
      alert("Error importing file: " + error.message);
    }
  };

  const handleBackup = () => {
    const templates = getTemplates();
    backupData(items, settings, templates);
  };

  const handleRestore = async (file) => {
    try {
      const backup = await restoreData(file);
      if (window.confirm("This will replace all current data. Continue?")) {
        setItems(backup.items || []);
        if (backup.settings) {
          setSettings(backup.settings);
          saveSettings(backup.settings);
        }
        alert("Data restored successfully");
      }
    } catch (error) {
      alert("Error restoring backup: " + error.message);
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation =
        selectedLocation === "All Locations" || item.location === selectedLocation;
      const matchesStatus =
        statusFilter === "all" || getStatus(item.expiry) === statusFilter.toUpperCase();
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesLocation && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, selectedLocation, statusFilter, categoryFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeItems = items.filter((i) => !i.removed);
    const expired = activeItems.filter((i) => getStatus(i.expiry) === "EXPIRED").length;
    const warning = activeItems.filter((i) => getStatus(i.expiry) === "WARNING").length;
    const safe = activeItems.filter((i) => getStatus(i.expiry) === "SAFE").length;
    const totalValue = activeItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    return {
      total: activeItems.length,
      expired,
      warning,
      safe,
      totalValue,
      locations: [...new Set(items.map((i) => i.location))].length || 1,
      categories: [...new Set(items.map((i) => i.category).filter(Boolean))],
      stores: stores,
    };
  }, [items]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (shouldn't happen due to useEffect, but safety check)
  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === "light" 
        ? "bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100" 
        : "bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"
    }`}>
      {/* Navigation */}
      <nav className={`fixed w-full backdrop-blur-lg z-50 border-b transition-colors duration-200 ${
        theme === "light"
          ? "bg-white/95 border-gray-300 supports-[backdrop-filter]:bg-white/80 shadow-sm"
          : "bg-slate-950/95 border-slate-800 supports-[backdrop-filter]:bg-slate-950/80"
      }`}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2 sm:gap-4 min-w-0">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold flex-shrink-0">
              <span className="gradient-text">VeriShelf</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2 justify-end flex-shrink min-w-0">
              {/* User Info */}
              <div className={`hidden 2xl:flex items-center gap-2 text-xs xl:text-sm ${textSecondaryClass} mr-2 xl:mr-4 px-2 xl:px-3 py-1 xl:py-1.5 rounded-lg flex-shrink-0 ${
                theme === "light" ? "bg-gray-100" : "bg-slate-800"
              }`}>
                <div className="flex flex-col items-end min-w-0">
                  <span className={`font-semibold truncate max-w-[120px] xl:max-w-none ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                    {user.name || user.email}
                  </span>
                  {user.company && (
                    <span className="text-xs truncate max-w-[120px] xl:max-w-none">{user.company}</span>
                  )}
                  {subscription && (
                    <span className="text-xs text-emerald-400">{subscription.plan} Plan</span>
                  )}
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={async () => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    await logout();
                  }
                }}
                className={`${btnClassFlex} text-red-400 hover:text-red-300 flex-shrink-0`}
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden 2xl:inline">Logout</span>
              </button>
              
              <div className={`hidden 2xl:flex items-center gap-2 text-xs xl:text-sm ${textSecondaryClass} mr-2 flex-shrink-0`}>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow"></div>
                <span>24/7 Monitoring</span>
              </div>
              
              {/* Essential buttons - responsive visibility */}
              <div 
                className="relative flex-shrink-0"
                onMouseEnter={() => {
                  console.log('Export menu hover enter');
                  setShowExportMenu(true);
                }}
                onMouseLeave={() => {
                  console.log('Export menu hover leave');
                  setShowExportMenu(false);
                }}
              >
                <button
                  onClick={handleExport}
                  className={btnClassFlex}
                  title="Export to CSV"
                  onMouseEnter={() => setShowExportMenu(true)}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden 2xl:inline">Export</span>
                </button>
                {showExportMenu && (
                  <div 
                    className="absolute top-full left-0 mt-1 z-[100]"
                    style={{ 
                      display: 'block',
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '0.25rem'
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      console.log('Export dropdown hover enter');
                      setShowExportMenu(true);
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      console.log('Export dropdown hover leave');
                      setShowExportMenu(false);
                    }}
                  >
                  <div className={dropdownClass}>
                    <button
                      onClick={() => handleExportPDF("full")}
                      className={dropdownItemClass}
                    >
                      Export Full (PDF)
                    </button>
                    <button
                      onClick={() => handleExportPDF("expired")}
                      className={dropdownItemClass}
                    >
                      Export Expired (PDF)
                    </button>
                    <button
                      onClick={() => handleExportPDF("expiring")}
                      className={dropdownItemClass}
                    >
                      Export Expiring (PDF)
                    </button>
                  </div>
                </div>
                )}
              </div>
              
              <button
                onClick={() => setShowImportWizard(true)}
                className={btnClassFlex}
                title="Import CSV"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden 2xl:inline">Import</span>
              </button>
              
              {/* Secondary buttons - hide on smaller screens */}
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`${btnClassFlex} hidden xl:flex`}
                title="Calendar"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden 2xl:inline">Calendar</span>
              </button>
              
              <button
                onClick={() => setShowCostAnalysis(!showCostAnalysis)}
                className={`${btnClassFlex} hidden xl:flex`}
                title="Cost Analysis"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden 2xl:inline">Cost</span>
              </button>
              
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className={`${btnClassFlex} relative hidden xl:flex`}
                title="Alerts"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="hidden 2xl:inline">Alerts</span>
              </button>
              
              <button
                onClick={() => setShowStoreManager(true)}
                className={`${btnClassFlex} hidden xl:flex`}
                title="Stores"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden 2xl:inline">Stores</span>
              </button>
              
              <button
                onClick={() => setShowBarcodeScanner(true)}
                className="px-2 xl:px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm transition-colors flex items-center gap-1.5 flex-shrink-0"
                title="Scan"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="hidden 2xl:inline">Scan</span>
              </button>
              
              <button
                onClick={() => setShowMultiLocation(true)}
                className="px-2 xl:px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 hidden xl:flex"
                title="Locations"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden 2xl:inline">Locations</span>
              </button>
              
              {/* More Menu - consolidates less essential buttons */}
              <div 
                className="relative flex-shrink-0 more-menu-container"
                onMouseEnter={() => {
                  console.log('More menu hover enter');
                  setShowMoreMenu(true);
                }}
                onMouseLeave={(e) => {
                  // Only close if we're actually leaving the container (not moving to dropdown)
                  const relatedTarget = e.relatedTarget;
                  if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
                    console.log('More menu hover leave');
                    setTimeout(() => setShowMoreMenu(false), 150);
                  }
                }}
              >
              <button
                  onClick={() => {
                    console.log('More button clicked');
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className={`${btnClassFlex} hidden xl:flex`}
                  title="More options"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                  <span className="hidden 2xl:inline">More</span>
                </button>
                {showMoreMenu && (
                  <div 
                    className="absolute top-full right-0 mt-1 z-[100] w-48"
                    onMouseEnter={() => {
                      console.log('Dropdown hover enter');
                      setShowMoreMenu(true);
                    }}
                    onMouseLeave={(e) => {
                      // Only close if we're actually leaving the dropdown
                      const relatedTarget = e.relatedTarget;
                      if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
                        console.log('Dropdown hover leave');
                        setTimeout(() => setShowMoreMenu(false), 150);
                      }
                    }}
                  >
                    <div className={dropdownClass}>
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Calendar clicked, current state:', showCalendar);
                        // Toggle state
                        setShowCalendar(prev => !prev);
                        console.log('Calendar state toggled');
                        // Close menu immediately
                        setShowMoreMenu(false);
                      }}
                      className={dropdownItemClass}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {showCalendar ? 'Hide Calendar' : 'Calendar'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Cost Analysis clicked, current state:', showCostAnalysis);
                        setShowCostAnalysis(prev => !prev);
                        console.log('Cost Analysis state toggled');
                        setShowMoreMenu(false);
                      }}
                      className={dropdownItemClass}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {showCostAnalysis ? 'Hide Cost Analysis' : 'Cost Analysis'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Alerts clicked, current state:', showAlerts);
                        setShowAlerts(prev => !prev);
                        console.log('Alerts state toggled');
                        setShowMoreMenu(false);
                      }}
                      className={dropdownItemClass}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {showAlerts ? 'Hide Alerts' : 'Alerts'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Stores clicked');
                        setShowStoreManager(true); 
                        setTimeout(() => {
                          setShowMoreMenu(false);
                        }, 50);
                      }}
                      className={dropdownItemClass}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Stores
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Locations clicked');
                        setShowMultiLocation(true); 
                        setTimeout(() => {
                          setShowMoreMenu(false);
                        }, 50);
                      }}
                      className={dropdownItemClass}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Locations
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Audit Logs clicked');
                        setShowAuditLogs(true); 
                        setTimeout(() => {
                          setShowMoreMenu(false);
                        }, 50);
                      }}
                      className={dropdownItemClass}
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                      Audit Logs
              </button>
                  </div>
                </div>
                )}
              </div>
              
              <div className="flex-shrink-0">
              <ThemeToggle />
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className={`${btnClass} flex-shrink-0`}
                title="Settings"
              >
                <svg className="w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                theme === "light"
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className={`lg:hidden mt-4 pt-4 border-t ${mobileMenuBorderClass}`}>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { handleExport(); setShowMobileMenu(false); }}
                  className={btnClassMobile}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={() => { setShowImportWizard(true); setShowMobileMenu(false); }}
                  className={btnClassMobile}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Import
                </button>
                <button
                  onClick={() => { setShowCalendar(!showCalendar); setShowMobileMenu(false); }}
                  className={btnClassMobile}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendar
                </button>
                <button
                  onClick={() => { setShowCostAnalysis(!showCostAnalysis); setShowMobileMenu(false); }}
                  className={btnClassMobile}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Cost
                </button>
                <button
                  onClick={() => { setShowAlerts(!showAlerts); setShowMobileMenu(false); }}
                  className={btnClassMobile}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Alerts
                </button>
                <button
                  onClick={() => { setShowStoreManager(true); setShowMobileMenu(false); }}
                  className={btnClassMobile}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Stores
                </button>
                <button
                  onClick={() => { setShowBarcodeScanner(true); setShowMobileMenu(false); }}
                  className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Scan
                </button>
                <button
                  onClick={() => { setShowMultiLocation(true); setShowMobileMenu(false); }}
                  className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Locations
                </button>
                <button
                  onClick={() => { setShowAuditLogs(true); setShowMobileMenu(false); }}
                  className="px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Audit
                </button>
                <div className="col-span-2">
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => { setShowSettings(true); setShowMobileMenu(false); }}
                  className={`col-span-2 ${btnClassMobile}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <button
                  onClick={async () => {
                    setShowMobileMenu(false);
                    if (window.confirm('Are you sure you want to logout?')) {
                      await logout();
                    }
                  }}
                  className="col-span-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {stats.expired > 0 && <AlertBanner count={stats.expired} />}

        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Expiry <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Real-time tracking and management of shelf expiry across all locations
          </p>
        </div>

        {/* Expiry Engine Status */}
        {expiryEngineStatus && (
          <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>
                  <div className="text-sm font-semibold text-white">Automated Expiry Engine Active</div>
                  <div className="text-xs text-slate-400">
                    Last check: {expiryEngineStatus.lastCheck ? new Date(expiryEngineStatus.lastCheck).toLocaleTimeString() : "Never"} • 
                    Next check: {expiryEngineStatus.nextCheck ? new Date(expiryEngineStatus.nextCheck).toLocaleTimeString() : "—"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-red-400 font-semibold">{expiryEngineStatus.expired} Expired</div>
                <div className="text-xs text-yellow-400">{expiryEngineStatus.expiringSoon} Expiring Soon</div>
              </div>
            </div>
          </div>
        )}

        <StatsCards stats={stats} />

        {/* Alerts Panel */}
        {showAlerts && (
          <div className="mb-8 relative" key="alerts-panel">
            <div className="card-gradient rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Alerts</h2>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
                  title="Close Alerts"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <AlertsPanel
                items={items}
                settings={settings}
                onItemClick={(item) => setEditingItem(item)}
              />
            </div>
          </div>
        )}

        {/* Cost Analysis */}
        {showCostAnalysis && (
          <div className="mb-8 relative" key="cost-analysis-panel">
            <div className="card-gradient rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Cost Analysis</h2>
                <button
                  onClick={() => setShowCostAnalysis(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
                  title="Close Cost Analysis"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CostAnalysis items={items} />
            </div>
          </div>
        )}

        {/* Calendar View */}
        {showCalendar && (
          <div className="mb-8 relative" key="calendar-panel">
            <div className="card-gradient rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Expiry Calendar</h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
                  title="Close Calendar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ExpiryCalendar items={items} onDateClick={handleDateClick} />
            </div>
          </div>
        )}

        {/* Analytics */}
        {showAnalytics && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Analytics</h2>
            <AnalyticsCharts items={items} />
          </div>
        )}

        {/* Recent Items & Saved Searches Sidebar */}
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            {/* Existing content */}
          </div>
          <div className="space-y-6">
            {showRecentItems && <RecentItems items={items} onItemClick={setEditingItem} />}
            {showSavedSearches && (
              <SavedSearches onLoadSearch={handleLoadSearch} />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setShowRecentItems(!showRecentItems)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
              >
                {showRecentItems ? "Hide" : "Show"} Recent
              </button>
              <button
                onClick={() => setShowSavedSearches(!showSavedSearches)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
              >
                Saved Searches
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SearchAndFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categories={stats.categories}
              searchInputRef={searchInputRef}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSaveSearch}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors"
              >
                Save Search
              </button>
              {selectedItems.length >= 2 && (
                <button
                  onClick={() => {
                    const itemsToCompare = items.filter((i) => selectedItems.includes(i.id));
                    setComparingItems(itemsToCompare);
                  }}
                  className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Compare Selected ({selectedItems.length})
                </button>
              )}
            </div>
          </div>
          <div>
            <LocationSelector
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              stores={stores}
            />
            <button
              onClick={() => setShowStoreManager(true)}
              className="mt-3 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Manage Stores
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Add Product</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium transition-colors"
              >
                📚 Templates
              </button>
              {selectedItems.length > 0 && (
                <button
                  onClick={() => setShowProductGroups(true)}
                  className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium transition-colors"
                >
                  📦 Group Selected
                </button>
              )}
            </div>
          </div>
          <AddItem
            onAdd={addItem}
            selectedLocation={selectedLocation}
            template={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
          />
        </div>

        <div className="card-gradient rounded-2xl p-6 card-gradient-hover">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Inventory</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-400">
                Showing <span className="text-emerald-400 font-semibold">{filteredItems.length}</span> items •{" "}
                <span className="text-emerald-400 font-semibold">{stats.total}</span> active
              </div>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                title="View Analytics"
              >
                {showAnalytics ? "Hide" : "Show"} Analytics
              </button>
              <button
                onClick={handleBackup}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
                title="Backup data"
              >
                Backup
              </button>
            </div>
          </div>
          <InventoryTable
            items={filteredItems}
            onRemove={removeItem}
            onDelete={deleteItem}
            onEdit={setEditingItem}
            onDuplicate={duplicateItem}
            onShowQR={(item) => setShowQRCode(item)}
            onShowHistory={(item) => setShowHistory(item)}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
          />
        </div>
      </main>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={updateItem}
        />
      )}

      <BulkOperations
        selectedItems={selectedItems}
        onBulkRemove={handleBulkRemove}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedItems([])}
      />

      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
            setShowSettings(false);
          }}
        />
      )}

      {showStoreManager && (
        <StoreManager
          onClose={() => setShowStoreManager(false)}
          onStoresUpdate={(updatedStores) => {
            setStores(updatedStores);
          }}
          maxLocations={subscription?.location_count || subscription?.locationCount || null}
        />
      )}

      {showBarcodeScanner && (
        <BarcodeScanner
          onScan={(barcode) => {
            // Find item by barcode or create new
            const existingItem = items.find((i) => i.barcode === barcode);
            if (existingItem) {
              setEditingItem(existingItem);
            } else {
              // Pre-fill barcode in add form
              const barcodeInput = document.querySelector('input[placeholder*="barcode" i]');
              if (barcodeInput) {
                barcodeInput.value = barcode;
                barcodeInput.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
            setShowBarcodeScanner(false);
          }}
          onClose={() => setShowBarcodeScanner(false)}
        />
      )}

      {showMultiLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Multi-Location Dashboard</h2>
              <button
                onClick={() => setShowMultiLocation(false)}
                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <MultiLocationDashboard items={items} stores={stores} settings={settings} />
            </div>
          </div>
        </div>
      )}

      {showAuditLogs && (
        <AuditLogsModal
          onClose={() => setShowAuditLogs(false)}
        />
      )}

      {showQRCode && (
        <QRCodeGenerator item={showQRCode} onClose={() => setShowQRCode(null)} />
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                History: {showHistory.name}
              </h2>
              <button
                onClick={() => setShowHistory(null)}
                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ProductHistoryTimeline itemId={showHistory.id} itemName={showHistory.name} />
            </div>
          </div>
        </div>
      )}

      {comparingItems.length > 0 && (
        <ProductComparison
          items={comparingItems}
          onClose={() => setComparingItems([])}
        />
      )}

      {showImportWizard && (
        <ImportWizard
          onClose={() => setShowImportWizard(false)}
          onImport={(importedItems) => {
            setItems([...items, ...importedItems]);
            setShowImportWizard(false);
            alert(`Successfully imported ${importedItems.length} items`);
          }}
        />
      )}

      {showTemplateLibrary && (
        <TemplateLibrary
          onSelectTemplate={(template) => {
            setSelectedTemplate(template);
            setShowTemplateLibrary(false);
          }}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}

      {showProductGroups && (
        <ProductGroups
          items={items.filter((i) => selectedItems.includes(i.id))}
          onClose={() => setShowProductGroups(false)}
        />
      )}
    </div>
  );
}

// Settings Modal Component
function SettingsModal({ settings, onClose, onSave }) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    onSave(localSettings);
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "notifications", label: "Notifications" },
    { id: "appearance", label: "Appearance" },
    { id: "advanced", label: "Advanced" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-emerald-400 border-b-2 border-emerald-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* General Tab */}
          {activeTab === "general" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Warning Days (days before expiry to show warning)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.warningDays || 3}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, warningDays: parseInt(e.target.value) || 3 })
                  }
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Default Location</label>
                <input
                  type="text"
                  value={localSettings.defaultLocation || "Store #001"}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, defaultLocation: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
                <select
                  value={localSettings.currency || "USD"}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, currency: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  {Object.entries(getCurrencies()).map(([code, curr]) => (
                    <option key={code} value={code}>
                      {curr.symbol} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Language</label>
                <select
                  value={localSettings.language || "en"}
                  onChange={(e) => {
                    setLocalSettings({ ...localSettings, language: e.target.value });
                    setLanguage(e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  {getAvailableLanguages().map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Time Zone</label>
                <select
                  value={localSettings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, timezone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  {getTimezones().map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Enable Notifications
                  </label>
                  <p className="text-xs text-slate-500">Browser notifications for expired items</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enableNotifications !== false}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, enableNotifications: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notification Check Interval (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.notificationInterval || 60}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, notificationInterval: parseInt(e.target.value) || 60 })
                  }
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
                <select
                  value={localSettings.theme || "dark"}
                  onChange={(e) => {
                    setLocalSettings({ ...localSettings, theme: e.target.value });
                    document.documentElement.setAttribute("data-theme", e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date Format</label>
                <select
                  value={localSettings.dateFormat || "MM/DD/YYYY"}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, dateFormat: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </>
          )}

          {/* Advanced Tab */}
          {activeTab === "advanced" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Keyboard Shortcuts
                  </label>
                  <p className="text-xs text-slate-500">Enable keyboard shortcuts (Ctrl+N, Ctrl+F, etc.)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.enableKeyboardShortcuts !== false}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, enableKeyboardShortcuts: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Default Categories</label>
                <textarea
                  value={(localSettings.categories || []).join(", ")}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      categories: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Dairy, Produce, Meat, Bakery..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">Comma-separated list of default categories</p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}


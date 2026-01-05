// Export to CSV
export function exportToCSV(items, filename = "verishelf-inventory.csv") {
  const headers = [
    "Name",
    "Barcode",
    "Category",
    "Quantity",
    "Price",
    "Expiry Date",
    "Status",
    "Location",
    "Batch/Lot",
    "Supplier",
    "Notes",
    "Added Date",
  ];

  const rows = items.map((item) => [
    item.name || "",
    item.barcode || "",
    item.category || "",
    item.quantity || 0,
    item.price || 0,
    item.expiry || "",
    getStatus(item.expiry) || "",
    item.location || "",
    item.batchNumber || "",
    item.supplier || "",
    item.notes || "",
    item.addedAt || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import from CSV
export function importFromCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());

        const items = lines.slice(1).map((line, index) => {
          if (!line.trim()) return null;
          const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
          const item = {};
          headers.forEach((header, i) => {
            const value = values[i]?.replace(/^"|"$/g, "").trim() || "";
            switch (header.toLowerCase()) {
              case "name":
                item.name = value;
                break;
              case "barcode":
                item.barcode = value;
                break;
              case "category":
                item.category = value;
                break;
              case "quantity":
                item.quantity = parseInt(value) || 1;
                break;
              case "price":
                item.price = parseFloat(value) || 0;
                break;
              case "expiry date":
                item.expiry = value;
                break;
              case "location":
                item.location = value;
                break;
              case "batch/lot":
                item.batchNumber = value;
                break;
              case "supplier":
                item.supplier = value;
                break;
              case "notes":
                item.notes = value;
                break;
            }
          });
          if (item.name && item.expiry) {
            return {
              ...item,
              id: Date.now() + index,
              addedAt: new Date().toISOString(),
              removed: false,
            };
          }
          return null;
        });

        resolve(items.filter((item) => item !== null));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Backup data
export function backupData(items, settings, templates) {
  const backup = {
    version: "1.0",
    timestamp: new Date().toISOString(),
    items,
    settings,
    templates,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `verishelf-backup-${new Date().toISOString().split("T")[0]}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Restore data
export function restoreData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        resolve(backup);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function getStatus(date) {
  if (!date) return "";
  const today = new Date();
  const expiry = new Date(date);
  const diff = expiry - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "EXPIRED";
  if (days <= 3) return "WARNING";
  return "SAFE";
}


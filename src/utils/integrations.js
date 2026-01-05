// Enterprise Integrations - POS, ERP, supplier systems, analytics pipelines

/**
 * Webhook configuration
 */
export function saveWebhookConfig(webhookConfig) {
  localStorage.setItem("verishelf-webhook-config", JSON.stringify(webhookConfig));
}

export function getWebhookConfig() {
  const saved = localStorage.getItem("verishelf-webhook-config");
  return saved ? JSON.parse(saved) : {
    enabled: false,
    url: "",
    events: [],
    headers: {},
  };
}

/**
 * Send webhook event
 */
export async function sendWebhookEvent(eventType, data) {
  const config = getWebhookConfig();
  
  if (!config.enabled || !config.url || !config.events.includes(eventType)) {
    return { success: false, error: "Webhook not configured for this event" };
  }

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      body: JSON.stringify({
        event: eventType,
        timestamp: new Date().toISOString(),
        data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    return { success: true, response: await response.json() };
  } catch (error) {
    console.error("Webhook error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Export data for ERP/POS systems
 */
export function exportForERP(items, format = "json") {
  const erpData = items.map((item) => ({
    product_id: item.id,
    product_name: item.name,
    barcode: item.barcode || null,
    category: item.category || null,
    quantity: item.quantity,
    unit: item.unit || "piece",
    price: item.price || 0,
    expiry_date: item.expiry,
    location: item.location || null,
    supplier: item.supplier || null,
    batch_number: item.batchNumber || null,
    status: item.removed ? "removed" : "active",
    last_updated: item.addedAt || new Date().toISOString(),
  }));

  if (format === "json") {
    return JSON.stringify(erpData, null, 2);
  } else if (format === "csv") {
    const headers = Object.keys(erpData[0] || {});
    const rows = erpData.map((item) => headers.map((h) => item[h] || "").join(","));
    return [headers.join(","), ...rows].join("\n");
  } else if (format === "xml") {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<products>\n';
    erpData.forEach((item) => {
      xml += "  <product>\n";
      Object.entries(item).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`;
      });
      xml += "  </product>\n";
    });
    xml += "</products>";
    return xml;
  }

  return erpData;
}

/**
 * Import data from POS/ERP systems
 */
export function importFromERP(data, format = "json") {
  let items = [];

  if (format === "json") {
    items = Array.isArray(data) ? data : JSON.parse(data);
  } else if (format === "csv") {
    const lines = data.split("\n");
    const headers = lines[0].split(",");
    items = lines.slice(1).map((line) => {
      const values = line.split(",");
      const item = {};
      headers.forEach((header, index) => {
        item[header.trim()] = values[index]?.trim() || "";
      });
      return item;
    });
  }

  // Transform ERP format to VeriShelf format
  return items.map((erpItem) => ({
    id: erpItem.product_id || Date.now() + Math.random(),
    name: erpItem.product_name || erpItem.name,
    barcode: erpItem.barcode || null,
    category: erpItem.category || null,
    quantity: parseInt(erpItem.quantity) || 1,
    unit: erpItem.unit || "piece",
    price: parseFloat(erpItem.price) || 0,
    expiry: erpItem.expiry_date || erpItem.expiry || null,
    location: erpItem.location || null,
    supplier: erpItem.supplier || null,
    batchNumber: erpItem.batch_number || null,
    removed: erpItem.status === "removed",
    addedAt: erpItem.last_updated || new Date().toISOString(),
  }));
}

/**
 * Generate API key for integrations
 */
export function generateAPIKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Save API configuration
 */
export function saveAPIConfig(config) {
  localStorage.setItem("verishelf-api-config", JSON.stringify(config));
}

export function getAPIConfig() {
  const saved = localStorage.getItem("verishelf-api-config");
  return saved ? JSON.parse(saved) : {
    enabled: false,
    apiKey: null,
    allowedOrigins: [],
  };
}

/**
 * Analytics export for data pipelines
 */
export function exportAnalyticsData(items, startDate, endDate) {
  const analytics = {
    period: {
      start: startDate,
      end: endDate,
    },
    summary: {
      totalItems: items.length,
      activeItems: items.filter((i) => !i.removed).length,
      expiredItems: items.filter((i) => !i.removed && new Date(i.expiry) < new Date()).length,
      totalValue: items.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0),
    },
    byLocation: {},
    byCategory: {},
    bySupplier: {},
    expiryTrends: [],
  };

  items.forEach((item) => {
    // By location
    const location = item.location || "Unknown";
    if (!analytics.byLocation[location]) {
      analytics.byLocation[location] = { count: 0, value: 0 };
    }
    analytics.byLocation[location].count++;
    analytics.byLocation[location].value += (item.price || 0) * item.quantity;

    // By category
    const category = item.category || "Uncategorized";
    if (!analytics.byCategory[category]) {
      analytics.byCategory[category] = { count: 0, value: 0 };
    }
    analytics.byCategory[category].count++;
    analytics.byCategory[category].value += (item.price || 0) * item.quantity;

    // By supplier
    if (item.supplier) {
      if (!analytics.bySupplier[item.supplier]) {
        analytics.bySupplier[item.supplier] = { count: 0, value: 0 };
      }
      analytics.bySupplier[item.supplier].count++;
      analytics.bySupplier[item.supplier].value += (item.price || 0) * item.quantity;
    }

    // Expiry trends
    if (item.expiry) {
      analytics.expiryTrends.push({
        date: item.expiry,
        itemId: item.id,
        itemName: item.name,
        daysUntil: Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24)),
      });
    }
  });

  return analytics;
}

/**
 * Supplier integration - sync supplier data
 */
export async function syncSupplierData(supplierConfig) {
  // In production, this would call supplier API
  // For now, return mock data structure
  return {
    success: true,
    products: [],
    lastSync: new Date().toISOString(),
  };
}


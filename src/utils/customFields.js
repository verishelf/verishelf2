// Custom fields management
export function getCustomFieldDefinitions() {
  const saved = localStorage.getItem("verishelf-custom-fields");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveCustomFieldDefinitions(fields) {
  localStorage.setItem("verishelf-custom-fields", JSON.stringify(fields));
}

export function addCustomField(field) {
  const fields = getCustomFieldDefinitions();
  fields.push({
    id: Date.now(),
    ...field,
  });
  saveCustomFieldDefinitions(fields);
  return fields;
}

export function updateCustomField(id, updates) {
  const fields = getCustomFieldDefinitions();
  const index = fields.findIndex((f) => f.id === id);
  if (index >= 0) {
    fields[index] = { ...fields[index], ...updates };
    saveCustomFieldDefinitions(fields);
  }
  return fields;
}

export function deleteCustomField(id) {
  const fields = getCustomFieldDefinitions();
  const filtered = fields.filter((f) => f.id !== id);
  saveCustomFieldDefinitions(filtered);
  return filtered;
}


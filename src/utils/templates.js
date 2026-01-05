// Product templates management
export function getTemplates() {
  const saved = localStorage.getItem("verishelf-templates");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveTemplate(template) {
  const templates = getTemplates();
  const newTemplate = {
    ...template,
    id: template.id || Date.now(),
    createdAt: template.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const index = templates.findIndex((t) => t.id === newTemplate.id);
  if (index >= 0) {
    templates[index] = newTemplate;
  } else {
    templates.push(newTemplate);
  }
  
  localStorage.setItem("verishelf-templates", JSON.stringify(templates));
  return newTemplate;
}

export function deleteTemplate(id) {
  const templates = getTemplates();
  const filtered = templates.filter((t) => t.id !== id);
  localStorage.setItem("verishelf-templates", JSON.stringify(filtered));
}

export function getTemplate(id) {
  const templates = getTemplates();
  return templates.find((t) => t.id === id);
}


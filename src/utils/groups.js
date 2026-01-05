// Product grouping/bundling
export function getGroups() {
  const saved = localStorage.getItem("verishelf-groups");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveGroup(group) {
  const groups = getGroups();
  const newGroup = {
    ...group,
    id: group.id || Date.now(),
    createdAt: group.createdAt || new Date().toISOString(),
  };
  
  const index = groups.findIndex((g) => g.id === newGroup.id);
  if (index >= 0) {
    groups[index] = newGroup;
  } else {
    groups.push(newGroup);
  }
  
  localStorage.setItem("verishelf-groups", JSON.stringify(groups));
  return newGroup;
}

export function deleteGroup(id) {
  const groups = getGroups();
  const filtered = groups.filter((g) => g.id !== id);
  localStorage.setItem("verishelf-groups", JSON.stringify(filtered));
  return filtered;
}

export function getGroup(id) {
  const groups = getGroups();
  return groups.find((g) => g.id === id);
}


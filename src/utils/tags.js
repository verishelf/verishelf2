// Product tags management
export function getTags() {
  const saved = localStorage.getItem("verishelf-tags");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveTags(tags) {
  localStorage.setItem("verishelf-tags", JSON.stringify(tags));
}

export function addTag(tag) {
  const tags = getTags();
  if (!tags.includes(tag)) {
    tags.push(tag);
    saveTags(tags);
  }
  return tags;
}

export function deleteTag(tag) {
  const tags = getTags();
  const filtered = tags.filter((t) => t !== tag);
  saveTags(filtered);
  return filtered;
}


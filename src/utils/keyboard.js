// Keyboard shortcuts
export function setupKeyboardShortcuts(handlers) {
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Key combinations
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      switch (e.key) {
        case "n":
          e.preventDefault();
          handlers.onNewItem?.();
          break;
        case "f":
          e.preventDefault();
          handlers.onFocusSearch?.();
          break;
        case "e":
          e.preventDefault();
          handlers.onExport?.();
          break;
        case "s":
          e.preventDefault();
          handlers.onSettings?.();
          break;
      }
    }

    // Escape key
    if (e.key === "Escape") {
      handlers.onEscape?.();
    }

    // Delete key (when not in input)
    if (e.key === "Delete" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      handlers.onDelete?.();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}


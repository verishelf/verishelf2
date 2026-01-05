// Browser notifications
let notificationPermission = null;

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showNotification(title, options = {}) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification(title, {
    icon: "/vite.svg",
    badge: "/vite.svg",
    ...options,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  return notification;
}

export function checkExpiredItems(items) {
  const expired = items.filter(
    (item) => !item.removed && new Date(item.expiry) < new Date()
  );
  
  if (expired.length > 0) {
    showNotification(
      `${expired.length} Item${expired.length > 1 ? "s" : ""} Expired`,
      {
        body: `You have ${expired.length} expired item${expired.length > 1 ? "s" : ""} that need attention.`,
        tag: "expired-items",
      }
    );
  }
}


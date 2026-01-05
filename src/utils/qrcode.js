// QR Code utilities
export function generateQRData(item) {
  const data = {
    name: item.name,
    expiry: item.expiry,
    location: item.location,
    barcode: item.barcode,
    id: item.id,
  };
  return JSON.stringify(data);
}

export function scanQRCode(data) {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}


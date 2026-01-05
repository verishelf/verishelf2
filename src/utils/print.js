// Print labels functionality
export function printLabel(item) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print labels");
    return;
  }

  const labelHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Product Label - ${item.name}</title>
        <style>
          @media print {
            @page {
              size: 4in 2in;
              margin: 0.1in;
            }
            body {
              margin: 0;
              padding: 0.1in;
              font-family: Arial, sans-serif;
              font-size: 10pt;
            }
          }
          body {
            margin: 0;
            padding: 0.1in;
            font-family: Arial, sans-serif;
            font-size: 10pt;
          }
          .label {
            border: 1px solid #000;
            padding: 0.1in;
            height: 1.8in;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .name {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 0.05in;
          }
          .details {
            font-size: 9pt;
            line-height: 1.3;
          }
          .expiry {
            font-weight: bold;
            color: #dc2626;
            font-size: 11pt;
            margin-top: 0.1in;
          }
          .barcode {
            font-family: monospace;
            font-size: 9pt;
            margin-top: 0.05in;
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div>
            <div class="name">${item.name || "Product"}</div>
            <div class="details">
              ${item.category ? `<div>Category: ${item.category}</div>` : ""}
              ${item.batchNumber ? `<div>Batch: ${item.batchNumber}</div>` : ""}
              ${item.location ? `<div>Location: ${item.location}</div>` : ""}
              ${item.quantity ? `<div>Qty: ${item.quantity}</div>` : ""}
            </div>
          </div>
          <div>
            <div class="expiry">Expires: ${new Date(item.expiry).toLocaleDateString()}</div>
            ${item.barcode ? `<div class="barcode">${item.barcode}</div>` : ""}
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(labelHTML);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

export function printLabels(items) {
  items.forEach((item, index) => {
    setTimeout(() => printLabel(item), index * 500);
  });
}


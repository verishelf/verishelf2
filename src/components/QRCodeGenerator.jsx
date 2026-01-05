import { QRCodeSVG } from "qrcode.react";
import { generateQRData } from "../utils/qrcode";

export default function QRCodeGenerator({ item, onClose }) {
  if (!item) return null;

  const qrData = generateQRData(item);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${item.name}</title>
          <style>
            @media print {
              @page { size: 4in 4in; margin: 0.5in; }
            }
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .qr-code { margin: 20px 0; }
            .product-name { font-size: 16pt; font-weight: bold; margin-bottom: 10px; }
            .product-info { font-size: 10pt; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="product-name">${item.name}</div>
          <div class="qr-code">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
              ${document.querySelector("#qr-code-svg")?.innerHTML || ""}
            </svg>
          </div>
          <div class="product-info">
            <div>Expires: ${new Date(item.expiry).toLocaleDateString()}</div>
            <div>Location: ${item.location || "N/A"}</div>
            ${item.barcode ? `<div>Barcode: ${item.barcode}</div>` : ""}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">QR Code</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center">
          <div className="bg-white p-4 rounded-lg inline-block mb-4">
            <QRCodeSVG
              id="qr-code-svg"
              value={qrData}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="text-white mb-4">
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-slate-400 mt-1">
              Expires: {new Date(item.expiry).toLocaleDateString()}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-colors"
            >
              Print QR Code
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


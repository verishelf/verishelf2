import { useState } from "react";
import { importFromCSV } from "../utils/export";

export default function ImportWizard({ onClose, onImport }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [errors, setErrors] = useState([]);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    try {
      const items = await importFromCSV(selectedFile);
      setPreview(items);
      setStep(2);
    } catch (error) {
      setErrors([error.message]);
    }
  };

  const handleImport = () => {
    if (preview && preview.length > 0) {
      onImport(preview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Import Data Wizard</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Step 1: Select CSV File</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Choose a CSV file to import. The file should have columns for product name, expiry date, and other fields.
                </p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-lg cursor-pointer transition-colors bg-slate-950/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-slate-400">
                      <span className="font-semibold">Click to upload</span> CSV file
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && preview && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Step 2: Preview Import</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Review the {preview.length} item(s) that will be imported:
                </p>
                <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-slate-300">Name</th>
                        <th className="px-3 py-2 text-left text-slate-300">Expiry</th>
                        <th className="px-3 py-2 text-left text-slate-300">Qty</th>
                        <th className="px-3 py-2 text-left text-slate-300">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-b border-slate-800">
                          <td className="px-3 py-2 text-white">{item.name || "—"}</td>
                          <td className="px-3 py-2 text-slate-400">{item.expiry || "—"}</td>
                          <td className="px-3 py-2 text-slate-400">{item.quantity || "—"}</td>
                          <td className="px-3 py-2 text-slate-400">{item.price ? `$${item.price}` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 10 && (
                    <div className="p-3 text-center text-sm text-slate-400">
                      ... and {preview.length - 10} more items
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="text-red-400 font-semibold mb-2">Errors:</div>
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-300">{error}</div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          {step === 2 && (
            <button
              onClick={handleImport}
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-colors"
            >
              Import {preview?.length || 0} Items
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


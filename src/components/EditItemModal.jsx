import { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EditItemModal({ item, onClose, onSave }) {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute("data-theme") || "dark";
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(document.documentElement.getAttribute("data-theme") || "dark");
    };
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState(null);
  const [qty, setQty] = useState(1);
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [supplier, setSupplier] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setExpiry(item.expiry ? new Date(item.expiry) : null);
      setQty(item.quantity || 1);
      setBarcode(item.barcode || "");
      setPrice(item.price || "");
      setImage(item.image || null);
      setImagePreview(item.image || null);
      setCategory(item.category || "");
      setBatchNumber(item.batchNumber || "");
      setSupplier(item.supplier || "");
      setNotes(item.notes || "");
    }
  }, [item]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !expiry) return;

    onSave({
      ...item,
      name,
      quantity: parseInt(qty) || 1,
      expiry: expiry.toISOString().split("T")[0],
      barcode: barcode || undefined,
      price: parseFloat(price) || 0,
      image: image || undefined,
      category: category || undefined,
      batchNumber: batchNumber || undefined,
      supplier: supplier || undefined,
      notes: notes || undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`rounded-2xl border max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
        theme === "light"
          ? "bg-white border-gray-300 shadow-2xl"
          : "bg-slate-900 border-slate-800"
      }`}>
        <div className={`p-6 border-b flex items-center justify-between ${
          theme === "light" ? "border-gray-300" : "border-slate-800"
        }`}>
          <h2 className={`text-2xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>Edit Product</h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              theme === "light"
                ? "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900"
                : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900"
                    : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Dairy, Produce"
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
                    : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white placeholder-slate-500"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Barcode</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900"
                    : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Quantity</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900"
                    : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900"
                    : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Expiry Date *</label>
              <DatePicker
                selected={expiry}
                onChange={(date) => setExpiry(date)}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900"
                    : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white"
                }`}
                wrapperClassName="w-full"
                calendarClassName={theme === "light" 
                  ? "bg-white border border-gray-300 rounded-lg shadow-xl"
                  : "bg-slate-900 border border-slate-800 rounded-lg shadow-xl"
                }
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Batch/Lot Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900"
                    : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Supplier</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
                  theme === "light"
                    ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900"
                    : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white"
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors resize-none ${
                  theme === "light"
                    ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900"
                    : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white"
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Product Photo</label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className={`w-full h-48 object-cover rounded-lg border ${theme === "light" ? "border-gray-300" : "border-slate-700"}`}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  theme === "light"
                    ? "border-gray-300 hover:border-emerald-500/50 bg-gray-50"
                    : "border-slate-700 hover:border-emerald-500/50 bg-slate-950/50"
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className={`w-10 h-10 mb-3 ${theme === "light" ? "text-gray-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className={`mb-2 text-sm ${theme === "light" ? "text-gray-600" : "text-slate-400"}`}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className={`flex gap-3 pt-4 border-t ${theme === "light" ? "border-gray-300" : "border-slate-800"}`}>
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors ${
                theme === "light"
                  ? "bg-gray-300 hover:bg-gray-400 text-gray-900 border border-gray-400"
                  : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


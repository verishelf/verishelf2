import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getSettings } from "../utils/settings";

export default function AddItem({ onAdd, selectedLocation, template, onTemplateSelect }) {
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
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [unit, setUnit] = useState("piece");
  const [reorderPoint, setReorderPoint] = useState("");
  const [variant, setVariant] = useState("");
  const [aisle, setAisle] = useState("");
  const [shelf, setShelf] = useState("");
  const fileInputRef = useRef(null);
  const settings = getSettings();

  // Load template if provided
  useEffect(() => {
    if (template) {
      setName(template.name || "");
      setBarcode(template.barcode || "");
      setPrice(template.price || "");
      setCategory(template.category || "");
      setSupplier(template.supplier || "");
      setNotes(template.notes || "");
      if (template.image) {
        setImage(template.image);
        setImagePreview(template.image);
      }
    }
  }, [template]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
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

  const submit = (e) => {
    e.preventDefault();
    if (!name || !expiry) return;

    onAdd({
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
      tags: tags.length > 0 ? tags : undefined,
      unit: unit || "piece",
      reorderPoint: reorderPoint ? parseInt(reorderPoint) : undefined,
      variant: variant || undefined,
      aisle: aisle || undefined,
      shelf: shelf || undefined,
      itemStatus: "active",
      status: "active",
    });

    setName("");
    setExpiry(null);
    setQty(1);
    setBarcode("");
    setPrice("");
    setImage(null);
    setImagePreview(null);
    setCategory("");
    setBatchNumber("");
    setSupplier("");
    setNotes("");
    setTags([]);
    setTagInput("");
    setUnit("piece");
    setReorderPoint("");
    setVariant("");
    setAisle("");
    setShelf("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onTemplateSelect) onTemplateSelect(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="card-gradient rounded-2xl p-6 card-gradient-hover">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className={`text-xl font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>Add Product</h3>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Product Name *</label>
          <input
            type="text"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
              theme === "light"
                ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
                : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white placeholder-slate-500"
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
              theme === "light"
                ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900"
                : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white"
            }`}
          >
            <option value="">Select category...</option>
            {(settings.categories || []).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
              theme === "light"
                ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
                : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white placeholder-slate-500"
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Expiry Date *</label>
          <div className="relative">
            <svg
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none z-10 ${theme === "light" ? "text-gray-500" : "text-slate-400"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <DatePicker
              selected={expiry}
              onChange={(date) => setExpiry(date)}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              placeholderText="Select expiry date"
              required
              className={`w-full pl-12 pr-4 py-3 border rounded-lg outline-none transition-colors ${
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
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Aisle</label>
          <input
            type="text"
            placeholder="e.g., A1, B3"
            value={aisle}
            onChange={(e) => setAisle(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
              theme === "light"
                ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
                : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white placeholder-slate-500"
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Shelf</label>
          <input
            type="text"
            placeholder="e.g., Top, Middle, Bottom"
            value={shelf}
            onChange={(e) => setShelf(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg outline-none transition-colors ${
              theme === "light"
                ? "bg-white border-gray-300 hover:border-emerald-500/50 focus:border-emerald-500 text-gray-900 placeholder-gray-400"
                : "bg-slate-950 border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 text-white placeholder-slate-500"
            }`}
          />
        </div>

        <div className="lg:col-span-4">
          <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-slate-300"}`}>Product Photo (Optional)</label>
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
                <p className={`text-xs ${theme === "light" ? "text-gray-500" : "text-slate-500"}`}>PNG, JPG, GIF up to 5MB</p>
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

        <div className="lg:col-span-4 flex items-end">
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all duration-200 hover-lift flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
        </div>
    </form>
    </div>
  );
}

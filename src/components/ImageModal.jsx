export default function ImageModal({ image, onClose }) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          src={image}
          alt="Product"
          className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
        />
      </div>
    </div>
  );
}


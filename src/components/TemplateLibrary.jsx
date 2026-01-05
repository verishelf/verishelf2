import { useState, useEffect } from "react";
import { getTemplates, saveTemplate, deleteTemplate } from "../utils/templates";

export default function TemplateLibrary({ onSelectTemplate, onClose }) {
  const [templates, setTemplates] = useState(getTemplates());
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = templates.filter((template) =>
    template.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm("Delete this template?")) {
      deleteTemplate(id);
      setTemplates(getTemplates());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Template Library</h2>
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
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
            />
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p>No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-lg hover:border-emerald-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-white">{template.name}</div>
                      {template.category && (
                        <div className="text-sm text-slate-400 mt-1">{template.category}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-slate-400 space-y-1 mb-3">
                    {template.price && <div>Price: ${template.price}</div>}
                    {template.supplier && <div>Supplier: {template.supplier}</div>}
                  </div>
                  <button
                    onClick={() => {
                      onSelectTemplate(template);
                      onClose();
                    }}
                    className="w-full px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


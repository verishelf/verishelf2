import { useState, useEffect } from "react";
import { getGroups, saveGroup, deleteGroup } from "../utils/groups";

export default function ProductGroups({ items, onClose }) {
  const [groups, setGroups] = useState(getGroups());
  const [groupName, setGroupName] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedItems.length > 0) {
      const group = {
        name: groupName.trim(),
        itemIds: selectedItems,
        items: items.filter((i) => selectedItems.includes(i.id)),
      };
      setGroups([...groups, saveGroup(group)]);
      setGroupName("");
      setSelectedItems([]);
    }
  };

  const handleDeleteGroup = (id) => {
    if (window.confirm("Delete this group?")) {
      setGroups(deleteGroup(id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Product Groups</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Create Group */}
          <div className="card-gradient rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Group</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name (e.g., Breakfast Bundle)"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
              />
              <div className="text-sm text-slate-400">
                {selectedItems.length} item(s) selected
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedItems.length === 0}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>

          {/* Existing Groups */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Existing Groups</h3>
            {groups.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p>No groups created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-white">{group.name}</div>
                      <div className="text-sm text-slate-400 mt-1">
                        {group.itemIds?.length || 0} item(s) in group
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


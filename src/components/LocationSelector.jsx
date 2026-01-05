import { getStores } from "../utils/stores";

export default function LocationSelector({ selectedLocation, onLocationChange, stores }) {
  const storeList = stores || getStores();
  const locationOptions = [
    "All Locations",
    ...storeList.map(store => typeof store === 'string' ? store : store.name)
  ];

  return (
    <div className="card-gradient rounded-2xl p-6">
      <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <select
          value={selectedLocation}
          onChange={(e) => onLocationChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 hover:border-emerald-500/30 focus:border-emerald-500 rounded-lg outline-none transition-colors text-white appearance-none"
        >
          {locationOptions.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}


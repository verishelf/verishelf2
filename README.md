# VeriShelf — Enterprise Shelf Expiry Management

A state-of-the-art expiry tracking application for retail chains, featuring real-time monitoring, automated alerts, and enterprise-grade analytics.

## Features

✨ **Modern UI/UX**
- Dark theme matching the VeriShelf website (slate-950 background with emerald accents)
- Smooth animations and transitions
- Fully responsive design
- Beautiful gradient effects and hover states

📊 **Dashboard & Analytics**
- Real-time statistics cards (Total Items, Expired, Expiring Soon, Total Value)
- Comprehensive inventory table with sorting and filtering
- Multi-location support
- Search by product name or barcode

🔔 **Smart Alerts**
- Urgent alerts for expired items
- Visual status badges (EXPIRED, WARNING, SAFE)
- Real-time monitoring indicator

📱 **Product Management**
- Add products with barcode support
- Track quantity, price, and expiry dates
- Remove items from shelves with audit trail
- Location-based organization

🔍 **Advanced Filtering**
- Search by name or barcode
- Filter by status (All, Expired, Expiring Soon, Safe)
- Filter by location
- Sortable table columns

💾 **Data Persistence**
- LocalStorage integration for data persistence
- Sample data included for demonstration

## Tech Stack

- **React 19** - Modern React with latest features
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript/ES6+** - Modern JavaScript

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+ (required for Vite)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
VeriShelf/
├── src/
│   ├── components/
│   │   ├── AddItem.jsx          # Product addition form
│   │   ├── AlertBanner.jsx      # Urgent alerts display
│   │   ├── ExpiryBadge.jsx      # Status badges
│   │   ├── InventoryTable.jsx   # Main inventory table
│   │   ├── LocationSelector.jsx  # Location filter
│   │   ├── RemoveButton.jsx     # Remove item button
│   │   ├── SearchAndFilters.jsx # Search and filter controls
│   │   └── StatsCards.jsx       # Statistics cards
│   ├── pages/
│   │   └── Dashboard.jsx        # Main dashboard page
│   ├── utils/
│   │   └── expiry.js            # Expiry calculation utilities
│   ├── App.jsx                  # Root component
│   ├── index.css                # Global styles with Tailwind
│   └── main.jsx                 # Entry point
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
└── package.json
```

## Design System

The application uses a consistent design system matching the VeriShelf website:

- **Background**: `slate-950` (dark)
- **Accent Color**: `emerald-500/400` (green)
- **Cards**: Gradient from `slate-900` to `slate-950` with `slate-800` borders
- **Status Colors**:
  - **EXPIRED**: Red (`red-400`)
  - **WARNING**: Yellow (`yellow-400`)
  - **SAFE**: Emerald (`emerald-400`)

## Key Features Explained

### Expiry Status:
- **EXPIRED**: Items past their expiry date
- **WARNING**: Items expiring within 3 days
- **SAFE**: Items with more than 3 days until expiry

### Statistics:
- **Total Items**: Count of all active (non-removed) products
- **Expired**: Count of expired items requiring immediate action
- **Expiring Soon**: Items expiring within 3 days
- **Total Value**: Sum of all inventory value (price × quantity)

### Data Persistence:
All data is automatically saved to browser localStorage and persists across sessions.

## Future Enhancements

Potential features for future development:
- Backend API integration
- User authentication and multi-user support
- Advanced analytics and reporting
- Barcode scanner integration (camera API)
- Export functionality (CSV, PDF)
- Email/SMS notifications
- Mobile app version
- Real-time sync across devices

## License

Private project - All rights reserved

---

Built with ❤️ for enterprise retail operations

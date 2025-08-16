# JAI-KISSAN AI - Agricultural Assistant Platform

A comprehensive AI-powered agricultural platform designed for farmers and suppliers with low-connectivity support through SMS interface.

## 🌾 Features

### For Farmers
- **AI-Powered Crop Recommendations** - Smart farming insights based on weather and soil data
- **Real-time Weather & Soil Alerts** - Instant notifications for optimal farming conditions  
- **Market Price Predictions** - AI-driven market analysis and price forecasting
- **Government Scheme Notifications** - Automatic updates on available agricultural schemes
- **Multi-language Support** - Available in 6+ regional languages

### For Suppliers
- **AI-Powered Demand Forecasting** - Predict market demands with machine learning
- **Smart Inventory Management** - Optimize stock levels automatically
- **Automated Customer Responses** - AI chatbot for instant customer support
- **Market Trend Analysis** - Comprehensive business insights

### SMS Assistant (Low Connectivity)
- **SMS 1** - Smart farming queries and answers
- **SMS 5** - Local weather and crop updates
- **SMS 9** - Language selection support
- **Contact**: 9876543210 (Available 24/7)

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### 1. Clone or Download Project

**Option A: Clone Repository**
```bash
git clone <your-repository-url>
cd jai-kissan-ai
```

**Option B: Download and Extract**
1. Download the project files
2. Extract to your desired folder
3. Open terminal in the project directory

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or if you prefer yarn
yarn install
```

### 3. Start Development Server

```bash
# Start the development server
npm run dev

# Or with yarn
yarn dev
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
jai-kissan-ai/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # Entry point
│   ├── components/
│   │   ├── FarmerDashboard.tsx    # Farmer interface
│   │   ├── SupplierDashboard.tsx  # Supplier interface
│   │   ├── SMSInterface.tsx       # SMS assistant
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx
│   │   └── ui/                    # Shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ... (39 components)
│   └── styles/
│       └── globals.css        # Global styles with Tailwind v4
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Alpha) with custom AI theme
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Build Tool**: Vite with HMR
- **Responsive**: Mobile-first design with desktop enhancements

## 📱 Responsive Design

### Mobile (< 768px)
- Single-column layout
- Touch-friendly interfaces (44px minimum touch targets)
- Optimized for agricultural fieldwork

### Tablet (768px - 1023px)
- Improved spacing and 2-column elements
- Enhanced readability

### Desktop (1024px+)
- Full 2-column hero layout
- Enhanced visual hierarchy
- Larger interactive elements
- Professional business interface

## 🎨 Design Features

### AI Assistant Branding
- Animated AI avatar with sparkle effects
- Gradient color schemes (Green → Blue → Purple)
- Glass-morphism effects with backdrop blur
- Smooth hover animations and micro-interactions

### Accessibility
- WCAG compliant color contrasts
- Keyboard navigation support
- Screen reader friendly
- Reduced motion support
- High contrast mode compatibility

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

## 📦 Dependencies Overview

### Core Dependencies
- `react` & `react-dom` - React framework
- `lucide-react` - Icon library
- `tailwindcss@next` - Tailwind CSS v4
- `@tailwindcss/vite` - Vite plugin for Tailwind

### UI Components (Shadcn/ui)
- All Radix UI primitives for accessible components
- `class-variance-authority` - Component variant management
- `clsx` & `tailwind-merge` - Utility class management

### Additional Features
- `recharts` - Chart and graph components
- `date-fns` & `react-day-picker` - Date handling
- `sonner` - Toast notifications
- `embla-carousel-react` - Carousel components

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📧 Contact & Support

- **SMS Helpline**: 9876543210
- **Platform**: Available 24/7 across India
- **Languages**: Hindi, English + 4 regional languages

## 🔄 Updates & Maintenance

This platform receives regular updates for:
- New agricultural data sources
- Enhanced AI recommendations
- Additional language support
- Feature improvements based on farmer feedback

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**JAI-KISSAN AI** - Empowering farmers through technology 🌾🤖
```

## 🚨 Troubleshooting

### Common Issues

**1. Import Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**2. Tailwind Not Loading**
```bash
# Ensure Tailwind v4 is properly installed
npm install tailwindcss@next @tailwindcss/vite@next
```

**3. TypeScript Errors**
```bash
# Restart TypeScript server in your editor
# Or rebuild project
npm run build
```

**4. Port Already in Use**
```bash
# Change port in vite.config.ts or kill process
npx kill-port 3000
```

---

🎉 **Your JAI-KISSAN AI platform is now ready for local development!**
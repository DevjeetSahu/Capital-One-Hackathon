# JAI-KISSAN AI - Agricultural Assistant Platform

A comprehensive AI-powered agricultural platform designed for farmers and suppliers with low-connectivity support through SMS interface. This platform provides intelligent farming assistance, real-time weather data, market insights, and supplier connections specifically tailored for the Bargarh district of Odisha, India.

## 🌾 Features

### For Farmers
- **AI-Powered Crop Recommendations** - Smart farming insights based on weather and soil data
- **Real-time Weather & Soil Alerts** - Instant notifications for optimal farming conditions  
- **Market Price Predictions** - AI-driven market analysis and price forecasting
- **Government Scheme Notifications** - Automatic updates on available agricultural schemes
- **Multi-language Support** - Available in English and Hindi with seamless language switching
- **Voice Input Support** - Speak your questions in Hindi/English for hands-free operation
- **Complex Query Workflows** - AI-powered multi-step analysis for complex agricultural problems

### For Suppliers
- **AI-Powered Demand Forecasting** - Predict market demands with machine learning
- **Smart Inventory Management** - Optimize stock levels automatically
- **Automated Customer Responses** - AI chatbot for instant customer support
- **Market Trend Analysis** - Comprehensive business insights

### SMS Assistant (Low Connectivity)
- **SMS 1** - Smart farming queries and answers
- **SMS 5** - Local weather and crop updates
- **SMS 9** - Language selection support
- **Contact**: +91xxxxxxxxxx (Available 24/7)
- **Hindi Translation** - Automatic translation of responses to Hindi

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.12+
- Node.js (v18 or higher)
- npm or yarn
- Git
- Twilio Account (for SMS features)

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd capital-one
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
```

**Important**: Make sure to install all dependencies before proceeding with the next steps.

#### Environment Configuration
Create a `.env` file in the `backend` directory:
```env
# LLM API Keys
GROQ_API_KEY=your_groq_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Backend URL for SMS module
BACKEND_URL=http://127.0.0.1:8000
PORT=3000
```

#### Initialize Vector Database
Before starting the server, you need to initialize the vector database with agricultural data:
```bash
cd backend
python agri_vector_db.py --init
```

This will create and populate the ChromaDB vector database with agricultural data from the `data_sources/` directory.

#### Start Backend Server
```bash
cd backend
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

The backend API will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Complete Setup Verification

To verify everything is working correctly:

1. **Backend**: Visit `http://localhost:8000/docs` to see the FastAPI documentation
2. **Frontend**: Visit `http://localhost:3000` to access the application
3. **Health Check**: Visit `http://localhost:8000/health` to verify backend status

### 5. SMS Module Setup (Optional)

For SMS functionality, you'll need to set up ngrok for Twilio webhook integration:

#### Install ngrok
1. Download ngrok from [https://ngrok.com/download](https://ngrok.com/download)
2. Extract and add to your PATH, or install via package manager:
   ```bash
   # On macOS with Homebrew
   brew install ngrok
   
   # On Windows with Chocolatey
   choco install ngrok
   
   # On Linux
   sudo snap install ngrok
   ```

#### Start SMS Module
```bash
cd backend/sms_module
uvicorn sms_app:app --host 0.0.0.0 --port 8001
```

#### Expose SMS Module with ngrok
In a new terminal window:
```bash
ngrok http 8001
```

Copy the HTTPS URL provided by ngrok (e.g., `https://abc123.ngrok.io`) and configure it as your Twilio webhook URL in the Twilio console.

## 📁 Project Structure

```
capital-one/
├── backend/                          # FastAPI Backend
│   ├── app.py                       # Main FastAPI application
│   ├── main.py                      # Agricultural Assistant core logic
│   ├── voice.py                     # Voice processing and translation
│   ├── sms_module/                  # SMS functionality
│   │   └── sms_app.py              # SMS webhook handler
│   ├── agri_vector_db.py           # Vector database management
│   ├── retriever.py                # Information retrieval system
│   ├── intent_classifier.py        # Query intent classification
│   ├── workflow_manager.py         # Complex query workflow engine
│   ├── llm_service.py              # LLM integration service
│   ├── llm_client.py               # LLM API clients
│   ├── startup.py                  # Application startup logic
│   ├── requirements.txt            # Python dependencies
│   ├── Procfile                    # Heroku deployment config
│   └── railway.json                # Railway deployment config
├── frontend/                        # React Frontend
│   ├── src/
│   │   ├── App.tsx                 # Main application component
│   │   ├── main.tsx               # Entry point
│   │   ├── components/
│   │   │   ├── FarmerDashboard.tsx    # Farmer interface
│   │   │   ├── SupplierDashboard.tsx  # Supplier interface
│   │   │   ├── SMSInterface.tsx       # SMS assistant
│   │   │   ├── WorkflowProgress.tsx   # Workflow progress component
│   │   │   └── ui/                    # Shadcn/ui components
│   │   └── styles/
│   │       └── globals.css        # Global styles with Tailwind
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── data_sources/                    # Agricultural Data
│   ├── bargarh_fertilizers.csv     # Fertilizer recommendations
│   ├── bargarh_pest_control.csv    # Pest control data
│   ├── bargarh_soil_data.csv       # Soil analysis data
│   ├── bargarh_government_schemes.csv # Government schemes
│   └── bargarh_mandi_prices.csv    # Market price data
├── agri_chromadb/                   # Vector Database
│   └── chroma.sqlite3              # ChromaDB database file
├── .venv/                          # Python virtual environment
├── .gitignore
└── README.md
```

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI with async support
- **AI/ML**: OpenAI GPT, Groq LLM, Sentence Transformers
- **Vector Database**: ChromaDB for semantic search
- **Language Processing**: Intent classification, Hindi translation
- **Voice Processing**: OpenAI Whisper for speech-to-text
- **SMS Integration**: Twilio for SMS functionality
- **Deployment**: Railway, Heroku ready

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with custom AI theme
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Markdown**: React Markdown for rich text rendering
- **Voice**: Web Speech API integration
- **Responsive**: Mobile-first design

### Data & AI
- **Vector Embeddings**: Sentence Transformers (all-MiniLM-L6-v2)
- **Intent Classification**: Custom ML model for query understanding
- **Workflow Engine**: Multi-step query processing
- **Translation**: Google Translate API for Hindi support

## 🌐 API Endpoints

### Core Endpoints
- `POST /query` - Main agricultural query endpoint
- `GET /weather/current` - Current weather data
- `GET /weather/comprehensive` - Detailed weather forecast
- `POST /voice/process` - Voice input processing
- `GET /health` - Health check endpoint

### Workflow Endpoints
- `POST /workflow/execute` - Execute workflow subtasks
- `POST /workflow/summary` - Get workflow summary
- `GET /workflow/{workflow_id}/status` - Workflow status

### SMS Endpoints
- `POST /sms/webhook` - Twilio SMS webhook handler

## 📱 Features in Detail

### 1. Intelligent Query Processing
- **Intent Classification**: Automatically categorizes queries into farming, weather, market, etc.
- **Context Retrieval**: Searches relevant agricultural data from vector database
- **Multi-step Workflows**: Handles complex queries requiring multiple analysis steps

### 2. Multi-language Support
- **English/Hindi Toggle**: Seamless language switching in frontend
- **Automatic Translation**: Backend translates responses to Hindi
- **Voice Input**: Support for Hindi and English voice queries

### 3. Real-time Weather Integration
- **Current Weather**: Live weather data for Bargarh district
- **Forecast**: 7-day weather predictions
- **Agricultural Alerts**: Weather-based farming recommendations

### 4. Market Intelligence
- **Price Tracking**: Real-time mandi prices
- **Demand Forecasting**: AI-powered market predictions
- **Supplier Network**: Connect with verified agricultural suppliers

### 5. SMS Assistant
- **Low Connectivity Support**: Works without internet
- **Quick Queries**: Fast responses via SMS
- **Hindi Support**: Responses in Hindi language

## 🔧 Development Commands

### Backend
```bash
# Start development server
cd backend
uvicorn app:app --reload

# Run tests
python -m pytest

# Format code
black .
```

### Frontend
```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run lint
```

**Note**: For local development, use ngrok as described in the setup section above.

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📧 Contact & Support

- **SMS Helpline**: +91xxxxxxxxxx
- **Platform**: Available 24/7 across India
- **Languages**: Hindi, English
- **Location**: Bargarh District, Odisha, India

## 🔄 Updates & Maintenance

This platform receives regular updates for:
- New agricultural data sources
- Enhanced AI recommendations
- Additional language support
- Feature improvements based on farmer feedback
- Performance optimizations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🚨 Troubleshooting

### Common Issues

**1. Backend Import Errors**
```bash
# Ensure virtual environment is activated
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**2. Frontend Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. Vector Database Issues**
```bash
# Rebuild vector database
cd backend
python agri_vector_db.py --init

# Or if you need to rebuild from scratch
python -c "from agri_vector_db import AgriculturalVectorDB; db = AgriculturalVectorDB(); db.rebuild_database()"
```

**4. SMS Module Issues**
```bash
# Check Twilio credentials
# Ensure BACKEND_URL is correctly set in .env
# Verify webhook URL in Twilio console
# Make sure ngrok is running and URL is updated in Twilio
```

**5. Port Conflicts**
```bash
# Change ports in respective config files
# Backend: uvicorn app:app --port 8001
# Frontend: Update vite.config.ts
```

**6. Vector Database Initialization Issues**
```bash
# Ensure you're in the backend directory
cd backend

# Check if data_sources directory exists
ls data_sources/

# Run initialization with verbose output
python agri_vector_db.py --init --verbose
```

**7. ngrok Issues**
```bash
# Check if ngrok is properly installed
ngrok version

# If ngrok is not found, add to PATH or reinstall
# Make sure to use the correct port (8001 for SMS module)
ngrok http 8001
```

---

🎉 **JAI-KISSAN AI** - Empowering farmers through technology 🌾🤖

*Built with ❤️ for the farming community of Bargarh, Odisha*

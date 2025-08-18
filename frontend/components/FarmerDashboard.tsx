import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

import {
  MessageSquare,
  Newspaper,
  Cloud,
  Thermometer,
  Droplets,
  Wind,
  Send,
  RefreshCw, 
  Sun, 
  Clock,
  CloudRain,
  Snowflake,
  Bot,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Brain,
  Share,
  ThumbsUp,
  Copy,
  Users, 
  TrendingUp, 
  Star, 
  Filter,
  BarChart3,
  Package,
  Truck,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Shield,
  Verified,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageCircle,
  Mic,
  MicOff,
  Square,
  Square as StopIcon
} from "lucide-react";
import { WorkflowProgress } from "./WorkflowProgress";

// Add interface for pending query
interface PendingQuery {
  question: string;
  answer: string | null;
  status: 'answered' | 'error';
}

// Add interface for workflow
interface WorkflowQuery {
  id: string;
  workflowId: string;
  question: string;
  subtasks: any[];
  status: 'processing' | 'completed' | 'error';
  result?: any;
}

// Add interface for component props
interface FarmerDashboardProps {
  pendingQuery?: PendingQuery | null;
  setPendingQuery?: (query: PendingQuery | null) => void;
}
interface Supplier {
  id: number;
  name: string;
  company: string;
  location: string;
  rating: number;
  totalReviews: number;
  verified: boolean;
  products: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
  bids: {
    product: string;
    price: number;
    unit: string;
    quantity: string;
    deliveryTime: string;
    terms: string;
  }[];
  badges: string[];
  profileImage: string;
  joinedDate: string;
  totalDeals: number;
  responseTime: string;
}
// Update function signature to accept props
export function FarmerDashboard({ pendingQuery, setPendingQuery }: FarmerDashboardProps = {}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("query");
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState([]);
  const [workflowQueries, setWorkflowQueries] = useState<WorkflowQuery[]>([]);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [showPreviousChats, setShowPreviousChats] = useState(false);
   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [weatherData, setWeatherData] = useState({
    temperature: '-',
    humidity: '-',
    windSpeed: '-',
    condition: '-',
    description: '',
    location: 'Bargarh, Odisha'
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(false);

  // 🔥 FIXED: Use useRef instead of useState to prevent re-renders
  const processedPendingQueryRef = useRef(null);
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: 1,
        name: "Rajesh Kumar",
        company: "Kumar Agriculture Supplies",
        location: "Bargarh, Odisha",
        rating: 4.8,
        totalReviews: 142,
        verified: true,
        products: ["Seeds", "Fertilizers", "Pesticides", "Tools"],
        contactInfo: {
          phone: "+91-9876543210",
          email: "rajesh@kumaragri.com"
        },
        bids: [
          {
            product: "Hybrid Rice Seeds",
            price: 850,
            unit: "per kg",
            quantity: "25 kg minimum",
            deliveryTime: "2-3 days",
            terms: "Cash on delivery"
          },
          {
            product: "NPK Fertilizer",
            price: 1200,
            unit: "per 50kg bag",
            quantity: "5 bags minimum",
            deliveryTime: "1-2 days",
            terms: "30 days credit"
          }
        ],
        badges: ["Top Seller", "Fast Delivery"],
        profileImage: "👨‍🌾",
        joinedDate: "2020",
        totalDeals: 450,
        responseTime: "< 2 hours"
      },
      {
        id: 2,
        name: "Priya Agro Solutions",
        company: "Modern Farm Supplies",
        location: "Sambalpur, Odisha",
        rating: 4.6,
        totalReviews: 98,
        verified: true,
        products: ["Organic Products", "Seeds", "Equipment"],
        contactInfo: {
          phone: "+91-9876543211",
          email: "contact@priyaagro.com"
        },
        bids: [
          {
            product: "Hybrid Rice Seeds",
            price: 800,
            unit: "per kg",
            quantity: "20 kg minimum",
            deliveryTime: "3-4 days",
            terms: "Advance payment"
          },
          {
            product: "Organic Fertilizer",
            price: 900,
            unit: "per 50kg bag",
            quantity: "3 bags minimum",
            deliveryTime: "2-3 days",
            terms: "Cash on delivery"
          }
        ],
        badges: ["Organic Certified", "Eco-Friendly"],
        profileImage: "👩‍🌾",
        joinedDate: "2019",
        totalDeals: 320,
        responseTime: "< 4 hours"
      },
      {
        id: 3,
        name: "Sahoo Enterprises",
        company: "Sahoo Farm Tech",
        location: "Bhubaneswar, Odisha",
        rating: 4.9,
        totalReviews: 205,
        verified: true,
        products: ["Technology", "Equipment", "Smart Tools"],
        contactInfo: {
          phone: "+91-9876543212",
          email: "info@sahootech.com"
        },
        bids: [
          {
            product: "Smart Irrigation System",
            price: 15000,
            unit: "per system",
            quantity: "1 unit minimum",
            deliveryTime: "5-7 days",
            terms: "50% advance"
          },
          {
            product: "Soil Testing Kit",
            price: 2500,
            unit: "per kit",
            quantity: "1 kit minimum",
            deliveryTime: "1-2 days",
            terms: "Cash on delivery"
          }
        ],
        badges: ["Tech Leader", "Innovation Award"],
        profileImage: "🔧",
        joinedDate: "2021",
        totalDeals: 180,
        responseTime: "< 1 hour"
      }
    ];
    setSuppliers(mockSuppliers);
  }, []);

  // 🔥 FIXED: Much simpler approach - handle pending query only once
  useEffect(() => {
    if (pendingQuery && processedPendingQueryRef.current !== pendingQuery) {
      // Mark this pendingQuery as processed
      processedPendingQueryRef.current = pendingQuery;

      const newQuery = {
        id: Date.now(), // Use timestamp for unique ID
        question: pendingQuery.question,
        timestamp: "Just now",
        responses: pendingQuery.status === "answered" ? 1 : 0,
        status: pendingQuery.status,
        answer: pendingQuery.answer
      };

      // Add the query to the beginning of queries array
      setQueries(prev => [newQuery, ...prev]);

      // Clear the pending query after processing
      if (setPendingQuery) {
        setPendingQuery(null);
      }
    }
  }, [pendingQuery]); // 🔥 SIMPLIFIED: Only depend on pendingQuery

  // Function to get weather icon based on condition
  const getWeatherIcon = (condition) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return <CloudRain className="w-6 h-6 text-blue-600" />;
    } else if (lowerCondition.includes('snow')) {
      return <Snowflake className="w-6 h-6 text-blue-200" />;
    } else if (lowerCondition.includes('cloud')) {
      return <Cloud className="w-6 h-6 text-gray-600" />;
    } else if (lowerCondition.includes('clear') || lowerCondition.includes('sun')) {
      return <Sun className="w-6 h-6 text-yellow-500" />;
    }
    return <Cloud className="w-6 h-6 text-gray-600" />;
  };

  // Function to fetch comprehensive weather data
  const fetchWeather = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/weather/comprehensive');
      const data = await response.json();

      if (data.status === 'success' && data.data.current_weather) {
        const current = data.data.current_weather.metadata;
        setWeatherData({
          temperature: `${current.temperature}°C`,
          humidity: `${current.humidity}%`,
          windSpeed: `${current.wind_speed} m/s`,
          condition: current.description,
          description: current.description,
          location: data.location
        });
        setLastUpdated(new Date());
      } else {
        // Fallback API call to current weather only
        const currentResponse = await fetch('http://127.0.0.1:8000/weather/current');
        const currentData = await currentResponse.json();
        
        if (currentData.status === 'success') {
          const current = currentData.data.metadata;
          setWeatherData({
            temperature: `${current.temperature}°C`,
            humidity: `${current.humidity}%`,
            windSpeed: `${current.wind_speed} m/s`,
            condition: current.description,
            description: current.description,
            location: currentData.location
          });
          setLastUpdated(new Date());
        } else {
          throw new Error('No weather data available');
        }
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(true);
      setWeatherData({
        temperature: 'Unavailable',
        humidity: 'Unavailable',
        windSpeed: 'Unavailable',
        condition: 'Unable to fetch weather data',
        description: 'Please check your connection',
        location: 'Unknown'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load weather once on component mount
  useEffect(() => {
    fetchWeather();
  }, []);

  // Cleanup recording on component unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    };
  }, [mediaRecorder, isRecording]);

  const handleSubmitQuery = async () => {
    if (!query.trim()) return;
    
    const newQuery = {
      id: Date.now(), // Use timestamp to avoid conflicts
      question: query,
      timestamp: Date.now(),
      responses: 0,
      status: "pending",
      answer: null
    };

    // Add it locally first
    setQueries([newQuery, ...queries]);
    setQuery("");

    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: newQuery.question,
          llm_provider: "groq",
          llm_model: "llama-3.1-8b-instant",
          top_k: 5
        })
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      // Check if this is a workflow query
      if (data.is_workflow && data.workflow_id) {
        // Add to workflow queries for sequential execution
        const workflowQuery: WorkflowQuery = {
          id: newQuery.id.toString(),
          workflowId: data.workflow_id,
          question: newQuery.question,
          subtasks: data.subtasks || [],
          status: 'processing'
        };
        setWorkflowQueries(prev => [workflowQuery, ...prev]);
        
        // Remove from regular queries since it's now a workflow
        setQueries(prev => prev.filter(q => q.id !== newQuery.id));
      } else {
        // Update the specific query with response (regular query)
      setQueries((prev) =>
        prev.map((q) =>
          q.id === newQuery.id
            ? {
                ...q,
                status: "answered",
                responses: (q.responses || 0) + 1,
                answer: data.response
              }
            : q
        )
      );
      }
    } catch (err) {
      console.error("Error sending query:", err);
      setQueries((prev) =>
        prev.map((q) =>
          q.id === newQuery.id ? { ...q, status: "error" } : q
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle workflow completion
  const handleWorkflowComplete = (workflowId: string, result: any) => {
    // Find the workflow query
    const workflowQuery = workflowQueries.find(wq => wq.workflowId === workflowId);
    
    if (workflowQuery) {
      // Add the workflow result to regular queries as an answered query
      const newQuery = {
        id: Date.now(),
        question: workflowQuery.question,
        timestamp: "Just now",
        responses: 1,
        status: "answered",
        answer: result.response || result.summary || "Workflow completed successfully."
      };
      
      setQueries(prev => [newQuery, ...prev]);
    }
    
    // Update workflow status
    setWorkflowQueries(prev => 
      prev.map(wq => 
        wq.workflowId === workflowId 
          ? { ...wq, status: 'completed', result }
          : wq
      )
    );
  };

  // Handle workflow error
  const handleWorkflowError = (workflowId: string, error: string) => {
    setWorkflowQueries(prev => 
      prev.map(wq => 
        wq.workflowId === workflowId 
          ? { ...wq, status: 'error' }
          : wq
      )
    );
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuery();
    }
  };

  // Monitor recording state changes
  useEffect(() => {
    console.log('Recording state changed to:', isRecording);
  }, [isRecording]);

  // Voice recording functions
  const startRecording = async () => {
    try {
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        alert('MediaRecorder is not supported in this browser. Please use a modern browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstart = () => {
        console.log('MediaRecorder actually started');
        console.log('Setting isRecording to true');
        setIsRecording(true);
      };

      recorder.onstop = async () => {
        console.log('MediaRecorder stopped');
        console.log('Setting isRecording to false');
        setIsRecording(false);
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
        alert('Recording error occurred. Please try again.');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      console.log('Recording started, isRecording set to true');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    console.log('stopRecording called, mediaRecorder:', !!mediaRecorder, 'isRecording:', isRecording);
    if (mediaRecorder && isRecording) {
      console.log('Stopping MediaRecorder...');
      mediaRecorder.stop();
      console.log('Recording stopped, isRecording set to false');
    } else {
      console.log('Cannot stop recording - mediaRecorder or isRecording not set');
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      setIsProcessingVoice(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'voice_input.wav');

      // Send to voice processing endpoint
      const response = await fetch('http://127.0.0.1:8000/voice/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Voice processing failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Set the translated English text as the query
        setQuery(result.translated_text);
        
        // Optionally auto-submit the query
        // handleSubmitQuery();
      } else {
        alert('Voice processing failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      alert('Error processing voice input. Please try again.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const agriculturalUpdates = [
    {
      id: 1,
      title: "New High-Yield Wheat Variety Released",
      content:
        "Agricultural Department announces new drought-resistant wheat variety with 20% higher yield.",
      location: "Punjab, Haryana",
      time: "3 hours ago",
      category: "New Varieties"
    },
    {
      id: 2,
      title: "Weather Alert: Heavy Rainfall Expected",
      content:
        "Meteorological department warns of heavy rainfall in northern states. Farmers advised to take precautions.",
      location: "North India",
      time: "6 hours ago",
      category: "Weather Alert"
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/** SMS Service **/}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border border-purple-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-purple-800 font-bold text-lg">Try Our SMS Service</h3>
            <p className="text-sm text-gray-600">Get instant help via text messages</p>
          </div>
        </div>
        <button className="flex items-center justify-center w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-300 shadow-md hover:shadow-lg">
          <Phone className="w-4 h-4 mr-2" />
          Start SMS Chat
        </button>
      </div>

      {/** Weather **/}
      <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 border border-blue-200 rounded-xl py-2 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/** Header with location and refresh button **/}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="flex items-center gap-3 text-lg font-bold text-blue-800 mb-1">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
              {error ? <AlertCircle className="w-5 h-5 text-white" /> : getWeatherIcon(weatherData.condition)}
            </div>
            Today's Weather
          </h3>
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <MapPin className="w-3 h-3" />
            <span className="font-medium">{weatherData.location}</span>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Calendar className="w-3 h-3" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={fetchWeather}
          disabled={loading}
            className={`flex items-center gap-1 px-2 rounded-full font-medium text-xs transition-all duration-200
              ${error
              ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow'
              } disabled:opacity-50 disabled:cursor-not-allowed
              border border-blue-300
              focus:outline-none focus:ring-2 focus:ring-blue-400
              `}
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              minHeight: 32,
              minWidth: 70,
              boxShadow: error ? '0 2px 8px rgba(239,68,68,0.12)' : '0 2px 8px rgba(59,130,246,0.10)'
            }}
        >
          {loading ? (
            <>
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                <span>Loading</span>
            </>
          ) : (
            <>
                <RefreshCw className="w-4 h-4 mr-1" />
              <span>{error ? 'Retry' : 'Refresh'}</span>
            </>
          )}
        </button>
      </div>

        {/** Weather Description **/}
      {weatherData.description && (
        <div className="mb-4 p-3 bg-white/70 rounded-lg border border-blue-100">
          <p className="text-sm text-center text-gray-700 capitalize font-medium">
            {weatherData.description}
          </p>
        </div>
      )}

        {/** Weather Metrics Grid **/}
      <div className="grid grid-cols-2 gap-3 text-sm">
          <div className={`flex items-center gap-3 bg-white/80 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${error ? 'border-red-200' : 'border-red-100'
        }`}>
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <span className="font-bold text-gray-800 text-base">{weatherData.temperature}</span>
            <p className="text-xs text-gray-500">Temperature</p>
          </div>
        </div>
        
          <div className={`flex items-center gap-3 bg-white/80 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${error ? 'border-blue-200' : 'border-blue-100'
        }`}>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <span className="font-bold text-gray-800 text-base">{weatherData.humidity}</span>
            <p className="text-xs text-gray-500">Humidity</p>
          </div>
        </div>
        
          <div className={`flex items-center gap-3 bg-white/80 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${error ? 'border-gray-200' : 'border-gray-100'
        }`}>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Wind className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <span className="font-bold text-gray-800 text-base">{weatherData.windSpeed}</span>
            <p className="text-xs text-gray-500">Wind Speed</p>
          </div>
        </div>
        
          <div className={`flex items-center gap-3 bg-white/80 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${error ? 'border-gray-200' : 'border-gray-100'
        }`}>
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {getWeatherIcon(weatherData.condition)}
          </div>
          <div>
            <span className="font-bold text-gray-800 text-base capitalize">{weatherData.condition}</span>
            <p className="text-xs text-gray-500">Condition</p>
          </div>
        </div>
      </div>

        {/** Loading Overlay **/}
      {loading && (
        <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Updating weather...</span>
          </div>
        </div>
      )}
    </div>

      {/** Tabs **/}
      <div>
        <div className="flex w-full bg-gray-100 rounded-xl py-4 overflow-hidden shadow-inner">
          <button
            onClick={() => setTab("query")}
            className={`flex-1 flex items-center gap-2 justify-center py-4 text-sm font-semibold transition-all duration-300 ${tab === "query"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg" 
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Ask Questions
          </button>
          <button
            onClick={() => setTab("suppliers")}
            className={`flex-1 flex items-center gap-2 justify-center py-4 text-sm font-semibold transition-all duration-300 ${
              tab === "suppliers" 
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
          : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <Users className="w-4 h-4" />
            Suppliers
          </button>
          <button
            onClick={() => setTab("updates")}
            className={`flex-1 flex items-center gap-2 justify-center py-4 text-sm font-semibold transition-all duration-300 ${tab === "updates"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg" 
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <Newspaper className="w-4 h-4" />
            Updates
          </button>
        </div>

        {tab === "query" && (
          <div className="space-y-6 mt-6">
                         {/* Chat Container */}
             <div className="chat-container bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">

              {/* Chat Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">JAI-Kissan</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                      <span className="text-green-100 text-sm">Online • Ready to help</span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Sparkles className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              </div>
              
              {/* Previous Conversations - Collapsible */}
              {queries.length > 1 && (
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => setShowPreviousChats(!showPreviousChats)}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-sm text-gray-600"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>Previous Conversations ({queries.length - 1})</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showPreviousChats ? 'rotate-180' : ''}`} />
                  </button>

                  {showPreviousChats && (
                    <div className="max-h-48 overflow-y-auto bg-gray-50/50">
                      {queries.slice(1).map((q) => (
                        <div key={q.id} className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-white/50 transition-colors">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MessageSquare className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 truncate">{q.question}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">{q.timestamp}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${q.status === "answered"
                                    ? "bg-green-100 text-green-600"
                                    : q.status === "error"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-blue-100 text-blue-600"
                                  }`}>
                                  {q.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Current Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50/30">
                {queries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Brain className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Welcome to JAI-KISSAN Assistant</h4>
                    <p className="text-gray-600 max-w-sm">
                      Ask me anything about farming, crops, weather, or agricultural practices. I'm here to help! 🌾
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Current/Latest Conversation */}
                    {queries.slice(0, 1).map((q) => (
                      <div key={q.id} className="space-y-4">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="max-w-xs lg:max-w-md">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-sm p-4 shadow-md">
                              <p className="text-sm leading-relaxed">{q.question}</p>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-1 px-1">
                              <span className="text-xs text-gray-400">{q.timestamp}</span>

                            </div>
                          </div>
                        </div>

                        {/* AI Response */}
                        {q.status === "pending" && (
                          <div className="flex justify-start">
                            <div className="max-w-xs lg:max-w-md">
                              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm p-4 shadow-md">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                                  <span className="text-sm text-gray-600">AI is analyzing your question...</span>
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                                                 {q.status === "answered" && q.answer && (
                           <div className="flex justify-start">
                             <div className="max-w-xs lg:max-w-2xl">
                               <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl rounded-bl-sm p-4 shadow-md">
                                 <div className="flex items-center gap-2 mb-3">

                                   <span className="text-xs font-semibold text-green-700">JAI-Kissan</span>
                                   <Sparkles className="w-3 h-3 text-green-500" />
                                 </div>
                                 <div className="prose prose-sm max-w-none text-gray-700">
                                   <ReactMarkdown
                                     components={{
                                       h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-gray-800 mb-2" {...props} />,
                                       h2: ({ node, ...props }) => <h2 className="text-base font-semibold text-gray-700 mb-2" {...props} />,
                                       h3: ({ node, ...props }) => <h3 className="text-sm font-semibold text-gray-600 mb-1" {...props} />,
                                       p: ({ node, ...props }) => <p className="text-sm mb-2 leading-relaxed" {...props} />,
                                       ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-2" {...props} />,
                                       ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-2" {...props} />,
                                       li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                                       strong: ({ node, ...props }) => <strong className="font-semibold text-gray-800" {...props} />,
                                       em: ({ node, ...props }) => <em className="italic text-gray-700" {...props} />,
                                       code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                                       pre: ({ node, ...props }) => <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto" {...props} />
                                     }}
                                   >
                                     {q.answer}
                                   </ReactMarkdown>
                                 </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-green-100">
                                  <button
                                    onClick={() => navigator.clipboard.writeText(q.answer)}
                                    className="flex items-center gap-1 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                  </button>
                                  <button className="flex items-center gap-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs transition-colors">
                                    <ThumbsUp className="w-3 h-3" />
                                    Helpful
                                  </button>
                                  <button className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition-colors">
                                    <Share className="w-3 h-3" />
                                    Share
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1 px-1">
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <Bot className="w-2 h-2 text-white" />
                                </div>
                                <span className="text-xs text-gray-400">Just now</span>
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              </div>
                            </div>
                          </div>
                        )}

                        {q.status === "error" && (
                          <div className="flex justify-start">
                            <div className="max-w-xs lg:max-w-md">
                              <div className="bg-red-50 border border-red-200 rounded-2xl rounded-bl-sm p-4 shadow-md">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="w-4 h-4 text-red-600" />
                                  <span className="text-xs font-semibold text-red-700">Error</span>
                                </div>
                                <p className="text-sm text-red-700">
                                  Sorry, I couldn't process your question right now. Please try again.
                                </p>
                                <button
                                  onClick={() => {
                                    setQuery(q.question);
                                    handleSubmitQuery();
                                  }}
                                  className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                                >
                                  Try again
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>

                             {/* Chat Input */}
               <div className="border-t border-gray-200 p-4 bg-white">
                 <div className="flex items-end gap-4">
                   <div className="flex-1">
                     <div className="relative">
                <textarea
                         placeholder="Ask me about farming, crops, weather, diseases, or any agricultural question... 🌱"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                         onKeyPress={(e) => {
                           if (e.key === 'Enter' && !e.shiftKey) {
                             e.preventDefault();
                             handleSubmitQuery();
                           }
                         }}
                         className="w-full border-2 border-gray-200 rounded-xl p-4 pr-16 text-sm max-h-32 min-h-[48px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 resize-none"
                         rows={1}
                       />
                       <div className="absolute right-4 top-4">
                         <span className="text-xs text-gray-400">
                           {query.length > 0 && `${query.length}/1000`}
                         </span>
                       </div>
                     </div>

                    {/* Quick Suggestions */}
                    {query.length === 0 && !isProcessingVoice && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          "Crop diseases 🦠",
                          "Weather advice ☀️",
                          "Fertilizer tips 🧪",
                          "Pest control 🐛"
                        ].map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => setQuery(suggestion.replace(/\s+\S+$/, ''))}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-md transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Voice Processing Status */}
                    {isProcessingVoice && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing voice input...</span>
                      </div>
                    )}
                  </div>

                                                        {/* Voice Recording Button */}
                   <button
                     onClick={isRecording ? stopRecording : startRecording}
                     disabled={isProcessingVoice || loading}
                     className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 relative ${
                       isRecording
                         ? "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg animate-pulse"
                         : isProcessingVoice
                         ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                         : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                     }`}
                     title={isRecording ? "Stop recording" : "Start voice recording"}
                   >
                     {isProcessingVoice ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                     ) : isRecording ? (
                       <div className="w-4 h-4 bg-white rounded-sm flex-shrink-0 border border-red-300"></div>
                     ) : (
                       <Mic className="w-5 h-5" />
                     )}
                   </button>

                   {/* Send Button */}
                <button
                  onClick={handleSubmitQuery}
                  disabled={!query.trim() || loading}
                     className={`p-3 rounded-xl transition-all duration-300 ${query.trim() && !loading
                         ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg"
                         : "bg-gray-200 text-gray-400 cursor-not-allowed"
                       }`}
                >
                  {loading ? (
                       <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                       <Send className="w-5 h-5" />
                  )}
                </button>
            </div>

                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Press Enter to send, Shift+Enter for new line • Click 🎤 for voice input</span>
                  <div className="flex items-center gap-1">
                    <span>Powered by JAI-Kissan</span>
                    <Zap className="w-3 h-3 text-yellow-500" />
                </div>
              </div>
                  </div>
                        </div>
                      </div>
        )}

        {/* New Suppliers Tab */}
        {tab === "suppliers" && (
          <div className="space-y-6 mt-6">
            {/* Suppliers Header */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                            </div>
                  <div>
                    <h3 className="text-blue-800 font-bold text-lg">Agricultural Suppliers</h3>
                    <p className="text-sm text-blue-600">Connect with verified suppliers and compare offers</p>
                          </div>
                        </div>
                
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  {showComparison ? 'Hide' : 'Show'} Comparison
                </button>
              </div>

              {/* Filter and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <select 
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border border-blue-200 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="all">All Categories</option>
                      <option value="seeds">Seeds</option>
                      <option value="fertilizers">Fertilizers</option>
                      <option value="equipment">Equipment</option>
                      <option value="organic">Organic Products</option>
                    </select>
                            </div>
                          </div>
                
                <div className="flex items-center gap-4 text-sm text-blue-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>{suppliers.filter(s => s.verified).length} Verified</span>
                        </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>Avg 4.7 Rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            {showComparison && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg overflow-x-auto">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Supplier Comparison
                </h4>
                
                <div className="min-w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2">Supplier</th>
                        <th className="text-left py-3 px-2">Rating</th>
                        <th className="text-left py-3 px-2">Response Time</th>
                        <th className="text-left py-3 px-2">Best Price</th>
                        <th className="text-left py-3 px-2">Delivery</th>
                        <th className="text-left py-3 px-2">Speciality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map((supplier, index) => (
                        <tr key={supplier.id} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{supplier.profileImage}</span>
                              <div>
                                <div className="font-medium text-gray-800">{supplier.name}</div>
                                <div className="text-xs text-gray-500">{supplier.company}</div>
                            </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="font-medium">{supplier.rating}</span>
                              <span className="text-gray-400">({supplier.totalReviews})</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-green-600 font-medium">{supplier.responseTime}</span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-bold text-blue-600">
                              ₹{Math.min(...supplier.bids.map(b => b.price))}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-gray-600">
                              {supplier.bids[0]?.deliveryTime || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-wrap gap-1">
                              {supplier.badges.slice(0, 2).map((badge, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                          </div>
                        </div>
                      )}

            {/* Supplier Cards */}
            <div className="grid gap-6">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  
                  {/* Supplier Header */}
                  <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center text-2xl">
                        {supplier.profileImage}
                        </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-800">{supplier.name}</h3>
                          {supplier.verified && (
                            <Verified className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                        <p className="text-gray-600 font-medium">{supplier.company}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{supplier.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Since {supplier.joinedDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-bold text-gray-800">{supplier.rating}</span>
                        <span className="text-gray-500">({supplier.totalReviews} reviews)</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {supplier.totalDeals} successful deals
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {supplier.badges.map((badge, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-medium">
                        <Award className="w-3 h-3 inline mr-1" />
                        {badge}
                      </span>
                    ))}
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Responds {supplier.responseTime}
                          </span>
                        </div>

                  {/* Products */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Products & Services:</h4>
                    <div className="flex flex-wrap gap-2">
                      {supplier.products.map((product, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                          {product}
                        </span>
                      ))}
                      </div>
                    </div>

                  {/* Current Bids */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Current Offers:
                    </h4>
                    <div className="space-y-3">
                      {supplier.bids.map((bid, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-800">{bid.product}</h5>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">₹{bid.price}</div>
                              <div className="text-xs text-gray-500">{bid.unit}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Min Qty:</span> {bid.quantity}
                            </div>
                            <div>
                              <span className="font-medium">Delivery:</span> {bid.deliveryTime}
                            </div>
                            <div>
                              <span className="font-medium">Terms:</span> {bid.terms}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedSupplier(supplier.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg py-3 text-sm transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat Now
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg px-4 py-3 text-sm transition-colors">
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg px-4 py-3 text-sm transition-colors">
                      <Eye className="w-4 h-4" />
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Supplier Stats Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 shadow-lg">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Market Summary
              </h4>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{suppliers.length}</div>
                  <p className="text-sm text-gray-600">Active Suppliers</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    ₹{Math.min(...suppliers.flatMap(s => s.bids.map(b => b.price)))}
                  </div>
                  <p className="text-sm text-gray-600">Best Price</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">4.7★</div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">2-3 Days</div>
                  <p className="text-sm text-gray-600">Avg Delivery</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/** Workflow Queries Section **/}
        {workflowQueries.length > 0 && (
          <div className="bg-white border border-purple-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-800">Complex AI Workflows</h4>
            </div>
            
            <div className="space-y-4">
              {workflowQueries.map((workflow) => (
                <div key={workflow.id} className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  {/** Workflow Question **/}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm leading-relaxed font-medium text-gray-800">{workflow.question}</p>
                  </div>

                                     {/** Workflow Progress Component **/}
                   <div className="ml-9">
                     <WorkflowProgress
                       workflowId={workflow.workflowId}
                       originalQuery={workflow.question}
                       subtasks={workflow.subtasks}
                       onComplete={(result) => handleWorkflowComplete(workflow.workflowId, result)}
                       onError={(error) => handleWorkflowError(workflow.workflowId, error)}
                     />
                   </div>

                  {/** Error State **/}
                  {workflow.status === 'error' && (
                    <div className="ml-9 mt-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-700">Workflow processing failed. Please try again.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "updates" && (
          <div className="space-y-4 mt-6">
            {agriculturalUpdates.map((update) => (
              <div key={update.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-bold leading-tight pr-2 text-gray-800">{update.title}</h3>
                  <span className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">
                    {update.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {update.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {update.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {update.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

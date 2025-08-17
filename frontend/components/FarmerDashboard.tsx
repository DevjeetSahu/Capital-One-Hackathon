import React, { useState, useEffect } from "react";
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
  MapPin,
  Calendar,
  Phone,
  MessageCircle,
  Bot,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Brain
} from "lucide-react";

// Add interface for pending query
interface PendingQuery {
  question: string;
  answer: string | null;
  status: 'answered' | 'error';
}

// Add interface for component props
interface FarmerDashboardProps {
  pendingQuery?: PendingQuery | null;
  setPendingQuery?: (query: PendingQuery | null) => void;
}

// Update function signature to accept props
export function FarmerDashboard({ pendingQuery, setPendingQuery }: FarmerDashboardProps = {}) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("query");
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState([]);
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

  // Handle pending query from homepage
  useEffect(() => {
    if (pendingQuery) {
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
  }, [pendingQuery, setPendingQuery]);

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

  const handleSubmitQuery = async () => {
    if (!query.trim()) return;
    
    const newQuery = {
      id: queries.length + 1,
      question: query,
      timestamp: "Just now",
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

      // Update the specific query with response
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

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuery();
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
      <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 border border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
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
          <div className={`flex items-center gap-3 bg-white/80 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
            error ? 'border-red-200' : 'border-red-100'
          }`}>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <span className="font-bold text-gray-800 text-base">{weatherData.temperature}</span>
              <p className="text-xs text-gray-500">Temperature</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 bg-white/80 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
            error ? 'border-blue-200' : 'border-blue-100'
          }`}>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Droplets className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <span className="font-bold text-gray-800 text-base">{weatherData.humidity}</span>
              <p className="text-xs text-gray-500">Humidity</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 bg-white/80 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
            error ? 'border-gray-200' : 'border-gray-100'
          }`}>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Wind className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <span className="font-bold text-gray-800 text-base">{weatherData.windSpeed}</span>
              <p className="text-xs text-gray-500">Wind Speed</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-3 bg-white/80 rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md ${
            error ? 'border-gray-200' : 'border-gray-100'
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
        <div className="grid grid-cols-2 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
          <button
            onClick={() => setTab("query")}
            className={`flex items-center gap-2 justify-center py-4 text-sm font-semibold transition-all duration-300 ${
              tab === "query" 
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg" 
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Ask Questions
          </button>
          <button
            onClick={() => setTab("updates")}
            className={`flex items-center gap-2 justify-center py-4 text-sm font-semibold transition-all duration-300 ${
              tab === "updates" 
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
            {/** Enhanced Query Box **/}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-green-800">Ask Agricultural Experts</h4>
                  <p className="text-sm text-gray-600">Get AI-powered answers from farming experts</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <textarea
                  placeholder="Type your agricultural question here..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full border-2 border-green-200 rounded-xl p-4 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-300 resize-none"
                />
                
                <button
                  onClick={handleSubmitQuery}
                  disabled={!query.trim() || loading}
                  className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl py-4 text-sm transition-all duration-300 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI is thinking...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Question
                    </>
                  )}
                </button>
              </div>
            </div>

            {/** Enhanced Previous Queries **/}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Your Previous Questions</h4>
              </div>
              
              <div className="space-y-4">
                {queries.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No questions yet. Ask your first farming question above!</p>
                  </div>
                ) : (
                  queries.map((q) => (
                    <div key={q.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                      {/** Question **/}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <MessageSquare className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-sm leading-relaxed font-medium text-gray-800">{q.question}</p>
                      </div>

                      {/** Answer **/}
                      {q.answer && (
                        <div className="ml-9 mb-3">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-semibold text-green-700">AI Expert Answer</span>
                              <Sparkles className="w-3 h-3 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
                          </div>
                        </div>
                      )}

                      {/** Loading State **/}
                      {q.status === "pending" && (
                        <div className="ml-9 mb-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                              <span className="text-sm text-blue-700">AI is analyzing your question...</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/** Error State **/}
                      {q.status === "error" && (
                        <div className="ml-9 mb-3">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600" />
                              <span className="text-sm text-red-700">Failed to get response. Please try again.</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/** Metadata **/}
                      <div className="flex items-center justify-between text-xs text-gray-500 ml-9">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {q.timestamp}
                          </span>
                          <span>{q.responses} responses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {q.status === "answered" && <CheckCircle className="w-3 h-3 text-green-500" />}
                          {q.status === "pending" && <Zap className="w-3 h-3 text-blue-500" />}
                          {q.status === "error" && <AlertCircle className="w-3 h-3 text-red-500" />}
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              q.status === "answered"
                                ? "bg-green-100 text-green-700"
                                : q.status === "error"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {q.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
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

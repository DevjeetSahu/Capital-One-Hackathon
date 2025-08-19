import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Leaf, Truck, ArrowLeft, MessageSquare, Sparkles, Zap, Shield, Globe, Clock, 
  Heart, Users, TrendingUp, Star, CheckCircle, Award, Sun, Sprout, Search, 
  Phone, Cloud, DollarSign, BookOpen, Home, Menu, Droplets, TreePine, 
  Wheat, Tractor, AlertTriangle, TrendingDown, Calculator, FileText,
  MapPin, Thermometer, Wind, Eye, Lightbulb, GraduationCap, HandHeart,
  Coins, CreditCard, Smartphone, Wifi, Mountain, Factory, ShoppingCart,
  Store, Building2, Package, Handshake, BarChart3, GitCompare, MessageCircle,
  UserCheck, Banknote, Calendar, Timer, Gauge, Network, Target
} from 'lucide-react';
import { FarmerDashboard } from '../components/FarmerDashboard';
import { SupplierDashboard } from '../components/SupplierDashboard';
import { SMSInterface } from '../components/SMSInterface';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

type UserInterface = 'farmer' | 'supplier' | 'sms' | null;

// Add interface for pending query
interface PendingQuery {
  question: string;
  answer: string | null;
  status: 'answered' | 'error';
}

export default function App() {
  const [userInterface, setUserInterface] = useState<UserInterface>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showElements, setShowElements] = useState(false);
  
  // Add pending query state
  const [pendingQuery, setPendingQuery] = useState<PendingQuery | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Starting animation sequence
  useEffect(() => {
    const sequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowElements(true);
    };
    sequence();
  }, []);

  const handleInterfaceSelection = (role: UserInterface) => {
    setUserInterface(role);
  };

  const handleBack = () => {
    setUserInterface(null);
    // Clear pending query when going back to home
    setPendingQuery(null);
  };

  // Modified handleSearchSubmit to make API call
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    
    setIsConnecting(true);

    try {
      // Make the API call first
      const response = await fetch("https://jai-kissan-service-945629796480.asia-south1.run.app/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: searchQuery,
          llm_provider: "groq",
          llm_model: "llama-3.1-8b-instant",
          top_k: 5
        })
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();

      // Store the query and response
      setPendingQuery({
        question: searchQuery,
        answer: data.response,
        status: "answered"
      });

    } catch (err) {
      console.error('Error sending query:', err);
      // Store failed query
      setPendingQuery({
        question: searchQuery,
        answer: null,
        status: "error"
      });
    } finally {
      // Clear search query and navigate
      setSearchQuery('');
      setIsConnecting(false);
      handleInterfaceSelection('farmer');
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "सुप्रभात! Good Morning";
    if (hour < 17) return "नमस्ते! Good Afternoon";
    return "शुभ संध्या! Good Evening";
  };

  const quickSuggestions = [
    { text: "मेरी फसल पीली हो रही है", icon: "🌾" },
    { text: "आज मौसम कैसा रहेगा?", icon: "🌦️" },
    { text: "धान का भाव क्या है?", icon: "💰" },
    { text: "खाद कब डालना चाहिए?", icon: "🌱" }
  ];

  // Demo supplier data for showcase
  const demoSuppliers = [
    {
      id: 1,
      name: "Kisan AgriSupply Co.",
      rating: 4.8,
      price: 1200,
      originalPrice: 1500,
      location: "15km away",
      specialty: "Seeds & Fertilizers",
      verified: true,
      responseTime: "< 30 min"
    },
    {
      id: 2,
      name: "Green Fields Enterprises",
      rating: 4.6,
      price: 1350,
      originalPrice: 1600,
      location: "25km away",
      specialty: "Organic Products",
      verified: true,
      responseTime: "< 1 hour"
    },
    {
      id: 3,
      name: "Punjab Krishi Mart",
      rating: 4.9,
      price: 1100,
      originalPrice: 1400,
      location: "45km away",
      specialty: "Complete Supplies",
      verified: true,
      responseTime: "< 15 min"
    }
  ];

  // Custom JAI-KISSAN Logo Component
  const JaiKissanLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
    const dimensions = {
      sm: "w-8 h-8",
      md: "w-12 h-12",
      lg: "w-16 h-16"
    };

    return (
      <div className={`${dimensions[size]} relative`}>
        {/* Background Circle representing Earth/Soil */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-green-600 to-blue-600 rounded-full shadow-lg">
          {/* Farmer Hands holding Wheat */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Wheat stalks */}
              <Wheat className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-5 h-5' : 'w-7 h-7'} text-amber-200 absolute -top-1 left-1/2 transform -translate-x-1/2`} />
              {/* Supporting hands */}
              <HandHeart className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
            </div>
          </div>
          {/* Rising Sun representing Hope */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full opacity-80"></div>
        </div>
      </div>
    );
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 ai-floating">
            <JaiKissanLogo size="lg" />
          </div>
          <h2 className="text-2xl lg:text-3xl text-gray-800 mb-4">JAI-KISSAN Loading...</h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // Connecting screen
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-2xl animate-spin">
              <JaiKissanLogo size="lg" />
            </div>
            <div className="absolute -inset-4 border-4 border-green-500/30 rounded-full animate-pulse"></div>
            <div className="absolute -inset-8 border-4 border-blue-500/20 rounded-full animate-pulse delay-500"></div>
          </div>
          
          <h2 className="text-3xl mb-4 text-gray-800">कृषि सहायक से जुड़ रहे हैं...</h2>
          <p className="text-lg text-gray-600 mb-6">Connecting to JAI-KISSAN Agricultural Assistant</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">कृषि विशेषज्ञ तैयार • Agricultural experts ready</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700">मौसम डेटा लोड हो रहा • Weather data loading</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-700">कृषि सलाहकार सक्रिय हो रहा • Agricultural advisor activating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userInterface) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-blue-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-green-200/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 md:w-36 md:h-36 lg:w-48 lg:h-48 bg-amber-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-blue-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        {/* Header */}
        <header className={`bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50 transition-all duration-1000 ${showElements ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <JaiKissanLogo size="md" />
                <div>
                  <h1 className="text-xl lg:text-2xl bg-gradient-to-r from-green-600 via-blue-600 to-amber-600 bg-clip-text text-transparent">
                    JAI-KISSAN
                  </h1>
                  <p className="text-xs lg:text-sm text-gray-600">किसान का विश्वसनीय साथी</p>
                </div>
              </div>

              {/* Quick Navigation */}
              <nav className="hidden lg:flex items-center gap-6">
                <Button 
                  variant="ghost" 
                  onClick={() => handleInterfaceSelection('farmer')}
                  className="hover:bg-green-100 text-green-700"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Weather
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleInterfaceSelection('farmer')}
                  className="hover:bg-blue-100 text-blue-700"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Prices
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => handleInterfaceSelection('sms')}
                  className="hover:bg-purple-100 text-purple-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </Button>
                <Button 
                  variant="ghost"
                  className="hover:bg-amber-100 text-amber-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Help
                </Button>
              </nav>

              {/* Mobile Menu */}
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="relative z-10">
          {/* Hero Section with Search */}
          <section className="px-4 py-12 lg:px-8 lg:py-20">
            <div className="max-w-6xl mx-auto">
              <div className={`text-center mb-12 lg:mb-16 transition-all duration-1000 delay-300 ${showElements ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {/* Status Indicator */}
                <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/20 mb-8">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">कृषि सहायक ऑनलाइन • Agricultural Assistant Online</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-500"></div>
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl lg:text-6xl xl:text-7xl mb-6 text-gray-800 leading-tight">
                  <span className="text-green-600">खेती की समस्या?</span><br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    तुरंत पूछें!
                  </span>
                </h1>
                
                <p className="text-lg lg:text-2xl text-gray-600 mb-4 leading-relaxed">
                  {getGreeting()} • Ask any farming question, get instant expert answers
                </p>
                
                <p className="text-base lg:text-lg text-gray-500 mb-12">
                  24/7 available • Works in Hindi, English & more languages
                </p>

                {/* Main Search Box */}
                <div className="max-w-4xl mx-auto mb-8">
                  <div className={`relative group ${isSearchFocused ? 'scale-105' : ''} transition-all duration-300`}>
                    <div className="absolute -inset-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
                      <div className="flex items-center p-4 lg:p-6">
                        <div className="flex-1 relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 text-gray-400" />
                          <Input
                            placeholder="मेरी फसल की समस्या है... / I have a crop problem..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                            className="pl-12 lg:pl-14 pr-4 py-4 lg:py-6 text-base lg:text-xl border-0 focus:ring-0 placeholder:text-gray-400 bg-transparent"
                          />
                        </div>
                        <Button 
                          onClick={handleSearchSubmit}
                          size="lg"
                          className="ml-4 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 lg:px-8 py-4 lg:py-6 text-base lg:text-lg"
                        >
                          <Lightbulb className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
                          Get Help
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Suggestions */}
                <div className="mb-12">
                  <p className="text-gray-600 mb-4 text-sm lg:text-base">Quick examples:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {quickSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => {
                          setSearchQuery(suggestion.text);
                          handleSearchSubmit();
                        }}
                        className="text-xs lg:text-sm border-green-200 rounded-xl px-6 py-2 hover:bg-green-50 hover:border-green-300 ai-suggestion-hover"
                      >
                        <span className="mr-2">{suggestion.icon}</span>
                        {suggestion.text}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Trust Indicators */}
                {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  <div className="text-center">
                    <div className="text-2xl lg:text-4xl font-bold text-green-600 mb-2">50,000+</div>
                    <p className="text-sm lg:text-base text-gray-600">Farmers Helped</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-4xl font-bold text-blue-600 mb-2">24/7</div>
                    <p className="text-sm lg:text-base text-gray-600">Always Available</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-4xl font-bold text-amber-600 mb-2">6+</div>
                    <p className="text-sm lg:text-base text-gray-600">Languages</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-4xl font-bold text-purple-600 mb-2">98%</div>
                    <p className="text-sm lg:text-base text-gray-600">Problems Solved</p>
                  </div>
                </div> */}
              </div>
            </div>
          </section>

            <section className={`px-4 py-12 lg:px-8 lg:py-16 bg-white/70 backdrop-blur-sm transition-all duration-1000 delay-400 ${showElements ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 lg:mb-16">
                <h2 className="text-3xl lg:text-5xl mb-6 text-gray-800">
                  किसानों की समस्याओं का समाधान • Complete Farming Solutions
                </h2>
                <p className="text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto">
                  From seed to harvest, from weather worries to market prices - JAI-KISSAN addresses every challenge farmers face daily
                </p>
              </div>

              {/* Problem Categories Grid */}
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-3 mb-16">
                
                {/* Weather & Climate Solutions */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-sky-100 border-2 border-blue-200 hover:border-blue-400 cursor-pointer ai-enhanced-card"
                      onClick={() => handleInterfaceSelection('farmer')}>
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Cloud className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-blue-800 text-lg lg:text-xl">Weather & Climate</h3>
                        <p className="text-blue-600 text-sm">मौसम और जलवायु</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">Real-time weather alerts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">Storm and hail warnings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">Drought predictions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span className="text-gray-700">Rainfall forecasts</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-600 to-sky-700 hover:from-blue-700 hover:to-sky-800 text-sm">
                      Get Weather Updates
                    </Button>
                  </CardContent>
                </Card>

                {/* Crop Health & Disease Management */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 hover:border-green-400 cursor-pointer ai-enhanced-card"
                      onClick={() => handleInterfaceSelection('farmer')}>
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Leaf className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-green-800 text-lg lg:text-xl">Crop Health</h3>
                        <p className="text-green-600 text-sm">फसल स्वास्थ्य</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Disease identification</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Pest control guidance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sprout className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Fertilizer recommendations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TreePine className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Organic farming tips</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-sm">
                      Check Crop Health
                    </Button>
                  </CardContent>
                </Card>

                {/* Market Intelligence */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-2 border-purple-200 hover:border-purple-400 cursor-pointer ai-enhanced-card"
                      onClick={() => handleInterfaceSelection('farmer')}>
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-purple-800 text-lg lg:text-xl">Market Intelligence</h3>
                        <p className="text-purple-600 text-sm">बाजार की जानकारी</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700">Real-time crop prices</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700">Price predictions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700">Local market info</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-purple-500" />
                        <span className="text-gray-700">Selling strategies</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-sm">
                      Check Prices
                    </Button>
                  </CardContent>
                </Card>

                {/* Financial Support & Schemes */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-200 hover:border-amber-400 cursor-pointer ai-enhanced-card"
                      onClick={() => handleInterfaceSelection('farmer')}>
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                        <CreditCard className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-amber-800 text-lg lg:text-xl">Financial Support</h3>
                        <p className="text-amber-600 text-sm">वित्तीय सहायता</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-700">Government schemes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-700">Loan guidance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-700">Crop insurance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-amber-500" />
                        <span className="text-gray-700">Subsidy calculator</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-sm">
                      Explore Schemes
                    </Button>
                  </CardContent>
                </Card>

                {/* Water Management */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 to-teal-100 border-2 border-cyan-200 hover:border-cyan-400 cursor-pointer ai-enhanced-card"
                      onClick={() => handleInterfaceSelection('farmer')}>
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Droplets className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-cyan-800 text-lg lg:text-xl">Water Management</h3>
                        <p className="text-cyan-600 text-sm">जल प्रबंधन</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-500" />
                        <span className="text-gray-700">Irrigation scheduling</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-cyan-500" />
                        <span className="text-gray-700">Water conservation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tractor className="w-4 h-4 text-cyan-500" />
                        <span className="text-gray-700">Drip irrigation setup</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        <span className="text-gray-700">Optimal watering times</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-700 hover:to-teal-800 text-sm">
                      Water Solutions
                    </Button>
                  </CardContent>
                </Card>

                {/* Knowledge & Training */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-100 border-2 border-rose-200 hover:border-rose-400 cursor-pointer ai-enhanced-card"
                      onClick={() => handleInterfaceSelection('farmer')}>
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <GraduationCap className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-rose-800 text-lg lg:text-xl">Knowledge & Training</h3>
                        <p className="text-rose-600 text-sm">ज्ञान और प्रशिक्षण</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-rose-500" />
                        <span className="text-gray-700">Farming techniques</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-rose-500" />
                        <span className="text-gray-700">Digital literacy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-rose-500" />
                        <span className="text-gray-700">Community learning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-rose-500" />
                        <span className="text-gray-700">Best practices</span>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-sm">
                      Learn & Grow
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Emergency Support Banner */}
              {/* <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-300" />
                  <h3 className="text-2xl lg:text-3xl">आपातकालीन सहायता • Emergency Support</h3>
                  <AlertTriangle className="w-8 h-8 text-yellow-300" />
                </div>
                <p className="text-lg lg:text-xl mb-6 opacity-90">
                  Crop emergency? Pest attack? Weather disaster? Get immediate expert help!
                </p>
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
                  <div className="flex items-center gap-3 bg-white/20 rounded-lg px-6 py-3">
                    <Phone className="w-6 h-6" />
                    <span className="text-lg font-mono">+91-9876543210</span>
                  </div>
                  <div className="text-lg">या SMS करें "HELP" इस नंबर पर</div>
                </div>
              </div> */}
            </div>
          </section>

          {/* Smart Supplier Marketplace Demo Section */}
          <section className={`px-4 py-4 lg:px-8 lg:py-16 bg-gradient-to-br from-blue-50 via-white to-green-50 transition-all duration-1000 delay-600 ${showElements ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12 lg:mb-16">
                <div className="inline-flex items-center gap-3 bg-blue-100 rounded-full px-6 py-3 mb-6">
                  <Store className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Smart Supplier Marketplace</span>
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-3xl lg:text-5xl mb-6 text-gray-800">
                  सबसे अच्छा सप्लायर चुनें • Choose Your Best Supplier
                </h2>
                <p className="text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto">
                  Our AI-powered marketplace helps you compare suppliers, prices, and quality - 
                  ensuring you always get the best deal for your farming needs.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Left Side - Process Demo */}
                <div className="space-y-8">
                  <div className="relative">
                    <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-xl border border-white/20">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">1. Search for Supplies</h3>
                        <p className="text-gray-600">Tell us what you need - fertilizers, seeds, equipment</p>
                      </div>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                    <div className="absolute -right-2 top-1/2 w-4 h-4 bg-gradient-to-br from-green-500 to-blue-600 rounded-full animate-pulse"></div>
                  </div>

                  <div className="relative ml-8">
                    <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-xl border border-white/20">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <GitCompare className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">2. Compare Suppliers</h3>
                        <p className="text-gray-600">AI analyzes price, quality, distance, and reviews</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="absolute -right-2 top-1/2 w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse delay-500"></div>
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-xl border border-white/20">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">3. Chat & Negotiate</h3>
                        <p className="text-gray-600">Direct communication with suppliers for best deals</p>
                      </div>
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Handshake className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="absolute -right-2 top-1/2 w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full animate-pulse delay-1000"></div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-4 mb-4">
                      <Award className="w-8 h-8 text-yellow-300" />
                      <h3 className="text-xl font-semibold">Success Guaranteed!</h3>
                    </div>
                    <p className="mb-4">Average savings: ₹15,000 per season | 98% farmer satisfaction</p>
                    <Button 
                      onClick={() => handleInterfaceSelection('farmer')}
                      className="bg-white w-full rounded-xl text-green-600 hover:bg-gray-100 w-full"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Try Supplier Marketplace
                    </Button>
                  </div>
                </div>

                {/* Right Side - Live Demo */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <Store className="w-6 h-6" />
                      <h3 className="text-xl font-semibold">Live Supplier Comparison</h3>
                    </div>
                    <p className="text-blue-100 text-sm">Showing results for "NPK Fertilizer 50kg"</p>
                  </div>

                  <div className="p-6 space-y-4">
                    {demoSuppliers.map((supplier, index) => (
                      <div key={supplier.id} className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                        index === 0 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center text-lg">
                              🏪
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{supplier.name}</h4>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                  <span className="text-sm font-medium">{supplier.rating}</span>
                                </div>
                                {supplier.verified && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">₹{supplier.price}</div>
                            <div className="text-xs text-gray-500 line-through">₹{supplier.originalPrice}</div>
                            <div className="text-xs text-red-600">Save ₹{supplier.originalPrice - supplier.price}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-500" />
                            <span>{supplier.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Timer className="w-3 h-3 text-green-500" />
                            <span>{supplier.responseTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-purple-500" />
                            <span>{supplier.specialty}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            <GitCompare className="w-3 h-3 mr-1" />
                            Compare
                          </Button>
                        </div>

                        {index === 0 && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Best Deal!
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Gauge className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-800">AI Recommendation</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Based on your location and previous purchases, <strong>Kisan AgriSupply Co.</strong> offers the best value with fastest delivery.
                      </p>
                      <Button 
                      size="sm"
                      onClick={() => handleInterfaceSelection('farmer')} 
                      className="bg-green-200 rounded-xl text-green-800 hover:bg-green-300">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Select This Supplier
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Best Prices</h4>
                  <p className="text-sm text-gray-600">AI finds the lowest prices across all suppliers</p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Verified Quality</h4>
                  <p className="text-sm text-gray-600">Only trusted suppliers with quality guarantee</p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Network className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Local Network</h4>
                  <p className="text-sm text-gray-600">Connect with suppliers in your area</p>
                </div>

                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Fast Delivery</h4>
                  <p className="text-sm text-gray-600">Same-day to 3-day delivery options</p>
                </div>
              </div> */}
            </div>
          </section>

          {/* Comprehensive Farmer Problems & Solutions Section */}
          

          {/* SMS Quick Access */}
          <section className={`px-4 py-8 lg:px-8 lg:py-12 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 transition-all duration-1000 delay-500 ${showElements ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="max-w-4xl mx-auto text-center text-white">
              <h2 className="text-2xl lg:text-4xl mb-6">No Internet? No Problem!</h2>
              <p className="text-lg lg:text-xl mb-8 opacity-90">
                गांव में नेटवर्क नहीं है? SMS करें और तुरंत मदद पाएं • No network in village? Send SMS for instant help
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="w-12 h-12 bg-white/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">1</span>
                  </div>
                  <h3 className="text-lg mb-2">Farming Queries</h3>
                  <p className="text-white/80 text-sm">SMS "1" for crop problems</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="w-12 h-12 bg-white/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">5</span>
                  </div>
                  <h3 className="text-lg mb-2">Weather Updates</h3>
                  <p className="text-white/80 text-sm">SMS "5" for weather alerts</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="w-12 h-12 bg-white/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">9</span>
                  </div>
                  <h3 className="text-lg mb-2">Language Choice</h3>
                  <p className="text-white/80 text-sm">SMS "9" for language selection</p>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30 inline-block">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Phone className="w-6 h-6" />
                  <span className="text-xl font-mono">9876543210</span>
                </div>
                <p className="text-white/80">SMS charges: ₹2 per message</p>
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => handleInterfaceSelection('sms')}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg"
                >
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Try SMS Interface
                </Button>
              </div>
            </div>
          </section>

          {/* Service Cards - Quick Access */}
          <section className={`px-4 py-12 lg:px-8 lg:py-16 bg-white/50 backdrop-blur-sm transition-all duration-1000 delay-700 ${showElements ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-5xl mb-6 text-gray-800">
                  Choose Your Preferred Interface
                </h2>
                <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                  Multiple ways to access JAI-KISSAN - choose what works best for you
                </p>
              </div>

              <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
                
                {/* Farmer Interface */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 hover:border-green-400 cursor-pointer ai-enhanced-card"
                      onClick={() => handleInterfaceSelection('farmer')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  <div className="relative h-48 lg:h-64 overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1722119272044-fc49006131e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGZhcm1pbmclMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1NTI3NDg3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Woman harvesting rice"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 shadow-lg">
                      <Leaf className="w-5 h-5" />
                    </div>
                  </div>

                  <CardContent className="p-6 lg:p-8 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Leaf className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-green-800 text-xl lg:text-2xl">Smart Dashboard</h3>
                        <p className="text-green-600">Complete farming assistant</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      Full dashboard with crop monitoring, weather alerts, market prices, expert chat, and supplier marketplace.
                    </p>

                    <Button className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                      Open Dashboard
                    </Button>
                  </CardContent>
                </Card>

                {/* Supplier Interface */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-100 border-2 border-blue-200 hover:border-blue-400 cursor-pointer ai-enhanced-card"
                      onClick={() => handleInterfaceSelection('supplier')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  <div className="relative h-48 lg:h-64 overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1569140733895-eabccf089fc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBtb2JpbGUlMjBwaG9uZXxlbnwxfHx8fDE3NTUwOTIxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Agricultural supplier"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-2 shadow-lg">
                      <Truck className="w-5 h-5" />
                    </div>
                  </div>

                  <CardContent className="p-6 lg:p-8 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Truck className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-blue-800 text-xl lg:text-2xl">Business Hub</h3>
                        <p className="text-blue-600">For agricultural suppliers</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      Business dashboard with demand forecasting, inventory management, and market analysis.
                    </p>

                    <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                      Business Dashboard
                    </Button>
                  </CardContent>
                </Card>

                {/* SMS Interface */}
                <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-100 border-2 border-purple-200 hover:border-purple-400 cursor-pointer ai-enhanced-card"
                      onClick={() => handleInterfaceSelection('sms')}>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  <div className="relative h-48 lg:h-64 overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1679068008949-12852e5fca5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXJhbCUyMGNvbm5lY3Rpdml0eSUyMG1vYmlsZSUyMHBob25lfGVufDF8fHx8MTc1NTI3NDg3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Rural mobile phone"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-purple-500 text-white rounded-full p-2 shadow-lg">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                  </div>

                  <CardContent className="p-6 lg:p-8 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-purple-800 text-xl lg:text-2xl">SMS Assistant</h3>
                        <p className="text-purple-600">No internet required</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-6">
                      Simple SMS interface that works on any phone. Perfect for low connectivity areas.
                    </p>

                    <Button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                      Try SMS Interface
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Success Stories & Community Impact */}
          <section className={`px-4 py-12 lg:px-8 lg:py-16 bg-gradient-to-br from-green-50 to-blue-50 transition-all duration-1000 delay-800 ${showElements ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl mb-6 text-gray-800">
                  किसानों की सफलता की कहानियां • Farmer Success Stories
                </h2>
                <div className="flex justify-center gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Wheat className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-800 mb-2">राम सिंह - पंजाब</h3>
                    <Badge className="bg-green-100 text-green-800">Rice Farmer</Badge>
                  </div>
                  <p className="text-gray-700 mb-4 italic text-center">
                    "JAI-KISSAN ने मेरी धान की पीली बीमारी की पहचान रात के 2 बजे ही कर दी। तुरंत इलाज मिला, फसल बच गई। 
                    अब मेरी आमदनी 40% बढ़ गई है।"
                  </p>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">₹2.5 Lakh</div>
                    <p className="text-sm text-gray-600">Additional income this year</p>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Cloud className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-800 mb-2">सुनीता देवी - हरियाणा</h3>
                    <Badge className="bg-blue-100 text-blue-800">Wheat Farmer</Badge>
                  </div>
                  <p className="text-gray-700 mb-4 italic text-center">
                    "Weather alerts saved my 50-acre wheat crop from hailstorm. JAI-KISSAN predicted it 3 days earlier. 
                    My family's future is secure now."
                  </p>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">₹8 Lakh</div>
                    <p className="text-sm text-gray-600">Crop loss prevented</p>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-white/20">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Sprout className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg text-gray-800 mb-2">મહેશ પટેલ - ગુજરાત</h3>
                    <Badge className="bg-purple-100 text-purple-800">Cotton Farmer</Badge>
                  </div>
                  <p className="text-gray-700 mb-4 italic text-center">
                    "કપાસમાં કીટ લાગ્યું હતું. JAI-KISSAN એ આપેલી સલાહે મને બચાવ્યું. હવે આંતરિક કૃષિ પણ શીખ્યો છું."
                  </p>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">₹4 Lakh</div>
                    <p className="text-sm text-gray-600">Profit from organic cotton</p>
                  </div>
                </div>
              </div>

              {/* Community Impact Stats */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 lg:p-12 shadow-2xl border border-white/20">
                <h3 className="text-2xl lg:text-3xl text-center text-gray-800 mb-8">Community Impact • समुदायिक प्रभाव</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  <div className="text-center">
                    <div className="text-3xl lg:text-5xl font-bold text-green-600 mb-2">50,000+</div>
                    <p className="text-gray-600">Farmers Helped</p>
                    <p className="text-xs text-gray-500 mt-1">किसानों की सहायता</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-5xl font-bold text-blue-600 mb-2">₹500Cr+</div>
                    <p className="text-gray-600">Loss Prevented</p>
                    <p className="text-xs text-gray-500 mt-1">नुकसान से बचाव</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-5xl font-bold text-purple-600 mb-2">1M+</div>
                    <p className="text-gray-600">Queries Solved</p>
                    <p className="text-xs text-gray-500 mt-1">सवालों का समाधान</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl lg:text-5xl font-bold text-amber-600 mb-2">15+</div>
                    <p className="text-gray-600">States Covered</p>
                    <p className="text-xs text-gray-500 mt-1">राज्यों में सेवा</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <div className="grid lg:grid-cols-4 gap-8 mb-8">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-4 mb-4">
                    <JaiKissanLogo size="md" />
                    <div>
                      <h3 className="text-2xl mb-1">JAI-KISSAN</h3>
                      <p className="text-white/80">आपका विश्वसनीय कृषि साथी</p>
                    </div>
                  </div>
                  <p className="text-white/90 mb-4 max-w-md">
                    Empowering farmers across India with technology, knowledge, and 24/7 support. 
                    From crop health to market prices, we're here for every farming challenge.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      <span className="font-mono">+91-9876543210</span>
                    </div>
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <div className="text-white/80">Available 24/7</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg mb-4">Quick Links</h4>
                  <div className="space-y-2">
                    <div className="text-white/80 hover:text-white cursor-pointer">Weather Updates</div>
                    <div className="text-white/80 hover:text-white cursor-pointer">Market Prices</div>
                    <div className="text-white/80 hover:text-white cursor-pointer">Crop Health</div>
                    <div className="text-white/80 hover:text-white cursor-pointer">Government Schemes</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg mb-4">Emergency Help</h4>
                  <div className="space-y-2">
                    <div className="text-white/80">SMS "HELP" to get instant support</div>
                    <div className="text-white/80">Available in 6 languages</div>
                    <div className="text-white/80">Works without internet</div>
                    <div className="bg-white/20 rounded-lg p-3 mt-4">
                      <div className="text-center">
                        <div className="font-mono text-lg">9876543210</div>
                        <div className="text-xs text-white/80">24/7 Emergency Line</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-8 text-center">
                <p className="text-white/80 mb-2">
                  Current Time: {currentTime.toLocaleString('hi-IN')} • समय: {currentTime.toLocaleTimeString()}
                </p>
                <p className="text-white/70">
                  © 2024 JAI-KISSAN. Built with ❤️ for Indian farmers. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  if (userInterface === 'sms') {
    return <SMSInterface onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 lg:px-8 py-3 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-green-100">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <JaiKissanLogo size="sm" />
              <div>
                <h1 className="text-lg lg:text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">JAI-KISSAN</h1>
                <p className="text-xs lg:text-sm text-gray-600 capitalize">
                  {userInterface} Assistant
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {userInterface === 'farmer' ? (
              <div className="flex items-center gap-1">
                <Leaf className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Truck className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                <div className="w-2 h-2 lg:w-3 lg:h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 lg:p-8 max-w-md lg:max-w-7xl mx-auto">
        {userInterface === 'farmer' ? (
          <FarmerDashboard 
            pendingQuery={pendingQuery} 
            setPendingQuery={setPendingQuery}
          />
        ) : (
          <SupplierDashboard />
        )}
      </main>
    </div>
  );
}
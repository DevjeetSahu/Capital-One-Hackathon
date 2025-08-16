import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Leaf, Truck, ArrowLeft, MessageSquare, Bot, Sparkles, Zap, Shield, Globe, Clock, Heart, Users, TrendingUp } from 'lucide-react';
import { FarmerDashboard } from '../components/FarmerDashboard';
import { SupplierDashboard } from '../components/SupplierDashboard';
// import { SMSInterface } from '../components/SMSInterface';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

type UserInterface = 'farmer' | 'supplier' | 'sms' | null;

export default function App() {
  const [userInterface, setUserInterface] = useState<UserInterface>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInterfaceSelection = (role: UserInterface) => {
    setUserInterface(role);
  };

  const handleBack = () => {
    setUserInterface(null);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "सुप्रभात! Good Morning";
    if (hour < 17) return "नमस्ते! Good Afternoon";
    return "शुभ संध्या! Good Evening";
  };

  if (!userInterface) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements - Responsive */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 bg-green-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-32 right-10 w-24 h-24 md:w-36 md:h-36 lg:w-48 lg:h-48 bg-blue-200/30 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 md:w-56 md:h-56 lg:w-72 lg:h-72 bg-purple-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 px-4 py-6 lg:px-8 lg:py-12">
          {/* Responsive Container */}
          <div className="max-w-md mx-auto lg:max-w-7xl">
            
            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="grid lg:grid-cols-2 xl:grid-cols-5 gap-8 items-start">
                
                {/* Left Column - Hero Section */}
                <div className="xl:col-span-2 space-y-8">
                  {/* AI Assistant Header - Desktop */}
                  <div className="text-center lg:text-left">
                    <div className="relative mb-8">
                      {/* AI Avatar - Larger for Desktop */}
                      <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto lg:mx-0 mb-6 flex items-center justify-center shadow-xl">
                        <Bot className="w-12 h-12 lg:w-16 lg:h-16 text-white animate-bounce" />
                      </div>
                      <div className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3 w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-white animate-spin" />
                      </div>
                      
                      <h1 className="text-5xl lg:text-7xl xl:text-8xl mb-4 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                        JAI-KISSAN AI
                      </h1>
                      <div className="w-32 h-1 lg:w-48 lg:h-2 bg-gradient-to-r from-green-600 to-blue-600 mx-auto lg:mx-0 rounded-full"></div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 lg:p-8 shadow-xl border border-white/20 mb-8">
                      <p className="text-green-700 text-lg lg:text-xl mb-3">{getGreeting()}</p>
                      <p className="text-gray-700 text-lg lg:text-xl leading-relaxed mb-4">
                        <Bot className="w-5 h-5 lg:w-6 lg:h-6 inline mr-2 text-blue-500" />
                        Your AI farming assistant for <span className="text-green-600 font-semibold">smart agriculture</span>
                      </p>
                      <p className="text-gray-600 text-base lg:text-lg">
                        Helping farmers grow better with technology & low connectivity support
                      </p>
                    </div>

                    {/* Key Benefits - Desktop Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300">
                        <Zap className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm lg:text-base text-gray-700 font-medium">Instant Help</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300">
                        <Globe className="w-8 h-8 lg:w-10 lg:h-10 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm lg:text-base text-gray-700 font-medium">Multi-language</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 lg:p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300">
                        <Shield className="w-8 h-8 lg:w-10 lg:h-10 text-green-500 mx-auto mb-2" />
                        <p className="text-sm lg:text-base text-gray-700 font-medium">Expert Advice</p>
                      </div>
                    </div>

                    {/* Enhanced AI Features Section - Desktop */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 lg:p-8 shadow-xl border border-white/20">
                      <div className="text-center lg:text-left mb-6">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                          <Bot className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />
                          <h3 className="text-gray-800 text-xl lg:text-2xl font-semibold">How JAI-KISSAN AI Helps</h3>
                          <Sparkles className="w-6 h-6 lg:w-7 lg:h-7 text-purple-600" />
                        </div>
                        <p className="text-gray-600 text-base lg:text-lg">Comprehensive support for every farming need</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-6">
                        <div className="text-center lg:text-left">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-xl mx-auto lg:mx-0 mb-3 flex items-center justify-center">
                            <span className="text-white text-xl lg:text-2xl">🌾</span>
                          </div>
                          <p className="text-sm lg:text-base text-gray-700 font-medium">Crop Health Monitoring</p>
                        </div>
                        <div className="text-center lg:text-left">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl mx-auto lg:mx-0 mb-3 flex items-center justify-center">
                            <span className="text-white text-xl lg:text-2xl">💰</span>
                          </div>
                          <p className="text-sm lg:text-base text-gray-700 font-medium">Market Price Alerts</p>
                        </div>
                        <div className="text-center lg:text-left">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mx-auto lg:mx-0 mb-3 flex items-center justify-center">
                            <span className="text-white text-xl lg:text-2xl">🏛️</span>
                          </div>
                          <p className="text-sm lg:text-base text-gray-700 font-medium">Govt. Scheme Updates</p>
                        </div>
                        <div className="text-center lg:text-left">
                          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl mx-auto lg:mx-0 mb-3 flex items-center justify-center">
                            <span className="text-white text-xl lg:text-2xl">🆘</span>
                          </div>
                          <p className="text-sm lg:text-base text-gray-700 font-medium">Emergency Support</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-base lg:text-lg">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                          </div>
                          <span className="text-gray-700">SMS to <strong>9876543210</strong> • Available 24/7</span>
                        </div>
                        <div className="flex items-center gap-4 text-base lg:text-lg">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Globe className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                          </div>
                          <span className="text-gray-700">6+ Languages • Voice Support</span>
                        </div>
                        <div className="flex items-center gap-4 text-base lg:text-lg">
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                          </div>
                          <span className="text-gray-700">Instant AI responses • Expert network</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Interface Cards */}
                <div className="xl:col-span-3 space-y-6">
                  <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-1">
                    
                    {/* Farmer Interface - Desktop Enhanced */}
                    <Card className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-green-300 group relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 transform hover:scale-105"
                          onClick={() => handleInterfaceSelection('farmer')}>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-100/0 via-green-100/50 to-green-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="p-8 lg:p-10 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-6 items-center">
                          <div>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                <Leaf className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-green-800 text-xl lg:text-2xl xl:text-3xl">Farmer Assistant</h3>
                                  <Badge className="bg-green-100 text-green-700 text-sm">AI Powered</Badge>
                                </div>
                                <p className="text-gray-600 text-base lg:text-lg">Smart farming dashboard</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-white/70 rounded-lg p-4 text-center border border-green-200 hover:bg-white/90 transition-colors">
                                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                                <p className="text-sm lg:text-base text-gray-700">Crop Analytics</p>
                              </div>
                              <div className="bg-white/70 rounded-lg p-4 text-center border border-blue-200 hover:bg-white/90 transition-colors">
                                <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm lg:text-base text-gray-700">Expert Chat</p>
                              </div>
                            </div>

                            <ul className="space-y-3 text-base lg:text-lg text-gray-600 mb-6">
                              <li className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                AI-powered crop recommendations
                              </li>
                              <li className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                Real-time weather & soil alerts
                              </li>
                              <li className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                Market price predictions
                              </li>
                              <li className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                Government scheme notifications
                              </li>
                            </ul>

                            <Button className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/50 text-lg py-4 px-6 transition-all duration-300 ease-in-out flex items-center justify-center">
                              <Sparkles className="w-5 h-5 mr-3" />
                              Start Smart Farming
                            </Button>
                          </div>

                          <div className="relative">
                            <ImageWithFallback
                              src="https://images.unsplash.com/photo-1722119272044-fc49006131e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGZhcm1pbmclMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1NTI3NDg3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                              alt="Smart farming technology"
                              className="w-full h-64 lg:h-80 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg"
                            />
                            <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2">
                              
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Supplier Interface - Desktop Enhanced */}
                    {/* <Card className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-blue-300 group relative overflow-hidden bg-gradient-to-r from-blue-50 to-cyan-50 transform hover:scale-105"
                          onClick={() => handleInterfaceSelection('supplier')}>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="p-8 lg:p-10 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-6 items-center">
                          <div>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                <Truck className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-blue-800 text-xl lg:text-2xl xl:text-3xl">Supplier Hub</h3>
                                  <Badge className="bg-blue-100 text-blue-700 text-sm">Business</Badge>
                                </div>
                                <p className="text-gray-600 text-base lg:text-lg">AI business insights</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                              <div className="bg-white/70 rounded-lg p-4 text-center border border-blue-200 hover:bg-white/90 transition-colors">
                                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <p className="text-sm lg:text-base text-gray-700">Customer AI</p>
                              </div>
                              <div className="bg-white/70 rounded-lg p-4 text-center border border-purple-200 hover:bg-white/90 transition-colors">
                                <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                                <p className="text-sm lg:text-base text-gray-700">Sales Forecast</p>
                              </div>
                            </div>

                            <ul className="space-y-3 text-base lg:text-lg text-gray-600 mb-6">
                              <li className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                AI-powered demand forecasting
                              </li>
                              <li className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                Smart inventory management
                              </li>
                              <li className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                Automated customer responses
                              </li>
                              <li className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                Market trend analysis
                              </li>
                            </ul>

                            <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg text-lg py-6">
                              <Sparkles className="w-5 h-5 mr-3" />
                              Launch Business AI
                            </Button>
                          </div>

                          <div className="relative">
                            <ImageWithFallback
                              src="https://images.unsplash.com/photo-1569140733895-eabccf089fc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBtb2JpbGUlMjBwaG9uZXxlbnwxfHx8fDE3NTUwOTIxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                              alt="Agricultural supplier"
                              className="w-full h-64 lg:h-80 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg"
                            />
                            <div className="absolute top-4 right-4 bg-blue-500 text-white rounded-full p-2">
                              
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card> */}

                    {/* SMS Interface - Desktop Enhanced */}
                    {/* <Card className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-purple-300 group bg-gradient-to-r from-purple-50 via-green-50 to-blue-50 relative overflow-hidden transform hover:scale-105"
                          onClick={() => handleInterfaceSelection('sms')}>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/0 via-purple-100/30 to-purple-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="p-8 lg:p-10 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-6 items-center">
                          <div>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                                <MessageSquare className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-purple-800 text-xl lg:text-2xl xl:text-3xl">SMS Assistant</h3>
                                  <Badge className="bg-purple-100 text-purple-700 text-sm">2G/3G Ready</Badge>
                                </div>
                                <p className="text-gray-600 text-base lg:text-lg">Low connectivity support</p>
                              </div>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-6 border border-purple-200">
                              <div className="space-y-3 text-base lg:text-lg text-gray-700">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm">1</div>
                                  <span><strong>AI Query:</strong> Smart farming answers</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm">5</div>
                                  <span><strong>Local AI:</strong> Weather & crop updates</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-sm">9</div>
                                  <span><strong>Language AI:</strong> Regional support</span>
                                </div>
                              </div>
                            </div>

                           <Button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/50 text-lg py-4 px-6 transition-all duration-300 ease-in-out flex items-center justify-center">
                              <MessageSquare className="w-5 h-5 mr-3" />
                                  <Sparkles className="w-4 h-4 mr-2" />
                                      Start SMS AI
                           </Button>

                          </div>

                          <div className="relative">
                            <ImageWithFallback
                              src="https://images.unsplash.com/photo-1679068008949-12852e5fca5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXJhbCUyMGNvbm5lY3Rpdml0eSUyMG1vYmlsZSUyMHBob25lfGVufDF8fHx8MTc1NTI3NDg3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                              alt="Rural connectivity mobile phone"
                              className="w-full h-64 lg:h-80 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg"
                            />
                            <div className="absolute top-4 right-4 bg-purple-500 text-white rounded-full p-2">
                              
                            </div>
                            <div className="absolute bottom-4 left-4 bg-green-500 text-white rounded-full px-3 py-2 text-sm">
                              AI Powered
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card> */}
                  </div>

                  {/* Live Status Indicator - Desktop */}
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6 text-center shadow-lg">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      <span className="text-lg lg:text-xl">AI Assistant Online</span>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-sm lg:text-base opacity-90">Serving farmers across India • {currentTime.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout (existing design) */}
            <div className="lg:hidden max-w-md mx-auto">
              {/* AI Assistant Header */}
              <div className="text-center mb-8">
                <div className="relative mb-6">
                  {/* AI Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                    <Bot className="w-10 h-10 text-white animate-bounce" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white animate-spin" />
                  </div>
                  
                  <h1 className="text-4xl mb-2 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
                    JAI-KISSAN AI
                  </h1>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-600 to-blue-600 mx-auto rounded-full"></div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 mb-4">
                  <p className="text-green-700 text-sm mb-2">{getGreeting()}</p>
                  <p className="text-gray-700 text-base leading-relaxed">
                    <Bot className="w-4 h-4 inline mr-1 text-blue-500" />
                    Your AI farming assistant for <span className="text-green-600">smart agriculture</span>
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Helping farmers grow better with technology & low connectivity support
                  </p>
                </div>

                {/* Key Benefits */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                    <Zap className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-700">Instant Help</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                    <Globe className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-700">Multi-language</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center border border-white/20">
                    <Shield className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-700">Expert Advice</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Mobile Interface Cards (existing design) */}
                
                {/* Farmer Mobile Interface */}
                <Card className="hover:shadow-xl transition-all duration-500 cursor-pointer border-2 hover:border-green-300 group relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50"
                      onClick={() => handleInterfaceSelection('farmer')}>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-100/0 via-green-100/50 to-green-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Leaf className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-green-800 text-lg">Farmer Assistant</h3>
                          <Badge className="bg-green-100 text-green-700 text-xs">AI Powered</Badge>
                        </div>
                        <p className="text-gray-600 text-sm">Smart farming dashboard</p>
                      </div>
                    </div>

                    <div className="mb-4 relative">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1722119272044-fc49006131e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGZhcm1pbmclMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc1NTI3NDg3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Smart farming technology"
                        className="w-full h-28 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <Bot className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/70 rounded-lg p-2 text-center border border-green-200">
                        <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-700">Crop Analytics</p>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2 text-center border border-blue-200">
                        <MessageSquare className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-700">Expert Chat</p>
                      </div>
                    </div>

                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        AI-powered crop recommendations
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Real-time weather & soil alerts
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Market price predictions
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Government scheme notifications
                      </li>
                    </ul>

                    <Button className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/50 text-lg py-4 px-6 transition-all duration-300 ease-in-out flex items-center justify-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Smart Farming
                    </Button>
                  </CardContent>
                </Card>

                {/* Supplier Interface */}
                {/* <Card className="hover:shadow-xl transition-all duration-500 cursor-pointer border-2 hover:border-blue-300 group relative overflow-hidden bg-gradient-to-r from-blue-50 to-cyan-50"
                      onClick={() => handleInterfaceSelection('supplier')}>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/50 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Truck className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-blue-800 text-lg">Supplier Hub</h3>
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Business</Badge>
                        </div>
                        <p className="text-gray-600 text-sm">AI business insights</p>
                      </div>
                    </div>

                    <div className="mb-4 relative">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1569140733895-eabccf089fc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBtb2JpbGUlMjBwaG9uZXxlbnwxfHx8fDE3NTUwOTIxNTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Agricultural supplier"
                        className="w-full h-28 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                        <Bot className="w-3 h-3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-white/70 rounded-lg p-2 text-center border border-blue-200">
                        <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-700">Customer AI</p>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2 text-center border border-purple-200">
                        <TrendingUp className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-700">Sales Forecast</p>
                      </div>
                    </div>

                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        AI-powered demand forecasting
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Smart inventory management
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Automated customer responses
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Market trend analysis
                      </li>
                    </ul>

                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Launch Business AI
                    </Button>
                  </CardContent>
                </Card> */}

                {/* SMS Interface */}
                <Card className="hover:shadow-xl transition-all duration-500 cursor-pointer border-2 hover:border-purple-300 group bg-gradient-to-r from-purple-50 via-green-50 to-blue-50 relative overflow-hidden"
                      onClick={() => handleInterfaceSelection('sms')}>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100/0 via-purple-100/30 to-purple-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <MessageSquare className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-purple-800 text-lg">SMS Assistant</h3>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">2G/3G Ready</Badge>
                        </div>
                        <p className="text-gray-600 text-sm">Low connectivity support</p>
                      </div>
                    </div>

                    <div className="mb-4 relative">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1679068008949-12852e5fca5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydXJhbCUyMGNvbm5lY3Rpdml0eSUyMG1vYmlsZSUyMHBob25lfGVufDF8fHx8MTc1NTI3NDg3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Rural connectivity mobile phone"
                        className="w-full h-28 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                        <Bot className="w-3 h-3" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                        AI Powered
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 mb-4 border border-purple-200">
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs">1</div>
                          <span><strong>AI Query:</strong> Smart farming answers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xs">5</div>
                          <span><strong>Local AI:</strong> Weather & crop updates</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-xs">9</div>
                          <span><strong>Language AI:</strong> Regional support</span>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/50 text-lg py-4 px-6 transition-all duration-300 ease-in-out flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <Sparkles className="w-3 h-3 mr-1" />
                      Start SMS AI
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced AI Features Section - Mobile */}
              <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <h3 className="text-gray-800 text-lg">How JAI-KISSAN AI Helps</h3>
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-gray-600 text-sm">Comprehensive support for every farming need</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-sm">🌾</span>
                    </div>
                    <p className="text-xs text-gray-700">Crop Health Monitoring</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-sm">💰</span>
                    </div>
                    <p className="text-xs text-gray-700">Market Price Alerts</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-sm">🏛️</span>
                    </div>
                    <p className="text-xs text-gray-700">Govt. Scheme Updates</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white text-sm">🆘</span>
                    </div>
                    <p className="text-xs text-gray-700">Emergency Support</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700">SMS to <strong>9876543210</strong> • Available 24/7</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">6+ Languages • Voice Support</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Instant AI responses • Expert network</span>
                  </div>
                </div>
              </div>

              {/* Live Status Indicator - Mobile */}
              <div className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm">AI Assistant Online</span>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
                <p className="text-xs opacity-90">Serving farmers across India • {currentTime.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // if (userInterface === 'sms') {
  //   return <SMSInterface onBack={handleBack} />;
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 lg:px-8 py-3 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-green-100">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg lg:text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">JAI-KISSAN AI</h1>
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
        {userInterface === 'farmer' ? <FarmerDashboard /> : <SupplierDashboard />}
      </main>
    </div>
  );
}
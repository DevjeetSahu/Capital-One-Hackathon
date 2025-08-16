import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Bot,
  MessageSquare,
  Send,
  Smartphone,
  Signal,
  Battery,
  Wifi,
  Clock,
  Phone,
  Languages,
  Cloud,
  Leaf,
  Sparkles,
  ArrowUp,
  CheckCircle2,
  Home,
} from 'lucide-react';

interface SMSMessage {
  id: string;
  type: 'user' | 'system';
  message: string;
  timestamp: Date;
}
interface SMSInterfaceProps {
  onBack: () => void;
}
export function SMSInterface({ onBack }: SMSInterfaceProps) {
  const [messages, setMessages] = useState<SMSMessage[]>([
    {
      id: '1',
      type: 'system',
      message: 'Welcome to JAI-KISSAN AI! 🌾\n\nSend SMS commands:\n📱 1 - Farming Query\n🌦️ 5 - Weather Updates\n🌍 9 - Language Selection\n\nHelp: Type HELP',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const userMsg: SMSMessage = {
        id: Date.now().toString(),
        type: 'user',
        message: currentMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      // Simulate AI response delay
      setTimeout(() => {
        const response = generateResponse(currentMessage.trim());
        const systemMsg: SMSMessage = {
          id: (Date.now() + 1).toString(),
          type: 'system',
          message: response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMsg]);
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);
      setCurrentMessage('');
    }
  };
  const generateResponse = (input: string): string => {
    const command = input.toLowerCase();
    
    if (command === '1') {
      return '🌾 Farming Assistant Ready!\n\nWhat can I help you with?\n• Crop diseases\n• Fertilizer advice\n• Planting guidance\n• Pest control\n\nType your farming question...';
    } else if (command === '5') {
      return '🌦️ Weather Update\n\n📍 Your area: Punjab\n🌡️ 28°C, Partly cloudy\n💧 Humidity: 65%\n🌧️ Rain: 30% chance\n\n🌾 Crop advice:\n• Good time for spraying\n• Check rice water levels\n\nNext update in 6 hours';
    } else if (command === '9') {
      return '🌍 Select Language:\n\n1. हिंदी (Hindi)\n2. English\n3. ਪੰਜਾਬੀ (Punjabi)\n4. ગુજરાતી (Gujarati)\n5. मराठी (Marathi)\n6. தமிழ் (Tamil)\n\nReply with number 1-6';
    } else if (command === 'help') {
      return '📱 JAI-KISSAN AI Commands:\n\n1 - Farming queries & advice\n5 - Weather & crop updates\n9 - Language selection\nHELP - Show this menu\nSTATUS - Service status\n\n📞 Emergency: 9876543210\n🌐 Available 24/7';
    } else if (command === 'status') {
      return '📊 Service Status:\n\n✅ AI Assistant: Online\n📶 Network: Strong\n🤖 Response time: <30s\n👥 Active users: 1,247\n📱 SMS rate: ₹2/message\n\nAll systems operational! 🚀';
    } else if (command.includes('rice') || command.includes('धान')) {
      return '🌾 Rice Crop Help:\n\n🔍 Issue detected: Yellowing\n💡 Likely cause: Nitrogen deficiency\n\n💊 Treatment:\n• Apply Urea 50kg/acre\n• Maintain 2-3 inch water\n• Monitor for pests\n\n📞 Expert help: 9876543210';
    } else if (command.includes('wheat') || command.includes('गेहूं')) {
      return '🌾 Wheat Guidance:\n\n📅 Current season advice:\n• Sowing time: Nov-Dec\n• Seed rate: 100kg/hectare\n• Fertilizer: DAP + Urea\n• First irrigation: 20-25 days\n\n💰 Market price: ₹2,200/quintal';
    } else {
      return '🤖 Message received!\n\nAI is analyzing your query...\n\nFor specific help:\n📱 Send "1" for farming advice\n🌦️ Send "5" for weather\n🌍 Send "9" for language\n\n⏱️ Response in 24/7';
    }
  };
  const handleQuickCommand = (command: string) => {
    setCurrentMessage(command);
    setTimeout(() => handleSendMessage(), 100);
  };
  return (
    <div className="flex items-center justify-center max-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4">
      {/* Left Side Information Cards - Desktop Only */}
      <div className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 space-y-4 w-64">
        {/* Service Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800">Service Status</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">AI Assistant</span>
              <Badge className="bg-green-100 text-green-700 text-xs">Online</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time</span>
              <span className="text-gray-800">&lt; 30 seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Languages</span>
              <span className="text-gray-800">6 Available</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Coverage</span>
              <span className="text-gray-800">Pan India</span>
            </div>
          </div>
        </div>
        {/* Commands Guide */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800">SMS Commands</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">1</div>
              <div>
                <p className="font-medium text-gray-800">Farming Queries</p>
                <p className="text-gray-600 text-xs">Crop advice, pest control, fertilizers</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">5</div>
              <div>
                <p className="font-medium text-gray-800">Weather Updates</p>
                <p className="text-gray-600 text-xs">Local weather, crop advisories</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-semibold">9</div>
              <div>
                <p className="font-medium text-gray-800">Language Selection</p>
                <p className="text-gray-600 text-xs">Choose your preferred language</p>
              </div>
            </div>
          </div>
        </div>
        {/* Emergency Contact */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 shadow-lg border border-red-200/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <Phone className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-red-800">Emergency Help</h3>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-2">For urgent agricultural help</p>
            <div className="bg-white rounded-lg p-2 border border-red-200">
              <p className="font-mono text-red-800 font-semibold">📞 9876543210</p>
            </div>
            <p className="text-xs text-gray-600 mt-1">Available 24/7</p>
          </div>
        </div>
      </div>

      {/* Phone Container */}
      <div className="w-180 max-w-xs mx-auto">
        {/* Phone Frame */}
        <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
          {/* Phone Screen */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-inner">
            {/* Status Bar */}
            <div className="bg-gray-50 px-6 py-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3 text-green-600" />
                <span className="text-gray-700">JAI-KISSAN</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-700 font-mono">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                <Wifi className="w-3 h-3 text-blue-600" />
                <Battery className="w-3 h-3 text-green-600" />
              </div>
            </div>
            {/* SMS Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">JAI-KISSAN AI</h3>
                  <p className="text-xs opacity-90">SMS Assistant • 9876543210</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">Online</span>
                </div>
              </div>
            </div>
            {/* Messages Area */}
            <div className="h-96 overflow-y-auto p-3 bg-gray-50 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'}`}>
                    <p className="text-xs leading-relaxed whitespace-pre-line">{msg.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {msg.type === 'user' && (
                        <CheckCircle2 className="w-3 h-3 text-blue-200" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-1">AI typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Quick Commands */}
            <div className="bg-white border-t border-gray-200 p-2">
              <div className="grid grid-cols-3 gap-1 mb-2">
                <Button
                  onClick={() => handleQuickCommand('1')}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                >
                  <Leaf className="w-3 h-3 mr-1" />
                  SMS 1
                </Button>
                <Button
                  onClick={() => handleQuickCommand('5')}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Cloud className="w-3 h-3 mr-1" />
                  SMS 5
                </Button>
                <Button
                  onClick={() => handleQuickCommand('9')}
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-green-200 hover:bg-green-50 hover:border-green-300"
                >
                  <Languages className="w-3 h-3 mr-1" />
                  SMS 9
                </Button>
              </div>
            </div>
            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type SMS command..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value.slice(0, 160))}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-12 h-9 text-sm border-gray-300 focus:border-purple-400 focus:ring-purple-400/20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className={`text-xs ${currentMessage.length > 140 ? 'text-red-500' : 'text-gray-400'}`}>
                      {currentMessage.length}/160
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleSendMessage}
                  size="sm"
                  disabled={!currentMessage.trim()}
                  className="h-9 w-16 p-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 "
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Bottom Bar */}
            <div className="bg-gray-100 px-4 py-2 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                <MessageSquare className="w-3 h-3" />
                <span>SMS charges apply • ₹2 per message</span>
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
          </div>
          {/* Home Button */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
            <button
              onClick={onBack}
              className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              aria-label="Go Home"
            >
              <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
            </button>
          </div>
        </div>
        {/* Phone Shadow */}
        <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] blur-xl opacity-20 scale-105 -z-10"></div>
      </div>

      {/* Right Side Info - Desktop Only */}
      <div className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 space-y-4 w-64">
        {/* Current Time & Date */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Current Time</h3>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-mono text-gray-800">{currentTime.toLocaleTimeString()}</p>
              <p className="text-sm text-gray-600">{currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
        </div>
        {/* Network Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800">Connectivity</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Network Type</span>
              <Badge className="bg-blue-100 text-blue-700 text-xs">2G/3G Ready</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SMS Rate</span>
              <span className="text-gray-800">₹2 per message</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data Required</span>
              <span className="text-gray-800">None</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Offline Support</span>
              <Badge className="bg-green-100 text-green-700 text-xs">Yes</Badge>
            </div>
          </div>
        </div>
        {/* Usage Stats */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 shadow-lg border border-green-200/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <ArrowUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800">Usage Today</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Messages Sent</span>
              <span className="text-gray-800 font-semibold">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Farmers Helped</span>
              <span className="text-gray-800 font-semibold">892</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Rate</span>
              <span className="text-gray-800 font-semibold">98.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Response</span>
              <span className="text-gray-800 font-semibold">24 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

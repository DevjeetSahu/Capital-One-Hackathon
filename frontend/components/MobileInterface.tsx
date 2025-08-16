import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Phone, 
  Mic, 
  Volume2, 
  MessageSquare, 
  Cloud, 
  Globe, 
  ArrowLeft,
  Thermometer,
  Droplets,
  Wheat,
  TreePine,
  MapPin,
  Clock
} from 'lucide-react';

type MobileScreen = 'keypad' | 'query' | 'updates' | 'language';

export function MobileInterface({ onBack }: { onBack: () => void }) {
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('keypad');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [userQuery, setUserQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const keypadNumbers = [
    { number: '1', label: 'Ask Query', icon: MessageSquare, action: () => setCurrentScreen('query') },
    { number: '2', label: 'ABC', icon: null, action: () => {} },
    { number: '3', label: 'DEF', icon: null, action: () => {} },
    { number: '4', label: 'GHI', icon: null, action: () => {} },
    { number: '5', label: 'Updates', icon: Cloud, action: () => setCurrentScreen('updates') },
    { number: '6', label: 'MNO', icon: null, action: () => {} },
    { number: '7', label: 'PQRS', icon: null, action: () => {} },
    { number: '8', label: 'TUV', icon: null, action: () => {} },
    { number: '9', label: 'Language', icon: Globe, action: () => setCurrentScreen('language') },
    { number: '*', label: '', icon: null, action: () => {} },
    { number: '0', label: 'Operator', icon: null, action: () => {} },
    { number: '#', label: '', icon: null, action: () => {} },
  ];

  const agriculturalUpdates = [
    {
      title: "Today's Weather",
      content: "Temperature: 28°C, Humidity: 65%, Light rain expected in evening",
      icon: Thermometer,
      color: "text-blue-600"
    },
    {
      title: "Soil Condition",
      content: "Moisture level: Good for wheat sowing. pH level: 6.8 (Optimal)",
      icon: Droplets,
      color: "text-green-600"
    },
    {
      title: "Crop Advisory",
      content: "Best time to sow winter wheat. Use 40kg seeds per acre.",
      icon: Wheat,
      color: "text-yellow-600"
    },
    {
      title: "Local Alert",
      content: "Pest control spraying recommended for nearby farms",
      icon: TreePine,
      color: "text-red-600"
    }
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' }
  ];

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Simulate voice input
    if (!isListening) {
      setTimeout(() => {
        setUserQuery("मेरे गेहूं के खेत में कीड़े लग गए हैं। क्या करूं?");
        setIsListening(false);
      }, 3000);
    }
  };

  if (currentScreen !== 'keypad') {
    return (
      <div className="max-w-md mx-auto bg-white">
        {/* Phone Header */}
        <div className="bg-green-800 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setCurrentScreen('keypad')}
              className="text-white hover:bg-green-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>JAI-KISSAN</span>
            </div>
            <div className="w-16"></div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="p-4 min-h-[500px]">
          {currentScreen === 'query' && (
            <div className="space-y-6">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-xl mb-2">Ask Your Question</h2>
                <p className="text-gray-600 text-sm">
                  Speak your agricultural question or type below
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center">
                  <Button
                    onClick={handleVoiceInput}
                    className={`w-16 h-16 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {isListening ? (
                      <div className="animate-pulse">
                        <Mic className="w-8 h-8" />
                      </div>
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </Button>
                </div>

                {isListening && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-full text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Listening...
                    </div>
                  </div>
                )}

                <Textarea
                  placeholder="Or type your question here..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="min-h-[100px] text-lg"
                />

                {userQuery && (
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Submit Question
                  </Button>
                )}
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Press * to go back to main menu</p>
              </div>
            </div>
          )}

          {currentScreen === 'updates' && (
            <div className="space-y-6">
              <div className="text-center">
                <Cloud className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl mb-2">Local Updates</h2>
                <p className="text-gray-600 text-sm mb-4">
                  Agricultural information for your area
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>Ludhiana, Punjab</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>Updated 2 hours ago</span>
                </div>
              </div>

              <div className="space-y-4">
                {agriculturalUpdates.map((update, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <update.icon className={`w-6 h-6 ${update.color} mt-1`} />
                        <div>
                          <h3 className="mb-2">{update.title}</h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {update.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen to Audio Updates
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Press * to go back to main menu</p>
              </div>
            </div>
          )}

          {currentScreen === 'language' && (
            <div className="space-y-6">
              <div className="text-center">
                <Globe className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-xl mb-2">Choose Language</h2>
                <p className="text-gray-600 text-sm">
                  Select your preferred language
                </p>
              </div>

              <div className="space-y-3">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.name ? "default" : "outline"}
                    className="w-full justify-between h-auto p-4"
                    onClick={() => setSelectedLanguage(lang.name)}
                  >
                    <span className="text-left">
                      <div>{lang.name}</div>
                      <div className="text-sm opacity-70">{lang.native}</div>
                    </span>
                    {selectedLanguage === lang.name && (
                      <Badge variant="secondary">Selected</Badge>
                    )}
                  </Button>
                ))}
              </div>

              <div className="text-center">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => setCurrentScreen('keypad')}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Confirm Language
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Press * to go back to main menu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
      {/* Phone Header */}
      <div className="bg-green-800 text-white p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-white hover:bg-green-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <span>JAI-KISSAN</span>
          </div>
          <div className="text-sm">
            Signal: ●●●●●
          </div>
        </div>
      </div>

      {/* Phone Screen */}
      <div className="bg-gray-100 p-4">
        <div className="bg-black text-green-400 p-3 rounded text-center font-mono text-sm">
          <div>JAI-KISSAN MOBILE</div>
          <div className="text-xs text-green-300 mt-1">Press key for service</div>
        </div>
      </div>

      {/* Service Instructions */}
      <div className="p-4 bg-green-50">
        <h3 className="text-center mb-3 text-green-800">Available Services</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-white rounded border-l-4 border-l-green-500">
            <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center">
              <span>1</span>
            </div>
            <div>
              <div className="text-sm">Ask Agricultural Question</div>
              <div className="text-xs text-gray-600">Voice or text query</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-white rounded border-l-4 border-l-blue-500">
            <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center">
              <span>5</span>
            </div>
            <div>
              <div className="text-sm">Local Agricultural Updates</div>
              <div className="text-xs text-gray-600">Weather, soil, crops</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-white rounded border-l-4 border-l-purple-500">
            <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center">
              <span>9</span>
            </div>
            <div>
              <div className="text-sm">Language Selection</div>
              <div className="text-xs text-gray-600">Change language</div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Keypad */}
      <div className="p-4 bg-gray-200">
        <div className="grid grid-cols-3 gap-3">
          {keypadNumbers.map((key) => (
            <Button
              key={key.number}
              onClick={key.action}
              className={`h-16 text-xl bg-white hover:bg-gray-100 text-black border-2 border-gray-300 rounded-lg ${
                ['1', '5', '9'].includes(key.number) 
                  ? 'ring-2 ring-green-400 bg-green-50 hover:bg-green-100' 
                  : ''
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span>{key.number}</span>
                  {key.icon && <key.icon className="w-4 h-4" />}
                </div>
                {key.label && (
                  <span className="text-xs text-gray-600 mt-1">{key.label}</span>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Phone Footer */}
      <div className="bg-green-800 text-white p-3 text-center text-sm">
        <p>Connecting Farmers • Empowering Agriculture</p>
        <p className="text-green-200 text-xs mt-1">Toll-free: 1800-JAI-KISSAN</p>
      </div>
    </div>
  );
}
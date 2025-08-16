import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Phone, 
  MessageSquare, 
  Cloud, 
  Globe, 
  ArrowRight,
  Mic,
  Volume2,
  ChevronDown
} from 'lucide-react';

export function WireframeDocumentation() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl mb-4 text-gray-800">JAI-KISSAN Mobile Interface Wireframe</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Designed for dial-operated phones and basic mobile devices to ensure agricultural services reach every farmer
        </p>
      </div>

      {/* Interface Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            User Flow & Key Functions
          </CardTitle>
          <CardDescription>
            Three primary functions accessible via simple keypad navigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Key 1 - Ask Query */}
            <div className="text-center space-y-4 p-4 border rounded-lg bg-green-50">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl">
                1
              </div>
              <div>
                <h3 className="text-lg text-green-800 mb-2">Ask Agricultural Query</h3>
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    <span>Voice input support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Audio responses</span>
                  </div>
                  <div>Multi-language support</div>
                  <div>Expert farmer network</div>
                </div>
              </div>
            </div>

            {/* Key 5 - Local Updates */}
            <div className="text-center space-y-4 p-4 border rounded-lg bg-blue-50">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl">
                5
              </div>
              <div>
                <h3 className="text-lg text-blue-800 mb-2">Local Agricultural Updates</h3>
                <Cloud className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Real-time weather data</div>
                  <div>Soil condition reports</div>
                  <div>Crop advisory messages</div>
                  <div>Local market prices</div>
                  <div>Government schemes</div>
                </div>
              </div>
            </div>

            {/* Key 9 - Language */}
            <div className="text-center space-y-4 p-4 border rounded-lg bg-purple-50">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl">
                9
              </div>
              <div>
                <h3 className="text-lg text-purple-800 mb-2">Language Selection</h3>
                <Globe className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="space-y-2 text-sm text-gray-600">
                  <div>हिन्दी (Hindi)</div>
                  <div>ਪੰਜਾਬੀ (Punjabi)</div>
                  <div>বাংলা (Bengali)</div>
                  <div>தமிழ் (Tamil)</div>
                  <div>తెలుగు (Telugu)</div>
                  <div>+ Regional languages</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screen Wireframes */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Main Keypad Screen */}
        <Card>
          <CardHeader>
            <CardTitle>Main Keypad Interface</CardTitle>
            <CardDescription>Primary screen showing keypad with service options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100">
              {/* Phone Header */}
              <div className="bg-green-800 text-white p-2 rounded text-center text-sm mb-4">
                JAI-KISSAN • Signal: ●●●●●
              </div>
              
              {/* Screen Display */}
              <div className="bg-black text-green-400 p-3 rounded text-center font-mono text-xs mb-4">
                <div>JAI-KISSAN MOBILE</div>
                <div className="text-green-300">Press key for service</div>
              </div>

              {/* Service Menu */}
              <div className="space-y-2 text-xs mb-4">
                <div className="flex items-center gap-2 p-2 bg-white rounded border-l-2 border-green-500">
                  <Badge>1</Badge>
                  <span>Ask Query</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded border-l-2 border-blue-500">
                  <Badge>5</Badge>
                  <span>Updates</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded border-l-2 border-purple-500">
                  <Badge>9</Badge>
                  <span>Language</span>
                </div>
              </div>

              {/* Keypad Grid */}
              <div className="grid grid-cols-3 gap-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
                  <div
                    key={key}
                    className={`h-8 bg-white border text-center text-xs flex items-center justify-center rounded ${
                      ['1', '5', '9'].includes(key) ? 'ring-1 ring-green-400 bg-green-50' : ''
                    }`}
                  >
                    {key}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Query Input Screen */}
        <Card>
          <CardHeader>
            <CardTitle>Query Input Interface</CardTitle>
            <CardDescription>Voice and text input for agricultural questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100">
              {/* Header */}
              <div className="bg-green-800 text-white p-2 rounded text-center text-sm mb-4 flex items-center justify-between">
                <span>← Back</span>
                <span>JAI-KISSAN</span>
                <span></span>
              </div>

              {/* Content Area */}
              <div className="space-y-4 text-xs">
                <div className="text-center">
                  <MessageSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div>Ask Your Question</div>
                  <div className="text-gray-600 text-xs">Speak or type below</div>
                </div>

                {/* Voice Button */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Listening Indicator */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded text-xs">
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                    Listening...
                  </div>
                </div>

                {/* Text Input Area */}
                <div className="border border-gray-300 p-2 rounded bg-white h-16 text-xs">
                  <div className="text-gray-400">Or type your question here...</div>
                </div>

                {/* Submit Button */}
                <div className="bg-green-600 text-white p-2 rounded text-center">
                  <Volume2 className="w-4 h-4 inline mr-1" />
                  Submit Question
                </div>

                {/* Instructions */}
                <div className="text-center text-gray-500 text-xs">
                  Press * to go back to main menu
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updates Screen */}
        <Card>
          <CardHeader>
            <CardTitle>Local Updates Interface</CardTitle>
            <CardDescription>Weather, soil, and crop information display</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100">
              {/* Header */}
              <div className="bg-blue-800 text-white p-2 rounded text-center text-sm mb-4 flex items-center justify-between">
                <span>← Back</span>
                <span>LOCAL UPDATES</span>
                <span></span>
              </div>

              {/* Location Info */}
              <div className="text-center text-xs mb-4">
                <div className="flex items-center justify-center gap-1 text-gray-600">
                  <span>📍 Ludhiana, Punjab</span>
                </div>
                <div className="text-gray-500">Updated 2 hours ago</div>
              </div>

              {/* Update Cards */}
              <div className="space-y-2">
                <div className="bg-white p-2 rounded border-l-2 border-blue-500 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span>🌡️</span>
                    <span>Today's Weather</span>
                  </div>
                  <div className="text-gray-600">28°C, 65% humidity</div>
                </div>

                <div className="bg-white p-2 rounded border-l-2 border-green-500 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span>💧</span>
                    <span>Soil Condition</span>
                  </div>
                  <div className="text-gray-600">Good moisture, pH 6.8</div>
                </div>

                <div className="bg-white p-2 rounded border-l-2 border-yellow-500 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span>🌾</span>
                    <span>Crop Advisory</span>
                  </div>
                  <div className="text-gray-600">Wheat sowing time</div>
                </div>
              </div>

              {/* Audio Button */}
              <div className="mt-4 bg-blue-600 text-white p-2 rounded text-center text-xs">
                <Volume2 className="w-4 h-4 inline mr-1" />
                Listen to Audio Updates
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Selection Screen */}
        <Card>
          <CardHeader>
            <CardTitle>Language Selection Interface</CardTitle>
            <CardDescription>Multi-language support for regional farmers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-100">
              {/* Header */}
              <div className="bg-purple-800 text-white p-2 rounded text-center text-sm mb-4 flex items-center justify-between">
                <span>← Back</span>
                <span>CHOOSE LANGUAGE</span>
                <span></span>
              </div>

              {/* Title */}
              <div className="text-center mb-4">
                <Globe className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-sm">Select Language</div>
              </div>

              {/* Language Options */}
              <div className="space-y-2">
                {[
                  { name: 'English', native: 'English', selected: true },
                  { name: 'Hindi', native: 'हिन्दी', selected: false },
                  { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', selected: false },
                  { name: 'Bengali', native: 'বাংলা', selected: false },
                  { name: 'Tamil', native: 'தமிழ்', selected: false },
                  { name: 'Telugu', native: 'తెలుగు', selected: false }
                ].map((lang) => (
                  <div 
                    key={lang.name}
                    className={`p-2 rounded border text-xs flex justify-between items-center ${
                      lang.selected ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-300'
                    }`}
                  >
                    <div>
                      <div>{lang.name}</div>
                      <div className="text-gray-600">{lang.native}</div>
                    </div>
                    {lang.selected && <Badge variant="secondary" className="text-xs">Selected</Badge>}
                  </div>
                ))}
              </div>

              {/* Confirm Button */}
              <div className="mt-4 bg-purple-600 text-white p-2 rounded text-center text-xs">
                <Volume2 className="w-4 h-4 inline mr-1" />
                Confirm Language
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
          <CardDescription>Design requirements for dial-operated phone compatibility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="mb-4 text-green-800">Hardware Compatibility</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Works on basic keypad phones</li>
                <li>• Compatible with 2G/3G networks</li>
                <li>• Low data usage (text-based interface)</li>
                <li>• Voice input via phone microphone</li>
                <li>• Audio output through phone speaker</li>
                <li>• Offline message queue for poor connectivity</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-blue-800">Interface Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Single-key navigation (1, 5, 9)</li>
                <li>• Audio-first user experience</li>
                <li>• Large text display (minimum 14px)</li>
                <li>• High contrast colors for visibility</li>
                <li>• Simple menu structure (max 3 levels)</li>
                <li>• Voice prompts in local languages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Journey */}
      <Card>
        <CardHeader>
          <CardTitle>User Journey Flow</CardTitle>
          <CardDescription>Step-by-step interaction flow for farmers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[
              {
                step: 1,
                title: "Farmer dials JAI-KISSAN number",
                description: "Toll-free number accessible from any phone",
                icon: Phone
              },
              {
                step: 2,
                title: "Main menu with 3 options displayed",
                description: "Clear audio instructions in selected language",
                icon: Volume2
              },
              {
                step: 3,
                title: "Farmer presses 1, 5, or 9",
                description: "Single keypress navigation to desired service",
                icon: MessageSquare
              },
              {
                step: 4,
                title: "Service-specific interface loads",
                description: "Contextual menus and input methods",
                icon: ArrowRight
              },
              {
                step: 5,
                title: "Farmer interacts via voice or keypad",
                description: "Natural language processing for voice queries",
                icon: Mic
              }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-800">{item.step}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-5 h-5 text-green-600" />
                    <h4>{item.title}</h4>
                  </div>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
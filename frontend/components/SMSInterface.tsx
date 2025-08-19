import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
      message:
        '📱 **Welcome to JAI-KISSAN AI!** 🌾\n\nSend SMS commands:\n1️⃣ Farming Query\n5️⃣ Weather Updates\n9️⃣ Language Selection\n\n💡 Type `HELP` for help.',
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showInputBox, setShowInputBox] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const farmingQueryAPI = async (queryText: string) => {
    try {
      const res = await fetch("https://jai-kissan-service-945629796480.asia-south1.run.app/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: queryText, 
          llm_provider: "groq", 
          llm_model: "llama-3.1-8b-instant", 
          top_k: 5 
        })
      });
      const data = await res.json();
      return data.response || "⚠️ No response received.";
    } catch (err) {
      return "❌ Error: Unable to reach the server. Please try again later.";
    }
  };

  const generateResponse = async (input: string): Promise<string> => {
    const command = input.trim().toLowerCase();
    if (command === '1') {
      setShowInputBox(true);
      return '🌾 Farming Assistant Ready! Please type your farming question below.';
    } else if (command === '5') {
      setShowInputBox(false);
      return '🌦️ **Weather Update**\n\n📍 Punjab\n🌡️ 28°C, Partly cloudy\n💧 Humidity: 65%\n🌧️ Rain: 30%\n\n🌾 Advice:\n- ✅ Good time for spraying\n- 💧 Check rice water levels';
    } else if (command === '9') {
      setShowInputBox(false);
      return `🌍 **Select Language:**\n1. हिंदी (Hindi)\n2. English\n3. ਪੰਜਾਬੀ (Punjabi)\n4. ગુજરાતી (Gujarati)\n5. मराठी (Marathi)\n6. தமிழ் (Tamil)\n\n_Current: ${selectedLanguage}_`;
    } else if (command === 'help') {
      setShowInputBox(false);
      return '📖 **JAI-KISSAN AI Commands:**\n- `1` → Farming queries\n- `5` → Weather updates\n- `9` → Language selection\n- `HELP` → Show menu\n- `STATUS` → Service status';
    } else if (command === 'status') {
      setShowInputBox(false);
      return '📊 **Service Status**\n- ✅ AI Assistant: Online\n- 📶 Network: Strong\n- ⏱ Response time: <30s\n- 👥 Active users: 1,247\n- 📱 SMS rate: ₹2/message';
    } else if ('123456'.includes(command) && messages[messages.length - 1]?.message.includes('Select Language')) {
      const langList = ['Hindi', 'English', 'Punjabi', 'Gujarati', 'Marathi', 'Tamil'];
      const idx = Number(command) - 1;
      if (idx >= 0 && idx < langList.length) {
        setSelectedLanguage(langList[idx]);
        return `🌍 Language changed to **${langList[idx]}**`;
      }
    } else if (showInputBox && input.length > 0) {
      setShowInputBox(false);
      return await farmingQueryAPI(input);
    } else {
      return '🤖 Message received! Try `1` for farming advice, `5` for weather, or `9` for language.';
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    const userMsg: SMSMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: currentMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(async () => {
      const response = await generateResponse(currentMessage);
      const systemMsg: SMSMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        message: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMsg]);
      setIsTyping(false);
    }, 1000);

    setCurrentMessage('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 p-6">
      {/* Home Button */}
      <Button onClick={onBack} variant="secondary" className="mb-4 self-start shadow-md">
        ⬅ Home
      </Button>
     <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
      <p className="text-sm font-semibold text-yellow-800">
        **This is for demonstration purpose.** <br />
        This demonstrates how it will appear in the user's smartphone and how
        farmers can use this SMS feature in low connectivity areas.
      </p>
    </div>
      {/* Smartphone Mockup */}
      <div className="relative w-[320px] h-[640px] bg-white rounded-[2.5rem] shadow-2xl border-4 border-gray-800 overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black rounded-b-2xl z-10"></div>

        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 text-xs bg-gray-100 border-b border-gray-200">
          <span>JAI-KISSAN SMS</span>
          <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-gray-100">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-xl shadow 
                ${msg.type === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white' 
                  : 'bg-white border border-gray-200 text-gray-800'}`}
              >
                <ReactMarkdown>
                  {msg.message}
                </ReactMarkdown>
                <span className="mt-1 text-[10px] text-gray-400 block text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="p-2 bg-gray-200 rounded-xl text-xs flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce delay-100"></span>
                <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce delay-200"></span>
                AI typing...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-gray-100 border-t border-gray-300 flex items-center gap-2">
          <Input
            placeholder={showInputBox ? "Type your farming question..." : "Type SMS command..."}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value.slice(0, 160))}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm" className="rounded-full">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

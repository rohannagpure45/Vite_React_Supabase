import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gptHealthService } from '../services/gpt';
import { mockBiometricData } from '../services/mockBiometrics';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Activity, Heart, Brain, Send } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BiometricData {
  heartRate?: number;
  bloodOxygen?: number;
  ecg?: {
    status: 'normal' | 'abnormal' | 'unavailable';
    timestamp: string;
  };
}

export default function Dashboard() {
  const [userLocation, setUserLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [biometrics, setBiometrics] = useState<BiometricData>({});
  const [chatLog, setChatLog] = useState<{ role: string; content: string }[]>([{
    role: 'assistant',
    content: 'Hello! How can I assist you with your health concerns today?'
  }]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { user, signOut } = useAuth();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation(`${latitude}, ${longitude}`);
        },
        () => {
          console.warn('Geolocation permission denied or unavailable.');
        }
      );
    }

    const requestAuth = async () => {
      try {
        await new Promise((res) => setTimeout(res, 1000));
        setBiometrics(mockBiometricData);
      } catch (err) {
        console.error("Failed to load mock biometrics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    requestAuth();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    const updatedLog = [...chatLog, { role: 'user', content: userInput }];
    setChatLog(updatedLog);
    setUserInput('');

    try {
      const response = await gptHealthService.getChatResponse(updatedLog, userLocation, biometrics);
      setChatLog((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setChatLog((prev) => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-100">
      <header className="bg-white shadow py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-600">Health Assistant</h1>
          <Button variant="outline" onClick={signOut}>Logout</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-10">
        {/* Chat Area */}
        <div className="flex-[4] space-y-6">
          <Card>
            <CardHeader><CardTitle>Chat with your Health Assistant</CardTitle></CardHeader>
            <CardContent className="space-y-4 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-auto bg-white p-4 rounded border shadow">
                <AnimatePresence>
                  {chatLog.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {msg.role === 'assistant'
                          ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                          : msg.content
                        }
                      </div>
                    </motion.div>
                  ))}
                  <div ref={chatEndRef} />
                </AnimatePresence>
              </div>

              {/* Input Area */}
              <div className="flex gap-2 items-end">
                <textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Describe your symptoms..."
                  rows={1}
                  className="flex-1 resize-none overflow-hidden rounded-md border px-3 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition max-h-40"
                  style={{ minHeight: '2.5rem' }}
                />
                <Button onClick={sendMessage} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biometric Sidebar */}
        <div className="w-64 space-y-4 ml-auto">
          <Card>
            <CardHeader><CardTitle>Your Biometric Data</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <Heart className="text-red-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-600">Heart Rate</div>
                  <div className="text-lg font-bold">{biometrics.heartRate || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <Activity className="text-blue-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-600">Blood Oxygen</div>
                  <div className="text-lg font-bold">{biometrics.bloodOxygen || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center p-4 bg-white rounded-lg shadow">
                <Brain className="text-purple-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-600">ECG Status</div>
                  <div className="text-lg font-bold capitalize">{biometrics.ecg?.status || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="text-center py-4 bg-white shadow">
        © {new Date().getFullYear()} Health Assistant - Powered by CardinalKit, HealthKit, and GPT
      </footer>
    </div>
  );
}

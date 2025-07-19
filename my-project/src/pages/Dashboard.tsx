import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { gptHealthService } from '../services/gpt';
import { mockBiometricData } from '../services/mockBiometrics';
import { HealthRecordsService } from '../services/healthRecords';
import { HealthRecordForm } from '../components/HealthRecordForm';
import { HealthRecordsList } from '../components/HealthRecordsList';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, Activity, Heart, Brain, Send, LogOut, Plus, Database } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader } from '@googlemaps/js-api-loader';
import { HealthRecord, CreateHealthRecord } from '../types/health';

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
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);
  const [showRecordsSection, setShowRecordsSection] = useState(false);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(`orthopedic clinic near ${userLocation}`)}`;
  const defaultBiometrics = {
    heartRate: 75,
    bloodOxygen: 98,
    ecg: { status: 'unavailable', timestamp: '' },
  };

  const { user, signOut } = useAuth();

  // Load health records
  const loadHealthRecords = async () => {
    if (!user) return;
    
    try {
      setRecordsLoading(true);
      const records = await HealthRecordsService.getUserRecords(user.uid);
      setHealthRecords(records);
    } catch (error) {
      console.error('Error loading health records:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  // Handle creating a new health record
  const handleCreateRecord = async (data: CreateHealthRecord) => {
    if (!user) return;

    try {
      await HealthRecordsService.createRecord(user.uid, data);
      await loadHealthRecords(); // Reload records
    } catch (error) {
      console.error('Error creating health record:', error);
      throw error;
    }
  };

  // Handle editing a health record
  const handleEditRecord = async (data: CreateHealthRecord) => {
    if (!user || !editingRecord) return;

    try {
      await HealthRecordsService.updateRecord({
        id: editingRecord.id!,
        ...data
      });
      await loadHealthRecords(); // Reload records
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating health record:', error);
      throw error;
    }
  };

  // Handle deleting a health record
  const handleDeleteRecord = async (recordId: string) => {
    if (!user) return;

    if (confirm('Are you sure you want to delete this health record?')) {
      try {
        await HealthRecordsService.deleteRecord(recordId);
        await loadHealthRecords(); // Reload records
      } catch (error) {
        console.error('Error deleting health record:', error);
      }
    }
  };

  useEffect(() => {
    async function init() {
      // Get user location
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
      
      try {
        await new Promise((res) => setTimeout(res, 1000));
        setBiometrics(mockBiometricData || defaultBiometrics);
      } catch (err) {
        console.error("Failed to load mock biometrics:", err);
      } finally {
        setIsLoading(false);
      }
    }
  
    init();
  }, []);

  // Load health records when user is available
  useEffect(() => {
    if (user) {
      loadHealthRecords();
    }
  }, [user]);

  useEffect(() => {
    if (!userLocation || !apiKey) return;
  
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places'],
    });
  
    loader.load().then(() => {
      console.log("Google Maps API loaded");
      // Optional: Store google maps object or use autocomplete, geocoder, etc.
    }).catch(err => {
      console.error("Maps API failed to load", err);
    });
  }, [userLocation, apiKey]);


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
      const response = await gptHealthService.getChatResponse(updatedLog, userLocation, biometrics, mapsUrl);
      setChatLog((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
      setChatLog((prev) => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!userLocation) {
    return <div className="text-center mt-6">Getting your location...</div>;
  }
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Assistant</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Tab Navigation */}
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setShowRecordsSection(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    !showRecordsSection
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Health Chat
                </button>
                <button
                  onClick={() => setShowRecordsSection(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    showRecordsSection
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Database className="w-4 h-4 inline mr-1" />
                  Health Records
                </button>
              </div>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {!showRecordsSection ? (
              // Health Chat Section
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Health Consultation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4 bg-gray-50"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      <AnimatePresence>
                        {chatLog.map((message, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white border shadow-sm'
                              }`}
                            >
                              {message.role === 'assistant' ? (
                                <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      a: ({ node, ...props }) => (
                                        <a
                                          {...props}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline"
                                        />
                                      ),
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={chatEndRef} />
                    </div>

                    <div className="mt-4 flex gap-2">
                      <textarea
                        className="flex-1 p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your symptoms or health concerns..."
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        ref={textareaRef}
                        rows={3}
                      />
                      <Button onClick={sendMessage} disabled={loading || !userInput.trim()}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Health Records Section
              <div className="space-y-6">
                {editingRecord ? (
                  <HealthRecordForm
                    onSubmit={handleEditRecord}
                    editRecord={editingRecord}
                    onCancel={() => setEditingRecord(null)}
                  />
                ) : (
                  <HealthRecordForm onSubmit={handleCreateRecord} />
                )}
                
                <HealthRecordsList
                  records={healthRecords}
                  onEdit={setEditingRecord}
                  onDelete={handleDeleteRecord}
                  loading={recordsLoading}
                />
              </div>
            )}
          </div>

          {/* Sidebar - Biometric Data */}
          <div className="w-64 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Biometric Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center p-4 bg-white rounded-lg shadow">
                  <Heart className="text-red-500 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-600">Heart Rate</div>
                    <div className="text-lg font-bold">{biometrics.heartRate ?? 'N/A'}</div>
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

            {/* Quick Stats for Health Records */}
            {showRecordsSection && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Records</span>
                      <span className="font-medium">{healthRecords.length}</span>
                    </div>
                    {healthRecords.length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Latest Weight</span>
                          <span className="font-medium">{healthRecords[0]?.weight} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Latest HR</span>
                          <span className="font-medium">{healthRecords[0]?.heartRate} bpm</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-4 bg-white shadow">
        © {new Date().getFullYear()} Health Assistant - Powered by Firebase, HealthKit, and GPT
      </footer>
    </div>
  );
}

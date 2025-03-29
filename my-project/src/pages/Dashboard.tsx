import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { healthKitManager } from '../services/healthKit';
import { gptHealthService } from '../services/gpt';
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table";
import { Loader2, Plus, Trash2, Activity, Heart, Brain } from "lucide-react";

interface Symptom {
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
}

interface BiometricData {
  heartRate?: number;
  bloodOxygen?: number;
  ecg?: {
    status: 'normal' | 'abnormal' | 'unavailable';
    timestamp: string;
  };
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [biometrics, setBiometrics] = useState<BiometricData>({});
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Form state
  const [symptomDescription, setSymptomDescription] = useState('');
  const [symptomSeverity, setSymptomSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [symptomDuration, setSymptomDuration] = useState('');

  const { user, signOut } = useAuth();

  // Request HealthKit authorization
  useEffect(() => {
    async function requestAuth() {
      await healthKitManager.requestAuthorization();
      fetchBiometrics();
      setIsLoading(false);
    }
    
    requestAuth();
  }, []);

  // Fetch biometric data
  async function fetchBiometrics() {
    const data = await healthKitManager.getLatestBiometrics();
    if (data) {
      setBiometrics(data);
    }
  }

  // Add symptom
  const handleAddSymptom = () => {
    if (!symptomDescription || !symptomDuration) return;
    
    setSymptoms([...symptoms, {
      description: symptomDescription,
      severity: symptomSeverity,
      duration: symptomDuration
    }]);
    
    setSymptomDescription('');
    setSymptomDuration('');
  };

  // Analyze health data
  const handleAnalyze = async () => {
    if (symptoms.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const analysis = await gptHealthService.analyzeHealth(symptoms, biometrics);
      setAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing health data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get specialist recommendations
  const handleGetRecommendations = async () => {
    if (symptoms.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const recommendations = await gptHealthService.getSpecialistRecommendations(
        symptoms,
        'San Francisco' // TODO: Get user's location
      );
      setAnalysis(recommendations);
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-2xl font-semibold">Loading Health Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-svh bg-gray-100">
      <header className="bg-white shadow-sm border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-600">Health Assistant</h1>
          <Button variant="outline" onClick={handleSignOut}>Logout</Button>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Health Data</CardTitle>
                  <CardDescription>
                    Your latest biometric data and symptoms
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Heart Rate</div>
                          <div className="text-2xl font-bold">
                            {biometrics.heartRate ? `${biometrics.heartRate} bpm` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">Blood Oxygen</div>
                          <div className="text-2xl font-bold">
                            {biometrics.bloodOxygen ? `${biometrics.bloodOxygen}%` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-500">ECG Status</div>
                          <div className="text-2xl font-bold">
                            {biometrics.ecg ? 'Available' : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">Add Symptom</h3>
                    <Button onClick={handleAddSymptom} size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="symptom">Symptom Description</Label>
                      <Input
                        id="symptom"
                        value={symptomDescription}
                        onChange={(e) => setSymptomDescription(e.target.value)}
                        placeholder="e.g., Headache"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity</Label>
                      <select
                        id="severity"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={symptomSeverity}
                        onChange={(e) => setSymptomSeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={symptomDuration}
                        onChange={(e) => setSymptomDuration(e.target.value)}
                        placeholder="e.g., 2 hours"
                      />
                    </div>
                  </div>
                </div>

                {symptoms.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Current Symptoms</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {symptoms.map((symptom, index) => (
                          <TableRow key={index}>
                            <TableCell>{symptom.description}</TableCell>
                            <TableCell className="capitalize">{symptom.severity}</TableCell>
                            <TableCell>{symptom.duration}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSymptoms(symptoms.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze Health Data'
                        )}
                      </Button>
                      <Button
                        onClick={handleGetRecommendations}
                        disabled={isAnalyzing}
                        variant="outline"
                      >
                        Get Specialist Recommendations
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Health Analysis</CardTitle>
                  <CardDescription>
                    AI-powered health insights and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {analysis.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Health Summary</CardTitle>
                <CardDescription>
                  {user?.email ? `Account: ${user.email}` : 'Your health stats'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Active Symptoms</div>
                    <div className="text-2xl font-bold">{symptoms.length}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500">Latest Heart Rate</div>
                    <div className="text-2xl font-bold">
                      {biometrics.heartRate ? `${biometrics.heartRate} bpm` : 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500">Latest Blood Oxygen</div>
                    <div className="text-2xl font-bold">
                      {biometrics.bloodOxygen ? `${biometrics.bloodOxygen}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <footer className="mt-auto border-t py-4 bg-white">
        <div className="container mx-auto px-4 text-center text-gray-500">
          &copy; {new Date().getFullYear()} Health Assistant - Powered by CardinalKit, HealthKit, and GPT
        </div>
      </footer>
    </div>
  );
} 
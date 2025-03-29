// Only import OpenAI if the API key is available
let OpenAI: any;
try {
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    OpenAI = (await import('openai')).default;
  }
} catch (error) {
  console.warn('OpenAI module not available:', error);
}

interface BiometricData {
  heartRate?: number;
  bloodOxygen?: number;
  ecg?: any;
}

interface Symptom {
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
}

export class GPTHealthService {
  private static instance: GPTHealthService;
  private openai: any;

  private constructor() {
    if (!OpenAI) {
      throw new Error('OpenAI is not available. Please check your environment variables.');
    }
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });
  }

  public static getInstance(): GPTHealthService {
    if (!GPTHealthService.instance) {
      GPTHealthService.instance = new GPTHealthService();
    }
    return GPTHealthService.instance;
  }

  // Analyze symptoms and biometric data
  async analyzeHealth(symptoms: Symptom[], biometrics: BiometricData) {
    try {
      const prompt = this.constructHealthPrompt(symptoms, biometrics);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a medical AI assistant. Analyze the provided symptoms and biometric data to give preliminary assessments and recommendations. Always emphasize that this is not a replacement for professional medical advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error analyzing health data:', error);
      return null;
    }
  }

  // Get specialist recommendations
  async getSpecialistRecommendations(symptoms: Symptom[], location: string) {
    try {
      const prompt = this.constructSpecialistPrompt(symptoms, location);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a medical AI assistant. Based on the symptoms and location, recommend appropriate medical specialists and explain why each specialist might be needed."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error getting specialist recommendations:', error);
      return null;
    }
  }

  // Construct health analysis prompt
  private constructHealthPrompt(symptoms: Symptom[], biometrics: BiometricData): string {
    const symptomsText = symptoms.map(s => 
      `- ${s.description} (Severity: ${s.severity}, Duration: ${s.duration})`
    ).join('\n');

    const biometricsText = Object.entries(biometrics)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');

    return `Please analyze the following health information:

Symptoms:
${symptomsText}

Biometric Data:
${biometricsText}

Please provide:
1. A preliminary assessment of the symptoms
2. Any potential concerns based on the biometric data
3. General recommendations for self-care
4. When to seek immediate medical attention
5. Suggested follow-up actions`;
  }

  // Construct specialist recommendation prompt
  private constructSpecialistPrompt(symptoms: Symptom[], location: string): string {
    const symptomsText = symptoms.map(s => 
      `- ${s.description} (Severity: ${s.severity}, Duration: ${s.duration})`
    ).join('\n');

    return `Based on the following symptoms and location, recommend appropriate medical specialists:

Symptoms:
${symptomsText}

Location: ${location}

Please provide:
1. Recommended medical specialists
2. Explanation for each specialist recommendation
3. Urgency level for each specialist
4. General guidance on when to seek emergency care`;
  }
}

export const gptHealthService = GPTHealthService.getInstance(); 
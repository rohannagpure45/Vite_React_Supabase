const systemPrompt = `
You are a helpful health assistant integrated into Epic's MyChart. Your goal is to guide patients conversationally, gather symptoms, and provide a brief, clear assessment — formatted cleanly for both patients and providers.

Guidelines:
1. Use warm, supportive, human-like language.
2. Start casually — do not give a diagnosis in the first reply.
3. Always ask for more symptom details before assessing.
4. Ask only one question at a time, wait for responses.
5. If location is not provided, politely request it or use available geolocation.

When giving a health assessment:
- Start with: "Based on what you've told me so far..."
- Provide a **brief diagnosis** directly after that.
- Integrate **inline citations** from credible sources like Mayo Clinic or NIH. Use hyperlinks if possible.
- Do **not** use section headers like "Summary of Symptoms" or "Assessment of Severity."
- Embed the severity judgment inside the sentence naturally (e.g., "This sounds mild...").
- Use **bold** but **not** bullet points or vertical lists for action steps under **Next Steps**, with a line break before the list.
- Format multiple recommendations in a single line or sentence, separated by commas.
  Example: "Next Steps: Stay hydrated, use a humidifier, rest your voice."
- End with: "Would you like help finding a provider near you?"
- Embed references as markdown links inside keywords. Use **bold**, _underlined_, and blue-colored text for medical sources.  
- Do not include full raw URLs in the message body.

Example Response 

Based on what you've told me so far, you may be experiencing mild symptoms of **[post-nasal drip](https://www.mayoclinic.org/diseases-conditions/post-nasal-drip/symptoms-causes/syc-20343667)** or mild respiratory irritation.

**Next Steps:** Stay hydrated, use a humidifier, avoid irritants.

Would you like help finding a provider near you?


**Next Steps**  
• Rest and hydrate  
• Use OTC meds for relief  
• Seek a provider if it worsens  

Would you like help finding a provider near you?

- **Finding a provider near you:** [View providers](\${mapsUrl})

Final note:
- Keep tone human and friendly.
- Be concise. No more than 5 lines per message if possible.
- Do not repeat already gathered information.
- Make responses suitable for provider review within MyChart.
`;


const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const gptHealthService = {
  async getChatResponse(
    messages: { role: string; content: string }[],
    location = "",
    biometrics?: {
      heartRate?: number;
      bloodOxygen?: number;
      ecg?: {
        status: 'normal' | 'abnormal' | 'unavailable';
        timestamp: string;
      };
    },
    mapsUrl?: string
  ) {
    const biometricSummary = biometrics
      ? `
Biometric Data:
- Heart Rate: ${biometrics.heartRate ?? 'N/A'} bpm
- Blood Oxygen: ${biometrics.bloodOxygen ?? 'N/A'}%
- ECG Status: ${biometrics.ecg?.status ?? 'N/A'} (${biometrics.ecg?.timestamp ?? 'N/A'})
`
      : "";

    const symptomCount = messages.filter(m => m.role === "user").length;
const promptContext = symptomCount < 2
  ? "The user has just started reporting symptoms. Focus on asking clarifying questions for now."
  : "";
  const fullPrompt = location
  ? `The patient's location is ${location}.\n${biometricSummary}\n${promptContext}\n${systemPrompt.replace('${mapsUrl}', mapsUrl || '#')}`
  : `${biometricSummary}\n${promptContext}\n${systemPrompt.replace('${mapsUrl}', mapsUrl || '#')}`;

    const fullMessages = [{ role: "system", content: fullPrompt }, ...messages];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-2024-07-18",
        messages: fullMessages,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Unknown error');
    }
    const data = await response.json();

    return data.choices[0].message.content || "Sorry, something went wrong.";
  },
};

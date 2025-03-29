export const mockBiometricData = {
    heartRate: 72,
    bloodOxygen: 97,
    ecg: {
      status: 'normal' as const,
      timestamp: new Date().toISOString(),
    },
  };
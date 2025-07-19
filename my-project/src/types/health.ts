export interface HealthRecord {
  id?: string;
  userId: string;
  weight: number;
  heartRate: number;
  bloodPressure: string;
  bloodOxygen?: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHealthRecord {
  weight: number;
  heartRate: number;
  bloodPressure: string;
  bloodOxygen?: number;
  notes: string;
}

export interface UpdateHealthRecord extends Partial<CreateHealthRecord> {
  id: string;
} 
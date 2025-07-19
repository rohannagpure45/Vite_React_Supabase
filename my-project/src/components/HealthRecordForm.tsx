import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2, Plus } from "lucide-react";
import { CreateHealthRecord, HealthRecord } from '../types/health';

interface HealthRecordFormProps {
  onSubmit: (data: CreateHealthRecord) => Promise<void>;
  editRecord?: HealthRecord;
  onCancel?: () => void;
}

export function HealthRecordForm({ onSubmit, editRecord, onCancel }: HealthRecordFormProps) {
  const [formData, setFormData] = useState<CreateHealthRecord>({
    weight: editRecord?.weight || 0,
    heartRate: editRecord?.heartRate || 0,
    bloodPressure: editRecord?.bloodPressure || '',
    bloodOxygen: editRecord?.bloodOxygen || 0,
    notes: editRecord?.notes || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }
    if (!formData.heartRate || formData.heartRate <= 0 || formData.heartRate > 300) {
      newErrors.heartRate = 'Please enter a valid heart rate (1-300)';
    }
    if (!formData.bloodPressure.trim()) {
      newErrors.bloodPressure = 'Please enter blood pressure';
    }
    if (formData.bloodOxygen && (formData.bloodOxygen < 70 || formData.bloodOxygen > 100)) {
      newErrors.bloodOxygen = 'Blood oxygen should be between 70-100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form if it's not an edit
      if (!editRecord) {
        setFormData({
          weight: 0,
          heartRate: 0,
          bloodPressure: '',
          bloodOxygen: 0,
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error submitting health record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateHealthRecord, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {editRecord ? 'Edit Health Record' : 'Add New Health Record'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="text-sm font-medium block mb-1">
                Weight (kg) *
              </label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight || ''}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="70.5"
                className={errors.weight ? 'border-red-500' : ''}
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>

            <div>
              <label htmlFor="heartRate" className="text-sm font-medium block mb-1">
                Heart Rate (bpm) *
              </label>
              <Input
                id="heartRate"
                type="number"
                value={formData.heartRate || ''}
                onChange={(e) => handleInputChange('heartRate', parseInt(e.target.value) || 0)}
                placeholder="72"
                className={errors.heartRate ? 'border-red-500' : ''}
              />
              {errors.heartRate && <p className="text-red-500 text-xs mt-1">{errors.heartRate}</p>}
            </div>

            <div>
              <label htmlFor="bloodPressure" className="text-sm font-medium block mb-1">
                Blood Pressure *
              </label>
              <Input
                id="bloodPressure"
                type="text"
                value={formData.bloodPressure}
                onChange={(e) => handleInputChange('bloodPressure', e.target.value)}
                placeholder="120/80"
                className={errors.bloodPressure ? 'border-red-500' : ''}
              />
              {errors.bloodPressure && <p className="text-red-500 text-xs mt-1">{errors.bloodPressure}</p>}
            </div>

            <div>
              <label htmlFor="bloodOxygen" className="text-sm font-medium block mb-1">
                Blood Oxygen (%)
              </label>
              <Input
                id="bloodOxygen"
                type="number"
                min="70"
                max="100"
                value={formData.bloodOxygen || ''}
                onChange={(e) => handleInputChange('bloodOxygen', parseInt(e.target.value) || 0)}
                placeholder="98"
                className={errors.bloodOxygen ? 'border-red-500' : ''}
              />
              {errors.bloodOxygen && <p className="text-red-500 text-xs mt-1">{errors.bloodOxygen}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-medium block mb-1">
              Notes
            </label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about your health today..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editRecord ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editRecord ? 'Update Record' : 'Add Record'
              )}
            </Button>
            {editRecord && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 
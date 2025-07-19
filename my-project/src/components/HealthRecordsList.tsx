import React from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Edit, Trash2, Calendar, Weight, Heart, Activity, FileText } from "lucide-react";
import { HealthRecord } from '../types/health';

interface HealthRecordsListProps {
  records: HealthRecord[];
  onEdit: (record: HealthRecord) => void;
  onDelete: (recordId: string) => void;
  loading?: boolean;
}

export function HealthRecordsList({ records, onEdit, onDelete, loading }: HealthRecordsListProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Health Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Health Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No health records yet</p>
            <p className="text-gray-400 text-sm">Add your first health record to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Health Records ({records.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {formatDate(record.createdAt)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(record)}
                    className="h-8 px-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(record.id!)}
                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Weight</p>
                    <p className="font-medium">{record.weight} kg</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-xs text-gray-500">Heart Rate</p>
                    <p className="font-medium">{record.heartRate} bpm</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Blood Pressure</p>
                    <p className="font-medium">{record.bloodPressure}</p>
                  </div>
                </div>

                {record.bloodOxygen && (
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Blood Oxygen</p>
                      <p className="font-medium">{record.bloodOxygen}%</p>
                    </div>
                  </div>
                )}
              </div>

              {record.notes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{record.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
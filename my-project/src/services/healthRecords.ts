import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { HealthRecord, CreateHealthRecord, UpdateHealthRecord } from '../types/health';

const COLLECTION_NAME = 'healthRecords';

export class HealthRecordsService {
  // Create a new health record
  static async createRecord(userId: string, data: CreateHealthRecord): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...data,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating health record:', error);
      throw new Error('Failed to create health record');
    }
  }

  // Get all health records for a user
  static async getUserRecords(userId: string): Promise<HealthRecord[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: HealthRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as HealthRecord);
      });
      
      return records;
    } catch (error) {
      console.error('Error fetching health records:', error);
      throw new Error('Failed to fetch health records');
    }
  }

  // Update a health record
  static async updateRecord(recordData: UpdateHealthRecord): Promise<void> {
    try {
      const { id, ...updateData } = recordData;
      const docRef = doc(db, COLLECTION_NAME, id);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating health record:', error);
      throw new Error('Failed to update health record');
    }
  }

  // Delete a health record
  static async deleteRecord(recordId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, recordId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting health record:', error);
      throw new Error('Failed to delete health record');
    }
  }

  // Real-time listener for user's health records
  static subscribeToUserRecords(
    userId: string, 
    callback: (records: HealthRecord[]) => void
  ): () => void {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const records: HealthRecord[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as HealthRecord);
      });
      callback(records);
    }, (error) => {
      console.error('Error in health records subscription:', error);
    });
  }

  // Get records for a specific date range
  static async getRecordsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<HealthRecord[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate)),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const records: HealthRecord[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as HealthRecord);
      });
      
      return records;
    } catch (error) {
      console.error('Error fetching records by date range:', error);
      throw new Error('Failed to fetch records for date range');
    }
  }
} 
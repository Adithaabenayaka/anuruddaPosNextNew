// src/services/baseService.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  QueryConstraint,
  DocumentData
} from "firebase/firestore";
import { db } from "../lib/firebase";

export class BaseService<T extends { id?: string }> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Create a new document
   */
  async create(data: Omit<T, "id">): Promise<T> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data } as unknown as T;
    } catch (error) {
      console.error(`[BaseService] Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get all documents with optional filters
   */
  async getAll(constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error(`[BaseService] Error getting documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get a single document by ID
   */
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`[BaseService] Error getting document ${id} from ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async update(id: string, data: Partial<Omit<T, "id">>): Promise<T> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(docRef, updateData as DocumentData);
      const updatedDoc = await this.getById(id);
      if (!updatedDoc) throw new Error("Document not found after update");
      return updatedDoc;
    } catch (error) {
      console.error(`[BaseService] Error updating document ${id} in ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[BaseService] Error deleting document ${id} from ${this.collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Custom query helper
   */
  async findByField(field: string, value: any): Promise<T[]> {
    return this.getAll([where(field, "==", value)]);
  }
}

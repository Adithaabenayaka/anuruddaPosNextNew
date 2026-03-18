import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where 
} from "firebase/firestore";
import { db } from "../lib/firebase";

export const firebaseService = {
  /**
   * Add a new document to a collection
   */
  async addDocument(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data };
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    }
  },

  /**
   * Get all documents from a collection
   */
  async getDocuments(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (e) {
      console.error("Error getting documents: ", e);
      throw e;
    }
  },

  /**
   * Get a single document by ID
   */
  async getDocument(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (e) {
      console.error("Error getting document: ", e);
      throw e;
    }
  },

  /**
   * Update a document by ID
   */
  async updateDocument(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    } catch (e) {
      console.error("Error updating document: ", e);
      throw e;
    }
  },

  /**
   * Delete a document by ID
   */
  async deleteDocument(collectionName: string, id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (e) {
      console.error("Error deleting document: ", e);
      throw e;
    }
  }
};

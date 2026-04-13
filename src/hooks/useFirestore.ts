import { useEffect, useState } from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  QueryConstraint, 
  DocumentData, 
  doc 
} from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Hook to listen to a collection in real-time
 */
export function useCollection<T>(
  collectionName: string, 
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, collectionName), ...constraints);
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error in useCollection (${collectionName}):`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints)]); // Simple way to track constraint changes

  return { data, loading, error };
}

/**
 * Hook to listen to a single document in real-time
 */
export function useDocument<T>(collectionName: string, id: string | undefined) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, collectionName, id);
    
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`Error in useDocument (${collectionName}/${id}):`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, id]);

  return { data, loading, error };
}

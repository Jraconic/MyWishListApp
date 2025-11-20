import React, { useState, useEffect, useCallback } from 'react';
import { signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot, doc, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';

// Component Imports - FIX: Removed .jsx extension for better module resolution
import Header from './components/Header';
import FloatingButton from './components/FloatingButton';
import ItemCard from './components/ItemCard';
import DetailPage from './components/DetailPage';
import AddForm from './components/AddForm';
import EditForm from './components/EditForm';

// 4. Main Application Component
export default function App({ db, auth, appId, initialAuthToken, isCanvasEnvironment }) {
  const [items, setItems] = useState([]);
  const [view, setView] = useState('list'); // 'list', 'detail', 'add', or 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Utility Functions ---
  const getWishlistCollectionRef = useCallback((uid) => {
    if (!db) return null;
    return collection(db, `artifacts/${appId}/users/${uid}/wishlist`);
  }, [db, appId]);

  // --- Auth and Firestore Setup ---
  useEffect(() => {
    if (!auth) {
        setIsAuthReady(true);
        setLoading(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            const anonymousUser = await signInAnonymously(auth);
            setUserId(anonymousUser.user.uid);
          }
        } catch (error) {
          console.error("Authentication Error: Failed to sign in.", error);
        }
      }
      setIsAuthReady(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, initialAuthToken]);

  // --- Firestore Real-time Listener (Data Fetching) ---
  useEffect(() => {
    if (!db || !isAuthReady || !userId) return;

    setLoading(true);
    const q = query(getWishlistCollectionRef(userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      fetchedItems.sort((a, b) => (b.dateAdded?.toMillis() || 0) - (a.dateAdded?.toMillis() || 0));
      setItems(fetchedItems);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error: Data fetch failed.", error);
      setItems([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, isAuthReady, userId, getWishlistCollectionRef]);

  // --- Firestore Operations ---
  const handleAddItem = useCallback(async (formData) => {
    if (!db || !userId) return;
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        dateAdded: serverTimestamp(),
      };
      await addDoc(getWishlistCollectionRef(userId), itemData);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }, [db, userId, getWishlistCollectionRef]);

  const handleEditItem = useCallback(async (itemId, formData) => {
    if (!db || !userId) return;
    try {
      const itemRef = doc(getWishlistCollectionRef(userId), itemId);
      const updatedData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        dateUpdated: serverTimestamp(),
      };
      await updateDoc(itemRef, updatedData);
      setView('detail');
    } catch (e) {
      console.error("Error editing document: ", e);
    }
  }, [db, userId, getWishlistCollectionRef]);

  const handleDeleteItem = useCallback(async (itemId) => {
    if (!db || !userId) return;
    if (!window.confirm("Are you sure you want to remove this item from your wishlist?")) return;
    try {
      await deleteDoc(doc(getWishlistCollectionRef(userId), itemId));
      setView('list');
      setSelectedItem(null);
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  }, [db, userId, getWishlistCollectionRef]);

  // --- View Handlers ---
  const handleSelect = (item) => {
    setSelectedItem(item);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedItem(null);
    setView('list');
  };
  
  const handleOpenEdit = () => {
    setView('edit');
  };
  
  const handleCancelForm = () => {
    setView(selectedItem ? 'detail' : 'list');
  };

  // --- Rendering Logic ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-stone-50">
        <div className="text-xl font-medium text-stone-600">Loading Wishlist...</div>
      </div>
    );
  }

  return (
    // Outer body set to a soft, warm gray
    <div className="min-h-screen bg-stone-50 font-sans">
      <Header userId={userId} />
      
      <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-20">
        
        {/* List View */}
        {view === 'list' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
            {items.length === 0 ? (
              <p className="col-span-full text-center text-stone-500 p-10 text-lg">Your wishlist is empty! Add some items using the '+' button.</p>
            ) : (
              items.map(item => (
                <ItemCard key={item.id} item={item} onSelect={handleSelect} />
              ))
            )}
          </div>
        )}

        {/* Detail View */}
        {view === 'detail' && selectedItem && (
          <DetailPage 
            item={selectedItem} 
            onBack={handleBack} 
            onDelete={handleDeleteItem} 
            onOpenEdit={handleOpenEdit}
          />
        )}
        
        {/* Add Form View */}
        {view === 'add' && (
          <AddForm onAddItem={handleAddItem} onCancel={handleCancelForm} />
        )}
        
        {/* Edit Form View */}
        {view === 'edit' && selectedItem && (
          <EditForm 
            item={selectedItem} 
            onEditItem={handleEditItem} 
            onCancel={handleCancelForm} 
          />
        )}
        
      </div>

      {view !== 'add' && view !== 'edit' && (
        <FloatingButton onOpenAdd={() => setView('add')} />
      )}
    </div>
  );
}
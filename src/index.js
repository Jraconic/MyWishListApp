import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// --- CONFIGURATION & FIREBASE SETUP ---

// Use fallback values if environment variables (__app_id, __firebase_config) are not provided 
const isCanvasEnvironment = typeof __app_id !== 'undefined';
const appId = isCanvasEnvironment ? __app_id : 'default-app-id';
const initialAuthToken = isCanvasEnvironment ? __initial_auth_token : null;

// The application will use this configuration block outside of the Canvas environment.
// These are your actual, valid Firebase project keys.
const defaultFirebaseConfig = {
  apiKey: "AIzaSyBIOV8rVBPWz4uUuuyTrV-cH6Alylui_54", 
  authDomain: "my-wishlist-tracker.firebaseapp.com",
  projectId: "my-wishlist-tracker", 
  storageBucket: "dummy-bucket.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefgh1234567890"
};

const firebaseConfig = isCanvasEnvironment ? JSON.parse(__firebase_config) : defaultFirebaseConfig;

// Initialize Firebase App and services
let app;
let db;
let auth;

try {
  // Attempt to initialize Firebase with the configuration
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  // If initialization fails, log the error and ensure variables are null
  console.error("CRITICAL ERROR: Failed to initialize Firebase services. App UI will not load.", e);
  console.error("Full error details:", e);
  app = null;
  db = null;
  auth = null;
}

const getWishlistCollectionRef = (userId) => 
  collection(db, `artifacts/${appId}/users/${userId}/wishlist`);

// --- UI COMPONENTS ---

// 1. Item Card for the Main List View
const ItemCard = ({ item, onSelect }) => {
  const placeholderUrl = `https://placehold.co/300x400/1c1917/f5f5f4?text=${item.name.substring(0, 10)}`;

  return (
    <div
      onClick={() => onSelect(item)}
      // Muted background and subtle shadow for an elegant feel
      className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden cursor-pointer transform transition duration-300 hover:shadow-xl hover:scale-[1.02]"
    >
      <div className="h-64 sm:h-80 w-full overflow-hidden">
        <img
          src={item.imageUrl || placeholderUrl}
          alt={item.name}
          className="w-full h-full object-cover transition duration-500 group-hover:opacity-75"
          onError={(e) => { e.target.onerror = null; e.target.src = placeholderUrl; }}
        />
      </div>
      <div className="p-4">
        {/* Stronger title for high contrast */}
        <h3 className="text-xl font-bold text-gray-900 tracking-wide truncate">{item.name}</h3>
        {/* Softer color for secondary text */}
        <p className="text-sm text-stone-500">{item.brand}</p>
        {/* Deep, rich color for the price accent */}
        <p className="text-2xl font-extrabold text-stone-700 mt-2">${item.price ? item.price.toFixed(2) : 'N/A'}</p>
      </div>
    </div>
  );
};

// 2. Detail Page Component
const DetailPage = ({ item, onBack, onDelete }) => {
  const placeholderUrl = `https://placehold.co/600x800/1c1917/f5f5f4?text=${item.name.substring(0, 10)}`;

  const handleBuyNow = () => {
    if (item.purchaseLink) {
      window.open(item.purchaseLink, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-stone-50 p-6 sm:p-10 rounded-xl shadow-2xl">
      <button
        onClick={onBack}
        // Accent color matching the new theme
        className="text-stone-600 hover:text-stone-800 transition duration-150 flex items-center mb-6 font-medium tracking-wider"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        BACK TO WISHLIST
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Section */}
        <div className="rounded-lg overflow-hidden shadow-xl border border-stone-200">
          <img
            src={item.imageUrl || placeholderUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = placeholderUrl; }}
          />
        </div>

        {/* Details Section */}
        <div>
          {/* Strong typography */}
          <h1 className="text-5xl font-light text-gray-900 mb-2 tracking-wider">{item.name}</h1>
          <h2 className="text-xl font-medium text-stone-600 mb-6">{item.brand}</h2>
          <p className="text-4xl font-extrabold text-stone-700 mb-8">${item.price ? item.price.toFixed(2) : 'N/A'}</p>

          <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-stone-300 pb-1">DESCRIPTION</h3>
          <p className="text-stone-700 leading-relaxed mb-8">{item.description}</p>

          <div className="flex space-x-4">
            <button
              onClick={handleBuyNow}
              // Dark, monochromatic button style
              className="px-8 py-3 bg-stone-800 text-white font-bold rounded-lg shadow-lg hover:bg-stone-900 transition duration-200 uppercase tracking-widest disabled:opacity-50"
              disabled={!item.purchaseLink}
            >
              BUY NOW
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="px-4 py-3 bg-red-500 text-white font-medium rounded-lg shadow-md hover:bg-red-600 transition duration-200"
            >
              REMOVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Form to add new items
const AddItemForm = ({ onAddItem }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    purchaseLink: '',
    imageUrl: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.purchaseLink) return;

    setIsSubmitting(true);
    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        dateAdded: serverTimestamp(),
      };
      await onAddItem(itemData);

      setFormData({ name: '', brand: '', price: '', purchaseLink: '', imageUrl: '', description: '' });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        // Floating button styled to match the dark accent
        className="fixed bottom-6 right-6 z-50 p-4 bg-stone-800 text-white rounded-full shadow-lg hover:bg-stone-900 transition duration-200 transform hover:scale-105"
        aria-label="Add new item"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-stone-50 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-wide">ADD NEW ITEM</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Item Name (e.g., Slim Fit Jeans)"
            required
            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white"
          />
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Brand (e.g., Levi's)"
            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white"
          />
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price (e.g., 89.99)"
            step="0.01"
            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white"
          />
          <input
            type="url"
            name="purchaseLink"
            value={formData.purchaseLink}
            onChange={handleChange}
            placeholder="External Purchase Link (REQUIRED)"
            required
            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white"
          />
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Image URL (Optional)"
            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description and Notes"
            rows="3"
            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white"
          ></textarea>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-100 transition duration-150"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-stone-800 text-white font-medium rounded-lg hover:bg-stone-900 transition duration-150 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// 4. Main Application Component
const App = () => {
  const [items, setItems] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [selectedItem, setSelectedItem] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Auth and Firestore Setup ---
  useEffect(() => {
    // Only attempt authentication if Firebase app was successfully initialized
    if (!app) {
        setIsAuthReady(true);
        setLoading(false);
        return; // Stop here if Firebase failed to initialize
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            // Sign in anonymously will use the dummy config, which is fine for rendering the UI
            const anonymousUser = await signInAnonymously(auth);
            setUserId(anonymousUser.user.uid);
          }
        } catch (error) {
          // Log an error if authentication fails, but don't crash the UI
          console.error("Authentication Error: Firebase config may be invalid outside Canvas. UI rendered without live data.", error);
        }
      }
      setIsAuthReady(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- Firestore Real-time Listener (Data Fetching) ---
  useEffect(() => {
    // Only proceed if Firebase is initialized and auth is ready
    if (!app || !isAuthReady || !userId) {
        if (!app) {
            setLoading(false);
            setItems([]); // Clear items if the app never initialized
        }
        return;
    }

    setLoading(true);
    // Note: This query may fail if the Firebase Config is dummy, but the UI should still load.
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
      // Catch Firestore errors here gracefully
      console.error("Firestore Error: Data fetch failed, likely due to dummy config. UI rendered but list is empty.", error);
      setItems([]); // Ensure the UI displays the "empty wishlist" message instead of a blank screen
      setLoading(false);
    });

    return () => unsubscribe();
  }, [app, isAuthReady, userId]);

  // --- Firestore Operations ---
  // The add/delete operations will likely fail with the dummy config, but they won't crash the app.
  const handleAddItem = useCallback(async (itemData) => {
    if (!userId || !app) {
        console.error("Cannot add item. Firebase app not initialized.");
        // If save fails, add the item to local state so the user sees it (temporary persistence)
        setItems(prev => [{ id: Date.now().toString(), ...itemData }, ...prev]);
        return;
    }
    try {
      await addDoc(getWishlistCollectionRef(userId), itemData);
    } catch (e) {
      console.error("Error adding document. You must connect a real Firebase project for data persistence.", e);
      // Optional: Add the item to local state so the user sees it, even if it's not saved permanently
      setItems(prev => [{ id: Date.now().toString(), ...itemData }, ...prev]);
    }
  }, [userId, app]);

  const handleDeleteItem = useCallback(async (itemId) => {
    if (!userId || !window.confirm("Are you sure you want to remove this item from your wishlist?")) return;
    if (!app) {
        console.error("Cannot delete item. Firebase app not initialized.");
        setItems(prev => prev.filter(item => item.id !== itemId));
        setView('list'); 
        setSelectedItem(null);
        return;
    }

    try {
      await deleteDoc(doc(getWishlistCollectionRef(userId), itemId));
      setView('list'); 
      setSelectedItem(null);
    } catch (e) {
      console.error("Error deleting document. Data persistence is required for permanent delete.", e);
      // Remove from local state even if the delete fails permanently
      setItems(prev => prev.filter(item => item.id !== itemId));
      setView('list'); 
      setSelectedItem(null);
    }
  }, [userId, app]);

  // --- View Handlers ---
  const handleSelect = (item) => {
    setSelectedItem(item);
    setView('detail');
  };

  const handleBack = () => {
    setSelectedItem(null);
    setView('list');
  };

  // --- Rendering Logic ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-stone-50">
        <div className="text-xl font-medium text-stone-600">Loading Wishlist...</div>
      </div>
    );
  }

  // Header styled for elegant minimalism
  const header = (
    <div className="p-4 bg-stone-50 shadow-md mb-8 rounded-b-xl border-t-8 border-stone-800">
      <h1 className="text-4xl font-light text-gray-900 tracking-widest uppercase">PERSONAL WISHLIST</h1>
      <p className="text-xs text-stone-500 mt-2">User ID: {userId}</p>
      <p className="text-xs text-stone-600 mt-1">Click the + button to add an item.</p>
      {/* Alert the user that data is NOT persistent outside of the Canvas environment */}
      {!isCanvasEnvironment && (
        <p className="text-xs text-red-600 mt-1 font-bold">WARNING: Data will NOT be saved permanently on this host.</p>
      )}
    </div>
  );

  return (
    // Outer body set to a soft, warm gray
    <div className="min-h-screen bg-stone-50 font-sans">
      {header}
      <div className="p-4 sm:p-6 pb-20">
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

        {view === 'detail' && selectedItem && (
          <DetailPage item={selectedItem} onBack={handleBack} onDelete={handleDeleteItem} />
        )}
      </div>

      <AddItemForm onAddItem={handleAddItem} />
    </div>
  );
};


// 5. RENDER LOGIC: THE MISSING PIECE!
// This tells the app to draw the App component into the HTML div with id="root".
try {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  } else {
    console.error("The HTML element with ID 'root' was not found. Cannot render the application.");
  }
} catch (error) {
  console.error("Failed to render the application. Check the React/ReactDOM setup.", error);
}
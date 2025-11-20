import React from 'react';

export default function Header({ userId }) {
    return (
        // Header styled for elegant minimalism - CENTERED FOR SQUARESPACE LOOK
        <div className="p-8 bg-stone-50 shadow-md mb-12 rounded-b-xl border-t-8 border-stone-800 flex flex-col items-center">
            <h1 className="text-4xl font-light text-gray-900 tracking-widest uppercase mb-2">PERSONAL WISHLIST</h1>
            {/* User ID is hidden now for cleaner aesthetics */}
            <p className="text-xs text-stone-500 mt-2 hidden">User ID: {userId}</p>
            <p className="text-xs text-stone-600 mt-1">Click the + button to add an item or click an item to view/edit.</p>
        </div>
    );
}
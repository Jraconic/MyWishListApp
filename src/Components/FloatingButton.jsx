import React from 'react';

export default function FloatingButton({ onOpenAdd }) {
    return (
        <button
            onClick={onOpenAdd}
            // Floating button styled to match the dark accent
            className="fixed bottom-6 right-6 z-50 p-4 bg-stone-800 text-white rounded-full shadow-lg hover:bg-stone-900 transition duration-200 transform hover:scale-105"
            aria-label="Add new item"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
    );
}
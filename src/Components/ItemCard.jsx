import React from 'react';

export default function ItemCard({ item, onSelect }) {
    // Fallback image in case the provided URL is invalid
    const placeholderUrl = `https://placehold.co/300x400/1c1917/f5f5f4?text=${item.name ? item.name.substring(0, 10) : 'Item'}`;

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
                {/* Reduced size for price accent */}
                <p className="text-xl font-extrabold text-stone-700 mt-2">${item.price ? item.price.toFixed(2) : 'N/A'}</p>
            </div>
        </div>
    );
}
import React from 'react';

export default function DetailPage({ item, onBack, onDelete, onOpenEdit }) {
    const placeholderUrl = `https://placehold.co/600x800/1c1917/f5f5f4?text=${item.name ? item.name.substring(0, 10) : 'Item'}`;

    const handleBuyNow = () => {
        if (item.purchaseLink) {
            window.open(item.purchaseLink, '_blank');
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-stone-50 p-6 sm:p-10 rounded-xl shadow-2xl">
            {/* Back Button */}
            <button
                onClick={onBack}
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
                    <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-wider">{item.name}</h1>
                    <h2 className="text-lg font-medium text-stone-600 mb-6">{item.brand}</h2>
                    {/* Reduced size for price accent */}
                    <p className="text-4xl font-extrabold text-stone-700 mb-10">${item.price ? item.price.toFixed(2) : 'N/A'}</p>

                    <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-stone-300 pb-1">DESCRIPTION / NOTES</h3>
                    <p className="text-stone-700 leading-relaxed mb-8 whitespace-pre-wrap">{item.description}</p>

                    <div className="flex space-x-3 pt-4">
                        {/* Buy Now Button */}
                        <button
                            onClick={handleBuyNow}
                            className="flex-grow text-center px-6 py-3 bg-stone-800 text-white font-bold rounded-lg shadow-md hover:bg-stone-900 transition duration-200 uppercase tracking-widest disabled:opacity-50"
                            disabled={!item.purchaseLink}
                        >
                            BUY NOW
                        </button>
                    </div>
                    
                    <div className="flex space-x-3 pt-4">
                        {/* Edit Button */}
                        <button
                            onClick={onOpenEdit}
                            className="flex-grow text-center px-6 py-3 bg-amber-600 text-white font-medium rounded-lg shadow-md hover:bg-amber-700 transition duration-200"
                        >
                            EDIT
                        </button>
                        {/* Remove Button */}
                        <button
                            onClick={() => onDelete(item.id)}
                            className="flex-grow text-center px-6 py-3 bg-red-500 text-white font-medium rounded-lg shadow-md hover:bg-red-600 transition duration-200"
                        >
                            DELETE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
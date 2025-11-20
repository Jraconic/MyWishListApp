import React, { useState } from 'react';

export default function AddForm({ onAddItem, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        purchaseLink: '',
        imageUrl: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.purchaseLink) return;

        setIsSubmitting(true);
        try {
            await onAddItem(formData);
            setFormData({ name: '', brand: '', price: '', purchaseLink: '', imageUrl: '', description: '' });
            onCancel(); // Close form upon successful submission
        } catch (error) {
            console.error("Error adding document: ", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-4">
            <div className="bg-stone-50 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-full">
                <h2 className="text-2xl font-light mb-6 text-gray-900 tracking-wider uppercase border-b pb-2 border-stone-300">Add New Wishlist Item</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Item Name (Required) */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Item Name (Required)</span>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Slim Fit Jeans"
                            required
                            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white mt-1"
                        />
                    </label>

                    {/* External Purchase Link (Required) */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Purchase Link (REQUIRED)</span>
                        <input
                            type="url"
                            name="purchaseLink"
                            value={formData.purchaseLink}
                            onChange={handleChange}
                            placeholder="https://retailer.com/product"
                            required
                            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white mt-1"
                        />
                    </label>

                    {/* Brand */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Brand</span>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="e.g., Levi's"
                            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white mt-1"
                        />
                    </label>

                    {/* Price */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Price ($)</span>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="e.g., 89.99"
                            step="0.01"
                            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white mt-1"
                        />
                    </label>

                    {/* Image URL */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Image URL</span>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://images.com/item.jpg"
                            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white mt-1"
                        />
                    </label>

                    {/* Description */}
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700">Description / Notes</span>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Add notes on sizing, color preference, etc."
                            rows="4"
                            className="w-full p-3 border border-stone-300 rounded-lg focus:ring-stone-500 focus:border-stone-500 bg-white mt-1"
                        ></textarea>
                    </label>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
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
                            {isSubmitting ? 'SAVING...' : 'ADD ITEM'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
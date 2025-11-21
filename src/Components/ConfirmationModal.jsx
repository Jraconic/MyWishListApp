import React from 'react';

export default function ConfirmationModal({ itemName, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm">
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Deletion</h3>
                
                <p className="text-stone-700 mb-6">
                    Are you sure you want to permanently delete **{itemName}**? This action cannot be undone.
                </p>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-100 transition duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition duration-150"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
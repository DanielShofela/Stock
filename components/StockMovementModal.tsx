import React, { useState, useEffect } from 'react';

interface StockMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (quantity: number, reference: string) => void;
    variantName: string;
    movementType: 'in' | 'out';
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ isOpen, onClose, onSubmit, variantName, movementType }) => {
    const [quantity, setQuantity] = useState('');
    const [reference, setReference] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setQuantity('');
            setReference('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            setError('La quantité doit être un nombre positif.');
            return;
        }
        onSubmit(qty, reference);
    };

    const title = movementType === 'in' ? 'Entrée de stock' : 'Sortie de stock';
    const buttonText = movementType === 'in' ? 'Enregistrer l\'entrée' : 'Enregistrer la sortie';
    const buttonColor = movementType === 'in' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500';

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500 mb-4">Pour : <span className="font-semibold">{variantName}</span></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">{error}</div>}
                    
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-semibold text-gray-600 mb-1">Quantité *</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0076BC]"
                            placeholder="ex: 10"
                            min="1"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label htmlFor="reference" className="block text-sm font-semibold text-gray-600 mb-1">Référence / Raison</label>
                        <input
                            type="text"
                            id="reference"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0076BC]"
                            placeholder="ex: BL-0012, Perte, etc."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Annuler
                        </button>
                        <button type="submit" className={`px-4 py-2 text-sm font-semibold text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${buttonColor}`}>
                            {buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockMovementModal;

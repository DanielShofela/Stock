import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { StockMovement } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChartBarIcon } from '../components/icons/ChartBarIcon';

const ReportsPage: React.FC = () => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [format, setFormat] = useState<'csv' | 'pdf'>('pdf');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchMovementsForReport = async (): Promise<StockMovement[]> => {
        const { data, error } = await supabase
            .from('stock_movements')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', `${endDate}T23:59:59.999Z`)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching movements for report:', error.message);
            throw new Error('Impossible de récupérer les données pour le rapport.');
        }

        return data.map(m => ({
            id: m.id,
            productName: m.product_name_cache || 'N/A',
            variantName: m.variant_name_cache || 'N/A',
            sku: m.sku_cache,
            quantity: m.quantity,
            type: m.movement_type,
            date: m.created_at || new Date().toISOString(),
            reference: m.reference
        }));
    };

    const exportCSV = (movements: StockMovement[]) => {
        const headers = ['Date', 'Produit', 'Variante', 'SKU', 'Type', 'Quantité', 'Référence'];
        const rows = movements.map(m => [
            new Date(m.date).toLocaleString('fr-FR'),
            `"${(m.productName || '').replace(/"/g, '""')}"`,
            `"${(m.variantName || '').replace(/"/g, '""')}"`,
            m.sku || '',
            m.type,
            m.quantity,
            `"${(m.reference || '').replace(/"/g, '""')}"`
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `rapport_mouvements_${startDate}_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const exportPDF = (movements: StockMovement[]) => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Rapport des Mouvements de Stock', 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Période du ${new Date(startDate).toLocaleDateString('fr-FR')} au ${new Date(endDate).toLocaleDateString('fr-FR')}`, 14, 30);

        autoTable(doc, {
            startY: 35,
            head: [['Date', 'Produit', 'Variante', 'Type', 'Qté', 'Référence']],
            body: movements.map(m => [
                new Date(m.date).toLocaleDateString('fr-FR'),
                m.productName,
                m.variantName,
                m.type,
                m.quantity.toString(),
                m.reference || ''
            ]),
            theme: 'grid',
            headStyles: { fillColor: [0, 118, 188] }, // #0076BC
        });

        doc.save(`rapport_mouvements_${startDate}_${endDate}.pdf`);
    };

    const handleExport = async () => {
        setLoading(true);
        setError('');
        try {
            const movements = await fetchMovementsForReport();
            if (movements.length === 0) {
                setError('Aucune donnée trouvée pour la période sélectionnée.');
                setLoading(false);
                return;
            }

            if (format === 'csv') {
                exportCSV(movements);
            } else {
                exportPDF(movements);
            }
        } catch (e: any) {
            setError(e.message);
        }
        setLoading(false);
    };

    return (
        <div className="p-4 bg-[#F5F5F5] min-h-screen">
            <h1 className="text-xl font-bold text-gray-800 mb-4">Rapports & Exports</h1>
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <ChartBarIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-md font-bold text-gray-800">Générer un rapport de mouvements</h2>
                </div>


                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-semibold text-gray-600 mb-2">Date de début</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full input-style" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-semibold text-gray-600 mb-2">Date de fin</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full input-style" />
                    </div>
                </div>

                <div>
                    <span className="block text-sm font-semibold text-gray-600 mb-2">Format d'export</span>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="format" value="pdf" checked={format === 'pdf'} onChange={() => setFormat('pdf')} className="form-radio h-4 w-4 text-[#0076BC] focus:ring-[#0076BC]" />
                            <span>PDF</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="format" value="csv" checked={format === 'csv'} onChange={() => setFormat('csv')} className="form-radio h-4 w-4 text-[#0076BC] focus:ring-[#0076BC]" />
                            <span>CSV</span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleExport}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#0076BC] text-white font-bold py-3 px-4 rounded-xl hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0076BC] transition-all duration-300 shadow-lg shadow-[#0076BC]/30 disabled:bg-gray-400 disabled:shadow-none"
                >
                    {loading ? 'Génération...' : 'Générer et Exporter'}
                </button>
                 <style>{`
                    .input-style {
                        width: 100%;
                        padding: 0.75rem 1rem;
                        border-radius: 0.75rem;
                        border: 1px solid #e5e7eb;
                        transition: box-shadow 0.2s;
                    }
                    .input-style:focus {
                        outline: none;
                        box-shadow: 0 0 0 2px #0076BC;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default ReportsPage;

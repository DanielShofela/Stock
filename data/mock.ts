import type { OverduePayment } from '../types';

export const mockOverduePayments: OverduePayment[] = [
    { id: 1, orderId: 'CMD-001', customerName: 'Sophie Leroy', amount: 15500, dueDate: '2024-07-15' },
    { id: 2, orderId: 'CMD-003', customerName: 'Luc Moreau', amount: 8000, dueDate: '2024-07-20' },
];
'use client';

import { useState, useEffect } from 'react';

export default function SalesmanHistoryPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/salesman/orders') // Needs alias or just use general orders API with user context
        // Actually we created GET /api/orders which automatically filters by salesman if role is salesman
        // So let's use that.
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-4 text-center">Loading history...</div>;

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-gray-900">Order History</h1>

            {orders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No orders placed yet.</div>
            ) : (
                <div className="space-y-3">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs text-gray-500">#{order.id.slice(0, 8)}</span>
                                    <div className="font-bold text-gray-900">₹{Number(order.totalAmount).toFixed(2)}</div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                {order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}


            {/* Floating Action Button for New Order */}
            <a
                href="/salesman/orders/create"
                className="fixed bottom-20 right-4 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-50 text-2xl font-bold"
            >
                +
            </a>
        </div>
    );
}

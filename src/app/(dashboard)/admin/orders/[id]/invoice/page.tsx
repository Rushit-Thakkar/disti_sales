'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

export default function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    router.push('/admin/orders');
                } else {
                    setOrder(data);
                }
                setLoading(false);
            })
            .catch(() => {
                alert('Failed to load invoice');
                setLoading(false);
            });
    }, [id, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Generating Invoice...</div>;
    if (!order) return null;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none">
                {/* Header */}
                <div className="bg-slate-900 text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-black">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight mb-1">INVOICE</h1>
                            <p className="opacity-80 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold">{order.company.name}</h2>
                            <p className="opacity-80">Salesman: {order.salesman.name}</p>
                            <p className="opacity-80">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Bill To Section */}
                    <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Bill To</h3>
                            {order.party ? (
                                <div className="text-gray-800">
                                    <p className="font-bold text-xl mb-1">{order.party.name}</p>
                                    <p className="font-medium">{order.party.ownerName}</p>
                                    <p className="text-gray-600 whitespace-pre-line">{order.party.address}</p>
                                    <p className="text-gray-600 mt-2 font-mono text-sm">{order.party.phoneNumber}</p>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No specific customer assigned.</p>
                            )}
                        </div>
                        <div className="flex-1 text-right">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Status</h3>
                            <span className={`inline-block px-4 py-2 rounded-lg font-bold text-sm ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                }`}>
                                {order.status}
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 mb-8">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Unit Price</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {order.items.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product.name}</td>
                                        <td className="px-6 py-4 text-sm text-center text-gray-500">{item.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-500">₹{Number(item.priceAtTime).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                                            ₹{(Number(item.priceAtTime) * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium">₹{Number(order.totalAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-4">
                                <span className="text-xl font-bold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-blue-600">₹{Number(order.totalAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="bg-gray-50 p-8 flex justify-between items-center print:hidden border-t border-gray-200">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Orders
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 active:scale-95 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}

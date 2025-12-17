'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SalesmanOrderPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Party State
    const [parties, setParties] = useState<any[]>([]);
    const [selectedPartyId, setSelectedPartyId] = useState('');

    // Add Party State
    const [showAddParty, setShowAddParty] = useState(false);
    const [newParty, setNewParty] = useState({ name: '', ownerName: '', phoneNumber: '', address: '' });
    const [addingParty, setAddingParty] = useState(false);

    const router = useRouter();

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/parties').then(res => res.json())
        ]).then(([prodData, partyData]) => {
            setProducts(Array.isArray(prodData) ? prodData : []);
            setParties(Array.isArray(partyData) ? partyData : []);
            setLoading(false);
        });
    }, []);

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => {
            const current = prev[productId] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: next };
        });
    };

    const handleAddParty = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingParty(true);
        try {
            const res = await fetch('/api/parties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newParty),
            });

            if (res.ok) {
                const party = await res.json();
                setParties([...parties, party]);
                setSelectedPartyId(party.id);
                setShowAddParty(false);
                setNewParty({ name: '', ownerName: '', phoneNumber: '', address: '' });
            } else {
                alert('Failed to add party');
            }
        } catch (e) {
            alert('Error adding party');
        } finally {
            setAddingParty(false);
        }
    };

    const submitOrder = async () => {
        if (!selectedPartyId) {
            alert("Please select a Party (Shop) first.");
            return;
        }

        setSubmitting(true);
        const items = Object.entries(cart).map(([productId, quantity]) => ({
            productId,
            quantity
        }));

        if (items.length === 0) return;

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, partyId: selectedPartyId }),
            });

            if (res.ok) {
                setCart({});
                router.push('/salesman/orders');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to place order');
            }
        } catch (e) {
            alert('Error placing order');
        } finally {
            setSubmitting(false);
        }
    };

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
    const totalPrice = Object.entries(cart).reduce((total, [pid, qty]) => {
        const product = products.find(p => p.id === pid);
        return total + (product ? Number(product.price) * qty : 0);
    }, 0);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [partySearchQuery, setPartySearchQuery] = useState('');

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="p-4 text-center">Loading data...</div>;

    return (
        <div className="space-y-4 pb-24 relative">
            <h1 className="text-xl font-bold text-gray-900">Take Order</h1>

            {/* Party Selector */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Select Party (Shop)</label>
                    <button
                        onClick={() => setShowAddParty(true)}
                        className="text-sm text-blue-600 font-semibold hover:text-blue-700"
                    >
                        + New Party
                    </button>
                </div>

                {selectedPartyId ? (
                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div>
                            <div className="font-semibold text-blue-900">
                                {parties.find(p => p.id === selectedPartyId)?.name}
                            </div>
                            <div className="text-xs text-blue-700">
                                {parties.find(p => p.id === selectedPartyId)?.address}
                            </div>
                        </div>
                        <button
                            onClick={() => { setSelectedPartyId(''); setSearchQuery(''); }}
                            className="text-xs font-medium text-blue-600 hover:underline"
                        >
                            Change
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search party by name..."
                            className="w-full p-2 pl-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={partySearchQuery}
                            onChange={(e) => setPartySearchQuery(e.target.value)}
                        />
                        {partySearchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
                                {parties.filter(p => p.name.toLowerCase().includes(partySearchQuery.toLowerCase())).length === 0 ? (
                                    <div className="p-3 text-sm text-gray-500 text-center">No parties found</div>
                                ) : (
                                    parties
                                        .filter(p => p.name.toLowerCase().includes(partySearchQuery.toLowerCase()))
                                        .map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => { setSelectedPartyId(p.id); setPartySearchQuery(''); }}
                                                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex flex-col items-start"
                                            >
                                                <span className="font-medium text-gray-900">{p.name}</span>
                                                <span className="text-xs text-gray-500">{p.ownerName} • {p.address}</span>
                                            </button>
                                        ))
                                )}
                            </div>
                        )}
                        {!partySearchQuery && (
                            <div className="mt-2 text-xs text-gray-500">Start typing to search existing parties...</div>
                        )}
                    </div>
                )}
            </div>

            {/* Product Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-10">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full p-2 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Add Party Modal */}
            {showAddParty && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95">
                        <h2 className="text-lg font-bold mb-4">Add New Party</h2>
                        <form onSubmit={handleAddParty} className="space-y-3">
                            <input
                                placeholder="Shop Name"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={newParty.name}
                                onChange={e => setNewParty({ ...newParty, name: e.target.value })}
                            />
                            <input
                                placeholder="Owner Name"
                                required
                                className="w-full p-2 border rounded-lg"
                                value={newParty.ownerName}
                                onChange={e => setNewParty({ ...newParty, ownerName: e.target.value })}
                            />
                            <input
                                placeholder="Phone Number"
                                required
                                type="tel"
                                className="w-full p-2 border rounded-lg"
                                value={newParty.phoneNumber}
                                onChange={e => setNewParty({ ...newParty, phoneNumber: e.target.value })}
                            />
                            <textarea
                                placeholder="Address / Location"
                                required
                                rows={2}
                                className="w-full p-2 border rounded-lg"
                                value={newParty.address}
                                onChange={e => setNewParty({ ...newParty, address: e.target.value })}
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddParty(false)}
                                    className="flex-1 py-2 text-gray-600 font-medium bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingParty}
                                    className="flex-1 py-2 text-white font-medium bg-blue-600 rounded-lg disabled:opacity-50"
                                >
                                    {addingParty ? 'Saving...' : 'Add Party'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {products.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl text-gray-500">
                    No products assigned to your company yet.
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl text-gray-500">
                    No products found matching "{searchQuery}".
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.map(product => (
                        <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                <p className="text-blue-600 font-medium">₹{Number(product.price).toFixed(2)}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateQuantity(product.id, -1)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:bg-gray-200"
                                >
                                    -
                                </button>
                                <span className="w-6 text-center font-medium">{cart[product.id] || 0}</span>
                                <button
                                    onClick={() => updateQuantity(product.id, 1)}
                                    className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 active:bg-blue-200"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Floating Cart & Submit */}
            {totalItems > 0 && (
                <div className="fixed bottom-16 left-4 right-4 bg-gray-900 text-white p-4 rounded-xl shadow-xl flex justify-between items-center z-30">
                    <div>
                        <div className="text-sm text-gray-400">{totalItems} items</div>
                        <div className="font-bold text-lg">₹{totalPrice.toFixed(2)}</div>
                    </div>
                    <button
                        onClick={submitOrder}
                        disabled={submitting}
                        className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Sending...' : 'Place Order'}
                    </button>
                </div>
            )}
        </div>
    );
}

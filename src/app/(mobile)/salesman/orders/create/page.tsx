'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateOrderPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data
    const [parties, setParties] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // Selections
    const [selectedParty, setSelectedParty] = useState<any>(null);
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [cart, setCart] = useState<any[]>([]);

    useEffect(() => {
        // Fetch Parties on load
        fetch('/api/parties').then(res => res.json()).then(setParties);
        // Fetch User info to check if they are restricted to one company
        // Check session or just fetch companies (API will filter if user is restricted)
        fetch('/api/admin/companies').then(res => res.json()).then(setCompanies);
    }, []);

    // Fetch Categories when Company is selected
    useEffect(() => {
        if (selectedCompany) {
            fetch(`/api/categories?companyId=${selectedCompany.id}`)
                .then(res => res.json())
                .then(setCategories);
        }
    }, [selectedCompany]);

    // Fetch Products when Category is selected
    useEffect(() => {
        if (selectedCompany && selectedCategory) {
            fetch(`/api/products?companyId=${selectedCompany.id}&categoryId=${selectedCategory.id}`)
                .then(res => res.json())
                .then(setProducts);
        }
    }, [selectedCompany, selectedCategory]);

    const addToCart = (product: any, qty: number) => {
        if (qty <= 0) return;
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item => item.productId === product.id ? { ...item, quantity: qty } : item);
            }
            return [...prev, { productId: product.id, quantity: qty, price: product.price, name: product.name }];
        });
    };

    const submitOrder = async () => {
        if (!selectedParty) return alert("Select a party");
        if (cart.length === 0) return alert("Cart is empty");
        // Ensure company is selected (it should be by step 2, but just in case)
        if (!selectedCompany) return alert("Select a company");

        setLoading(true);
        const res = await fetch('/api/orders', {
            method: 'POST',
            body: JSON.stringify({
                partyId: selectedParty.id,
                companyId: selectedCompany.id,
                items: cart
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            router.push('/salesman/orders');
        } else {
            alert('Failed to place order');
        }
        setLoading(false);
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                New Order (v2) {step > 1 && `(Step ${step}/4)`}
            </h1>

            {/* Step 1: Select Party */}
            {step === 1 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Select Party</h2>
                    <div className="grid gap-3">
                        {parties.map(party => (
                            <button
                                key={party.id}
                                onClick={() => { setSelectedParty(party); setStep(2); }}
                                className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-left hover:bg-blue-50 transition"
                            >
                                <div className="font-bold text-gray-900">{party.name}</div>
                                <div className="text-sm text-gray-500">{party.address}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Select Company */}
            {step === 2 && (
                <div className="space-y-4">
                    <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
                    <h2 className="text-lg font-semibold text-gray-800">Select Company</h2>
                    {companies.length === 1 ? (
                        // Auto-select if only 1 company available (e.g., standard salesman)
                        <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
                            Selected: {companies[0].name}
                            <button onClick={() => { setSelectedCompany(companies[0]); setStep(3); }} className="block mt-2 font-bold underline">Continue</button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {companies.map(comp => (
                                <button
                                    key={comp.id}
                                    onClick={() => { setSelectedCompany(comp); setStep(3); }}
                                    className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-left hover:bg-blue-50 transition"
                                >
                                    <div className="font-bold text-gray-900">{comp.name}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Select Category */}
            {step === 3 && (
                <div className="space-y-4">
                    <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
                    <h2 className="text-lg font-semibold text-gray-800">Select Category ({selectedCompany?.name})</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { setSelectedCategory(cat); setStep(4); }}
                                className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 text-center hover:bg-blue-50 transition flex flex-col items-center justify-center h-24"
                            >
                                <span className="font-semibold text-gray-800">{cat.name}</span>
                                <span className="text-xs text-gray-400 mt-1">{cat._count?.products || 0} products</span>
                            </button>
                        ))}
                        {categories.length === 0 && <div className="col-span-2 text-center text-gray-500">No categories found.</div>}
                    </div>
                </div>
            )}

            {/* Step 4: Add Products */}
            {step === 4 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <button onClick={() => setStep(3)} className="text-sm text-gray-500 hover:text-gray-800">← Back</button>
                        <div className="text-right">
                            <span className="text-xs text-gray-500">Cart Total</span>
                            <div className="font-bold text-lg text-green-600">
                                ₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">{selectedCategory?.name} Products</h2>
                    <div className="space-y-3 pb-20">
                        {products.map(prod => {
                            const inCart = cart.find(c => c.productId === prod.id)?.quantity || 0;
                            return (
                                <div key={prod.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium text-gray-900">{prod.name}</div>
                                        <div className="text-sm text-gray-500">₹{Number(prod.price).toFixed(2)}</div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        {inCart > 0 && (
                                            <button
                                                onClick={() => addToCart(prod, inCart - 1)}
                                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold"
                                            >-</button>
                                        )}
                                        <span className="w-6 text-center font-medium">{inCart}</span>
                                        <button
                                            onClick={() => addToCart(prod, inCart + 1)}
                                            className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold"
                                        >+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Submit Button */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
                        <button
                            onClick={submitOrder}
                            disabled={cart.length === 0 || loading}
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:shadow-none"
                        >
                            {loading ? 'Placing Order...' : `Place Order (${cart.length} items)`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

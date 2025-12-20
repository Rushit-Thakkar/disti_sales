'use client';

import { useState, useEffect } from 'react';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const fetchData = async () => {
        try {
            const [prodRes, compRes, catRes] = await Promise.all([
                fetch('/api/products', { cache: 'no-store' }),
                fetch('/api/admin/companies'),
                fetch('/api/categories?companyId=' + (companyId || ''))
            ]);

            if (prodRes.ok) setProducts(await prodRes.json());
            if (compRes.ok) setCompanies(await compRes.json());
            if (catRes.ok) setCategories(await catRes.json());
            setLoading(false);
        } catch (error) {
            console.error("Failed to load data", error);
            setLoading(false);
        }
    };

    // Refetch categories when company changes
    useEffect(() => {
        if (companyId) {
            fetch('/api/categories?companyId=' + companyId)
                .then(res => res.json())
                .then(data => setCategories(data));
        } else {
            setCategories([]);
        }
    }, [companyId]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price, companyId, categoryId }),
            });

            if (res.ok) {
                setMessage('Product added successfully!');
                setName('');
                setPrice('');
                // Keep company selected for easier multiple entry
                setCategoryId('');
                fetchData(); // Refresh list
            } else {
                const data = await res.json();
                setMessage(data.error || 'Failed to add product');
            }
        } catch (error) {
            setMessage('Error adding product');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage('Product deleted successfully');
                fetchData();
            } else {
                alert('Failed to delete product');
            }
        } catch (e) {
            alert('Error deleting product');
        }
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        const fileInput = document.getElementById('importFile') as HTMLInputElement;
        const file = fileInput?.files?.[0];

        if (!file) {
            setMessage('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/products/import', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Import successful!');
                fetchData();
                if (fileInput) fileInput.value = '';
            } else {
                setMessage(data.error || 'Import failed');
            }
        } catch (error) {
            setMessage('Error importing file');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Manage Products (v2)
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Actions Column */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Create Product Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Single Product</h2>

                        {message && (
                            <div className={`p-3 mb-4 rounded-lg text-sm ${message.includes('success') || message.includes('imported') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Company</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={companyId}
                                    onChange={e => setCompanyId(e.target.value)}
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    disabled={!companyId}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors">
                                Add Product
                            </button>
                        </form>
                    </div>

                    {/* Import Form */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Bulk Import</h2>
                        <form onSubmit={handleImport} className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-gray-500">
                                    Upload .xlsx with: <strong>Name, Price, Company Name</strong>.
                                </p>
                            </div>
                            <input
                                type="file"
                                id="importFile"
                                accept=".xlsx, .xls, .csv"
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-colors">
                                Import Products
                            </button>
                        </form>
                    </div>
                </div>

                {/* Product List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Product Inventory</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">Product Name</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Company</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No products found.</td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                            <td className="px-6 py-4">₹{Number(product.price).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-gray-500">{product.category?.name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium border border-blue-100">
                                                    {product.company?.name || `Unknown (${product.companyId})`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

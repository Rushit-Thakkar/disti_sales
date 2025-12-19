'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [newName, setNewName] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('');

    useEffect(() => {
        fetchData();
        fetchCompanies();
    }, [selectedCompanyFilter]);

    async function fetchData() {
        setLoading(true);
        let url = '/api/categories';
        if (selectedCompanyFilter) url += `?companyId=${selectedCompanyFilter}`;

        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            setCategories(data);
        }
        setLoading(false);
    }

    async function fetchCompanies() {
        const res = await fetch('/api/admin/companies'); // Assuming this exists or similar
        if (res.ok) {
            const data = await res.json();
            setCompanies(data);
            if (data.length > 0 && !selectedCompanyId) {
                setSelectedCompanyId(data[0].id);
            }
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const res = await fetch('/api/categories', {
            method: 'POST',
            body: JSON.stringify({ name: newName, companyId: selectedCompanyId }),
            headers: { 'Content-Type': 'application/json' }
        });
        setSubmitting(false);

        if (res.ok) {
            setShowModal(false);
            setNewName('');
            fetchData();
        } else {
            alert('Failed to create category');
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Category Management
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    + Add Category
                </button>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filter by Company:</label>
                <select
                    value={selectedCompanyFilter}
                    onChange={e => setSelectedCompanyFilter(e.target.value)}
                    className="border rounded-md px-3 py-1 text-sm bg-white"
                >
                    <option value="">All Companies</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="bg-white rounded-xl shadow border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((cat: any) => (
                                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cat.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {companies.find(c => c.id === cat.companyId)?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {cat._count?.products || 0}
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 md:backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4">Create New Category</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-50 focus:bg-white transition"
                                    placeholder="e.g., Beverages"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Company</label>
                                <select
                                    required
                                    value={selectedCompanyId}
                                    onChange={e => setSelectedCompanyId(e.target.value)}
                                    className="mt-1 w-full border rounded-md px-3 py-2 bg-gray-50 focus:bg-white transition"
                                >
                                    <option value="" disabled>Select Company</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                                >
                                    {submitting ? 'Creating...' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

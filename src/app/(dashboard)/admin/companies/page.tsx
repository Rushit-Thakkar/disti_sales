'use client';

import { useState, useEffect } from 'react';

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [newCompany, setNewCompany] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const fetchCompanies = () => {
        fetch('/api/admin/companies')
            .then(async (res) => {
                if (!res.ok) {
                    const errorIdx = await res.json().catch(() => ({}));
                    throw new Error(errorIdx.error || 'Failed to fetch');
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setCompanies(data);
                } else {
                    setCompanies([]);
                }
                setLoading(false);
            })
            .catch(err => {
                // console.error("Error fetching companies:", err);
                setMessage(err.message.includes('Unauthorized') ? 'Access Denied. Please log in as Admin.' : err.message);
                setCompanies([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('/api/admin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCompany }),
            });

            if (res.ok) {
                setMessage('Company added successfully!');
                setNewCompany('');
                fetchCompanies(); // Refresh list
            } else {
                const data = await res.json();
                setMessage(data.error || 'Failed to add company');
            }
        } catch (error) {
            setMessage('Error adding company');
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (!confirm("Are you sure? This will delete all users, products, and orders associated with this company.")) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/companies/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessage('Company deleted successfully');
                fetchCompanies();
            } else {
                const data = await res.json();
                setMessage(data.error || 'Failed to delete');
            }
        } catch (err) {
            setMessage('Error deleting company');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Companies</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Company Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Company</h2>

                    {message && (
                        <div className={`p-3 mb-4 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleCreateCompany} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Acme Corp"
                                value={newCompany}
                                onChange={(e) => setNewCompany(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            Add Company
                        </button>
                    </form>
                </div>

                {/* Company List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">Existing Companies</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {companies.length === 0 ? (
                            <div className="p-6 text-gray-500 text-center">No companies found.</div>
                        ) : (
                            companies.map((company) => (
                                <div key={company.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 group">
                                    <div>
                                        <span className="font-medium text-gray-900 block">{company.name}</span>
                                        <span className="text-xs text-gray-400">Added {new Date(company.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCompany(company.id)}
                                        className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors opacity-100"
                                        title="Delete Company"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

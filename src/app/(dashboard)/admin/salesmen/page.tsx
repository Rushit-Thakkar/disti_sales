'use client';

import { useState, useEffect } from 'react';

export default function SalesmanPage() {
    const [salesmen, setSalesmen] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch Data
        Promise.all([
            fetch('/api/admin/companies').then(res => res.json()),
            fetch('/api/admin/salesmen').then(res => res.json())
        ]).then(([companiesData, salesmenData]) => {
            if (Array.isArray(companiesData)) setCompanies(companiesData);
            if (Array.isArray(salesmenData)) setSalesmen(salesmenData);
        }).catch(err => {
            console.error(err);
            setMessage("Failed to load data.");
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const fetchSalesmen = async () => {
        const res = await fetch('/api/admin/salesmen');
        if (res.ok) setSalesmen(await res.json());
    };

    const handleCreateSalesman = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('/api/admin/create-salesman', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, companyId }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Salesman created successfully!');
                setName('');
                setEmail('');
                setPassword('');
                setCompanyId('');
                fetchSalesmen(); // Refresh list
            } else {
                setMessage(data.error || 'Failed to create salesman');
            }
        } catch (error) {
            setMessage('An error occurred');
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Manage Salesmen</h1>

            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Create New Salesman</h2>
                </div>

                <div className="p-6">
                    {message && (
                        <div className={`p-4 mb-6 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleCreateSalesman} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Company</label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                                    value={companyId}
                                    onChange={e => setCompanyId(e.target.value)}
                                >
                                    <option value="">Select a Company</option>
                                    <option value="ALL">All Companies (Global Access)</option>
                                    {companies.map((company: any) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
                            >
                                Create Salesman
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Salesmen List */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Salesman Team</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Assigned Company</th>
                                <th className="px-6 py-4 text-center">Orders Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {salesmen.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No salesmen found.</td>
                                </tr>
                            ) : (
                                salesmen.map((salesman) => (
                                    <tr key={salesman.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">{salesman.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{salesman.email}</td>
                                        <td className="px-6 py-4">
                                            {salesman.company ? (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
                                                    {salesman.company.name}
                                                </span>
                                            ) : (
                                                <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-100">
                                                    Global Access
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-800">
                                            {salesman._count?.orders || 0}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

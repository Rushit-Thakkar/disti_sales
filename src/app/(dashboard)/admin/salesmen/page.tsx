'use client';

import { useState, useEffect } from 'react';

export default function SalesmanPage() {
    const [salesmen, setSalesmen] = useState<any[]>([]); // In real app, fetch this
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyId, setCompanyId] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // 1. Fetch Companies
        fetch('/api/admin/companies')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setCompanies(data);
                } else {
                    // console.error("Failed to load companies:", data);
                    setMessage(data.error || "Failed to load companies. Are you logged in as Admin?");
                    setCompanies([]);
                }
            })
            .catch(err => {
                setMessage("Network error loading companies.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

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
            } else {
                setMessage(data.error || 'Failed to create salesman');
            }
        } catch (error) {
            setMessage('An error occurred');
        }
    };

    return (
        <div className="space-y-8">
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
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Company</label>
                            <div className="relative">
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white transition-all"
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
                                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                className="w-full md:w-auto bg-blue-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Create Salesman
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

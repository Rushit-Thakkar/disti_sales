'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        activeSalesmen: 0,
        totalRevenue: 0,
        recentOrders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setStats(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // Helper for currency formatting
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 mt-2">Overview of your distribution network performance.</p>
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Refresh Data
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 transform hover:scale-[1.02] transition-transform duration-300">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 font-medium text-sm uppercase tracking-wider">Total Revenue</p>
                            <h3 className="text-3xl font-bold mt-2">{formatCurrency(Number(stats.totalRevenue))}</h3>
                        </div>
                        <div className="p-3 bg-blue-500 bg-opacity-30 rounded-lg">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-blue-100">
                        <span className="bg-blue-500 bg-opacity-20 px-2 py-0.5 rounded mr-2">Booked</span>
                        Based on non-cancelled orders
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-100 border border-gray-100 hover:border-blue-500 transition-colors duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Total Orders</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">{stats.totalOrders}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link href="/admin/orders" className="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center">
                            View all orders
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </Link>
                    </div>
                </div>

                {/* Salesmen Card */}
                <div className="bg-white rounded-2xl p-6 shadow-xl shadow-gray-100 border border-gray-100 hover:border-blue-500 transition-colors duration-300 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Active Salesmen</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">{stats.activeSalesmen}</h3>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link href="/admin/salesmen" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
                            Manage Team
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <Link href="/admin/orders" className="text-sm font-medium text-blue-600 hover:text-blue-500">View All</Link>
                </div>
                <div className="divide-y divide-gray-100">
                    {(stats.recentOrders as any[]).map((order) => (
                        <div key={order.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 font-bold text-xs">
                                    ORD
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">New order from {order.company.name}</p>
                                    <p className="text-sm text-gray-500">Salesman: {order.salesman.name} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-gray-900">₹{Number(order.totalAmount).toFixed(2)}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {stats.recentOrders.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No recent activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

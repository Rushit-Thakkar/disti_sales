'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/salesmen', label: 'Salesmen' },
    { href: '/admin/companies', label: 'Companies' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/categories', label: 'Categories' },
    { href: '/admin/parties', label: 'Parties' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.replace('/auth/login');
        } else if (status === 'authenticated' && (session?.user as any)?.role !== 'DISTRIBUTOR') {
            if ((session?.user as any)?.role === 'SALESMAN') {
                router.replace('/salesman');
            } else {
                router.replace('/');
            }
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (status === 'unauthenticated' || (session?.user as any)?.role !== 'DISTRIBUTOR') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Top Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-blue-600">DistiMaster</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === item.href
                                            ? 'border-blue-500 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex flex-col items-end mr-4">
                                <span className="text-sm font-medium text-gray-900">{session?.user?.name || 'Admin User'}</span>
                                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    Role: {(session?.user as any)?.role || 'Loading...'}
                                </span>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}

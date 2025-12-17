'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Mobile Top Bar */}
            <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10">
                <span className="font-bold text-lg text-blue-600">DistiApp</span>
                <button
                    onClick={() => signOut({ callbackUrl: '/auth/login' })}
                    className="text-sm font-medium text-gray-500"
                >
                    Logout
                </button>
            </header>

            <main className="p-4">
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 pb-safe z-20">
                <Link
                    href="/salesman"
                    className={`flex flex-col items-center ${pathname === '/salesman' ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    <span className="text-xs mt-1">Order</span>
                </Link>
                <Link
                    href="/salesman/orders"
                    className={`flex flex-col items-center ${pathname === '/salesman/orders' ? 'text-blue-600' : 'text-gray-400'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    <span className="text-xs mt-1">History</span>
                </Link>
            </nav>
        </div>
    );
}

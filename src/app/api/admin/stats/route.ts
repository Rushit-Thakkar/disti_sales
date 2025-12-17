import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const [totalOrders, activeSalesmen, totalRevenueResult, recentOrders] = await Promise.all([
            prisma.order.count(),
            prisma.user.count({ where: { role: 'SALESMAN' } }),
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { status: 'DELIVERED' } // Only count delivered revenue? Or all? Let's count all non-cancelled for now.
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    salesman: { select: { name: true } },
                    company: { select: { name: true } }
                }
            })
        ]);

        // Revenue logic: often business want to see 'Booked Revenue' (all orders) vs 'Realized' (Delivered).
        // Let's show Total Booked Revenue for now (excluding cancelled).
        const bookedRevenue = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { status: { not: 'CANCELLED' } }
        });

        return NextResponse.json({
            totalOrders,
            activeSalesmen,
            totalRevenue: bookedRevenue._sum.totalAmount || 0,
            recentOrders
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}

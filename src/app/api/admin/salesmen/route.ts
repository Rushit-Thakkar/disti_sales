import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const salesmen = await prisma.user.findMany({
            where: { role: 'SALESMAN' },
            include: {
                company: true,
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(salesmen);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch salesmen" }, { status: 500 });
    }
}

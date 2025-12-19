import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: List Categories (Distributor sees own company or all if super admin? Assuming 1 Disti/Company for now)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get('companyId');

    // Filter by companyId if provided, or fallback to user's company (if they have one)
    const companyId = companyIdParam || user.companyId;

    const whereClause: any = {};
    if (companyId) {
        whereClause.companyId = companyId;
    }

    const categories = await prisma.category.findMany({
        where: whereClause,
        include: { _count: { select: { products: true } } },
        orderBy: { name: 'asc' }
    });

    return NextResponse.json(categories);
}

// POST: Create Category
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, companyId } = await req.json();

    if (!name || !companyId) {
        return NextResponse.json({ error: "Name and Company ID required" }, { status: 400 });
    }

    try {
        const category = await prisma.category.create({
            data: {
                name,
                companyId
            }
        });
        return NextResponse.json(category);
    } catch (e) {
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}

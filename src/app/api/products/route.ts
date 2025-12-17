import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const companyIdParam = searchParams.get('companyId');

    const userRole = (session.user as any).role;
    const userCompanyId = (session.user as any).companyId;

    let whereClause = {};

    if (userRole === 'SALESMAN') {
        // Salesman sees ONLY their company's products
        whereClause = { companyId: userCompanyId };
    } else if (companyIdParam) {
        // Distributor can filter by company
        whereClause = { companyId: companyIdParam };
    }

    const products = await prisma.product.findMany({
        where: whereClause,
        include: { company: true }
    });

    return NextResponse.json(products);
}

// Allow Distributor to create products
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, price, companyId } = await req.json();

    const product = await prisma.product.create({
        data: {
            name,
            price: Number(price),
            companyId
        }
    });

    return NextResponse.json(product);
}

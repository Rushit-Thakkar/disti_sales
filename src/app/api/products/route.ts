import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');
    const categoryId = searchParams.get('categoryId');

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (categoryId) where.categoryId = categoryId;

    const products = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' }
    });

    return NextResponse.json(products);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, price, companyId, categoryId } = body;

        if (!name || !price || !companyId) { // categoryId is optional
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                companyId,
                categoryId // Optional
            }
        });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    try {
        await prisma.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (e: any) {
        if (e.code === 'P2003') {
            return NextResponse.json({
                error: "Cannot delete this product because it has been ordered in the past. To maintain order history, products with existing orders cannot be deleted."
            }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}

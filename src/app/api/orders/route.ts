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
    const companyIdParam = searchParams.get('company_id');
    const salesmanIdParam = searchParams.get('salesman_id');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    let whereClause: any = {};

    if (userRole === 'SALESMAN') {
        // Salesman sees their own orders
        whereClause = { salesmanId: userId };
    } else {
        // Distributor filters
        if (companyIdParam) whereClause.companyId = companyIdParam;
        if (salesmanIdParam) whereClause.salesmanId = salesmanIdParam;
    }

    // Date Filtering
    if (startDateParam || endDateParam) {
        whereClause.createdAt = {};
        if (startDateParam) {
            whereClause.createdAt.gte = new Date(startDateParam);
        }
        if (endDateParam) {
            // Set end date to end of that day
            const end = new Date(endDateParam);
            end.setHours(23, 59, 59, 999);
            whereClause.createdAt.lte = end;
        }
    }

    const orders = await prisma.order.findMany({
        where: whereClause,
        include: {
            salesman: { select: { name: true } },
            company: { select: { name: true } },
            items: {
                include: { product: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(orders);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!session || (user as any).role !== 'SALESMAN') {
        return NextResponse.json({ error: "Unauthorized. Only Salesmen can create orders currently." }, { status: 403 });
    }

    const { items, partyId } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // Must provide partyId if available, but optional in schema.
    // Ideally we should enforce it now, but schema says optional.
    // Let's pass it if present.

    const userId = (user as any).id;
    const companyId = (user as any).companyId;

    // Calculate total and Verify products
    let totalAmount = 0;
    const validItems = [];

    for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        // Ensure product belongs to user's company (if user has one - Disti or Salesman)
        // Salesman: user.companyId must match product.companyId
        if ((user as any).role === 'SALESMAN' && product.companyId !== (user as any).companyId) {
            return NextResponse.json({ error: `Product ${product.name} does not belong to your company` }, { status: 400 });
        }

        totalAmount += Number(product.price) * item.quantity;
        validItems.push({
            productId: product.id,
            quantity: item.quantity,
            priceAtTime: product.price
        });
    }

    try {
        const order = await prisma.order.create({
            data: {
                salesman: { connect: { id: userId } },
                company: { connect: { id: companyId } },
                totalAmount: totalAmount,
                ...(partyId ? { party: { connect: { id: partyId } } } : {}),
                items: {
                    create: validItems
                }
            },
            include: { items: true }
        });
        return NextResponse.json(order);
    } catch (error) {
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'debug_order.txt');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Order Error: ${error}. Payload: ${JSON.stringify({ partyId, companyId, items: validItems })}\n`);
        } catch { }
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

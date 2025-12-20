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

    const userRole = (user as any).role;

    if (!session || (userRole !== 'SALESMAN' && userRole !== 'DISTRIBUTOR')) {
        return NextResponse.json({ error: "Unauthorized. Only Salesmen or Distributors can create orders." }, { status: 403 });
    }

    const { items, partyId, companyId: requestedCompanyId } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const userId = (user as any).id;
    let targetCompanyId = (user as any).companyId; // Default to user's company

    // Validation for Global Salesman
    if ((user as any).role === 'SALESMAN') {
        if (!targetCompanyId) {
            // Global Salesman MUST provide a companyId
            if (!requestedCompanyId) {
                return NextResponse.json({ error: "Global Salesman must specify a company" }, { status: 400 });
            }
            targetCompanyId = requestedCompanyId;
        } else {
            // Regular Salesman: Must match their company
            // (Optional: we could ignore requestedCompanyId or error if it mismatches)
        }
    } else if ((user as any).role === 'DISTRIBUTOR') {
        // Distributor creating order: default to their company, or allow override if we start supporting multi-company distributors
        targetCompanyId = (user as any).companyId;
    }

    // Calculate total and Verify products
    let totalAmount = 0;
    const validItems = [];

    for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        // Ensure product belongs to the TARGET company
        if (product.companyId !== targetCompanyId) {
            return NextResponse.json({ error: `Product ${product.name} does not belong to the selected company` }, { status: 400 });
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
                company: { connect: { id: targetCompanyId } },
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
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] Order Error: ${error}. Payload: ${JSON.stringify({ partyId, companyId: targetCompanyId, items })}\n`);
        } catch { }
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

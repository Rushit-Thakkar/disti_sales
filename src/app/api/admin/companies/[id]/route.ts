import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Company ID required" }, { status: 400 });
    }

    try {
        // Perform manual cascade delete in a transaction
        await prisma.$transaction(async (tx) => {
            const prismaTx = tx as any; // Cast to any to bypass type issues with generated client

            // 1. Delete OrderItems associated with Orders of this company
            await prismaTx.orderItem.deleteMany({
                where: {
                    order: {
                        companyId: id
                    }
                }
            });

            // 2. Delete Orders of this company
            await prismaTx.order.deleteMany({
                where: { companyId: id }
            });

            // 3. Delete Products of this company
            await prismaTx.product.deleteMany({
                where: { companyId: id }
            });

            // 4. Delete Users (Salesmen) of this company
            await prismaTx.user.deleteMany({
                where: { companyId: id }
            });

            // 5. Delete the Company itself
            await prismaTx.company.delete({
                where: { id }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete company error:", error);
        return NextResponse.json(
            { error: "Failed to delete company. Ensure all related data is safe to verify." },
            { status: 500 }
        );
    }
}

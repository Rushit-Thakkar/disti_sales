import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


export async function GET() {
    const session = await getServerSession(authOptions);

    // Only Distributors or Salesmen (for products) might need this? 
    // Actually salesmen need companies list for "Assign Company"? No, Admin needs it.
    // Salesmen usually know their own company. 
    // But let's assume this particular API is for the Admin table.
    // NOTE: If some other part of app uses this, it might break. 
    // SalesmanPage uses it. CompaniesPage uses it. 
    // SalesmanPage is Admin-only (creating salesmen).
    // So this should be protected for DISTRIBUTOR.

    if (!session || ((session.user as any).role !== 'DISTRIBUTOR' && (session.user as any).role !== 'SALESMAN')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const companies = await prisma.company.findMany();
    return NextResponse.json(companies);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Company name is required" }, { status: 400 });
        }

        const company = await prisma.company.create({
            data: { name }
        });

        return NextResponse.json(company);
    } catch (error) {
        return NextResponse.json({ error: "Company already exists or invalid data" }, { status: 500 });
    }
}

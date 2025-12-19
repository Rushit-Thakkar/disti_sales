import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // Basic authorization: Must be Distributor
    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { name, email, password, companyId } = await req.json();

        if (!password) {
            return NextResponse.json({ error: "Password is required" }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        // If companyId is "ALL", set it to null for global access
        const finalCompanyId = (companyId === 'ALL' || companyId === '') ? null : companyId;

        const salesman = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'SALESMAN',
                companyId: finalCompanyId,
            },
        });

        // Exclude password from response
        const { password: _, ...result } = salesman;

        return NextResponse.json(result);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "User already exists or invalid data" }, { status: 500 });
    }
}

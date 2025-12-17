import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    try {
        const logPath = path.join(process.cwd(), 'debug_party.txt');
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] POST Party. Session: ${JSON.stringify(session)}\n`);
    } catch { }

    if (!session || ((session.user as any).role !== 'DISTRIBUTOR' && (session.user as any).role !== 'SALESMAN')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const { name, ownerName, phoneNumber, address } = await req.json();

        if (!name || !ownerName || !phoneNumber || !address) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const party = await prisma.party.create({
            data: {
                name,
                ownerName,
                phoneNumber,
                address
            }
        });

        return NextResponse.json(party);
    } catch (error) {
        try {
            const logPath = path.join(process.cwd(), 'debug_party.txt');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] POST Error: ${error}\n`);
        } catch { }
        return NextResponse.json({ error: "Failed to create party" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const parties = await prisma.party.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(parties);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch parties" }, { status: 500 });
    }
}

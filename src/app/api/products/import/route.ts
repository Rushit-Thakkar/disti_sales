import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import * as XLSX from 'xlsx';


export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'DISTRIBUTOR') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        // const companyId = formData.get('companyId') as string; // Removed as per instruction

        if (!file) {
            return NextResponse.json({ error: "File required" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const data: any[] = XLSX.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            return NextResponse.json({ error: "No data found in file" }, { status: 400 });
        }

        // 1. Extract unique company names
        const companyNames = new Set<string>();
        data.forEach(row => {
            const cName = row['Company Name'] || row['Company'] || row['company'];
            if (cName) companyNames.add(String(cName).trim());
        });

        if (companyNames.size === 0) {
            return NextResponse.json({ error: "Column 'Company Name' is missing or empty." }, { status: 400 });
        }

        // 2. Fetch existing companies
        const existingCompanies = await prisma.company.findMany({
            where: {
                name: { in: Array.from(companyNames) }
            },
            select: { id: true, name: true }
        });

        const companyMap = new Map(existingCompanies.map(c => [c.name.toLowerCase(), c.id]));

        // 3. Map products to IDs
        const productsToCreate: any[] = [];
        const skippedRows: any[] = [];

        data.forEach(row => {
            const name = row.Name || row.name || row.ProductName || row['Product Name'];
            const price = Number(row.Price || row.price || 0);
            const cName = row['Company Name'] || row['Company'] || row['company'];

            if (name && !isNaN(price) && cName) {
                const companyId = companyMap.get(String(cName).trim().toLowerCase());
                if (companyId) {
                    productsToCreate.push({
                        name,
                        price,
                        companyId
                    });
                } else {
                    skippedRows.push({ name, reason: `Company '${cName}' not found` });
                }
            }
        });

        if (productsToCreate.length === 0) {
            return NextResponse.json({
                error: "No valid products found. check 'Company Name' matches exactly.",
                skipped: skippedRows
            }, { status: 400 });
        }

        // Batch insert
        await prisma.product.createMany({
            data: productsToCreate
        });

        return NextResponse.json({
            success: true,
            count: productsToCreate.length,
            message: `Successfully imported ${productsToCreate.length} products. ${skippedRows.length > 0 ? `(${skippedRows.length} skipped)` : ''}`,
            skipped: skippedRows
        });

    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
    }
}

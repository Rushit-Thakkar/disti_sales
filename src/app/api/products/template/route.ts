import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
    try {
        // Create a sample worksheet
        const data = [
            { "Name": "Sample Product 1", "Price": 100, "Company Name": "Tech Corp" },
            { "Name": "Sample Product 2", "Price": 250.50, "Company Name": "Gadget Inc" },
            { "Name": "Widget A", "Price": 99.99, "Company Name": "Tech Corp" }
        ];

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

        // Generate buffer
        const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        // Return as download
        return new NextResponse(buf, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="product_import_template.xlsx"',
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate template" }, { status: 500 });
    }
}

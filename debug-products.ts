import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            include: {
                company: true,
            },
        });

        console.log(`Found ${products.length} products.`);
        products.forEach(p => {
            console.log(`Product: ${p.name}, Company: ${p.company ? p.company.name : 'NULL'}, CompanyID: ${p.companyId}`);
            if (!p.company) {
                console.error(`ERROR: Product ${p.id} has no company! Linked CompanyID: ${p.companyId}`);
            }
        });

        const companies = await prisma.company.findMany();
        console.log(`\nFound ${companies.length} companies:`);
        companies.forEach(c => console.log(`- ${c.name} (${c.id})`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

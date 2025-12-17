import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await hash('admin123', 10);

    const distributor = await prisma.user.upsert({
        where: { email: 'admin@disti.com' },
        update: {},
        create: {
            email: 'admin@disti.com',
            name: 'Main Distributor',
            password,
            role: 'DISTRIBUTOR',
        },
    });

    // Create a default company
    const companyA = await prisma.company.upsert({
        where: { name: 'Company A' },
        update: {},
        create: { name: 'Company A' }
    });

    const companyB = await prisma.company.upsert({
        where: { name: 'Company B' },
        update: {},
        create: { name: 'Company B' }
    });

    console.log({ distributor, companyA, companyB });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

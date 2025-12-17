import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@disti.com';
    const password = 'admin123';

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.log("User NOT found");
        return;
    }

    console.log("User found:", user.email);
    console.log("Stored Hash:", user.password);

    // Test comparison
    const isValid = await compare(password, user.password);
    console.log("Password 'admin123' valid?", isValid);

    // Debug: Generate new hash to see if it looks different
    const newHash = await hash(password, 10);
    console.log("New Hash for 'admin123':", newHash);
    const isNewHashValid = await compare(password, newHash);
    console.log("New Hash valid?", isNewHashValid);
}

main().then(() => prisma.$disconnect());

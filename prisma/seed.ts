/**
 * Seeds the fixed demo account (see package.json → prisma.seed).
 * Run: npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedDemoDataForUser } from "../src/services/seed-demo.service";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
const DEMO_EMAIL = "demo@pocketledger.com";
const DEMO_PASSWORD = "Demo123!";

async function main() {
  const email = DEMO_EMAIL.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: "Demo User",
      },
    });
    console.log("Created demo user:", email);
  } else {
    console.log("Demo user already present:", email);
  }

  await seedDemoDataForUser(user.id);
  console.log("Demo categories & transactions applied (skipped if already seeded).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

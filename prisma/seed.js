import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding admin user...");

  const password = "Admin123!";
  const hashedPassword = await hash(password, 10);

  const admin = await db.user.upsert({
    where: { email: "admin@nextpath.com" },
    update: {},
    create: {
      name: "LeanGroup Admin",
      email: "admin@leangroup.com",
      password: hashedPassword,
      role: "ADMIN",
      balance: 0
    },
  });

  console.log("✅ Admin created:", admin.email);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

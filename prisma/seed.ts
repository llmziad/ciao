import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_SUPERADMIN_EMAIL || "admin@icao.local").toLowerCase();
  const password = process.env.SEED_SUPERADMIN_PASSWORD || "ChangeMe!2026";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN", status: "ACTIVE", passwordHash },
    create: { email, passwordHash, role: "SUPER_ADMIN", status: "ACTIVE" },
  });

  // Super admins are administrators only — no profile. Remove one if it exists.
  await prisma.profile.deleteMany({ where: { userId: user.id } });

  console.log("\n✅ Seeded super admin (administrator only, no profile):");
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log("   (change these via SEED_SUPERADMIN_* env vars)\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

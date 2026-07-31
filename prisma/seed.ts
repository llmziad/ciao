import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Base-58 slug (mirrors src/lib/slug.ts) — seed is standalone.
const ALPHABET = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
function randomSlug(len = 8): string {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

async function main() {
  const email = (process.env.SEED_SUPERADMIN_EMAIL || "admin@icao.local").toLowerCase();
  const password = process.env.SEED_SUPERADMIN_PASSWORD || "ChangeMe!2026";
  const name = process.env.SEED_SUPERADMIN_NAME || "ICAO Super Admin";

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN", status: "ACTIVE", passwordHash },
    create: {
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      profile: {
        create: {
          slug: randomSlug(),
          name,
          title: "Super Administrator",
        },
      },
    },
    include: { profile: true },
  });

  // Ensure a profile exists even if the user pre-existed without one.
  if (!user.profile) {
    await prisma.profile.create({
      data: { userId: user.id, slug: randomSlug(), name, title: "Super Administrator" },
    });
  }

  // Populate demo fields so the public page showcases every section.
  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      title: "Chief, Aviation Security & Facilitation",
      phone: "+1 514-954-8219",
      address: "999 Robert-Bourassa Blvd, Montréal, QC H3C 5H7, Canada",
      socialTwitter: "https://x.com/ICAO",
      socialLinkedin: "https://www.linkedin.com/company/icao",
      socialFacebook: "https://www.facebook.com/ICAO",
      socialInstagram: "https://www.instagram.com/icao",
    },
  });

  console.log("\n✅ Seeded super admin:");
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

import { PrismaClient } from "@prisma/client";
import { mountainHouseProfile } from "../lib/profile";
const db = new PrismaClient();
async function main() {
  await db.searchProfile.upsert({
    where: { id: "mountain-house" },
    update: {},
    create: {
      id: "mountain-house",
      name: "Mountain House",
      criteria: mountainHouseProfile,
    },
  });
  console.log("House Hunter bootstrap complete");
}
main().finally(() => db.$disconnect());

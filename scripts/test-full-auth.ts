import { prisma } from "../src/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  verifySessionToken,
  registerSchema,
  loginSchema,
} from "../src/lib/auth";

async function testFullAuth() {
  console.log("=== Testing ShopSphere Complete Authentication & Database Integration ===");

  const testEmail = `auth_test_${Date.now()}@shopsphere.example`;
  const rawPassword = "StrongPassword2026!";

  // 1. Test Schema Validation
  console.log("\n1. Testing input validation schemas...");
  const validReg = registerSchema.safeParse({
    name: "Aarav Patel",
    email: testEmail,
    password: rawPassword,
  });
  if (!validReg.success) throw new Error("Registration schema failed valid input");
  console.log("  [PASS] Registration schema validated successfully");

  const validLogin = loginSchema.safeParse({
    email: testEmail,
    password: rawPassword,
  });
  if (!validLogin.success) throw new Error("Login schema failed valid input");
  console.log("  [PASS] Login schema validated successfully");

  // 2. Test Password Hashing
  console.log("\n2. Testing password hashing & verification...");
  const hashedPassword = await hashPassword(rawPassword);
  const isValidPass = await verifyPassword(rawPassword, hashedPassword);
  const isInvalidPass = await verifyPassword("WrongPassword123!", hashedPassword);
  if (!isValidPass || isInvalidPass) throw new Error("Password verification logic failed");
  console.log("  [PASS] Bcrypt password hashing & comparison verified");

  // 3. Test Database User Creation (Supabase PostgreSQL via Prisma)
  console.log("\n3. Testing PostgreSQL User Creation via Prisma...");
  const createdUser = await prisma.user.create({
    data: {
      name: "Aarav Patel",
      email: testEmail,
      passwordHash: hashedPassword,
      role: "CUSTOMER",
    },
  });
  console.log(`  [PASS] Customer user persisted in database. ID: ${createdUser.id}`);

  // 4. Test Database User Lookup & Password Check
  console.log("\n4. Testing user retrieval and credential validation...");
  const fetchedUser = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  if (!fetchedUser) throw new Error("User could not be retrieved from database");
  const loginMatch = await verifyPassword(rawPassword, fetchedUser.passwordHash);
  if (!loginMatch) throw new Error("Database stored password hash does not match");
  console.log("  [PASS] Retrieved user and authenticated password from database");

  // 5. Test JWT Session Signing and Verification (Jose)
  console.log("\n5. Testing JWT session token generation & verification...");
  const sessionToken = await signSessionToken({
    userId: fetchedUser.id,
    email: fetchedUser.email,
    name: fetchedUser.name,
    role: fetchedUser.role,
  });
  const decodedSession = await verifySessionToken(sessionToken);
  if (!decodedSession || decodedSession.userId !== fetchedUser.id) {
    throw new Error("Session verification failed");
  }
  console.log(`  [PASS] Session token verified for user: ${decodedSession.name} (${decodedSession.email})`);

  // 6. Cleanup
  console.log("\n6. Cleaning up test user...");
  await prisma.user.delete({ where: { id: createdUser.id } });
  console.log("  [PASS] Test user cleaned up cleanly");

  console.log("\n>>> ALL AUTHENTICATION & DATABASE CHECKS PASSED WITH ZERO ERRORS! <<<");
  await prisma.$disconnect();
}

testFullAuth().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

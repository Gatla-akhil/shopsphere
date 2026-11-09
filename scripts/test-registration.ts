import { prisma } from "../src/lib/prisma";
import { registerSchema, hashPassword, verifyPassword } from "../src/lib/auth";

async function runTests() {
  console.log("=== Testing Step 5 & 6: Customer Registration & Password Hashing ===");

  // 1. Test Input Validation with Zod Schema
  console.log("\n1. Testing Input Validation...");
  const invalidCases = [
    { name: "A", email: "bademail", password: "short" },
    { name: "", email: "user@test.com", password: "Password123" },
    { name: "Valid User", email: "user@test.com", password: "onlyletters" },
    { name: "Valid User", email: "user@test.com", password: "12345678" },
  ];

  for (const tc of invalidCases) {
    const res = registerSchema.safeParse(tc);
    if (!res.success) {
      console.log(`  [PASS] Rejected invalid input: ${JSON.stringify(tc)} -> ${res.error.issues[0]?.message}`);
    } else {
      console.error(`  [FAIL] Failed to reject invalid input: ${JSON.stringify(tc)}`);
      process.exit(1);
    }
  }

  // 2. Test Secure Password Hashing
  console.log("\n2. Testing Secure Password Hashing...");
  const testPassword = "SecurePassword123!";
  const hash = await hashPassword(testPassword);
  console.log(`  Hashed password: ${hash}`);
  if (!hash.startsWith("$2a$") && !hash.startsWith("$2b$")) {
    console.error("  [FAIL] Password hash does not appear to be a valid bcrypt hash!");
    process.exit(1);
  }
  const isMatch = await verifyPassword(testPassword, hash);
  const isWrongMatch = await verifyPassword("WrongPassword123!", hash);
  if (isMatch && !isWrongMatch) {
    console.log("  [PASS] Bcrypt password hashing and verification passed!");
  } else {
    console.error("  [FAIL] Password verification failed!");
    process.exit(1);
  }

  // 3. Test Database User Creation & Unique Email Constraint
  console.log("\n3. Testing Database Customer Creation via Prisma...");
  const testEmail = `testcustomer_${Date.now()}@shopsphere.example`;
  try {
    const createdUser = await prisma.user.create({
      data: {
        name: "Test Customer",
        email: testEmail,
        passwordHash: hash,
        role: "CUSTOMER",
      },
    });
    console.log(`  [PASS] Customer user created in PostgreSQL with ID: ${createdUser.id}, role: ${createdUser.role}`);

    // Test duplicate email rejection
    let duplicateRejected = false;
    try {
      await prisma.user.create({
        data: {
          name: "Duplicate User",
          email: testEmail,
          passwordHash: hash,
        },
      });
    } catch (e: any) {
      if (e.code === "P2002") {
        duplicateRejected = true;
        console.log("  [PASS] Duplicate email constraint P2002 successfully triggered!");
      }
    }
    if (!duplicateRejected) {
      console.error("  [FAIL] Duplicate email was not rejected by database!");
      process.exit(1);
    }

    // Clean up test user
    await prisma.user.delete({ where: { id: createdUser.id } });
    console.log("  [PASS] Test customer cleaned up successfully.");
  } catch (err: any) {
    console.error("  [FAIL] Database operation failed:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log("\nAll Customer Registration & Password Hashing checks PASSED!");
}

runTests();


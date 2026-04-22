import bcrypt from "bcryptjs";

const plain = process.argv[2];
if (!plain) {
  console.error("Usage: node scripts/hash-password.mjs <plain_password>");
  process.exit(1);
}

const hash = await bcrypt.hash(plain, 12);
console.log(hash);

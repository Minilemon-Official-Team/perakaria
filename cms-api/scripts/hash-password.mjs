import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";

const password = process.argv[2];
const email = process.argv[3];

if (!password || !email) {
  console.error(
    "Usage: npm run hash-password --workspace cms-api -- <password> <email>",
  );
  process.exit(1);
}

const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, 100_000, 32, "sha256");

console.log(
  JSON.stringify(
    {
      id: randomUUID(),
      email: email.toLowerCase(),
      password_hash: hash.toString("base64"),
      password_salt: salt.toString("base64"),
      role: "superadmin",
    },
    null,
    2,
  ),
);

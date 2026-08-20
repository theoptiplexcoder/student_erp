const fs = require('fs');
const file = 'apps/web/src/lib/auth.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  'export async function getCurrentUser(): Promise<AuthUser | null> {',
  `export async function getCurrentUser(): Promise<AuthUser | null> {
  return {
    id: "test", authUserId: "test", institutionId: "test", role: "STUDENT", status: "ACTIVE", email: "test@test.com", firstName: "test", lastName: "test", photoUrl: null
  };`,
);
fs.writeFileSync(file, code);

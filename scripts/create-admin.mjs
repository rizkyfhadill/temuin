// ============================================================
// Temuin - Create / promote an Admin account
// Uses the SUPABASE SERVICE ROLE key (server-only) so it can
// create users and flip their role to "admin" in the DB.
//
// Usage:
//   node scripts/create-admin.mjs                 # uses defaults below
//   node scripts/create-admin.mjs you@email.com  # custom email (random pw)
//   node scripts/create-admin.mjs you@email.com StrongPass123!
//
// Env (reads .env.local automatically, or set them in the shell):
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- load .env.local if present ---
function loadEnv() {
  try {
    const txt = readFileSync(".env.local", "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const k = m[1];
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* ignore */
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("   Copy .env.local.example → .env.local and fill them in, then re-run.");
  process.exit(1);
}

const adminEmail = process.argv[2] || "admin@temuin.id";
// Generate a memorable-but-strong default password if not supplied.
const adminPassword =
  process.argv[3] ||
  `Temuin${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.floor(Math.random() * 9000 + 1000)}!`;
const adminUsername = "admin";

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  // Find existing user by email.
  let userId = null;
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("❌ Failed to list users:", listErr.message);
    process.exit(1);
  }
  const existing = (list.users || []).find((u) => u.email === adminEmail);

  if (existing) {
    userId = existing.id;
    console.log(`ℹ️  User ${adminEmail} already exists — promoting to admin.`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // skip email confirmation for the admin
      user_metadata: { username: adminUsername, full_name: "Temuin Admin" },
    });
    if (error) {
      console.error("❌ Failed to create user:", error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`✅ Created user ${adminEmail}.`);
  }

  // Promote to admin + verify.
  const { error: upErr } = await supabase
    .from("profiles")
    .update({ role: "admin", verified: true })
    .eq("id", userId);
  if (upErr) {
    console.error("❌ Failed to set admin role:", upErr.message);
    process.exit(1);
  }

  console.log("\n=============================================");
  console.log("✅ Admin account ready!");
  console.log(`   Email:    ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log("   Login at: /login  →  /admin");
  console.log("=============================================\n");
  console.log("(Save this password somewhere safe. You can change it later in Pengaturan.)");
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});

#!/usr/bin/env node
// ============================================================
// Temuin - Sync Profile Data
// Ensures all auth users have profiles with username/full_name
// Uses the SUPABASE SERVICE ROLE key (server-only).
//
// Usage:
//   node scripts/sync-profiles.mjs
//
// Env (.env.local):
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ============================================================
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

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
  console.error("   Copy .env.local.example → .env.local and fill them in.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🔍 Fetching all auth users...");
  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error("❌ Failed to list users:", usersErr.message);
    process.exit(1);
  }

  console.log(`📊 Found ${users.users.length} users in auth.`);

  // Fetch all existing profiles
  const { data: profiles, error: profilesErr } = await supabase
    .from("profiles")
    .select("id, username, full_name");
  if (profilesErr) {
    console.error("❌ Failed to fetch profiles:", profilesErr.message);
    process.exit(1);
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));
  let created = 0;
  let updated = 0;

  for (const user of users.users) {
    const existing = profileMap.get(user.id);
    const metadata = user.user_metadata || {};
    const email = user.email || "";

    // Generate username from metadata or email
    let username =
      metadata.username ||
      email.split("@")[0] ||
      `user_${user.id.slice(0, 8)}`;
    
    const fullName = metadata.full_name || metadata.name || "";
    const city = metadata.city || "";

    if (!existing) {
      // Create profile
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        username,
        full_name: fullName,
        city,
        role: "user",
        points: 0,
      });
      if (error) {
        console.warn(`  ⚠️  Failed to create profile for ${user.id}: ${error.message}`);
      } else {
        console.log(`  ✅ Created profile for ${email}`);
        created++;
      }
    } else if (!existing.username || (!existing.full_name && fullName)) {
      // Update profile if username missing or full_name empty but we have it
      const updates = {};
      if (!existing.username) updates.username = username;
      if (!existing.full_name && fullName) updates.full_name = fullName;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", user.id);
        if (error) {
          console.warn(
            `  ⚠️  Failed to update profile for ${user.id}: ${error.message}`
          );
        } else {
          console.log(
            `  ✅ Updated profile for ${email} - ${Object.keys(updates).join(", ")}`
          );
          updated++;
        }
      }
    }
  }

  console.log("\n=============================================");
  console.log(`✅ Sync complete!`);
  console.log(`   Created: ${created} profiles`);
  console.log(`   Updated: ${updated} profiles`);
  console.log("=============================================\n");
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});

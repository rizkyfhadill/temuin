#!/usr/bin/env node
// Force create profiles for all auth users from their metadata
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
  console.error("❌ Missing env vars");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log(`📊 Creating profiles for ${users.users.length} auth users...\n`);

  let created = 0;

  for (const user of users.users) {
    const meta = user.user_metadata || {};
    const username = meta.username || user.email.split("@")[0];
    const fullName = meta.full_name || meta.name || "";
    const city = meta.city || "";

    const { error } = await supabase.from("profiles").insert(
      {
        id: user.id,
        username,
        full_name: fullName,
        city,
        role: "user",
        points: 0,
      },
      { onConflict: "id" }
    );

    if (error && error.code === "23505") {
      console.log(`  ⏭️  Profile already exists for ${user.email}`);
    } else if (error) {
      console.log(`  ❌ Error for ${user.email}: ${error.message}`);
    } else {
      console.log(`  ✅ Created profile for ${user.email}`);
      console.log(`     username: "${username}", full_name: "${fullName}"`);
      created++;
    }
  }

  console.log(`\n✅ Done! Created ${created} profiles`);
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});

#!/usr/bin/env node
// Check profile status in database
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
  // Get users
  const { data: users } = await supabase.auth.admin.listUsers();
  console.log("Auth users:");
  users.users.forEach((u) => {
    console.log(`  ${u.id.slice(0, 8)}... - ${u.email} (metadata: ${JSON.stringify(u.user_metadata)})`);
  });

  // Get profiles with service role (bypass RLS)
  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .order("created_at", { ascending: false });
  
  if (profileErr) {
    console.log(`\nProfiles error: ${profileErr.message}`);
  }
  console.log("\nProfiles:");
  if (profiles && profiles.length > 0) {
    profiles.forEach((p) => {
      console.log(`  ${p.id.slice(0, 8)}... - username: "${p.username}", full_name: "${p.full_name}"`);
    });
  } else {
    console.log("  ❌ No profiles found!");
  }

  // Check comments with author
  const { data: comments } = await supabase
    .from("comments")
    .select("id, user_id, body, author:profiles(id, username, full_name)")
    .limit(5);

  console.log("\nLatest comments:");
  comments.forEach((c) => {
    console.log(`  ${c.user_id.slice(0, 8)}... - author: ${c.author ? `${c.author.username}/${c.author.full_name}` : "NULL"}`);
    console.log(`    "${c.body.slice(0, 50)}..."`);
  });
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});

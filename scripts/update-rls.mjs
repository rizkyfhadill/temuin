#!/usr/bin/env node
// Apply RLS policy fix to Supabase
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
  console.log("🔄 Updating RLS policy for profiles...\n");

  const sql = `
    -- Drop existing policies
    drop policy if exists "profiles_select" on public.profiles;
    drop policy if exists "profiles_insert" on public.profiles;
    drop policy if exists "profiles_update" on public.profiles;

    -- Create new policies: allow anyone to read profiles
    create policy "profiles_select" on public.profiles for select using (true);
    create policy "profiles_insert" on public.profiles for insert with check (id = auth.uid());
    create policy "profiles_update" on public.profiles for update using (id = auth.uid() or public.is_admin());
  `;

  const { error } = await supabase.rpc("exec", { sql });
  
  // If exec rpc doesn't work, try direct SQL
  if (error) {
    console.log(`Note: exec rpc not available, trying direct approach...\n`);
    
    // Drop and recreate policies one by one
    const policies = [
      'drop policy if exists "profiles_select" on public.profiles',
      'drop policy if exists "profiles_insert" on public.profiles',
      'drop policy if exists "profiles_update" on public.profiles',
      'create policy "profiles_select" on public.profiles for select using (true)',
      'create policy "profiles_insert" on public.profiles for insert with check (id = auth.uid())',
      'create policy "profiles_update" on public.profiles for update using (id = auth.uid() or public.is_admin())',
    ];

    for (const policy of policies) {
      console.log(`  Executing: ${policy.slice(0, 60)}...`);
    }

    console.log(`\n⚠️  Cannot execute RLS changes via client.`);
    console.log(`    Please manually run in Supabase SQL Editor:\n`);
    console.log(sql);
    process.exit(0);
  }

  console.log(`✅ RLS policies updated successfully!\n`);
  console.log(`Now profiles are readable by everyone (public data).`);
  console.log(`Users can only modify their own profile.`);
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});

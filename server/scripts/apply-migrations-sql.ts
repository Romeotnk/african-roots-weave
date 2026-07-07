import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const migrationsDir = join(process.cwd(), "prisma", "migrations");

function splitSql(sql: string) {
  const statements: string[] = [];
  let current = "";
  let singleQuote = false;
  let doubleQuote = false;
  let dollarTag: string | null = null;
  let lineComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];
    current += char;

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (!singleQuote && !doubleQuote && !dollarTag && char === "-" && next === "-") {
      lineComment = true;
      current += next;
      index += 1;
      continue;
    }

    if (!singleQuote && !doubleQuote && char === "$") {
      const rest = sql.slice(index);
      const match = rest.match(/^\$[A-Za-z0-9_]*\$/);
      if (match) {
        const tag = match[0];
        if (!dollarTag) {
          dollarTag = tag;
          current += tag.slice(1);
          index += tag.length - 1;
          continue;
        }
        if (dollarTag === tag) {
          dollarTag = null;
          current += tag.slice(1);
          index += tag.length - 1;
          continue;
        }
      }
    }

    if (dollarTag) continue;

    if (!doubleQuote && char === "'" && sql[index - 1] !== "\\") {
      singleQuote = !singleQuote;
      continue;
    }

    if (!singleQuote && char === '"') {
      doubleQuote = !doubleQuote;
      continue;
    }

    if (!singleQuote && !doubleQuote && char === ";") {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
    }
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

async function ensureMigrationTable() {
  await prisma.$executeRawUnsafe(`
    create table if not exists "_prisma_migrations" (
      id varchar(36) primary key,
      checksum varchar(64) not null,
      finished_at timestamptz,
      migration_name varchar(255) not null,
      logs text,
      rolled_back_at timestamptz,
      started_at timestamptz not null default now(),
      applied_steps_count integer not null default 0
    )
  `);
}

async function appliedMigrationNames() {
  const rows = await prisma.$queryRaw<{ migration_name: string }[]>`
    select migration_name from "_prisma_migrations"
  `;
  return new Set(rows.map((row) => row.migration_name));
}

try {
  await ensureMigrationTable();
  const applied = await appliedMigrationNames();
  const names = (await readdir(migrationsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const name of names) {
    if (applied.has(name)) {
      console.log(`skip ${name}`);
      continue;
    }

    const migrationPath = join(migrationsDir, name, "migration.sql");
    const sql = await readFile(migrationPath, "utf8");
    const statements = splitSql(sql);
    const startedAt = new Date();

    console.log(`apply ${name} (${statements.length} statements)`);
    let appliedSteps = 0;
    for (const statement of statements) {
      await prisma.$executeRawUnsafe(statement);
      appliedSteps += 1;
    }

    const finishedAt = new Date();
    const checksum = createHash("sha256").update(sql).digest("hex");
    await prisma.$executeRaw`
      insert into "_prisma_migrations" (
        id,
        checksum,
        finished_at,
        migration_name,
        logs,
        rolled_back_at,
        started_at,
        applied_steps_count
      )
      values (
        ${randomUUID()},
        ${checksum},
        ${finishedAt},
        ${name},
        null,
        null,
        ${startedAt},
        ${appliedSteps}
      )
    `;
  }

  console.log("migrations sql applied");
} finally {
  await prisma.$disconnect();
}

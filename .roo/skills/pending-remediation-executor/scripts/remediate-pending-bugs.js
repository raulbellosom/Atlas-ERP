#!/usr/bin/env node
/**
 * RemediatePendingBugs.js
 *
 * Idempotent script to process pending remediation bugs from the matrix.
 * Reads the CSV, checks current status, and processes each bug.
 *
 * Usage: node scripts/remediate-pending-bugs.js [--bug=T-0619]
 */

import { readFileSync } from 'node:fs';
import { parse } from 'node:csv';

const CSV_PATH = 'docs/07-dev-workflow/pending-remediation-matrix.csv';
const STATUS_COL = 16; // status column index (0-based)
const TASK_ID_COL = 0; // task_id column index
const LAST_UPDATED_COL = 15; // last_updated column index

/**
 * Parse CSV file and return rows
 */
function parseCSV(filepath) {
  const content = readFileSync(filepath, 'utf-8');
  // Remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent.split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    // Simple CSV parsing - handles quoted fields
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Main remediation processor
 */
async function main() {
  const args = process.argv.slice(2);
  const targetBug = args.find((arg) => arg.startsWith('--bug='))?.split('=')[1];

  console.log('🔧 Pending Remediation Executor');
  console.log('================================');

  const rows = parseCSV(CSV_PATH);

  if (targetBug) {
    const bug = rows.find((r) => r.task_id === targetBug);
    if (!bug) {
      console.error(`❌ Bug ${targetBug} not found in matrix`);
      process.exit(1);
    }
    console.log(`\n📋 Processing: ${bug.task_id} - ${bug.title}`);
    console.log(`   Status: ${bug.status}`);
    console.log(`   Phase: ${bug.phase}`);
    console.log(`   Block: ${bug.block}`);
    console.log(`   Owner: ${bug.owner}`);
    console.log(`   Risk: ${bug.risk}`);
    console.log(`   Objective: ${bug.objective}`);
    console.log(`   Proposed action: ${bug.proposed_action}`);
    console.log(`   Dependencies: ${bug.dependency}`);

    if (bug.status === 'CLOSED') {
      console.log('\n✅ Bug already closed - skipping');
    } else {
      console.log('\n⚠️  Bug is OPEN/IN_PROGRESS - fix implementation needed');
    }
  } else {
    console.log('\n📊 Pending Bugs Summary:');
    console.log('------------------------');

    const security = rows.filter((r) => r.current_doc_status !== 'CLOSED' && r.status === 'OPEN');
    const auth = rows.filter((r) => r.task_id.startsWith('T-06'));
    const foundation = rows.filter((r) => r.task_id.startsWith('T-08'));

    console.log(`\nTotal OPEN bugs: ${rows.filter((r) => r.status === 'OPEN').length}`);
    console.log(`Total CLOSED bugs: ${rows.filter((r) => r.status === 'CLOSED').length}`);
    console.log(`Total IN_PROGRESS bugs: ${rows.filter((r) => r.status === 'IN_PROGRESS').length}`);

    console.log('\n📋 By Category:');
    console.log(
      '- Security/Platform hardening: ' +
        rows.filter((r) => r.task_id.startsWith('T-06') && parseInt(r.task_id.slice(-3)) >= 32)
          .length,
    );
    console.log(
      '- Auth/Scope/Data correctness: ' +
        rows.filter((r) => r.task_id.startsWith('T-06') && parseInt(r.task_id.slice(-3)) < 32)
          .length,
    );
    console.log(
      '- Foundation consistency/UX debt: ' +
        rows.filter((r) => r.task_id.startsWith('T-08')).length,
    );
  }

  console.log('\n📁 Execution order (from remediation-master.md):');
  console.log(
    '1. Security: T-0632, T-0633, T-0634, T-0905, T-0908, T-0910, T-0914, T-0916, T-0917, T-0722',
  );
  console.log('2. Auth: T-0625, T-0706, T-1019');
  console.log('3. Foundation: T-0619, T-0628, T-0629, T-0814');

  console.log('\n✅ Script completed. Implement fixes following SKILL.md workflow.');
}

main().catch(console.error);

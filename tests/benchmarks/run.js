#!/usr/bin/env node
/**
 * Agent Mind - Benchmark Runner
 *
 * Runs all benchmark test files and prints a structured summary.
 *
 * Usage:
 *   npm run test:benchmarks                  # run structure/methodology tests only
 *   RUN_LLM_BENCHMARKS=true npm run test:benchmarks  # also execute LLM calls
 *
 * What this runs:
 *   - tests/benchmarks/*.test.js files
 *   - These are NOT unit tests — they document expected LLM behavior
 *   - The methodology tests (no LLM) verify the benchmark structure itself
 *   - The LLM tests (when enabled) measure actual agent protocol adherence
 */

const { run } = require('node:test');
const { spec } = require('node:test/reporters');
const path = require('path');
const fs = require('fs');

const benchmarksDir = path.join(__dirname);
const testFiles = fs
  .readdirSync(benchmarksDir)
  .filter(f => f.endsWith('.test.js'))
  .map(f => path.join(benchmarksDir, f));

if (testFiles.length === 0) {
  console.error('No benchmark test files found in tests/benchmarks/');
  process.exit(1);
}

const isLLMMode = process.env.RUN_LLM_BENCHMARKS === 'true';

console.log('');
console.log('Agent Mind — Benchmark Runner');
console.log('─'.repeat(50));
console.log(`Mode: ${isLLMMode ? 'LLM execution (live)' : 'Methodology only (no LLM calls)'}`);
if (!isLLMMode) {
  console.log('Tip:  Set RUN_LLM_BENCHMARKS=true to run against a real LLM');
}
console.log(`Files: ${testFiles.map(f => path.basename(f)).join(', ')}`);
console.log('─'.repeat(50));
console.log('');

const stream = run({ files: testFiles });
stream.compose(spec()).pipe(process.stdout);

stream.on('test:fail', () => {
  process.exitCode = 1;
});

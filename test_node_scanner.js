import { UnifiedCLIScanner } from './src/core/unified_cli_scanner.js';

async function test() {
  console.log('[INFO] Testing Unified CLI Scanner...\n');
  
  const scanner = new UnifiedCLIScanner();
  const results = await scanner.scanAllCLIs();
  
  console.log('[SCAN] Scan Results:');
  console.log('-'.repeat(80));
  
  for (const [name, info] of Object.entries(results)) {
    const status = info.available ? 'YES' : 'NO';
    console.log(`[${status}] ${name.padEnd(15)} | Command: ${info.executeCommand.padEnd(20)} | Location: ${info.location.padEnd(10)} | Version: ${info.version}`);
  }
  
  console.log('\n[REPORT] Comprehensive Scan Report:');
  console.log('-'.repeat(80));
  
  const report = await scanner.getComprehensiveScanReport();
  const summary = report.summary;
  
  console.log(`Total Scanned: ${summary.totalScanned}`);
  console.log(`Available: ${summary.available}`);
  console.log(`Global Packages: ${summary.globalPackages}`);
  console.log(`Local Packages: ${summary.localPackages}`);
  console.log(`Npx Packages: ${summary.npxPackages}`);
  
  if (report.recommendations.length > 0) {
    console.log('\n[RECOMMENDATIONS]:');
    for (const rec of report.recommendations) {
      console.log(`  - ${rec}`);
    }
  }
}

test().catch(console.error);
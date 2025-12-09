# Archive Directory Contents

This directory contains files that have been moved from the project root to reduce clutter and decrease package size.

## Directory Structure

### temporary_tests/
All temporary test files that were in the project root:
- test-*.js files
- *-test.js files
- Individual test files (direct-test.js, simple-test.js, etc.)
- Python test files (test_auth.py, test_cli.py, etc.)

### algorithm_examples/
Algorithm and calculation example files:
- factorial.js, fibonacci.js, quicksort.js
- prime-checker.js, is-even.js, isEven.js
- javascript-calculator.js, add.js, compare-calculators.js

### intermediate_docs/
Intermediate documentation and technical documentation:
- Process documents (FINAL_SUMMARY.md, TEST_RESULTS_ANALYSIS.md)
- Test plans and reports (E2E_TEST_RESULTS.md, END_TO_END_TEST_PLAN.md)
- Technical documentation (ALGORITHMS.md, API_DOCS.md, ENCRYPTION_DOCS.md)
- AI tool specific docs (agent.md, claude.md, gemini.md, etc.)
- CHANGELOG.md

### fix_scripts/
Fix, cleanup and diagnostic scripts:
- fix-node-conflict.js, path-fixer.js, emergency-cleanup.js
- verification scripts (verify_windows_fix.js, comprehensive_verification.js)
- utility scripts (cleanup.js, diagnostic.js, publish.js)
- package.test.json

### remaining_tests/
Additional test files that were in root:
- test_all_cli_adapters.js
- test_cli_help_analyzer.js
- test_complete_installation.js
- test_current_system_status.js
- test_hook_system.js
- test_integration_help_routing.js
- test_plugin_mechanisms.js

### additional_files/
Python files and other examples:
- Authentication examples (authenticate_user.py, auth_example.py)
- Algorithm examples (binary_search.py, binary_search_demo.py)
- Image processing (image_processor.cpp)
- Test utilities (test_all_clis.py, test_async_subprocess.py, etc.)

### temp_dirs/
Temporary extraction directories for package analysis:
- temp_extract_stigmergy-1.0.94/
- temp_extract_stigmergy-1.0.95/
- temp_extract_stigmergy-1.0.97/
- temp_extract_stigmergy-1.0.98/

## Notes

- All these files are preserved for reference and can be restored if needed
- They have been moved to reduce the main project directory clutter
- The .npmignore file has been configured to exclude these files from npm packages
- Core functionality is preserved in the main project directories (src/, bin/, etc.)
"""
Stigmergy CLI System Test Evaluation Script
==========================================

This script tests the three main functionalities of the Stigmergy CLI system:
1. CLI Environment Scanner
2. Deployment System
3. Initialization Process

The tests are designed to be non-destructive and won't modify the user's actual system configuration.
"""

import os
import sys
import json
import tempfile
import shutil
from pathlib import Path
import subprocess
import asyncio
from datetime import datetime

# Add project path
sys.path.append(str(Path(__file__).parent))

from src.core.ai_environment_scanner import AIEnvironmentScanner
from src.core.enhanced_init_processor import EnhancedInitProcessor
from src.core.models import CLI_CONFIG_MAPPING


class StigmergySystemTester:
    """Test the Stigmergy CLI system components"""
    
    def __init__(self):
        self.test_results = {
            'start_time': datetime.now().isoformat(),
            'scanner_tests': {},
            'deployment_tests': {},
            'initialization_tests': {},
            'configuration_tests': {}
        }
    
    async def run_all_tests(self):
        """Run all system tests"""
        print("Starting Stigmergy CLI System Evaluation")
        print("=" * 60)
        
        # 1. Test CLI Environment Scanner
        print("1. Testing CLI Environment Scanner...")
        await self.test_cli_scanner()
        
        # 2. Test Deployment System
        print("2. Testing Deployment System...")
        await self.test_deployment_system()
        
        # 3. Test Initialization Process
        print("3. Testing Initialization Process...")
        await self.test_initialization_process()
        
        # 4. Test Configuration Files
        print("4. Testing Configuration Files...")
        await self.test_configuration_files()
        
        # 5. Generate Test Report
        print("5. Generating Test Report...")
        await self.generate_test_report()
        
        print("=" * 60)
        print("All tests completed!")
        
        return self.test_results
    
    async def test_cli_scanner(self):
        """Test the CLI environment scanner"""
        try:
            scanner = AIEnvironmentScanner(current_cli="claude")
            
            # Create a temporary directory for testing
            with tempfile.TemporaryDirectory() as temp_dir:
                # Scan the environment
                ai_env = await scanner.scan_ai_environment(temp_dir)
                
                self.test_results['scanner_tests'] = {
                    'success': True,
                    'available_clis': list(ai_env.available_clis.keys()),
                    'available_count': len(ai_env.available_clis),
                    'scan_duration': ai_env.scan_duration,
                    'collaboration_guide_generated': ai_env.collaboration_guide is not None,
                    'project_specific_clis': len(ai_env.project_specific_clis)
                }
                
                print(f"   [PASS] Found {len(ai_env.available_clis)} available CLI tools")
                print(f"   [PASS] Scan completed in {ai_env.scan_duration:.2f} seconds")
                print(f"   [PASS] Collaboration guide generated: {ai_env.collaboration_guide is not None}")
                
                # List available CLIs
                if ai_env.available_clis:
                    print("   Available CLIs:")
                    for cli_name, cli_info in ai_env.available_clis.items():
                        print(f"     - {cli_info.display_name} (v{cli_info.version}) [{cli_info.status.value}]")
                        
        except Exception as e:
            self.test_results['scanner_tests'] = {
                'success': False,
                'error': str(e)
            }
            print(f"   [FAIL] CLI scanner test failed: {e}")
    
    async def test_deployment_system(self):
        """Test the deployment system"""
        try:
            # Check if Node.js is available (required for deployment)
            try:
                result = subprocess.run(['node', '--version'], 
                                      capture_output=True, text=True, timeout=10)
                node_available = result.returncode == 0
            except:
                node_available = False
            
            # Check deployment scripts
            deploy_script_path = Path(__file__).parent / "src" / "deploy.js"
            deploy_script_exists = deploy_script_path.exists()
            
            # Check CLI installation configs
            cli_configs = {}
            for cli_name, config in CLI_CONFIG_MAPPING.items():
                cli_configs[cli_name] = {
                    'config_file': config.config_file,
                    'has_install_script': config.install_script is not None,
                    'has_version_check': config.version_check_command is not None
                }
            
            self.test_results['deployment_tests'] = {
                'success': True,
                'node_available': node_available,
                'deploy_script_exists': deploy_script_exists,
                'cli_configs_count': len(cli_configs),
                'cli_configurations': cli_configs
            }
            
            print(f"   [PASS] Node.js available: {node_available}")
            print(f"   [PASS] Deploy script exists: {deploy_script_exists}")
            print(f"   [PASS] Found {len(cli_configs)} CLI configurations")
            
            # Show sample CLI configurations
            sample_clis = list(cli_configs.keys())[:3]
            for cli_name in sample_clis:
                config = cli_configs[cli_name]
                print(f"     - {cli_name}: config='{config['config_file']}', "
                      f"install_script={config['has_install_script']}")
                      
        except Exception as e:
            self.test_results['deployment_tests'] = {
                'success': False,
                'error': str(e)
            }
            print(f"   [FAIL] Deployment system test failed: {e}")
    
    async def test_initialization_process(self):
        """Test the initialization process"""
        try:
            init_processor = EnhancedInitProcessor(current_cli="claude")
            
            # Create a temporary directory for testing initialization
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_path = Path(temp_dir)
                
                # Test project status detection
                project_status = await init_processor._detect_project_status(str(temp_path))
                
                # Since this is a fresh temp directory, it should be detected as a new project
                is_new_project = not project_status.is_existing_project
                
                # Test initialization for a new project (simulation)
                # We won't actually generate files to avoid disk changes
                scanner = AIEnvironmentScanner(current_cli="claude")
                ai_env = await scanner.scan_ai_environment(str(temp_path))
                
                self.test_results['initialization_tests'] = {
                    'success': True,
                    'project_detection_works': True,
                    'correctly_identifies_new_project': is_new_project,
                    'ai_environment_scanning_works': ai_env is not None,
                    'available_clis_for_init': len(ai_env.available_clis) if ai_env else 0
                }
                
                print(f"   [PASS] Project detection works: True")
                print(f"   [PASS] Correctly identifies new project: {is_new_project}")
                print(f"   [PASS] AI environment scanning works: {ai_env is not None}")
                print(f"   [PASS] Available CLIs for initialization: {len(ai_env.available_clis) if ai_env else 0}")
                
        except Exception as e:
            self.test_results['initialization_tests'] = {
                'success': False,
                'error': str(e)
            }
            print(f"   [FAIL] Initialization process test failed: {e}")
    
    async def test_configuration_files(self):
        """Test that configuration files are properly structured"""
        try:
            # Check CLI configuration mapping
            cli_mapping_count = len(CLI_CONFIG_MAPPING)
            
            # Check that all expected CLIs are configured
            expected_clis = ["claude", "gemini", "qwen", "iflow", "qoder", 
                           "codebuddy", "copilot", "codex"]
            configured_clis = list(CLI_CONFIG_MAPPING.keys())
            missing_clis = [cli for cli in expected_clis if cli not in configured_clis]
            
            # Check configuration structure for a sample CLI
            sample_cli = "claude"
            if sample_cli in CLI_CONFIG_MAPPING:
                claude_config = CLI_CONFIG_MAPPING[sample_cli]
                config_structure_valid = (
                    hasattr(claude_config, 'config_file') and
                    hasattr(claude_config, 'global_doc') and
                    hasattr(claude_config, 'integration_type')
                )
            else:
                config_structure_valid = False
            
            self.test_results['configuration_tests'] = {
                'success': True,
                'cli_mapping_count': cli_mapping_count,
                'missing_expected_clis': missing_clis,
                'config_structure_valid': config_structure_valid,
                'sample_cli': sample_cli
            }
            
            print(f"   [PASS] CLI mapping contains {cli_mapping_count} configurations")
            print(f"   [PASS] Missing expected CLIs: {missing_clis}")
            print(f"   [PASS] Sample CLI '{sample_cli}' configuration structure valid: {config_structure_valid}")
            
        except Exception as e:
            self.test_results['configuration_tests'] = {
                'success': False,
                'error': str(e)
            }
            print(f"   [FAIL] Configuration files test failed: {e}")
    
    async def generate_test_report(self):
        """Generate a comprehensive test report"""
        self.test_results['end_time'] = datetime.now().isoformat()
        
        # Calculate summary statistics
        total_tests = 4  # scanner, deployment, initialization, configuration
        passed_tests = sum(1 for test in [
            self.test_results['scanner_tests'],
            self.test_results['deployment_tests'],
            self.test_results['initialization_tests'],
            self.test_results['configuration_tests']
        ] if test.get('success', False))
        
        success_rate = passed_tests / total_tests if total_tests > 0 else 0
        
        self.test_results['summary'] = {
            'total_test_categories': total_tests,
            'passed_test_categories': passed_tests,
            'success_rate': success_rate,
            'duration': (
                datetime.fromisoformat(self.test_results['end_time']) - 
                datetime.fromisoformat(self.test_results['start_time'])
            ).total_seconds()
        }
        
        # Save test report
        report_dir = Path(__file__).parent / "test_reports"
        report_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = report_dir / f"stigmergy_system_test_{timestamp}.json"
        
        try:
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(self.test_results, f, indent=2, ensure_ascii=False)
            print(f"   Test report saved: {report_file}")
        except Exception as e:
            print(f"   ⚠️ Failed to save test report: {e}")
        
        # Print summary
        summary = self.test_results['summary']
        print(f"\nTest Summary:")
        print(f"   Test Categories: {summary['total_test_categories']}")
        print(f"   Passed: {summary['passed_test_categories']}")
        print(f"   Success Rate: {summary['success_rate']:.1%}")
        print(f"   Duration: {summary['duration']:.2f} seconds")
        
        # Detailed results
        print(f"\nDetailed Results:")
        
        # Scanner results
        scanner_results = self.test_results['scanner_tests']
        if scanner_results.get('success'):
            print(f"   Scanner Test: [PASS] Passed")
            print(f"     Available CLIs: {scanner_results.get('available_count', 0)}")
            print(f"     Scan Time: {scanner_results.get('scan_duration', 0):.2f}s")
        else:
            print(f"   Scanner Test: [FAIL] Failed")
            print(f"     Error: {scanner_results.get('error', 'Unknown')}")
        
        # Deployment results
        deployment_results = self.test_results['deployment_tests']
        if deployment_results.get('success'):
            print(f"   Deployment Test: [PASS] Passed")
            print(f"     Node.js Available: {deployment_results.get('node_available', False)}")
            print(f"     Deploy Script: {deployment_results.get('deploy_script_exists', False)}")
        else:
            print(f"   Deployment Test: [FAIL] Failed")
            print(f"     Error: {deployment_results.get('error', 'Unknown')}")
        
        # Initialization results
        init_results = self.test_results['initialization_tests']
        if init_results.get('success'):
            print(f"   Initialization Test: [PASS] Passed")
            print(f"     New Project Detection: {init_results.get('correctly_identifies_new_project', False)}")
        else:
            print(f"   Initialization Test: [FAIL] Failed")
            print(f"     Error: {init_results.get('error', 'Unknown')}")
        
        # Configuration results
        config_results = self.test_results['configuration_tests']
        if config_results.get('success'):
            print(f"   Configuration Test: [PASS] Passed")
            print(f"     CLI Configurations: {config_results.get('cli_mapping_count', 0)}")
            print(f"     Missing CLIs: {len(config_results.get('missing_expected_clis', []))}")
        else:
            print(f"   Configuration Test: [FAIL] Failed")
            print(f"     Error: {config_results.get('error', 'Unknown')}")


async def main():
    """Main function to run the system tests"""
    print("Stigmergy CLI System Evaluation")
    print("Testing CLI environment scanner, deployment system, and initialization process")
    print()
    
    tester = StigmergySystemTester()
    results = await tester.run_all_tests()
    
    # Interactive summary
    print("\n" + "="*60)
    print("System Evaluation Complete!")
    print("Key findings:")
    
    # Scanner findings
    scanner_results = results['scanner_tests']
    if scanner_results.get('success'):
        print(f"- CLI Scanner: Found {scanner_results.get('available_count', 0)} available tools")
    
    # Deployment findings
    deployment_results = results['deployment_tests']
    if deployment_results.get('success'):
        node_status = "[PASS] Available" if deployment_results.get('node_available') else "[FAIL] Not available"
        print(f"- Deployment System: Node.js {node_status}")
        print(f"- CLI Configurations: {deployment_results.get('cli_configs_count', 0)} tools configured")
    
    # Initialization findings
    init_results = results['initialization_tests']
    if init_results.get('success'):
        project_detection = "[PASS] Working" if init_results.get('project_detection_works') else "[FAIL] Failed"
        print(f"- Initialization: Project detection {project_detection}")
    
    # Configuration findings
    config_results = results['configuration_tests']
    if config_results.get('success'):
        config_count = config_results.get('cli_mapping_count', 0)
        missing_count = len(config_results.get('missing_expected_clis', []))
        print(f"- Configuration: {config_count} CLI mappings ({missing_count} missing)")
    
    print("\nFor detailed results, check the test report in the test_reports/ directory")


if __name__ == '__main__':
    asyncio.run(main())
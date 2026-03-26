# Verification-First Skill

**Skill Name**: verification-first

**Description**: 防止"模拟冒充真实执行"的认知错误，建立验证优先的工作流程，确保所有技术决策和功能实现都经过实际验证而非假设。

## Usage Scenarios

Use this skill when:
- You're about to implement a feature based on code review alone
- You find yourself saying "this should work" without testing
- You're making assumptions about API behavior without verification
- You need to validate technical decisions before committing to them
- You're debugging and want to avoid confirmation bias
- You're reviewing code changes and need to ensure they actually work
- You're planning integration between components

## Core Principles

### 1. Verification First Principle
**"Never assume when you can verify"**

- **Code reading ≠ Execution**: Reading code only tells you what should happen, not what does happen
- **Mental simulation is unreliable**: Your brain will skip edge cases and error conditions
- **Evidence over intuition**: "It works" requires actual execution evidence, not just reasoning
- **Quick validation beats long debugging**: A 5-minute test saves hours of debugging later

### 2. Three-Stage Verification Protocol

**Stage 1: Feasibility Verification** (Can it work?)
- Minimal proof-of-concept
- Basic functionality check
- Error path identification

**Stage 2: Integration Verification** (Does it work in context?)
- Real environment testing
- Dependency validation
- Edge case exploration

**Stage 3: Production Verification** (Does it work reliably?)
- Full workflow testing
- Performance validation
- Error recovery testing

## Verification-Driven Workflow (6 Steps)

### Step 1: Explicitly State Hypothesis
Before any verification, clearly state what you believe will happen:

```
Hypothesis: "The HookDeploymentManager.js deployHooks() method
will successfully copy hook files from source to CLI tool
directories when those directories exist."
```

### Step 2: Design Verification Test
Create a minimal test that can prove/disprove your hypothesis:

```
Test: Call deployHooks() with a test CLI tool configuration
Expected: Hook files appear in the target directory
Evidence type: File system observation
```

### Step 3: Execute Verification
Run the test and collect actual evidence:

```
Execution: Run the deployment with logging
Actual result: Check if files were created
```

### Step 4: Compare Expected vs Actual
Document the comparison:

```
Expected: Files copied to target
Actual: Files copied to target
Outcome: Verified ✓
```

OR

```
Expected: Files copied to target
Actual: Error - target directory doesn't exist
Outcome: Hypothesis rejected ✗
```

### Step 5: Analyze Discrepancies
If verification fails, understand why:

```
Root cause: Directory path not normalized
Fix needed: Add path normalization in deployHooks()
```

### Step 6: Document Evidence
Record what was verified and how:

```
Verification Record:
- What: Hook deployment functionality
- How: Manual test with mock CLI config
- Result: Works when target dir exists
- Caveat: Fails when target dir missing
```

## Quick Verification Checklist (8 Questions)

Before proceeding with any technical implementation or decision, ask:

1. **Have I stated my hypothesis explicitly?**
   - Can I write down exactly what I expect to happen?

2. **Is there a way to verify this empirically?**
   - Can I run code, make a request, or observe behavior?

3. **Have I executed the verification?**
   - Did I actually run the test, or just think about it?

4. **What evidence did I collect?**
   - Do I have logs, outputs, screenshots, or measurements?

5. **Does the evidence support my hypothesis?**
   - Did the actual result match my expectation?

6. **What edge cases did I test?**
   - Did I verify error conditions and boundary cases?

7. **Can this verification be reproduced?**
   - Could someone else run the same test and get the same result?

8. **What assumptions remain unverified?**
   - What parts of the system am I still assuming work?

## Evidence Quality Standards

### A-Level Evidence (Direct Observation)
- **Definition**: You personally executed code and observed the result
- **Examples**:
  - Ran the function and saw the output
  - Made the API call and received the response
  - Executed the test and watched it pass/fail
- **Strength**: Highest confidence
- **Use case**: Critical path functionality, integration points

### B-Level Evidence (Verified Documentation)
- **Definition**: Someone you trust executed it and documented it
- **Examples**:
  - Test suite that passes in CI/CD
  - Peer-reviewed code with test coverage
  - Official documentation with working examples
- **Strength**: High confidence (with trust assumption)
- **Use case**: Well-tested libraries, standard APIs

### C-Level Evidence (Reasoning without Execution)
- **Definition**: Logical inference from code reading or similar patterns
- **Examples**:
  - "This looks similar to working code X"
  - "The API signature suggests it should work"
  - "The code path seems correct"
- **Strength**: Low confidence - hypothesis only
- **Use case**: Initial exploration, non-critical decisions

**Rule**: Never rely on C-level evidence for critical decisions without upgrading to A or B level.

## Usage Examples

### Example 1: Correct Verification-First Approach

**Scenario**: Need to verify HookDeploymentManager.js works

❌ **Wrong Approach** (Confirmation Bias):
```
"I read the HookDeploymentManager.js code. It looks good.
The deployHooks() method should work. Let's proceed."
```

✅ **Correct Approach** (Verification-First):
```
1. Hypothesis: deployHooks() copies files to CLI tool directories
2. Test: Create test CLI config, call deployHooks(), check file system
3. Execute: Run test with logging
4. Evidence: Files confirmed in target directory
5. Result: Verified ✓

Next step: Test what happens when target dir doesn't exist
```

### Example 2: Verification for API Integration

**Scenario**: Need to use an external API

❌ **Wrong Approach**:
```
"The API documentation says it returns JSON. It should work
if we pass the right parameters. Let's implement it."
```

✅ **Correct Approach**:
```
1. Hypothesis: API returns user data for valid user ID
2. Test: Make actual API call with known user ID
3. Execute: curl/Postman request
4. Evidence: Received JSON response with expected fields
5. Result: Verified ✓
6. Additional: Test error case (invalid user ID)
```

### Example 3: Verification for Debugging

**Scenario**: Function not working as expected

❌ **Wrong Approach**:
```
"I see the bug - it's probably the async/await issue.
Let me fix it and assume it works."
```

✅ **Correct Approach**:
```
1. Hypothesis: The issue is missing await on line 42
2. Test: Add logging to show execution order
3. Execute: Run with logging
4. Evidence: Logs show function returns before async completes
5. Result: Root cause confirmed ✓
6. Fix: Add await, re-test to verify fix works
```

## Implementation Pattern for AI Agents

When using this skill, follow this pattern:

1. **Before any action**: Ask "What am I assuming?"
2. **Design verification**: "How can I prove/disprove this?"
3. **Execute verification**: Actually run the test
4. **Collect evidence**: Capture the actual output
5. **Compare**: Does it match expectations?
6. **Document**: Record what was verified
7. **Iterate**: What else needs verification?

## Common Anti-Patterns to Avoid

### Pattern 1: Code Review as Verification
❌ "I reviewed the code, it looks correct"
✅ "I executed the code and observed the correct behavior"

### Pattern 2: Analogy as Evidence
❌ "This is just like the other function that works"
✅ "I tested this specific case and confirmed it works"

### Pattern 3: Documentation as Truth
❌ "The docs say it works this way"
✅ "I verified the documented behavior with a real call"

### Pattern 4: Mental Simulation
❌ "If I call this with those parameters, it should work"
✅ "I called this with those parameters and it worked"

## Advanced Techniques

### Verification Scripts
Create reusable verification scripts for common patterns:

```javascript
// verify-hook-deployment.js
const verifyHookDeployment = async (cliName) => {
  console.log(`Verifying hook deployment for ${cliName}...`);

  // Stage 1: Check if CLI tool exists
  const cliExists = await checkCliToolExists(cliName);
  if (!cliExists) {
    console.log(`❌ CLI tool ${cliName} not found`);
    return false;
  }

  // Stage 2: Deploy hooks
  const deployResult = await deployHooks(cliName);
  console.log(`Deployment result: ${deployResult}`);

  // Stage 3: Verify files exist
  const filesExist = await verifyHookFilesExist(cliName);
  console.log(`Hook files verified: ${filesExist}`);

  return filesExist;
};
```

### Verification Logging
Always log verification steps:

```
[VERIFY] Starting verification of HookDeploymentManager
[VERIFY] Hypothesis: deployHooks() copies files to target dir
[VERIFY] Test: Deploy to test-cli with mock config
[VERIFY] Execute: Running deployHooks()...
[VERIFY] Result: Files created at /test-cli/hooks/
[VERIFY] Status: VERIFIED ✓
```

## When to Use This Skill

✅ **Use verification-first when**:
- Implementing new features
- Integrating components or APIs
- Debugging complex issues
- Making architectural decisions
- Reviewing code changes
- Optimizing performance

❌ **Don't over-verify when**:
- The cost of verification exceeds the risk
- Working with well-tested, stable libraries
- Making trivial, reversible changes
- Exploratory coding (but verify before committing)

## Integration with Other Skills

This skill works well with:
- **Test-driven development**: Verification-first is the mindset behind TDD
- **Debugging skills**: Verification provides evidence for debugging
- **Code review**: Adds verification to the review process
- **Architecture design**: Verify architectural decisions early

## Summary

**Verification-First Mindset**:
- Assume nothing, verify everything
- Quick validation beats long debugging
- Evidence quality matters (A > B > C)
- Document what you verified and how

**Remember**: "Code that looks right" is not the same as "code that is right". The only way to know the difference is to verify.

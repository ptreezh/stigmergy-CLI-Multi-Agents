/**
 * DECI — Soul Autonomous Decision Framework
 *
 * 3-layer gate: Boundary -> Confidence -> Emergency Fallback
 * Plus: DecisionVerifier (post-execution self-check) + FallbackManager (escalation)
 *
 * Usage:
 *   const { SoulDecisionEngine, DecisionContext, DecisionVerifier, FallbackManager } = require('./DECI');
 *   const engine = new SoulDecisionEngine();
 *   const result = engine.decide(new DecisionContext({ ... }));
 *
 *   if (result.final_decision === 'ACT_AUTONOMOUSLY') {
 *     const outcome = await executeAction();
 *     const verifier = new DecisionVerifier();
 *     const verdict = verifier.verify(result, outcome);
 *     engine.recordOutcome(verdict.verdict === 'PASS');
 *   }
 */
const SoulDecisionEngine = require('./SoulDecisionEngine');
const DecisionBoundary = require('./DecisionBoundary');
const ConfidenceScorer = require('./ConfidenceScorer');
const EmergencyFallback = require('./EmergencyFallback');
const DecisionVerifier = require('./DecisionVerifier');
const FallbackManager = require('./FallbackManager');
const DecisionContext = require('./DecisionContext');

module.exports = {
  // Core engine
  SoulDecisionEngine,

  // Layer components
  DecisionBoundary,   // Layer 1
  ConfidenceScorer,   // Layer 2
  EmergencyFallback,   // Layer 3

  // Verification + escalation
  DecisionVerifier,    // DECI-05
  FallbackManager,     // DECI-06

  // Types
  DecisionContext,
};

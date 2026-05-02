/**
 * DECI - Soul Decision Engine barrel
 * Re-exports the 4 DECI components used by SoulManager
 */

const SoulDecisionEngine = require("./SoulDecisionEngine");
const DecisionContext = require("./DecisionContext");
const DecisionVerifier = require("./DecisionVerifier");
const FallbackManager = require("./FallbackManager");

module.exports = {
  SoulDecisionEngine,
  DecisionContext,
  DecisionVerifier,
  FallbackManager,
};

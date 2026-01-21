const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');

function maxOfTwo(a, b) {
  return a > b ? a : b;
}

// Placeholder function - always returns true since no user authentication is needed
// for a multi-AI CLI collaboration system
function isAuthenticated() {
  return true;
}

module.exports = {
  maxOfTwo,
  isAuthenticated,
};

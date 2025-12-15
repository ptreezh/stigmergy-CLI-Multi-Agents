// Test data for end-to-end testing
const testData = {
  // Simple code generation prompts for each tool
  simpleCodeGeneration: {
    claude: "claude write a simple Python function to add two numbers",
    gemini: "gemini create a basic JavaScript function for string reversal",
    qwen: "qwen generate a simple Java method to calculate area of rectangle",
    iflow: "iflow write a basic function to check if a number is even",
    qodercli: "qodercli write a simple function to find maximum of two numbers",
    codebuddy: "codebuddy create a basic function to calculate circle circumference",
    copilot: "copilot generate a simple function to convert Celsius to Fahrenheit",
    codex: "codex write a basic function to calculate factorial of a number"
  },
  
  // Complex code generation prompts
  complexCodeGeneration: {
    claude: "claude implement a binary search algorithm in Python with proper error handling",
    gemini: "gemini create a JavaScript class for a simple banking system with deposit and withdraw methods",
    qwen: "qwen generate a Java implementation of a linked list with insert and delete operations",
    iflow: "iflow write a function to sort an array using quicksort algorithm",
    qodercli: "qodercli implement a hash table data structure with collision handling",
    codebuddy: "codebuddy create a function to parse JSON data and validate its structure",
    copilot: "copilot generate a function to implement a simple REST API client",
    codex: "codex write a function to process CSV data and generate statistics"
  },
  
  // Analysis prompts
  analysis: {
    claude: "claude analyze this Python code for potential security vulnerabilities",
    gemini: "gemini review this JavaScript code for performance optimization opportunities", 
    qwen: "qwen check this Java code for adherence to best practices",
    iflow: "iflow evaluate this code for potential bugs and logical errors",
    qodercli: "qodercli assess this function for code quality and maintainability",
    codebuddy: "codebuddy analyze this code for potential memory leaks",
    copilot: "copilot review this code for proper error handling",
    codex: "codex examine this code for potential scalability issues"
  },
  
  // Documentation prompts
  documentation: {
    claude: "claude generate documentation for a Python function that sorts arrays",
    gemini: "gemini create JSDoc for a JavaScript function that validates email addresses",
    qwen: "qwen write JavaDoc for a Java method that connects to database",
    iflow: "iflow generate comments for a C++ function that processes image data",
    qodercli: "qodercli create documentation for a function that handles HTTP requests",
    codebuddy: "codebuddy write documentation for a function that encrypts data",
    copilot: "copilot generate README section for a machine learning model API",
    codex: "codex create API documentation for a weather data processing function"
  },
  
  // Collaboration scenarios
  collaborationScenarios: [
    {
      name: "Code Review Workflow",
      steps: [
        "qodercli write a Python function to handle user authentication",
        "claude analyze the security of the authentication function",
        "gemini suggest performance improvements for the function"
      ]
    },
    {
      name: "Multi-language Implementation", 
      steps: [
        "qwen generate a Java implementation of a calculator class",
        "copilot create a C# version of the same calculator",
        "codex write a JavaScript equivalent of the calculator"
      ]
    },
    {
      name: "Documentation and Testing",
      steps: [
        "iflow write a complex algorithm in Python",
        "codebuddy generate unit tests for the algorithm",
        "qodercli create comprehensive documentation for the algorithm"
      ]
    }
  ],
  
  // Error handling test cases
  errorHandling: {
    invalidTool: "xyz generate a function to add two numbers",
    malformedInput: "claude ",
    extremelyLongInput: "claude " + "very long prompt ".repeat(1000),
    specialCharacters: "gemini analyze code with special chars: \n\t\r\\\"'"
  }
};

module.exports = testData;

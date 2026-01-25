<<<<<<< HEAD
    .description('Resume session - Cross-CLI session recovery and history management (shows last message of latest valuable session by default)')
    .argument('[cli]', 'CLI tool to filter (claude, gemini, qwen, iflow, codebuddy, codex, qodercli, opencode, kode)')
    .argument('[limit]', 'Maximum number of sessions to show')
    .option('-v, --verbose', 'Verbose output')
    .action(async (cli, limit, options) => {
      const args = [];
      if (cli) args.push(cli);
      if (limit) args.push(limit);
      await handleResumeCommand(args, options);
    });

  // Concurrent execution command
  program
    .command('concurrent')
    .alias('conc')
    .description('Execute task with multiple AI tools concurrently')
    .argument('<prompt>', 'Task description')
    .option('-c, --concurrency <number>', 'Number of concurrent CLIs (default: 3)', '3')
    .option('-t, --timeout <ms>', 'Execution timeout in milliseconds (default: 0 = no timeout)', '0')
    .option('-m, --mode <mode>', 'Execution mode: parallel (default) or sequential', 'parallel')
    .option('--no-lock', 'Disable file lock protection (not recommended)')
    .option('-v, --verbose', 'Verbose output')
    .action(async (prompt, options) => {
      await handleConcurrentCommand(prompt, options);
    });

  // Route commands to CLI tools
  for (const tool of ['claude', 'gemini', 'qwen', 'codebuddy', 'codex', 'iflow', 'qodercli', 'copilot', 'opencode', 'kode']) {
    program
      .command(tool)
      .description(`Use ${tool} CLI tool`)
      .argument('[args...]', 'Arguments to pass to the CLI tool')
      .option('-i, --interactive', 'Run in interactive mode (continuous conversation)')
      .option('-p, --print', 'Run in one-time mode (print and exit)')
      .allowUnknownOption(true)
      .allowExcessArguments(true)
      .action(async (args, options, command) => {
=======
    .description('Resume session (forwards to @stigmergy/resume CLI tool)')
    .argument('[args...]', 'Arguments to pass to resumesession')
    .option('-v, --verbose', 'Verbose output')
    .action(async (args, options) => {
      await handleResumeCommand(args, options);
    });

  // Route commands to CLI tools
  for (const tool of ['claude', 'gemini', 'qwen', 'codebuddy', 'codex', 'iflow', 'qodercli', 'copilot', 'kode', 'opencode', 'oh-my-opencode']) {
    program
      .command(tool)
      .description(`Use ${tool} CLI tool`)
      .option('-i, --interactive', 'Run in interactive mode (continuous conversation)')
      .option('-p, --print', 'Run in one-time mode (print and exit)')
      .allowUnknownOption(true)
      .action(async (options, command) => {
>>>>>>> bc9f83b088a8388ffb32199a4f0457e08dfc6580
        try {
          // Get the tool path directly (we know the tool name)
          const toolPath = await getCLIPath(tool);

          if (toolPath) {
            // Join args to form the prompt
<<<<<<< HEAD
            const prompt = args.join(' ');
=======
            const prompt = command.args.join(' ');
>>>>>>> bc9f83b088a8388ffb32199a4f0457e08dfc6580
# GitHub Copilot Features

GitHub Copilot offers a comprehensive suite of AI-powered features to enhance your development workflow. Copilot also offers a suite of features for administrators to manage and optimize team usage.

## Table of Contents

- [GitHub Copilot Features](#github-copilot-features)
- [GitHub Copilot Features for Administrators](#github-copilot-features-for-administrators)
- [Next Steps](#next-steps)

---

## GitHub Copilot Features

### Inline Suggestions

Autocomplete-style suggestions from Copilot in supported IDEs (Visual Studio Code, Visual Studio, JetBrains IDEs, Azure Data Studio, Xcode, Vim/Neovim, and Eclipse). See [Getting code suggestions in your IDE with GitHub Copilot](https://docs.github.com/en/copilot/using-github-copilot/getting-code-suggestions-in-your-ide-with-github-copilot).

If you use VS Code, Xcode, and Eclipse, you can also use **next edit suggestions** (public preview), which will predict the location of the next edit you are likely to make and suggest a completion for it.

### Copilot Chat

A chat interface that lets you ask coding-related questions. GitHub Copilot Chat is available on the GitHub website, in GitHub Mobile, in supported IDEs (Visual Studio Code, Visual Studio, JetBrains IDEs, Eclipse IDE, and Xcode), and in Windows Terminal. Users can also use skills with Copilot Chat. See [Asking GitHub Copilot questions in GitHub](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-github) and [Asking GitHub Copilot questions in your IDE](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide).

### Copilot Coding Agent

An autonomous AI agent that can make code changes for you. You can assign a GitHub issue to Copilot and the agent will work on making the required changes, and will create a pull request for you to review. You can also ask Copilot to create a pull request from Copilot Chat. See [GitHub Copilot coding agent](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-coding-agent).

### Copilot CLI (public preview)

A command line interface that lets you use Copilot from within the terminal. You can get answers to questions, or you can ask Copilot to make changes to your local files. You can also use Copilot CLI to interact with GitHub.com—for example, listing your open pull requests, or asking Copilot to create an issue. See [About GitHub Copilot CLI](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line).

### Copilot Code Review

AI-generated code review suggestions to help you write better code. See [Using GitHub Copilot code review](https://docs.github.com/en/copilot/using-github-copilot/code-review).

> **Note:** New tools in Copilot code review is in public preview and subject to change. See [About GitHub Copilot code review](https://docs.github.com/en/copilot/using-github-copilot/code-review/about-code-review).

### Copilot Pull Request Summaries

AI-generated summaries of the changes that were made in a pull request, which files they impact, and what a reviewer should focus on when they conduct their review. See [Creating a pull request summary with GitHub Copilot](https://docs.github.com/en/copilot/using-github-copilot/creating-a-pull-request-summary-with-github-copilot).

### Copilot Text Completion (public preview)

AI-generated text completion to help you write pull request descriptions quickly and accurately. See [Writing pull request descriptions with GitHub Copilot text completion](https://docs.github.com/en/copilot/using-github-copilot/creating-a-pull-request-summary-with-github-copilot#writing-a-pr-description).

### Copilot Edits

Copilot Edits is available in Visual Studio Code, Visual Studio, and JetBrains IDEs. Use Copilot Edits to make changes across multiple files directly from a single Copilot Chat prompt. Copilot Edits has the following modes:

#### Edit Mode

**Edit mode is only available in Visual Studio Code and JetBrains IDEs.**

Use edit mode when you want more granular control over the edits that Copilot proposes. In edit mode, you choose which files Copilot can make changes to, provide context to Copilot with each iteration, and decide whether or not to accept the suggested edits after each turn.

Edit mode is best suited to use cases where:

- You want to make a quick, specific update to a defined set of files.
- You want full control over the number of LLM requests Copilot uses.

#### Agent Mode

Use agent mode when you have a specific task in mind and want to enable Copilot to autonomously edit your code. In agent mode, Copilot determines which files to make changes to, offers code changes and terminal commands to complete the task, and iterates to remediate issues until the original task is complete.

Agent mode is best suited to use cases where:

- Your task is complex, and involves multiple steps, iterations, and error handling.
- You want Copilot to determine the necessary steps to take to complete the task.
- The task requires Copilot to integrate with external applications, such as an MCP server.

### Copilot Custom Instructions

Enhance Copilot Chat responses by providing contextual details on your preferences, tools, and requirements. See [About customizing GitHub Copilot responses](https://docs.github.com/en/copilot/customizing-copilot/about-customizing-github-copilot-responses).

### Copilot in GitHub Desktop

Automatically generate commit messages and descriptions with Copilot in GitHub Desktop based on the changes you make to your project.

### Copilot Spaces

Organize and centralize relevant content—like code, docs, specs, and more—into Spaces that ground Copilot's responses in the right context for a specific task. See [About GitHub Copilot Spaces](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-spaces).

### GitHub Spark (public preview)

Build and deploy full-stack applications using natural-language prompts that seamlessly integrate with the GitHub platform for advanced development. See [Building and deploying AI-powered apps with GitHub Spark](https://docs.github.com/en/copilot/building-ai-powered-apps-with-github-spark).

---

## GitHub Copilot Features for Administrators

The following features are available to organization and enterprise owners with a Copilot Business or Copilot Enterprise plan.

### Policy Management

Manage policies for Copilot in your organization or enterprise. See [Managing policies and features for GitHub Copilot in your organization](https://docs.github.com/en/copilot/managing-copilot/managing-github-copilot-in-your-organization/managing-policies-and-features-for-copilot-in-your-organization) and [Managing policies and features for GitHub Copilot in your enterprise](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/managing-policies-and-features-for-copilot-in-your-enterprise).

### Access Management

Enterprise owners can specify which organizations in the enterprise can use Copilot, and organization owners can specify which organization members can use Copilot. See [Managing access to GitHub Copilot in your organization](https://docs.github.com/en/copilot/managing-copilot/managing-github-copilot-in-your-organization/managing-access-to-github-copilot-in-your-organization) and [Managing access to Copilot in your enterprise](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/managing-access-to-copilot-in-your-enterprise).

### Usage Data

Review Copilot usage data within your organization or enterprise to inform how to manage access and drive adoption of Copilot. See [Reviewing user activity data for GitHub Copilot in your organization](https://docs.github.com/en/copilot/managing-copilot/managing-github-copilot-in-your-organization/reviewing-usage-data-for-github-copilot-in-your-organization) and [Viewing Copilot license usage in your enterprise](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-copilot-for-your-enterprise/viewing-copilot-license-usage-in-your-enterprise).

### Audit Logs

Review audit logs for Copilot in your organization to understand what actions have been taken and by which users. See [Reviewing audit logs for GitHub Copilot Business](https://docs.github.com/en/copilot/managing-copilot/managing-github-copilot-in-your-organization/reviewing-audit-logs-for-copilot-business).

### Exclude Files

Configure Copilot to ignore certain files. This can be useful if you have files that you don't want to be available to Copilot. See [Excluding content from GitHub Copilot](https://docs.github.com/en/copilot/managing-copilot/managing-github-copilot-in-your-organization/excluding-content-from-github-copilot).

---

## Next Steps

To learn more about the plans available for GitHub Copilot, see [Plans for GitHub Copilot](https://docs.github.com/en/copilot/about-github-copilot/subscription-plans-for-github-copilot).

To start using Copilot, see [Setting up GitHub Copilot](https://docs.github.com/en/copilot/setting-up-github-copilot).

---

## Additional Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [GitHub Copilot Trust Center](https://resources.github.com/copilot-trust-center/)
- [GitHub Copilot FAQ](https://github.com/features/copilot#faq)
- [GitHub Copilot Product Page](https://github.com/features/copilot)

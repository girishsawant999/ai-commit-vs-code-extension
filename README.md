# AI Commit Helper VS Code Extension

This VS Code extension helps you generate commit messages using AI.

## Features

- **AI-powered Commit Message Generation:** Leverage the power of AI to create clear, concise, and informative commit messages.
- **Customizable Prompts:** Tailor the AI's behavior by providing custom prompts to generate commit messages that fit your project's conventions.
- **Easy Integration:** Seamlessly integrate with your existing Git workflow within VS Code.

## How to Use

1. **Install the Extension:** Search for "AI Commit Helper" in the VS Code Extensions marketplace and install it.
2. **Open the Command Palette:** Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS).
3. **Run "AI Commit Helper: Generate Commit Message":** Select this command from the palette.
4. **Review and Commit:** The AI-generated commit message will appear in the SCM input field. Review it, make any necessary adjustments, and commit your changes.## Installation

You can install the extension from the VS Code Marketplace. Search for "AI Commit Helper".

## Configuration

You can configure the extension's behavior in your VS Code settings:

- `ai-commit-helper.update-google-api-key`: Your API key for the AI service (e.g., Gemini).
- `ai-commit-helper.generate`: The prompt used to generate commit messages. You can use placeholders like `{diff}` for the diff content.

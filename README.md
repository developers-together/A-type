# A-Type

A-Type is a minimalistic, browser-based typing speed test designed to help users improve their typing speed and accuracy. Whether you’re a beginner or a seasoned typist, A-Type provides an intuitive platform for honing your skills.

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Development](#development)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)

## Features

- **Minimalistic UI**: A clean and distraction-free interface.
- **Multiple Modes**: Choose between timed tests or fixed word counts.
- **Toggle Options**: Enable/disable punctuation and numbers.
- **Instant Reset**: Press the "Tab" key at any time to restart the test.
- **Responsive Design**: Works seamlessly across devices (desktop, tablet, mobile).
- **Leaderboard Integration**: Track and compare your WPM scores with others.
- **Free & Open Source**: No subscriptions, no hidden fees.

## How It Works

1. **Select Your Preferences:**
   - Toggle punctuation and numbers.
   - Switch between time-based or word-count-based tests.
   - Choose the duration or word count (e.g., 10, 25, 50, 100).

2. **Start Typing:**
   - Type the displayed text in the typing area.
   - Your WPM (Words Per Minute) and accuracy are calculated on-the-fly.

3. **Reset Anytime:**
   - Press "Tab" to instantly reset the test and start over.

4. **Track Your Progress:**
   - Compare your WPM across sessions.
   - Check out the [leaderboard](./docs/leaderboard/leaderboard.html) to see global stats.

## Installation

You can run A-Type locally by cloning this repository:

```bash
git clone https://github.com/developers-together/A-type.git
cd A-type
No special build steps are required. Just serve the files or open index.html directly in your browser.
```

## Usage

**Local Usage:**

1. Open the `docs/index.html` file in your browser.
2. Adjust the settings as desired.
3. Start typing!

**Online Demo:**

Visit the live demo at: [A-Type Live Demo](https://developers-together.github.io/A-type/)

## Configuration

- **Modes:**
  - **Time Mode:** Select from common durations (e.g., 10s, 25s, 50s).
  - **Words Mode:** Select from a range of word counts (10, 25, 50, 100).

- **Toggles:**
  - **Punctuation:** Adds punctuation characters to the test.
  - **Numbers:** Includes numeric characters.

These settings can be toggled on the main page. Any additional configuration (like custom wordlists or themes) can be implemented by editing the corresponding JavaScript and CSS files.

## Development

We welcome contributions! To get started:

1. Fork the repository.
2. Create a new branch for your feature or fix:
   ```bash
   git checkout -b feature/new-feature
   Make your changes, ensuring code quality and consistency.
   Test your changes locally.
   Submit a Pull Request (PR) with a clear description of your modifications.
   ```

## Running a Local Server
  - For a more seamless development experience:

  - Use an HTTP server (like live-server or http-server) to serve the docs directory.
  Example:
   ```bash
      npm install -g live-server
      live-server docs
   ```
This automatically reloads the page on file changes, improving your development workflow.

## Project Structure
   ```css
      A-type/
      ├─ docs/
      │  ├─ index.html          # Main page
      │  ├─ info/
      │  │  ├─ info.html
      │  │  ├─ info.css
      │  │  └─ info.js
      │  ├─ leaderboard/
      │  │  ├─ leaderboard.html
      │  │  ├─ leaderboard.css
      │  │  └─ leaderboard.js
      │  ├─ login/
      │  │  ├─ login.html
      │  │  ├─ login.css
      │  │  └─ login.js
      │  ├─ assets/
      │  │  ├─ Logo/
      │  │  │  ├─ logo.svg
      │  │  │  ├─ favicon/
      │  │  │  │  └─ A-Type-Logo.ico
      │  │  └─ (additional images/fonts)
      │  ├─ styles/
      │  │  ├─ main.css
      │  │  └─ (other CSS files)
      │  ├─ scripts/
      │  │  ├─ main.js
      │  │  └─ (other JS files)
      │  ├─ ... (other HTML/JS/CSS files)
      └─ (root project files like README, LICENSE)
   ```

## Technologies Used
- HTML5: Semantic, accessible markup.
- CSS3: Responsive and minimalistic styling.
- JavaScript (ES6+): Core functionality for handling typing logic, resetting tests, and updating stats.
- Fonts & Icons: Google Fonts, Font Awesome, and Material Symbols.

## Contributing

Contributions are welcome! Please read our Contributing Guidelines before submitting a PR.

Ideas for contributions:

- Improve performance.
- Add new test modes or difficulty levels.
- Enhance mobile compatibility.
- Create a dark mode theme.
- Add support for multiple languages.

Feel free to open issues for suggestions, bugs, or feature requests.

# Git Profile Manager (GPM)

## Overview
Git Profile Manager (`gpm`) is a CLI tool that automates setting up folder-specific Git profiles on Windows, Linux, and Mac. It allows users to define different Git usernames and emails for specific projects.

## Setup & Installation 
### Prerequisites
Ensure you have the following installed:
- Node.js (v18 or later)
- Git

### Steps to Install
1. Clone the project:
   ```sh
   git clone https://github.com/ZUBERKHAN034/git-profile-manager.git
   cd git-profile-manager
2. Run the command:
   ```sh
   npm run cli

## CLI Features
- After setup run `gpm -h` in terminal to confirm Setup & Installation
- Automatically sets up a Git profile for a folder using `gpm init`
- Lists all configured Git profiles with `gpm list`
- Removes a folder-specific Git profile with `gpm remove <dir>`
- Fully cross-platform (Windows, Linux, Mac)   
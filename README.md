# Git Profile Manager (GPM)

## Overview
Git Profile Manager (`gpm`) is a CLI tool that automates setting up folder-specific Git profiles on Windows, Linux, and Mac. It allows users to define different Git usernames and emails for specific projects.

## Features
- Automatically sets up a Git profile for a folder using `gpm init`
- Lists all configured Git profiles with `gpm list`
- Removes a folder-specific Git profile with `gpm remove <dir>`
- Fully cross-platform (Windows, Linux, Mac)

## Installation
### Prerequisites
Ensure you have the following installed:
- Node.js (v18 or later)
- Git

### Steps to Install
1. Clone the project:
   ```sh
   git clone https://github.com/yourusername/git-profile-manager.git
   cd git-profile-manager

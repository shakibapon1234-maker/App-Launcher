# New PC setup

On a new Windows PC, keep this entire **App Launcher** folder together, then double-click:

`Start_Setup_For_New_PC.bat`

The setup installs Node.js LTS through Windows Package Manager, installs this launcher's Electron dependency, creates/refreshes the Desktop shortcut, and opens the launcher.

Requirements: Windows 10/11, internet access, and Windows Package Manager (`winget`). If `winget` is unavailable, install the current Node.js LTS from https://nodejs.org/ once, then run the setup file again.

This prepares the **App Launcher itself** on any drive and does not require the Photo Editor folder. Apps launched by the hub (for example Video Editor or Photo Editor) are separate projects: their folders must also be copied to that PC and may each need their own first-time dependency setup.

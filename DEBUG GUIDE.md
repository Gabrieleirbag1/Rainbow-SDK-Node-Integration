# Debugging TypeScript in Node.js Projects

This guide will help you set up and run a debug session for your TypeScript files using Visual Studio Code.

## Project Structure

A typical TypeScript Node.js project structure:

- **index.ts**: Main entry point that contains your application logic
- **config.json**: Contains configuration settings for your application
- **tsconfig.json**: TypeScript configuration specifying module settings and compilation options
- **launch.json**: Debug configuration for VS Code

## Prerequisites

- Ensure dependencies are installed by running:

  ```sh
  npm install
  ```
  *(or `pnpm install` or `yarn` depending on your package manager)*

- Make sure you have VS Code installed.

## Build Process

The project uses [esbuild](https://esbuild.github.io/) to compile and bundle the TypeScript source code. When you build the project, the following happens:

1. **Transpile & Bundle**  
   The build script compiles index.ts and outputs the bundled file into the dist directory.
   
2. **Static Files Copy**  
   A custom plugin in the build script copies static assets (files that are not TypeScript) from src to dist.

To build the project, run:

```sh
npm run build
```

## Key File Explanations

### tsconfig.json

```json
{
    "compilerOptions": {
        "module": "ESNext",        // Use modern ECMAScript modules
        "target": "es2019",        // Target ES2019 JavaScript features
        "moduleResolution": "node", // Use Node.js-style module resolution
        "sourceMap": true,         // Generate source maps for debugging
        "resolveJsonModule": true,  // Enable importing JSON files
        "esModuleInterop": true     // Better interoperability with CommonJS modules
    }
}
```

### index.ts

This file serves as the entry point for your application. It might look something like:

```typescript
import config from '../config.json';

class Application {
    constructor() {
        this.initialize();
    }

    public async initialize(): Promise<void> {
        console.log("Initializing application");
        // Your application initialization code
    }
}

const app = new Application();
```

### launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",              // Use Node.js debugger
      "request": "launch",         // Launch a new Node.js process
      "name": "Launch Program",    // Name shown in the debug dropdown
      "program": "${workspaceFolder}/dist/index.js", // Entry point for debugging
      "preLaunchTask": "npm: build", // Run build task before launching
      "outFiles": ["${workspaceFolder}/dist/**/*.js"], // Location of output files
      "sourceMaps": true,          // Enable source map support
      "stopOnEntry": true,      // Pause execution at each step
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",   // Look for source maps in workspace
        "!**/node_modules/**"      // Ignore node_modules
      ]
    }
  ]
}
```

## Debug Configuration

The debug configuration in launch.json is set up to:

- Launch Node.js to run the compiled JavaScript in index.js
- Automatically build the project before debugging starts via the `preLaunchTask`
- Use source maps to map the compiled JavaScript back to the original TypeScript
- Configure source map resolution to work correctly with the project structure

## Starting a Debug Session

1. Open your project in Visual Studio Code.
2. Set breakpoints in your TypeScript files by clicking in the gutter next to line numbers.
3. Open the Debug panel (Ctrl+Shift+D or click the Debug icon in the Activity Bar).
4. Select the **Launch Program** configuration.
5. Click the green play button, or press F5 to start debugging.

## Summary

- **Install dependencies:** `npm install`  
- **Build:** `npm run build`  
- **Debug:** Use the **Launch Program** configuration in the Debug panel

Happy debugging!
# Debugging TypeScript in Rainbow-SDK-Node-Integration

This guide will help you set up and run a debug session for your TypeScript files using Visual Studio Code.

## Project Structure

- **`src/index.ts`**: Main entry point that imports the Rainbow SDK and initializes it with configuration
- **`config.json`**: Contains configuration settings for the Rainbow SDK (server, app ID, secret key)
- **`tsconfig.json`**: TypeScript configuration specifying ESM modules, JSON import support, and source map generation
- **`.vscode/launch.json`**: Debug configuration for VS Code

## Prerequisites

- Ensure dependencies are installed by running:

  ```sh
  pnpm install
  ```
  *(or `npm install` if you're using npm)*

- Make sure you have VS Code installed.

## Build Process

The project uses [esbuild](esbuild.js) to compile and bundle the TypeScript source code. When you build the project, the following happens:

1. **Transpile & Bundle**  
   [esbuild.js](esbuild.js) compiles `src/index.ts` into an ES module and outputs the bundled file into the `dist` directory.
   
2. **Static Files Copy**  
   A custom plugin in the build script copies static assets (files that are not TypeScript) from `src/` to `dist/`.

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

### src/index.ts

```typescript
import { LogLevelEnum, RainbowSDK } from 'rainbow-web-sdk';
import config from '../config.json';

class TestRainbowSDK {
    protected rainbowSDK: RainbowSDK;

    constructor() {
        this.test();
    }

    public async test(): Promise<void> {
        console.log("test")
        this.rainbowSDK = RainbowSDK.create({
            appConfig: { 
                server: config.RAINBOW_SERVER || 'demo.openrainbow.org', 
                applicationId: config.RAINBOW_APP_ID || '',
                secretKey: config.RAINBOW_SECRET_KEY || ''
            },
            plugins: [],
            autoLogin: true,
            logLevel: LogLevelEnum.WARNING
        });
    }
}

const testRainbowSDK = new TestRainbowSDK();
```

This file initializes the Rainbow SDK using configuration values from `config.json`.

### .vscode/launch.json

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
      // "stopOnEntry": true,      // Uncomment to pause execution at start
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",   // Look for source maps in workspace
        "!**/node_modules/**"      // Ignore node_modules
      ]
    }
  ]
}
```

## Debug Configuration

The debug configuration in [`.vscode/launch.json`](.vscode/launch.json) is set up to:

- Launch Node.js to run the compiled JavaScript in `dist/index.js`
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

- **Install dependencies:** `pnpm install`  
- **Build:** `npm run build`  
- **Debug:** Use the **Launch Program** configuration in the Debug panel

Happy debugging!
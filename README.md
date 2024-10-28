# AdonisJS Maintenance Mode

>This package enables a simple maintenance mode in AdonisJS applications. When activated, the application temporarily disables access for users, displaying a maintenance message or page.

## Features
- Toggle maintenance mode with CLI commands
- Customize maintenance mode with templates, HTTP status, retries, refresh intervals, redirection, and secret access
- Exclude specific URLs from maintenance mode
- Uses `cookie-based` access control
- File-based, creating a maintenance file in the `tmp/` directory
## Installation

You can install the package using either node ace or npm.

### Using Adonis CLI
```bash 
  node ace add adonisjs-maintenance-mode
```
### Or Using NPM
```bash 
  npm install adonis-maintenance-mode
```
## Configuration
After installation, configure maintenance mode in the following ways:

- **Middleware:** A `block_requests_during_maintenance_middleware.ts` file is generated in the middleware folder. Inside this file:
- Define `excludedUrls:` an array of URLs that should bypass maintenance mode.

Environment Variable:
- Add `APP_URL` to your .env file to specify your application’s base URL.

## Usage
Activating Maintenance Mode

Enable maintenance mode via CLI:

```bash
  node ace maintenance:on
```
This command creates a file called `maintenance_mode_on` in the `tmp/` directory, enabling maintenance mode.

Command Options:
- `--template:` Specify a custom maintenance view template under the resources folder.
```bash
  node ace maintenance:on --template="pages/errors/503"
```

- `--status:` Set a custom HTTP status code (default is 503).
```bash
  node ace maintenance:on --status=503
```

- `--retry:` Specify a retry interval for retrying requests.
```bash
  node ace maintenance:on --retry=60
```

- `--refresh:` Set the page refresh interval.
```bash
  node ace maintenance:on --refresh=30
```

- `--redirect:` Provide a URL to redirect users during maintenance mode.
```bash
  node ace maintenance:on --redirect=example-url
```

- `--secret:` Add a secret key to bypass maintenance mode. When using `--secret`, ensure `APP_URL` is set in your .env file. The default value for `APP_URL` is `http://$HOST:$PORT`, but you may customize it to match your application's URL.
```bash
  node ace maintenance:on --secret=mysecretkey
```

You can also generate a random secret key:
```bash
  node ace maintenance:on --secret=random
```

## Custom Error Pages Configuration
The `statusPages` configuration in `handler.ts` allows you to define custom renderers for specific HTTP status codes, enabling personalized error pages for various scenarios, including maintenance mode.

```typescript
protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '503': (error, { view }) => {
      return view.render('pages/errors/503', { error })
    },
}
```
### !! Note on command --template option !!
If you enable maintenance mode with the `--template` option (e.g., node ace maintenance:on --template=path_to_template), the template specified will automatically be used for the 503 error response, making manual changes in `handler.ts` unnecessary. This provides flexibility for setting custom templates dynamically without requiring code modifications.

## Deactivating Maintenance Mode
Turn off maintenance mode using the following command:

```bash
node ace maintenance:off
```

This command removes the `maintenance_mode_on` file from the `tmp/` directory.
## Deactivating Maintenance Mode
Turn off maintenance mode using the following command:

```bash
node ace maintenance:off
```
This command removes the `maintenance_mode_on` file from the `tmp/` directory.

## Example Middleware Usage
In `#middleware/block_requests_during_maintenance_middleware.ts`, you’ll find excludedUrls where you can list URLs that should bypass maintenance mode. This is useful for allowing access to specific resources or pages even during maintenance.

* The `'*'` wildcard allows access to any route that starts with `/users/`, meaning routes like `/users/1`, `/users/profile`, and any other `/users/{sub-route}` will be accessible during maintenance mode.
* If you add users to the excluded array, all routes beginning with users will be accessible, including `/users` itself.
* If you specify `users/*`, only routes under `/users/` `(like /users/1, /users/profile)` will be accessible, but not /users itself.
* Using `users*` allows access to all routes starting with users, equivalent to simply users.

```typescript
import EnsureMaintenanceMode from 'adonisjs-maintenance-mode14/ensure_maintenance_mode'

/**
 * BlockRequestsDuringMaintenanceMiddleware class extends the functionality of
 * EnsureMaintenanceMode to block requests during maintenance mode,
 * while allowing the specification of certain URLs to be excluded.
 *
 * @class
 * @extends EnsureMaintenanceMode
 *
 * @property {string[]} excludedUrls - An array of URL strings that are excluded from blocking
 * requests during maintenance mode.
 */
export default class BlockRequestsDuringMaintenanceMiddleware extends EnsureMaintenanceMode {
  /**
   * An array of URL paths that should be excluded from being blocked during maintenance mode.
   * Requests to these URLs will bypass the maintenance check.
   *
   * @protected
   * @type {string[]}
   */
  protected excludedUrls: string[] = [
      'users/*',
      'about',
  ]
}
```

# Upgrading from v3 to v4

test

## In a nutshell
* Revamped migrations
* Reimplemented way of starting and stopping the server
* New job manager to handle your job queues
* Simplified config options
* Updated all dependencies to the newest version possible
* Dropped a lot of functionality that wasn't really used anymore

as well as a bunch of quality of life improvements and refactors.

This will seem like a long document to go through, but the changes required to
upgrade in the apps are in all likelihood not that involved. The green boxes
will guide you to specific actions you need to take.

## Migrations

### Migration paths
Up until now, the migrate command has been copying files to a temporary folder
in the app's root folder, sorting them and running them. This behaviour created
two issues:

* Copying the migration file's path meant that `require` relative paths were not
valid at runtime.
* A strict deployment environment could mean that folders cannot be created on 
the fly, making the whole migration fail.

Starting with this release, there will be no copying of files and no creation
of a temporary folder. This means that you can now `require` relative paths in
your migrations like you would in any other file. It also means you need to fix
all paths of existing migrations to be valid relative paths.

:::tip[What you need to do]
Go through all the migration files. If you find code that looks like this
```js
// eslint-disable-next-line import/no-unresolved, import/extensions
const User = require('../models/user/user.model')
```
where removing the `eslint-disable` line makes the linter complain about the
path being incorrect, delete the lint disable line and correct the path to be
accurate relative to the current file.
:::

### Stricter migration rules

All new migrations after upgrading will be subject to some new rules:
* `sql` files are not allowed anymore, use `db.raw` if necessary
* Rollback functions are now mandatory (ie. your migration will fail if there
is no `exports.down` function)
* Naming convention: migration files must start with a unix timestamp and a dash
(this is already the case for most of them, but now they actually get checked)

### `migrationManager` and `migrate` cli

There are some new tools to help you manage migrations: the `migrationManager`
is exposed from `@coko/server` and the (re-implemented) `migrate` command is 
available via the `coko-server` cli.

Both allow you to:
* run all migrations
* run migrations up to a specific point
* run a specified number of migrations from the list of migrations that haven't been
executed yet (eg. only run the next 2 migrations, even though there is 4 new ones)
* roll back one or more migrations
* get a list of executed migrations
* get a list of pending migrations

Note that you can only roll back to the point where the upgrade to v4 happened, 
as rollback functions were not mandatory before that.

A checkpoint of when the last successful run of migrations happened is also kept,
so that you can simply roll back to that checkpoint.

The above also opens up the possibility of testing migrations with unit tests.
A migration test could look like this:
* Run all migrations up to the one right before the one you are writing
* Seed some data
* Run your new migration only on top of that data
* Assert that your tables now look like they should
* Roll back your new migration
* Assert that your tables look like they did before

It is highly advised that all migrations have corresponding unit tests from now
on.

### New "core" migrations

Some new "core" (as in not associated to a specific model) migrations will
always run. For the time being these are:
* Creating a meta table for coko server internal use (there is never a case
where the app should edit this)
* Installing the `pgcrypto` extension on your postgres database
* Dropping the legacy `entities` table

If you have code that handles the above, it is safe to delete it, as it's now
handled out of the box.

:::tip[What you need to do]
If you're mounting an sql script into your db container to install the 
`pgcrypto` extension, remove it.
:::

## Server

### New startup behaviour

Starting up your server, the following will now happen automatically:
* The server will wait for the database connection to be available.
* It will connect to file storage (if `useFileStorage` is `true` in the config).
* It will run migrations.
* It will seed all global teams declared in the config.

Whatever code in the apps was handling all this can now be removed.

:::tip[what you need to do]
If you're using a wait for it script to wait for the database connection to be
available in your compose file's entrypoint, delete it. You can also drop the
`node-wait-for-it` dependency if that's the only reason you were using it for.
:::

:::tip[what you need to do]
If you're using `connectToFileStorage` in your code, delete it.
:::

:::tip[what you need to do]
If you're running migrations through a shell script on your compose file's 
entrypoint, delete it.
:::

:::tip[what you need to do]
If you're running a script through the compose file's entyrpoint or anywhere else
to seed the global teams, delete it.
:::

### Custom startup and shutdown scripts through the config

`startServer` and `app` are no longer exposed through `@coko/server`. In order
to run custom scripts on startup or shutdown, declare those scripts in the
config like so:

```js
module.eports = {
  // ... other config options
  onStartup: [
    {
      label: 'Your script label for logging purposes',
      execute: yourFunction,
    },
  ]
  onShutdown: [
    {
      label: 'Your shutdown script label',
      execute: yourShutdownFunction,
    },
  ]
}
```

Scripts will be run one after the other (ie. not in parallel) and in the order
they're declared.

:::tip[what you need to do]
Declare all startup and shutdown scripts in the config. Make sure they are exported
functions and not invoked at the end of the file.
:::

:::tip[what you need to do]
Delete custom `startServer` or `app` files in your app.
:::

:::tip[what you need to do]
You're probably now left with an entrypoint in your compose file that doesn't do
anything. Remove the entrypoint from the server's compose configuration
altogether.
:::

### Declaring static folders through the config

No static folders will be served from the server by default. If you have a 
static folder that you need to make available, use the config like so:

```js
module.exports = {
  // ... other config options
  staticFolders: [
    {
      folderPath: './static',
      mountPoint: '/', // where it becomes available
    },
  ],
}
```

:::tip[what you need to do]
Declare any static folders that you want served in the config.
:::

### New commands

There is two new commands in the cli: `start` and `start-dev`.  Both will run
the server. The latter will keep a process for the server that restarts on
detection of file changes. You do not need to directly use `nodemon` anymore.

:::tip[what you need to do]
Change your compose file's command to look like:
* `command: ['yarn', 'coko-server', 'start-dev']` for development
* `command: ['yarn', 'coko-server', 'start']` for production

Drop the `nodemon` dependency.
:::

## Job manager

### Job queue basics

There is two basic steps to using jobs.
1. Declare the queue, including what happens on receiving a new job.
2. Send a specific job to the queue.

Queues are checked every 2 seconds for pending jobs. You can control the number
of jobs that get picked up on every check, as well as the number of jobs that
are allowed to run at any given point.

### Declaring job queues

Declaring queues happens in the config like so:

```js
module.exports = {
  // ... other config options
  jobQueues: [
    {
      name: 'your-queue-name',
      handler: jobHandler, // what happens on receiving a job
      teamSize: 1, // optional, how many jobs to pick up on each loop
      teamConcurrency: 1, // optional, how many jobs of this queue can run at any given point
    },
  ],
}
```

:::tip[what you need to do]
If you're using any job queues, declare them in your config. Delete any code
that used to manually create queues.
:::

### Sending jobs to queues

You can use the new `jobManager` to send jobs to queues:

```js
const { jobManager } = require('@coko/server')

const data = { someData: true }

await jobManager.sendToQueue('your-queue-name', data)
```

You can also defer a job to start later:

```js
await jobManager.sendToQueue('your-queue-name', data, {
  startAfter: 60 * 60 * 24, // 86400 seconds from now, ie. in 24 hours
})
```

:::tip[what you need to do]
Use the new `jobManager` to send jobs to queues.
:::

### Scheduled jobs

Current implementations of scheduled tasks use cron libraries that run on the
server. This can be problematic however in scaled server scenarios, as the tasks
will run once on each server. So for example, if you want to send an email once
a day and you have a cluster of 3 servers running, the users will receive 3 emails!

We can avoid this situation by using the queues for this as well. Because the
queues live on the database and not on the server, they will only be executed
once for the whole cluster.

Declare a schedule for your queue in the config like so:

```js
module.exports = {
  // ... other config options
  jobQueues: [
    {
      name: 'your-schedule-queue',
      handler: sendDailyEmailFunction,
      teamSize: 1,
      teamConcurrency: 1,
      schedule: '0 7 * * *', // a valid cron pattern
      scheduleTimezone: 'Europe/Athens', // optional, what timezone should be followed
    },
  ],
}
```

Note that the cron patterns use 5 points, not 6, giving you granularity up to
minutes, but not seconds.

:::tip[what you need to do]
Move all cron jobs to scheduled jobs.
:::

### Removing queues or schedules

If you want to delete a queue, simply delete it from the config. If you want to
keep the queue, but remove its schedule, simply remove the `schedule` and 
`scheduleTimezone` keys from the job declaration. Changes for both are checked
on server startup and cleaned up accordingly.

### Dropped exports
`boss` and `connectToJobQueue` are not exported anymore. Additionally, the config
key `useJobQueues` is not valid anymore, as the queues are now always on.

:::tip[what you need to do]
Delete all use of `boss` and `connectToJobQueue`.
:::


## Subscription manager
A new `subscriptionManager` is exported. This is essentially what used to be
`pubsub`, already initialized.

So insted of writing
```js
const { pubsubManager } = require('@coko/server')

const pubsub = await pubsubManager.getPubsub()

pubsub.publish('EVENT', data)
```
you can now write

```js
const { subscriptionManager } = require('@coko/server')

subscriptionManager.publish('EVENT', data)
```

The methods (`publish`, `asyncIterators` etc) remain unchanged.

:::tip[what you need to do]
Rename `pubsubManager` imports to `subcriptionManager`. Delete any use of `getPubsub`.
:::

## File storage changes

* Dropped `connectToFileStorage`. It will now connect automatically if the
`useFileStorage` config option is `true`.
* There is a new `filestorage.region` config option
* On the `fileStorage` object:
  * `deleteFiles` has been renamed to `delete`
  * `delete` can now accept either a single key, or an array of keys (it used
  to only accept an array of keys)
  * the `uploadFileHandler` method is now private and thus not available anymore

:::tip[what you need to do]
Rename `fileStorage.deleteFiles()` to `fileStorage.delete()`.
:::

:::tip[what you need to do]
Make sure you're not using `fileStorage.uploadFileHandler()`.
:::

## Models and GraphQL changes

### GraphQL context
`user` has been renamed to `userId` for clarity. This means that all uses of
`ctx.user` in your resolvers should be renamed to `ctx.userId`.

:::tip[what you need to do]
Rename `ctx.user` to `ctx.userId`.
:::

### Public subscriptions
Subscriptions are now allowed to not have an auth token. There was previously
an assumption that subscriptions should happen for authenticated users only.
This change allows us to have subscriptions in public pages in the apps.

### Models

* `ChatThread` model has been renamed to `ChatChannel`.
* `chatThreadId` property on `ChatMessage` has been renamed to `chatChannelId`.
* Deleting a user will now also delete that user's identities (previously only deleted team members with that user id were deleted).
* Deleting a chat channel will now also delete its messages.
* `deleteByIds` now returns the number of affected rows instead of an array of ids.
* `User`, `Identity`, `Team`, `TeamMember`, `ChatMessage` and `ChatChannel` are now directly exported from `@coko/server`.

:::tip[what you need to do]
If you're using the chat models, rename `ChatThread` to `ChatChannel` and
`chatThreadId` to `chatChannelId`. Make sure you rename the grapqhl api types
as well.
:::

:::tip[what you need to do]
Make sure you're not manually deleting identities when deleting a user.
:::

:::tip[what you need to do]
Make sure you're not manually deleting messages when deleting a chat channel.
:::

:::tip[what you need to do]
Make sure you're not using ids returned from the `deleteByIds` base model method.
:::

:::tip[what you need to do]
If you were importing models from a direct path in `@coko/server`, import from
the root package.

eg.
```js
const { User } = require('@coko/server/src/models/user') // Bad
const { User } = require('@coko/server') // Good
```

Remember that internal paths can change without being considered a breaking
change.
:::

### Model types

- You cannot use multiple types unless one of them is `null`. Use `anyOf` syntax instead.
See: [Strict mode | Ajv JSON schema validator](https://ajv.js.org/strict-mode.html#union-types)
- All nullable types now have a default of `null`.
- Exported `modelTypes` have been renamed to `modelJsonSchemaTypes`.

:::tip[what you need to do]
Use `anyOf` syntax if your field can have multiple types.
:::

:::tip[what you need to do]
Rename `modelTypes` imports to `modelJsonSchemaTypes`.
:::

### GraphQL API

#### Dropped queries and mutations
Queries:
* `getGlobalTeams`
* `getObjectTeams`

Just use the `teams` query with filtering options to achieve the same results.

Mutations:
* `resendVerificationEmailFromLogin`

:::tip[what you need to do]
Make sure you're not using the above.
:::

#### Renamed fields in the schema
* `ChatThread` type has been renamed to `ChatChannel`.
* Property `chatThreadId` of type `ChatMessage` has been renamed to `chatChannelId`.
* Input `UpdateInput` has been renamed to `UpdateUserInput` for clarity.
* The `identityId` property of `UpdateUserInput` has been dropped.
* Input `UsersQueryParams` has been renamed to `UserFilter`
* `users` query arguments have been renamed from `queryParams` and `options` to 
`filter` and `pagination` respectively.
* `sendMessage`, `editMessage` and `deleteMessage` mutations have been renamed to
`sendChatMessage`, `editChatMessage` and `deleteChatMessage` respectively.

:::tip[what you need to do]
If using any of the above fields, make sure you rename them.
:::

#### Fields and arguments made not nullable
* `totalCount` in all places it's used
* `result` on type `Users`
* `id` and `user` properties on type `TeamMember`
* `id` argument on the `user` query
* `id` argument on the `updateUser` mutation

:::tip[what you need to do]
If using any of the above fields, make sure they're followed by `!`.
:::


### GraphQL playground

The playground is a deprecated project and was dropped. A viable alternative
might be apollo's own explorer. Go to [`https://studio.apollographql.com/sandbox/explorer`](https://studio.apollographql.com/sandbox/explorer)
and enter eg. [`http://localhost:3000/graphql`](http://localhost:3000/graphql) in
the settings at the top of the page.

## Config changes

### Dropped keys
* `authsome`
* `dbManager.migrationsPath`
* `password-reset.token-length`
* `publicKeys`
* `pubsweet-client`
* `pubsweet-server.apollo`
* `pubsweet-server.app`
* `pubsweet-server.cron`
* `pubsweet-server.host`
* `pubsweet-server.ignoreTerminatedConnectionError`
* `pubsweet-server.resolvers`
* `pubsweet-server.serveClient`
* `pubsweet-server.typedefs`
* `pubsweet-server.uploads`
* `serveClient`
* `useJobQueue`

:::tip[what you need to do]
Delete all dropped keys
:::

### Renamed keys
* `pubsweet.components` → `components`
* `password-reset` → `passwordReset`
* `pubsweet-server.acquireConnectionTimeout` → `acquireConnectionTimeout`
* `pubsweet-server.db` → `db`
* `pubsweet-server.emailVerificationTokenExpiry` → `emailVerificationTokenExpiry`
* `pubsweet-server.logger` → `logger`
* `pubsweet-server.morganLogFormat` → `morganLogFormat`
* `pubsweet-server.passwordResetTokenExpiry` → `passwordResetTokenExpiry`
* `pubsweet-server.pool` → `pool`
* `pubsweet-server.port` → `port`
* `pubsweet-server.secret` → `secret`
* `pubsweet-server.serverUrl` → `serverUrl`
* `pubsweet-server.tokenExpiresIn` → `tokenExpiresIn`
* `pubsweet-server.useFileStorage` → `useFileStorage`
* `pubsweet-server.useGraphqlServer` → `useGraphqlServer`

:::tip[what you need to do]
Move all keys that exist inside `pubsweet` or `pubsweet-server` to the top
level of your config. Delete the now emtpy `pubsweet` and `pubsweet-server` keys.
Make `password-reset` key camel case.
:::

### Team config

Change the previous structure:
```js
module.exports = {
  // ... other config options
  teams: {
    global: {
      admin: {
        displayName: 'Admin',
        role: 'admin',
      },
      editor: {
        displayName: 'Editor',
        role: 'editor',
      },
    },
    nonGlobal: {
      author: {
        displayName: 'Author',
        role: 'author',
      },
    },
  },
}
```

to the new structure:
```js
module.exports = {
  // ... other config options
  teams: {
    global: [
      {
        displayName: 'Admin',
        role: 'admin',
      },
      {
        displayName: 'Editor',
        role: 'editor',
      },
    ],
    nonGlobal: [
      {
        displayName: 'Author',
        role: 'author',
      },
    ],
  },

}
```

:::tip[what you need to do]
Make sure that your teams are declared in the config and that they follow the 
schema described above.
:::

## Other utilities and changes

### cli
There is a new `circular` command, which will give you a report of circular
dependencies found in the code.

### Temp folder utilities
A temp folder is created automatically on server startup now. You can access
its path from the library's main exports:
```js
const { tempFolderPath } = require('@coko/server')
```

There's also the following exported utility functions, that do exactly what you
expect them to:
* `deleteFileFromTemp`
* `emptyTemp`
* `writeFileToTemp`

:::tip[what you need to do]
Use the provided standard `tempFolderPath` and remove use of custom temp paths.
:::

### Request

Exposed a `request` helper, which is essentially `axios`, plus retries and
exponential backoff.

### Password reset token

Password reset token expiry now has a default of 24 hours.

### Send email
`sendEmail` now accepts an extra argument that lets you override one or more of
the options defined in `mailer.transport` in the config.

### Emails in development
If there are no credentials passed through the `mailer` config, a link will be 
printed in your terminal when sending emails. Clicking on that link will open a
browser tab that simulates a received email. If you use values in your `mailer`
config, this functionality will be overriden and a real attempt to send an email
will be performed.

## Dropped features

* Email graphql middleware
* The `DATABASE_URL` environment variable
* The `entities` table in the database
* Connectors (not available through `ctx.connectors` in resolvers anymore)
* `authsome`
* Usage of `app.locals`
* Support for `@pubsweet/models`
* Extending the express app (since the app is not exported anymore)
* The `POST /api/upload` endpoint
* The `upload` graphql mutation and its corresponding progress subscription

:::tip[what you need to do]
Make sure you're not using any of the above.
:::

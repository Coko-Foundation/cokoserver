# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [4.11.1](https://gitlab.coko.foundation/cokoapps/server/compare/v4.11.0...v4.11.1) (2025-05-15)


### Bug Fixes

* **models:** fix invalid spread operator when updating user email ([d79c8c7](https://gitlab.coko.foundation/cokoapps/server/commit/d79c8c7743b3ea0da709d3d4af12fe095dc9318e))

## [4.11.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.10.0...v4.11.0) (2025-05-15)


### Features

* **graphql:** add identityId to UpdateUserInput ([769a07c](https://gitlab.coko.foundation/cokoapps/server/commit/769a07c0dacb7b8228aebb53ab08702039f52e2a))

## [4.10.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.9.0...v4.10.0) (2025-05-09)


### Features

* **fileStorage:** add getFileContent method ([251e05c](https://gitlab.coko.foundation/cokoapps/server/commit/251e05cee86b210c47bd6385f8fb7cd6bbd023f3))

## [4.9.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.8.0...v4.9.0) (2025-03-31)


### Features

* add default value to email verification token ([a9ea107](https://gitlab.coko.foundation/cokoapps/server/commit/a9ea10769d37545286a02cfec0d33641ce99515a))

## [4.8.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.7.0...v4.8.0) (2025-02-24)


### Features

* expose uuid validate method ([55a9c89](https://gitlab.coko.foundation/cokoapps/server/commit/55a9c899619827b0b3775abe37b815fa047c49df))

## [4.7.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.6.0...v4.7.0) (2025-02-24)


### Features

* **server:** handle base64 data input in write file helper ([a2bc636](https://gitlab.coko.foundation/cokoapps/server/commit/a2bc636605235180950e9a29e339ce560a4fbd99))

## [4.6.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.5.0...v4.6.0) (2025-02-13)


### Features

* **db:** add db connection count report ([62ad0fb](https://gitlab.coko.foundation/cokoapps/server/commit/62ad0fb11c4c4137e7980bdc0b33a7d89d6c4f78))
* **graphql:** add resolver performance logs in development ([faed0c2](https://gitlab.coko.foundation/cokoapps/server/commit/faed0c2d1d92e8b79edaf5fa4309cd3571bebce9))
* validate db connection reporter config ([878b5b0](https://gitlab.coko.foundation/cokoapps/server/commit/878b5b05dcf8e5843fbc241849a850c23662babb))

## [4.5.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.4.0...v4.5.0) (2025-02-12)


### Features

* **graphql:** embed apollo explorer at /graphql in development ([3b85e32](https://gitlab.coko.foundation/cokoapps/server/commit/3b85e32637a0281971a03e80e56cb320ed7e2c3e))
* **server:** allow cors origin extension ([dc38658](https://gitlab.coko.foundation/cokoapps/server/commit/dc38658ed10876a2b79843575507cf0ad0c30f87))

## [4.4.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.3.0...v4.4.0) (2025-02-05)


### Features

* **cli:** allow debug inspectors to attach ([480d6dc](https://gitlab.coko.foundation/cokoapps/server/commit/480d6dcbc4e6ea827314d3fad08dbe267178a290))

## [4.3.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.2.0...v4.3.0) (2024-12-13)


### Features

* **graphql:** export race from graphql shield ([fc3cfcc](https://gitlab.coko.foundation/cokoapps/server/commit/fc3cfcc980134c0e8fdc1e7fcad3854f3067d7da))


### Bug Fixes

* **server:** do not throw error if subscriptions db is not defined in config ([4adf2a1](https://gitlab.coko.foundation/cokoapps/server/commit/4adf2a17484c5f2920bb808405171b7599410382))

## [4.2.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.1.1...v4.2.0) (2024-11-29)


### Features

* **fileStorage:** allow aws s3 connection without key secret pair ([a703310](https://gitlab.coko.foundation/cokoapps/server/commit/a7033107d32e4a7c4e78944d5c1ab11d6eff870a))

### [4.1.1](https://gitlab.coko.foundation/cokoapps/server/compare/v4.1.0...v4.1.1) (2024-11-19)


### Bug Fixes

* **db:** fix object destructure for fallback db values ([67c7c31](https://gitlab.coko.foundation/cokoapps/server/commit/67c7c31474850fc5e28a35caf3a1f04695ad5f9d))

## [4.1.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.2...v4.1.0) (2024-11-19)


### Features

* **db:** allow passing an encoded ca certificate through envornment variables ([c44ac0b](https://gitlab.coko.foundation/cokoapps/server/commit/c44ac0bc4d66dfe4ea9300ff54840d86dc3e161f))
* **db:** allow subscriptions to connect to a different db ([17803a0](https://gitlab.coko.foundation/cokoapps/server/commit/17803a0c13cc4ccc06be41b367338920206ed710))


### Bug Fixes

* **db:** correctly read allow self signed certificates variable ([45f189c](https://gitlab.coko.foundation/cokoapps/server/commit/45f189cd5209ad74e570f56a3369a42a9a105665))

### [4.0.2](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.1...v4.0.2) (2024-10-31)


### Bug Fixes

* **api:** return Int when deleting users in bulk ([1b7a2aa](https://gitlab.coko.foundation/cokoapps/server/commit/1b7a2aa527ba4af3f6f20d54feca2e94f0b09da4))

### [4.0.1](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.0...v4.0.1) (2024-10-21)


### Bug Fixes

* **server:** do not print user emails in the logs ([8b1cde9](https://gitlab.coko.foundation/cokoapps/server/commit/8b1cde9cbfe350098a80d013d10098f810bc0ac1))

## [4.0.0](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.0-beta.7...v4.0.0) (2024-10-21)


### Bug Fixes

* **server:** fix wrong function call in notify email ([fc4b006](https://gitlab.coko.foundation/cokoapps/server/commit/fc4b0069074db6c50c7ea1180f12e835abc89e41))

## [4.0.0-beta.7](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2024-09-24)


### Features

* allow globs to be ignored by nodemon ([a1a07ac](https://gitlab.coko.foundation/cokoapps/server/commit/a1a07ac4fc3ab98afc91162dde5ba13041ba5f46))

## [4.0.0-beta.6](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2024-08-30)


### Bug Fixes

* **server:** fix helmet cross origin resource policy ([f42d235](https://gitlab.coko.foundation/cokoapps/server/commit/f42d2350c4573b5a82d30f1036fb6072eaf768aa))

## [4.0.0-beta.5](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2024-08-29)


### Bug Fixes

* **graphql:** fix when graphql upload express is called ([71495b7](https://gitlab.coko.foundation/cokoapps/server/commit/71495b7b31bab90dc41ae489b342ac372e7be283))

## [4.0.0-beta.4](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2024-08-29)


### Bug Fixes

* **graphql:** make sure gql errors are logged ([b24aab0](https://gitlab.coko.foundation/cokoapps/server/commit/b24aab00cdfb8ecc4e94609cd70061b094d1aaa4))

## [4.0.0-beta.3](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2024-08-29)


### Bug Fixes

* **server:** fix serving of static assets from the server ([a95ccd3](https://gitlab.coko.foundation/cokoapps/server/commit/a95ccd363dc615efb2915d951c0172934b2c477e))

## [4.0.0-beta.2](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2024-08-29)


### Bug Fixes

* **graphql:** do not initialize graphql test server on index import ([0af6155](https://gitlab.coko.foundation/cokoapps/server/commit/0af61555ebb87d17fbf0705d822b4072f8e32bbb))
* **graphql:** fix pubsub noop error method ([8a6f13c](https://gitlab.coko.foundation/cokoapps/server/commit/8a6f13ca7aff1b43a1c8516c144da0af249f3b37))
* **graphql:** fix useGraphql not being true by default for pubsub ([fe060d8](https://gitlab.coko.foundation/cokoapps/server/commit/fe060d8581b6a6f66b8fe73c761db8e712d4c60f))

## [4.0.0-beta.1](https://gitlab.coko.foundation/cokoapps/server/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2024-08-29)


### Features

* **models:** trigger subscription when user is updated ([9531ad9](https://gitlab.coko.foundation/cokoapps/server/commit/9531ad9b822488fb990d9afecb8a523388fc179b))

## [4.0.0-beta.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.13.2...v4.0.0-beta.0) (2024-08-29)


### ⚠ BREAKING CHANGES

* s3 protocol, host, port is now url
* **server:** drop hardcoded POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES reference
* **models:** deleting a chat channel now deletes its messages too
* **graphql:** Renamed types TeamsResponse and ChatChannelResponse to Teams and ChatChannels respectively.
* **graphql:** Renamed sendMessage, editMessage and deleteMessage to senChatMessage, editChatMessage and
deleteChatMessage respectively. UpdateUserInput id is now not nullable.
* **graphql:** renamed gql chatChannels where to filter
* **graphql:** renamed gql users options to users pagination
* **graphql:** renamed UserQueryParams to UserFilter
* **graphql:** gql user id param and user result are not nullable
* **graphql:** gql totalCount is now not nullable
* **graphql:** make teamMember id and user in gql not-nullable
* **graphql:** drop getGlobalTeams, getObjectTeams, rename TeamWhereInput to TeamFilter
* **models:** chat threads renamed to chat channels, chat message chatThreadId renamed to chatChannelId
* **models:** graphql UpdateInput has been renamed to UpdateUserInput. identityId has been dropped from
UpdateInput.
* **models:** deleteByIds does not return ids but number of rows now
* **models:** delete identities on user deletion
* ctx.user is renamed to ctx.userId
* **server:** renamed pubsub to subscriptionManager
* **server:** allow unauthenticated subscriptions
* rename filestorage deletefiles to delete
* drop connectToFileStorage and rename fileStorage to FileStorage
* **models:** modelTypes is now modelJsonSchemaTypes
* **models:** all nullable model types now have a default of null
* password reset token expiry now has default value (24 hours)
* drop exporting startServer
* drop extending typedefs and resolvers through config
* drop upload to disk endpoints
* drop serveClient option
* drop automatically serving _build and static folders
* **db manager:** drop createTables script
* drop extending the express app
* changed teams config structure
* dropped password-reset.token-length
* config.password-reset renamed to config.passwordReset
* drop extending apollo through config
* dropped pubsweet from config
* dropped pubsweet-server from config
* **db manager:** drop DATABASE_URL environment variable

### Features

* add helpful error message for pubsweet config changes ([c82b1da](https://gitlab.coko.foundation/cokoapps/server/commit/c82b1da44cebbd49afd0df9b5cfc1f71b2c122ac))
* add job manager and job definitions config ([bfa6b22](https://gitlab.coko.foundation/cokoapps/server/commit/bfa6b22901f8d7b39f8c2210374a98d8f7a98017))
* add messages for removed keys ([52d0880](https://gitlab.coko.foundation/cokoapps/server/commit/52d0880e2de14e97d5e87a3a79fe87b2b017504c))
* add meta table and constraints on migration files ([6d906bc](https://gitlab.coko.foundation/cokoapps/server/commit/6d906bc2887ebb0c3658df0e02ef4a59a72700fb))
* add onStartup hook for custom init scripts ([3c43420](https://gitlab.coko.foundation/cokoapps/server/commit/3c43420317036da1ed600a4d792c555d4d9bb953))
* add write to temp util ([e4ccbde](https://gitlab.coko.foundation/cokoapps/server/commit/e4ccbde6c8ddbea469e84290c6c434a138125bb1))
* allow config to define mount point for static folders ([85fe5b5](https://gitlab.coko.foundation/cokoapps/server/commit/85fe5b55585f9e63a9f48d32e38ed18d37c0db81))
* check for db connection at startup ([d28c24f](https://gitlab.coko.foundation/cokoapps/server/commit/d28c24f3d7e607466430efbecb66dbacf6fdb086))
* **cli:** add circular command ([5242ba2](https://gitlab.coko.foundation/cokoapps/server/commit/5242ba25fdc48c6471e447b52fb621023f79396d))
* **cli:** add start command ([c06e2f3](https://gitlab.coko.foundation/cokoapps/server/commit/c06e2f31c459838e541c08a8fdba74cae56aa979))
* **cli:** add start-dev command ([24b9821](https://gitlab.coko.foundation/cokoapps/server/commit/24b982150c83d5bbd0c3d4009b0e308ed40d27d2))
* **cli:** expand migrate command functionality ([633d485](https://gitlab.coko.foundation/cokoapps/server/commit/633d485c5fa6ad79601bcfaf03993a2a7bd2d26e))
* **db manager:** drop DATABASE_URL environment variable ([4f52e20](https://gitlab.coko.foundation/cokoapps/server/commit/4f52e204ca763d57797836b80e629f8fdce0446a))
* **db manager:** remove create tables script ([6decbef](https://gitlab.coko.foundation/cokoapps/server/commit/6decbef1d5a2cc3ec0da121f445a4269f18d4f5e))
* define static folders to serve through config ([41f9b26](https://gitlab.coko.foundation/cokoapps/server/commit/41f9b26305a4db740d3ce8bb6c299b3c44a113a8))
* drop app.locals and @pubsweet/models ([35a424b](https://gitlab.coko.foundation/cokoapps/server/commit/35a424bb5120912279527a105befba1f3b8087a2))
* drop authsome ([8dab3e5](https://gitlab.coko.foundation/cokoapps/server/commit/8dab3e5759f4e42817c0eb850fcd101e7c489921))
* drop entities table via core migrations ([8e33a50](https://gitlab.coko.foundation/cokoapps/server/commit/8e33a50a49f4ffe7224015e44d8590ee48ee8f44))
* dropped connectors ([fdd0d8e](https://gitlab.coko.foundation/cokoapps/server/commit/fdd0d8e0757bfbe341b7dba9bab11959e4bca513))
* dropped password reset token length config option ([38f4a11](https://gitlab.coko.foundation/cokoapps/server/commit/38f4a1129dff945a5a8d833e5bd3cba46756abf8))
* export withFilter for subscriptions ([fbea60d](https://gitlab.coko.foundation/cokoapps/server/commit/fbea60d739d8b06bcf7a3c7b7e0a70f64ee81495))
* expose graphql test server for api testing ([870ea1b](https://gitlab.coko.foundation/cokoapps/server/commit/870ea1ba3be96277efe0822ba2a9097253f700ce))
* expose standardized temp folder path ([eb68bc8](https://gitlab.coko.foundation/cokoapps/server/commit/eb68bc8232048b5e99ca18027cd9d3fd2edb8642))
* expose temp folder utility functions ([7593192](https://gitlab.coko.foundation/cokoapps/server/commit/7593192d4cb3b45cb8e0aed613f6f0ec7554679f))
* **fileStorage:** allow file storage connection config to be overriden through createfile and deletefile ([a37f2ea](https://gitlab.coko.foundation/cokoapps/server/commit/a37f2ea17f1226fced582d9750205c74cec4b7d6))
* **graphql:** rename chat channels where to filter and add api tests ([df46d65](https://gitlab.coko.foundation/cokoapps/server/commit/df46d658054a4cc55aade816373ed437f976e0e4))
* **graphql:** rename chat message mutations and add docs for all mutations ([19adcd0](https://gitlab.coko.foundation/cokoapps/server/commit/19adcd09340498ba610a02b56e5caab22093c259))
* **graphql:** rename users options to pagination ([33c3e79](https://gitlab.coko.foundation/cokoapps/server/commit/33c3e799ead7aeca9b25313f3a992f98b2d3a693))
* **graphql:** simplify type naming for teams and chat channels ([dff3adb](https://gitlab.coko.foundation/cokoapps/server/commit/dff3adbba1bb412aa6e43fe4457a0912ac53208a))
* **graphql:** update team graphql api ([ebd04d5](https://gitlab.coko.foundation/cokoapps/server/commit/ebd04d544a385539fad75490ddc0c62fb741bd4e))
* **graphql:** user query params is now user filter ([347b780](https://gitlab.coko.foundation/cokoapps/server/commit/347b780f3addeb7087fbf3be5d33bdc6f654d335))
* improve config validations ([662f16a](https://gitlab.coko.foundation/cokoapps/server/commit/662f16a71de75cf6992a7a054afe03f1063318a9))
* install pgcrypto via core migrations ([f3f710d](https://gitlab.coko.foundation/cokoapps/server/commit/f3f710dea6b645c8d264e7a30c5d0ee9f11e3a0f))
* make all config pubsweet keys top-level ([53dcc94](https://gitlab.coko.foundation/cokoapps/server/commit/53dcc94d5785e5b791b9516fc9177fe7469bd0de))
* make all config pubsweet-server keys top-level ([ff81563](https://gitlab.coko.foundation/cokoapps/server/commit/ff8156324fd9b767669688ad9b84aa44281cf852))
* make file storage a singleton class ([64ed7c3](https://gitlab.coko.foundation/cokoapps/server/commit/64ed7c31a45110ae5bf616926250827273991a54))
* make teams configs arrays ([c89bf90](https://gitlab.coko.foundation/cokoapps/server/commit/c89bf90e04e475c5bf2d35533a72c3ef18f1af92))
* **models:** base model delete by ids returns number of affected rows ([14c688e](https://gitlab.coko.foundation/cokoapps/server/commit/14c688e9a9f0d1db75a80885ea7778eab001adf9))
* **models:** delete chat messages on chat channel delete cascade ([dfe071c](https://gitlab.coko.foundation/cokoapps/server/commit/dfe071c1aec6721860184834c88c4e8ddcdea404))
* **models:** delete identities on cascade when user delete happens ([467ef39](https://gitlab.coko.foundation/cokoapps/server/commit/467ef396e891df9d5267cc06ae51b41d3c2c6937))
* **models:** export models directly from coko server ([fa9b8d1](https://gitlab.coko.foundation/cokoapps/server/commit/fa9b8d1cbff19df3e7575018a66d64c26ce04942))
* **models:** rename chat threads to chat channels ([e6f7649](https://gitlab.coko.foundation/cokoapps/server/commit/e6f76496b7c57f5a71c3f19d11b55de15f47bd60))
* **models:** rename exported modelTypes to modelJsonSchemaTypes ([53c6d01](https://gitlab.coko.foundation/cokoapps/server/commit/53c6d019505202f1e7b007a6f47a26273cb0a1b4))
* **models:** rename UpdateInput to UpdateUserInput ([2676458](https://gitlab.coko.foundation/cokoapps/server/commit/2676458191323c53d1ec7119e0b70b97f135e0e6))
* **models:** skip full size image migration if file storage is not used at all ([a9f447f](https://gitlab.coko.foundation/cokoapps/server/commit/a9f447f3aefbff15e4ed62df3695e13689570477))
* only update migrate checkpoint if it has changed ([7b8a576](https://gitlab.coko.foundation/cokoapps/server/commit/7b8a5764f63ea272e479f8de90f03b8b70b2df33))
* remove config option to serve client ([b098a4b](https://gitlab.coko.foundation/cokoapps/server/commit/b098a4b26f88eeb3de9ccd87954750cc5c6d3211))
* remove config.apollo from configuration ([70e26ac](https://gitlab.coko.foundation/cokoapps/server/commit/70e26ac0ba9d9829c9358ca72207d5677b5a02bf))
* remove option to extend the express app ([2039f87](https://gitlab.coko.foundation/cokoapps/server/commit/2039f87c50cbd00bfa35d1eb3f700fe6d8bbeec1))
* remove option to extend typedefs and resolvers through config ([c42abad](https://gitlab.coko.foundation/cokoapps/server/commit/c42abad0def54c7292d37146d756a6e7300fa2d4))
* remove start server export ([57cbc86](https://gitlab.coko.foundation/cokoapps/server/commit/57cbc8666ef1448133ef32e807f970e6e539b063))
* remove upload to disk endpoints and uploads config ([c71eb55](https://gitlab.coko.foundation/cokoapps/server/commit/c71eb559fd6dd704cdb2c1458aae9755076e06c0))
* rename ctx.user in graphql to ctx.userId ([ea7da11](https://gitlab.coko.foundation/cokoapps/server/commit/ea7da11b734ceabee26c0aa0f4f9b006bdb50373))
* rename filestorage deleteFiles to delete ([8c876b9](https://gitlab.coko.foundation/cokoapps/server/commit/8c876b986a88a4b49b4136edc4218008c6d50abe))
* rename password reset config to camelcase ([6255f95](https://gitlab.coko.foundation/cokoapps/server/commit/6255f95c281f55c6932b24001633131f911b5045))
* **server:** add option to add custom shutdown scripts ([e5bca73](https://gitlab.coko.foundation/cokoapps/server/commit/e5bca73af19f2b22af37cc2415680a1c471f5eae))
* **server:** do not throw error when subscriptions do not provide an auth token ([5b485db](https://gitlab.coko.foundation/cokoapps/server/commit/5b485db3b9eb5228fb47fa4ad09866f6513f3a02))
* **server:** expose subscription manager instead of pubsub and make less verbose ([b046ca1](https://gitlab.coko.foundation/cokoapps/server/commit/b046ca17c0d915ba05f669d3e90cfaf93593ab18))
* **server:** make mailer fall back on ethereal if not in prod and overridable ([997ad99](https://gitlab.coko.foundation/cokoapps/server/commit/997ad9943e337c2590524a11dcd22d24f587636b))
* **server:** record last successful migrate run ([f704050](https://gitlab.coko.foundation/cokoapps/server/commit/f704050139f152e59373602153580318aeb5a2a8))
* **server:** remove hardcoded POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES reference, let app handle it ([c95bcef](https://gitlab.coko.foundation/cokoapps/server/commit/c95bcefc5927a2cc661ef2b0995a58aa9639e38e))
* **server:** seed global teams at server startup ([2bab536](https://gitlab.coko.foundation/cokoapps/server/commit/2bab5364967edd704dcbd0de26e3d5ff422a3b1b))
* **server:** upgrade to apollo server v4 ([5a1e103](https://gitlab.coko.foundation/cokoapps/server/commit/5a1e103f63b35e94df8e2c17a3dfc836bc0a3a26))
* simplify s3 url config ([cd5b1c2](https://gitlab.coko.foundation/cokoapps/server/commit/cd5b1c2dde54d69d4dd7948607c0926ea1a30fcd))
* upgrade aws-sdk to v3 ([fae0125](https://gitlab.coko.foundation/cokoapps/server/commit/fae01258d358b403cf2775313372c44e1c4d2e2f))


### Bug Fixes

* add useJobQueue to list of removed config keys ([56e9139](https://gitlab.coko.foundation/cokoapps/server/commit/56e9139e0664df436c8ed054dfc67a4f4dab1f1b))
* **cli:** fix circular command not exiting ([285e44a](https://gitlab.coko.foundation/cokoapps/server/commit/285e44a3c9ecec497c76df24dbf2b137cb5f18be))
* fix graphql cors ([4f0adde](https://gitlab.coko.foundation/cokoapps/server/commit/4f0adde4f9a454ddb26c6c03f6e0a7c7c8d9c99b))
* fix optional missing keys crashing ([797ec71](https://gitlab.coko.foundation/cokoapps/server/commit/797ec71c8563de9566cc1e81d6ffa293bfaa66a1))
* **graphql:** fix isAdmin shield permission ([06c7970](https://gitlab.coko.foundation/cokoapps/server/commit/06c797051274f4ac1a660b99a31b775aa2bdbc63))
* **graphql:** make sure totalCount cannot be null ([6c51caa](https://gitlab.coko.foundation/cokoapps/server/commit/6c51caad88a33c9c82d45bd87ebfda9ca0d20458))
* **graphql:** make user query result and id param not nullable ([2a9f174](https://gitlab.coko.foundation/cokoapps/server/commit/2a9f17443c029ba68e1eecc6e7a6201594a3f36a))
* **graphql:** set not nullable values on members and add type docs for teams ([9c58861](https://gitlab.coko.foundation/cokoapps/server/commit/9c588612a035acaf46f4f3736f670aaaaf70f8ac))
* **server:** fix startServer imports ([7ecc1e8](https://gitlab.coko.foundation/cokoapps/server/commit/7ecc1e812547006bf76bc1110c541650ad2aaeae))
* **server:** make sure nodemon restarts for non-js files ([8154927](https://gitlab.coko.foundation/cokoapps/server/commit/81549279d2c60d9b716039d4be4884f1fbd63d06))


* **models:** upgrade knex and objection ([d4e0b2a](https://gitlab.coko.foundation/cokoapps/server/commit/d4e0b2a4eaf2b18c84cf4b4a932b512218167b94))
* upgrade faker ([6b4b708](https://gitlab.coko.foundation/cokoapps/server/commit/6b4b70829493750fb477fbfc59565f48f7c2bff3))

### [3.13.2](https://gitlab.coko.foundation/cokoapps/server/compare/v3.13.1...v3.13.2) (2024-08-27)


### Bug Fixes

* **models:** make team member status nullable ([b91df44](https://gitlab.coko.foundation/cokoapps/server/commit/b91df449edf32ff45e0018602660c82a74dc14c6))

### [3.13.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.13.0...v3.13.1) (2024-05-14)


### Bug Fixes

* **server:** fix bug where server crashes if teams are not defined ([62d20ff](https://gitlab.coko.foundation/cokoapps/server/commit/62d20ffec566f2ef4081f4bc41d20e8f3e5b30dd))

## [3.13.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.12.0...v3.13.0) (2024-04-29)


### Features

* expose isEnvVariableTrue helper function ([2ac0bac](https://gitlab.coko.foundation/cokoapps/server/commit/2ac0bac6db56a5040f31512fc75b8a1b3b81b5ee))


### Bug Fixes

* **db-manager:** fix immutability issue of db config so that it can be extended ([d75713b](https://gitlab.coko.foundation/cokoapps/server/commit/d75713b91dc79ef0349fbd47bf9586c338014a49))

## [3.12.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.11.0...v3.12.0) (2024-04-29)


### Features

* **db-manager:** add POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES env variable ([5589a8e](https://gitlab.coko.foundation/cokoapps/server/commit/5589a8ec9055ebc973b22d4d708648a54cf93fc5))


### Bug Fixes

* switch s3 healthcheck to using headBucket for compatibility with do ([d732d75](https://gitlab.coko.foundation/cokoapps/server/commit/d732d7561f77c2c59e09f0cc2e9521a13c7fb3b7))

## [3.11.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.10.1...v3.11.0) (2024-04-18)


### Features

* **db-manager:** expose create tables command ([3611f59](https://gitlab.coko.foundation/cokoapps/server/commit/3611f59facab8c5cbeb8c5f41d64a5bfc76c2f4c))

### [3.10.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.10.0...v3.10.1) (2024-02-22)


### Bug Fixes

* make coko-server cli work ([7f480ad](https://gitlab.coko.foundation/cokoapps/server/commit/7f480adf77f9b6061e740551711144863d00dff1))

### [3.10.1-alpha.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.10.0...v3.10.1-alpha.0) (2024-02-22)


### Bug Fixes

* fix cli path in package.json ([df06372](https://gitlab.coko.foundation/cokoapps/server/commit/df0637284e18fde140efe9ddaf37a07277db8b83))

## [3.10.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.9.1...v3.10.0) (2024-02-16)


### Features

* expose migrate as a function ([ebdd3dc](https://gitlab.coko.foundation/cokoapps/server/commit/ebdd3dc76150a96ab32c1e63b6b351cad05039f3))

### [3.9.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.9.0...v3.9.1) (2024-02-13)

### [3.9.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.8.1...v3.9.0) (2024-02-01)


### Features

* add activity log service ([697038f](https://gitlab.coko.foundation/cokoapps/server/commit/697038f423abfa6cc43a36213f00bfa1815659de))


### Bug Fixes

* **server:** andle oauth refresh token having 0 as its expiration value ([14cd7f3](https://gitlab.coko.foundation/cokoapps/server/commit/14cd7f384bec46beb539d9f54a500dc09ca0d7b2))
* **server:** fix identity-tokens circular dependency ([8beb1df](https://gitlab.coko.foundation/cokoapps/server/commit/8beb1dfcb9e7f959b0c4e842ad946d336b6c194d))
* **server:** handle access token becoming invalid before expiration ([89fedbd](https://gitlab.coko.foundation/cokoapps/server/commit/89fedbd20493ec96b88488abaaba35ed79466eb7))


### [3.8.2-beta.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.8.2-beta.0...v3.8.2-beta.1) (2024-01-30)


### Bug Fixes

* **server:** fix pubsubmanager imports ([3f1bb6a](https://gitlab.coko.foundation/cokoapps/server/commit/3f1bb6a4ec801ad599e535a907d5731897cdb322))


### [3.8.2-beta.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.8.1...v3.8.2-beta.0) (2024-01-30)


### Bug Fixes

* fix jobs circular dependency ([897834f](https://gitlab.coko.foundation/cokoapps/server/commit/897834fc95cf6a72a9eee27cbafd6b01b6e9d9b1))


### [3.8.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.8.0...v3.8.1) (2024-01-23)


### Bug Fixes

* **server:** allow files without mimetype to be uploaded ([cca8846](https://gitlab.coko.foundation/cokoapps/server/commit/cca8846f967acfa658591fc1adacb86bbd1837ca))

## [3.8.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.7.1...v3.8.0) (2023-12-22)


### Features

* add new env variable for separate s3 delete operations ([80c5ad7](https://gitlab.coko.foundation/cokoapps/server/commit/80c5ad770773ed89252cd88c5470617379dd1363))

### [3.7.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.7.0...v3.7.1) (2023-12-21)


### Bug Fixes

* **models:** force lowercase emails in identity find methods ([9e2a254](https://gitlab.coko.foundation/cokoapps/server/commit/9e2a254715c787a4c49c0a339d3bcd33450a20cd))
* **models:** remove non-existent user.email field from api ([3e403b0](https://gitlab.coko.foundation/cokoapps/server/commit/3e403b0f87c18b0decb108697b92b90cd5fa9d6c))

## [3.7.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.6.0...v3.7.0) (2023-12-20)


### Features

* **server:** expose sanitized clientUrl and serverUrl ([8a32d5e](https://gitlab.coko.foundation/cokoapps/server/commit/8a32d5e763b0a8132b164439a4705d4935b3bf03))

## [3.6.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.5.0...v3.6.0) (2023-12-19)


### Features

* **server:** remove trailing slashes from client url ([da79590](https://gitlab.coko.foundation/cokoapps/server/commit/da795901c3d2d162915c5b5ade42f7c57fa39957))


### Bug Fixes

* **models:** fix migration failing when multiple files use the same object key ([22f0218](https://gitlab.coko.foundation/cokoapps/server/commit/22f021800e345843286954b139645d0eb93456dd))

## [3.5.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.4.1...v3.5.0) (2023-12-19)


### Features

* **models:** add optional status on updateMembershipByTeamId ([09adbe2](https://gitlab.coko.foundation/cokoapps/server/commit/09adbe2af74cbeb548cbd588cd729730f796ed96))


### Bug Fixes

* duplicate identity crashes server ([d2fb19f](https://gitlab.coko.foundation/cokoapps/server/commit/d2fb19f54ba7175ac1c1f9a257aac5f8d0a61222))
* **server:** correctly update existing oauth identities ([479cc60](https://gitlab.coko.foundation/cokoapps/server/commit/479cc6036bc20a0193802718e283a37436b1b1ea))

### [3.4.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.4.0...v3.4.1) (2023-12-15)


### Bug Fixes

* handle refresh token expiration ([eb70a4b](https://gitlab.coko.foundation/cokoapps/server/commit/eb70a4bd363cf0dac4aa60e83bb2031847fb8872))

## [3.4.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.3.1...v3.4.0) (2023-12-13)


### Features

* make s3 style path configurable ([f84130e](https://gitlab.coko.foundation/cokoapps/server/commit/f84130ef1d9620ae1fe55d8679cf8e245ad891bc))

### [3.3.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.3.0...v3.3.1) (2023-12-08)


### Bug Fixes

* use s3 api instead of axios for full size image migration ([80d1c44](https://gitlab.coko.foundation/cokoapps/server/commit/80d1c4439bf6094c8eefcc3ecbe1784642a11cef))

## [3.3.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.2.3...v3.3.0) (2023-12-06)


### Features

* add deferred job for renewing refresh tokens ([2f57018](https://gitlab.coko.foundation/cokoapps/server/commit/2f570189f7f3ea173871fc34c53fd71d372d3fd6))

### [3.2.3](https://gitlab.coko.foundation/cokoapps/server/compare/v3.2.2...v3.2.3) (2023-11-28)


### Bug Fixes

* **server:** correct return for getAuthTokens ([0381570](https://gitlab.coko.foundation/cokoapps/server/commit/03815705134d03e30cfb1faa51fb5cbd30528897))

### [3.2.2](https://gitlab.coko.foundation/cokoapps/server/compare/v3.2.1...v3.2.2) (2023-11-28)


### Bug Fixes

* use utc for expiration times ([71847cf](https://gitlab.coko.foundation/cokoapps/server/commit/71847cf35de32bb4183999ea1ae1d24a14bc6104))

### [3.2.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.2.0...v3.2.1) (2023-11-18)


### Bug Fixes

* add redirect uri to integration authenticated call ([a0b2531](https://gitlab.coko.foundation/cokoapps/server/commit/a0b253113dba235e29e53e193e50c625d5f829c4))

## [3.2.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.1.1...v3.2.0) (2023-11-17)


### Features

* add function to make authenticated oauth calls ([8e52c4a](https://gitlab.coko.foundation/cokoapps/server/commit/8e52c4a731776bb7217ea76ab0c01bb4bb715710))
* **models:** add expiration to oauth tokens in identities ([9ebdf48](https://gitlab.coko.foundation/cokoapps/server/commit/9ebdf48e61bef0bb28d2e1cf38c9ee4722af7acc))
* **server:** add function to make authenticated call to integration ([313929d](https://gitlab.coko.foundation/cokoapps/server/commit/313929d239fa34b3a8d8f10ca4baf3061f482fa5))


### Bug Fixes

* **models:** add constraint that makes provider-email combinations unique ([f04f589](https://gitlab.coko.foundation/cokoapps/server/commit/f04f589224321166adb7611c4059b3865ce416ad))

### [3.1.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.1.0...v3.1.1) (2023-11-10)


### Bug Fixes

* **server:** fix file migration import paths ([bb4f94f](https://gitlab.coko.foundation/cokoapps/server/commit/bb4f94f9d789f63d5839723efdbfc7b204b24669))

## [3.1.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.1...v3.1.0) (2023-11-08)


### Features

* add full size conversion to image uploads ([6effd16](https://gitlab.coko.foundation/cokoapps/server/commit/6effd169184c879c7fa0c45594395a254ab76150))

### [3.0.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0...v3.0.1) (2023-10-19)


### Bug Fixes

* **server:** await promise when returning image width ([a8f4ec2](https://gitlab.coko.foundation/cokoapps/server/commit/a8f4ec27dc9ab6cb95aa5096301474742777261b))

## [3.0.0](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.16...v3.0.0) (2023-10-03)


### Features

* upgrade bcrypt to allow using node 18+ ([f946a3e](https://gitlab.coko.foundation/cokoapps/server/commit/f946a3ea13d03d2d6b0cf4ff2971de5f96593398))


### Bug Fixes

* update gql shield version in lockfile ([10d9be1](https://gitlab.coko.foundation/cokoapps/server/commit/10d9be1e447e16bdd91370c96fb16dca406004e0))

## [3.0.0-beta.16](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.15...v3.0.0-beta.16) (2023-07-20)


### Features

* **server:** add wax to docx converter ([2febe66](https://gitlab.coko.foundation/cokoapps/server/commit/2febe669a05293392b4a113bce457c69c7bfa366))

## [3.0.0-beta.15](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.14...v3.0.0-beta.15) (2023-07-14)

## [3.0.0-beta.14](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.13...v3.0.0-beta.14) (2023-07-12)


### Features

* **models:** added currentUserOnly flag in members resolver ([65105e9](https://gitlab.coko.foundation/cokoapps/server/commit/65105e94ea2bedd0b9905a636fe8b6e05dd1d830))

## [3.0.0-beta.13](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.12...v3.0.0-beta.13) (2023-06-09)

## [3.0.0-beta.12](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.11...v3.0.0-beta.12) (2023-06-06)


### Bug Fixes

* **server:** fix problem with await of pubsub ([84c6ff4](https://gitlab.coko.foundation/cokoapps/server/commit/84c6ff474333d96dcdf9fcc1c454419869c76097))

## [3.0.0-beta.11](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.10...v3.0.0-beta.11) (2023-06-06)


### Features

* **server:** subscriptions added for user ([adf5bf9](https://gitlab.coko.foundation/cokoapps/server/commit/adf5bf96658652e6525623cddc8c1ca48c0ca0a4))

## [3.0.0-beta.10](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.9...v3.0.0-beta.10) (2023-04-06)


### Bug Fixes

* **server:** fix svg corrupted conversions ([b344d96](https://gitlab.coko.foundation/cokoapps/server/commit/b344d9656018bcd9f267240868a67c61b8f32961))

## [3.0.0-beta.9](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.8...v3.0.0-beta.9) (2023-04-04)


### Bug Fixes

* **models:** current user should be allowed to return null ([57f11f4](https://gitlab.coko.foundation/cokoapps/server/commit/57f11f4fbd43f29871009ab8993f8bf1d0e2e1dc))

## [3.0.0-beta.8](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.7...v3.0.0-beta.8) (2023-03-23)


### Features

* **server:** add chat gpt support ([231f3bc](https://gitlab.coko.foundation/cokoapps/server/commit/231f3bca38b8955de694a229f8fc3d59a6dbfb05))

## [3.0.0-beta.7](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.6...v3.0.0-beta.7) (2023-03-15)


### Bug Fixes

* **models:** improvments in file migration script ([4267df9](https://gitlab.coko.foundation/cokoapps/server/commit/4267df9290e3200b05ec13c37b73c3c6d0091886))
* **server:** correction in forceObjectKey feature and tests ([8c45224](https://gitlab.coko.foundation/cokoapps/server/commit/8c45224a773182f8eaa9468fe771831f61356a5b))

## [3.0.0-beta.6](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.5...v3.0.0-beta.6) (2023-03-08)

## [3.0.0-beta.5](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.4...v3.0.0-beta.5) (2023-02-28)


### Bug Fixes

* **models:** create unique username if not exists ([28bcd51](https://gitlab.coko.foundation/cokoapps/server/commit/28bcd51ede13fc4dbff54761a0185cffc32f806b))

## [3.0.0-beta.4](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.3...v3.0.0-beta.4) (2023-02-24)


### Bug Fixes

* **models:** more gentle migrations for users teams identities and team members ([0e4cb8b](https://gitlab.coko.foundation/cokoapps/server/commit/0e4cb8b1dbd8d26e6388140563bf8c6eccc40f85))
* **server:** use correct env variable for cors ([e0e25e3](https://gitlab.coko.foundation/cokoapps/server/commit/e0e25e3086a07dcf65b35222425cb1a4a6939f75))

## [3.0.0-beta.3](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.2...v3.0.0-beta.3) (2023-02-23)


### Features

* **server:** allow filestorage to read credentials from os aws setup ([8db9292](https://gitlab.coko.foundation/cokoapps/server/commit/8db92929e806a26ad6d1caddb3f892c947f5f5a3))

## [3.0.0-beta.2](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.1...v3.0.0-beta.2) (2023-02-15)


### Features

* **server:** add callMicroservice function ([5b06158](https://gitlab.coko.foundation/cokoapps/server/commit/5b06158a7a88785637f8852fa425269315d20d59))
* **server:** convert eps to svg, tiff \& png to png ([440b366](https://gitlab.coko.foundation/cokoapps/server/commit/440b366bd68b0bdfa0a7ee1dd61cb18667bf38f5))
* **server:** expose verifyJWT added ([a6fd48c](https://gitlab.coko.foundation/cokoapps/server/commit/a6fd48c9fec708f572db6217ab9f68d5a6cc6dc6))
* **server:** pass cors config to apollo server ([6232cb5](https://gitlab.coko.foundation/cokoapps/server/commit/6232cb5f71704d22eb8d3f8fe4bdb86e6229059c))


### Bug Fixes

* **models:** get base model for service credentials from local file ([f17e633](https://gitlab.coko.foundation/cokoapps/server/commit/f17e633ea7018ee4aabf6fcc30cbd107bccf03d9))
* **server:** move config services into get access token fn ([2487665](https://gitlab.coko.foundation/cokoapps/server/commit/24876652867c6d8b696a408f3127a300181ad2e6))
* **server:** register cors before static endpoints ([b64dd28](https://gitlab.coko.foundation/cokoapps/server/commit/b64dd28f2a77cfc689ad8c3a6c139eebf3d16926))

## [3.0.0-beta.1](https://gitlab.coko.foundation/cokoapps/server/compare/v3.0.0-beta.0...v3.0.0-beta.1) (2023-01-27)


### Bug Fixes

* **models:** remove Fake from dist models ([3c72d6f](https://gitlab.coko.foundation/cokoapps/server/commit/3c72d6f4773d104320eefeb31eb953e7b7bae667))

## [3.0.0-beta.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.14.0...v3.0.0-beta.0) (2023-01-24)


### Features

* **models:** add models test setup ([94a9bc5](https://gitlab.coko.foundation/cokoapps/server/commit/94a9bc5e5b4987fde91e857ebecd71ffa104a800))
* **models:** add to/remove from global team methods ([19daad7](https://gitlab.coko.foundation/cokoapps/server/commit/19daad75c136184777cb76cd9a53b14634be656c))
* **models:** chat added ([e7cb9c7](https://gitlab.coko.foundation/cokoapps/server/commit/e7cb9c7695356fd0a663de9d821d5416de00dad4))
* **models:** enable query users by their data ([f1dab50](https://gitlab.coko.foundation/cokoapps/server/commit/f1dab50dae12a650f3043d171c714050ab0ebaf1))
* **models:** expose graphql loader util ([2187e36](https://gitlab.coko.foundation/cokoapps/server/commit/2187e36f048be0ac105143f2b5382f29d0ffc42c))
* **models:** expose model types ([f4dd673](https://gitlab.coko.foundation/cokoapps/server/commit/f4dd67398812d2a7a87bfea43583dd419d47c2b9))
* **models:** get user teams with a model method ([fafdcf1](https://gitlab.coko.foundation/cokoapps/server/commit/fafdcf16cb7c7833ff01232cfbb5a131afd2bb95))
* **models:** graphql schema and resolvers added ([3bcbeff](https://gitlab.coko.foundation/cokoapps/server/commit/3bcbeff74f41925ce4df161ba1be21f98be0d54f))
* **models:** user, identity, team and teamMember added ([cbcf8a1](https://gitlab.coko.foundation/cokoapps/server/commit/cbcf8a16b4c5c4d6a5d5bf345a4c8b1164c77ada))
* **models:** user, identity, team and teamMember added ([58be118](https://gitlab.coko.foundation/cokoapps/server/commit/58be11849c63b2ab55c5394b58ba69c157d9348e))
* **models:** user, team, chat api completed ([e2a5bc1](https://gitlab.coko.foundation/cokoapps/server/commit/e2a5bc197905142b53f07d44f35881a368283885))
* object storage ([b3d6d2c](https://gitlab.coko.foundation/cokoapps/server/commit/b3d6d2cdba27b24b0f835efb81b45b2663353b65))
* **server:** add resend verify email after login ([a803d9f](https://gitlab.coko.foundation/cokoapps/server/commit/a803d9f4b4f639cb93cc2fe59f8039206e315c10))
* **server:** expose req & res in graphql context ([7e5e876](https://gitlab.coko.foundation/cokoapps/server/commit/7e5e87642e7c49fcb94947794dfd1c0adc170ac1))
* **server:** init graphql-api ([5feb581](https://gitlab.coko.foundation/cokoapps/server/commit/5feb581c24d67d1f4cc448479f360814879c9783))
* **server:** replace external url, base url and client variables with a single client url variable ([b746aea](https://gitlab.coko.foundation/cokoapps/server/commit/b746aea41b1e3487a9c5dbe135c09bbc4b74ba46))
* **server:** team, teamMember, chatThread, chatMessage added ([cfe38e6](https://gitlab.coko.foundation/cokoapps/server/commit/cfe38e627f2fed3b65c51e07fe5c407cfee6e508))
* **server:** use graphql-upload to allow node > 12 ([3461a77](https://gitlab.coko.foundation/cokoapps/server/commit/3461a7757f4e49bc6a5e3a6699a04e5491de9b4f))


### Bug Fixes

* **middleware:** allow shield errors ([a6c32b8](https://gitlab.coko.foundation/cokoapps/server/commit/a6c32b872fa345884beb7dbb936353fd90c8fc3e))
* **middleware:** permissions circular dependency ([877f428](https://gitlab.coko.foundation/cokoapps/server/commit/877f428efce0b90b06f1fdfe4c40511ff141bfba))
* **middleware:** remove server host var in prod ([03b1bdf](https://gitlab.coko.foundation/cokoapps/server/commit/03b1bdf4df0c06e4676d338686644d2e4bb07c81))
* **models:** allow paginating users results ([8d65cce](https://gitlab.coko.foundation/cokoapps/server/commit/8d65cce94e773fc81066b6f523e2272e26fc2b9f))
* **models:** always count ([2ddd4a2](https://gitlab.coko.foundation/cokoapps/server/commit/2ddd4a2395737eb20096e3a7270d255404ac4a35))
* **models:** chatMessage test fixed ([0e987df](https://gitlab.coko.foundation/cokoapps/server/commit/0e987dfc1719440a760171c99dbc440e479eb695))
* **models:** correcting typo ([9e156f4](https://gitlab.coko.foundation/cokoapps/server/commit/9e156f416533e5e73259209d23559998b36565b2))
* **models:** delete identities before deleting user(s) ([c466e4b](https://gitlab.coko.foundation/cokoapps/server/commit/c466e4bcec8aa1584e375059d9b8b001cafd920b))
* **models:** fetch teamMember user from user model instead of loader ([b62eea9](https://gitlab.coko.foundation/cokoapps/server/commit/b62eea9c89e05bf9c3ee6654d5822bf2a9d7d20d))
* **models:** fix api loaders ([d4fac6a](https://gitlab.coko.foundation/cokoapps/server/commit/d4fac6afeee44e0c7cfe0af3f968c292079e9528))
* **models:** fix loader error message ([8177a10](https://gitlab.coko.foundation/cokoapps/server/commit/8177a10826d105f711d350bb1faa0eac04834e2a))
* **models:** fix logger and model imports ([b30a283](https://gitlab.coko.foundation/cokoapps/server/commit/b30a283a2630a510220164badf08e8bb38e3e4f3))
* **models:** pass the correct parameters to updatePassword controller ([d36121a](https://gitlab.coko.foundation/cokoapps/server/commit/d36121a50365ff978578c68be6adf5def965a34b))
* **models:** return array of ids when deleting users ([2d40788](https://gitlab.coko.foundation/cokoapps/server/commit/2d40788377adc8fbf1c5347d75fe376cfb8e6ccb))
* **models:** small is not a type ([74aa952](https://gitlab.coko.foundation/cokoapps/server/commit/74aa952d4565add0ffcdf5cb6225137e9d84a2b5))
* **models:** unused user.teams deleted from resolvers ([46d5224](https://gitlab.coko.foundation/cokoapps/server/commit/46d52245bf80f8a4165049cd457bf8aad82542d6))
* running tests ([297d5a1](https://gitlab.coko.foundation/cokoapps/server/commit/297d5a1d6def7c73e1e8c810592a861659b56413))
* **server:** add file type definitions ([8c04f35](https://gitlab.coko.foundation/cokoapps/server/commit/8c04f35dd7cbd30fb371b6361ad296684631e9c4))
* **server:** add plain text link to request password reset ([7badcb8](https://gitlab.coko.foundation/cokoapps/server/commit/7badcb840ec573296da0daa70449ecc18f2647b7))
* **server:** avoid circular dependencies ([75b62b2](https://gitlab.coko.foundation/cokoapps/server/commit/75b62b2b4518eb46a1a0d5bbfe57f379d2a3440b))
* **server:** correct login typedefs ([85681b2](https://gitlab.coko.foundation/cokoapps/server/commit/85681b2ecfec96fcfba6a21b51344adc16dfc6b3))
* **server:** correct users typedef ([4efba7a](https://gitlab.coko.foundation/cokoapps/server/commit/4efba7a13661a348bed599b9729ac3b47c15be60))
* **server:** correct verify after login query ([8e2ec49](https://gitlab.coko.foundation/cokoapps/server/commit/8e2ec494c8b9a7f55fe298f18b6ee1448ee39cf3))
* **server:** do not allow gql playground in production ([f43c1d5](https://gitlab.coko.foundation/cokoapps/server/commit/f43c1d5567218406d4f6cc55ba3ebc6d99f93a41))
* **server:** error handle invalid login credentials ([a0a766a](https://gitlab.coko.foundation/cokoapps/server/commit/a0a766af94e46aab0174611d7ca1a5cece3c45b8))
* **server:** file controller circular dependencies ([1aac706](https://gitlab.coko.foundation/cokoapps/server/commit/1aac7069ece46a11fcd5c5fcb34cdaf94ab5d631))
* **server:** fix datetime type for file ([782be0b](https://gitlab.coko.foundation/cokoapps/server/commit/782be0bc67b401eb3bbeb6509ff3f9fa11d858ff))
* **server:** fix team member loader response ([aee28ae](https://gitlab.coko.foundation/cokoapps/server/commit/aee28aef88da1927d38d144a1c1ba857121c061d))
* **server:** fix team queries api response definitions ([a68a1a6](https://gitlab.coko.foundation/cokoapps/server/commit/a68a1a63f4296687f9d12232bd5b5c5f4c669f28))
* **server:** fix Upload scalar resolver ([23ae9a6](https://gitlab.coko.foundation/cokoapps/server/commit/23ae9a616d8af1ac7a0f2f5e1bcf4fe59b89f84d))
* **server:** handle user not found on login ([b6c4bdd](https://gitlab.coko.foundation/cokoapps/server/commit/b6c4bdd53bbe68fa0742a2fbfdf76db1e84dcacd))
* **server:** improve plain text formatting for verification email ([09894cb](https://gitlab.coko.foundation/cokoapps/server/commit/09894cb96806f95916644816ab37e2c6c930f143))
* **server:** include plain text link in verification email ([7444dd6](https://gitlab.coko.foundation/cokoapps/server/commit/7444dd60d13a40d3efd31295fc7ed39731c031f2))
* **server:** make login mutation args an input ([039dcd4](https://gitlab.coko.foundation/cokoapps/server/commit/039dcd48c9f755b53c7b99a7177b0a87a42972d9))
* **server:** make sure old api is not called from pubsweet ([f46efb0](https://gitlab.coko.foundation/cokoapps/server/commit/f46efb042430d31b3f75547f5dca4b13bf702ec9))
* **server:** make username optional during signup ([02e0cd1](https://gitlab.coko.foundation/cokoapps/server/commit/02e0cd1f372f3ac826eec19abba35854a6fb5b01))
* **server:** remove loaders from user identities for now ([cced62a](https://gitlab.coko.foundation/cokoapps/server/commit/cced62ab12c6c059cc7d2b1a55574743b25a3eb3))
* **server:** revert last change ([fa2c3da](https://gitlab.coko.foundation/cokoapps/server/commit/fa2c3daefc39e8628c882a820fcbb8ba02a224fe))
* **server:** signup: do not check username if not provided ([4a17029](https://gitlab.coko.foundation/cokoapps/server/commit/4a17029f8986b20f0387e9745a926c0d258939af))
* **server:** temporarily disable team member data loader ([0441a73](https://gitlab.coko.foundation/cokoapps/server/commit/0441a73c37ebac3d5bfa67dec0ef5ee109a46441))
* **server:** throw when fileStorage configuration missing ([8e1d0cc](https://gitlab.coko.foundation/cokoapps/server/commit/8e1d0cc60470131b1ebc886097fcef9bf5e3984e))
* **server:** wrap connect to filestorage in a function ([49e230d](https://gitlab.coko.foundation/cokoapps/server/commit/49e230d4f16ec0e3c8b4c510536312cf9fde4ff1))

## [1.14.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.13.0...v1.14.0) (2021-04-19)

### Features

- **server:** add uuid helper ([62a04de](https://gitlab.coko.foundation/cokoapps/server/commit/62a04de4c0fa569bf88ac4571ac55b858ba12532))

### Bug Fixes

- fix useTransaction base model import ([a06af0f](https://gitlab.coko.foundation/cokoapps/server/commit/a06af0fe85a65d2eee3dfa41950e3b3397bf838d))

## [1.13.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.12.2...v1.13.0) (2021-04-10)

### Features

- **server:** add useTransaction ([d33b2f2](https://gitlab.coko.foundation/cokoapps/server/commit/d33b2f24b0a6e197410b1f96949a8a1455fcf2c4))

### [1.12.2](https://gitlab.coko.foundation/cokoapps/server/compare/v1.12.1...v1.12.2) (2021-03-30)

### Bug Fixes

- **server:** fix mailer config issue ([07c6a02](https://gitlab.coko.foundation/cokoapps/server/commit/07c6a02531751037e1b185c4f2bdf56c3226acfa))

### [1.12.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.12.0...v1.12.1) (2021-03-29)

### Bug Fixes

- **server:** server should not crash without mailer config ([62b9d7f](https://gitlab.coko.foundation/cokoapps/server/commit/62b9d7f9259a4723ca5ba08207ddb3484a40883a))

## [1.12.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.11.0...v1.12.0) (2021-03-23)

### Features

- **server:** include send email component & update docs ([8dc9faa](https://gitlab.coko.foundation/cokoapps/server/commit/8dc9faae2f85bd462c3b4dbc90ad126a0a6584c6))

## [1.11.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.10.0...v1.11.0) (2021-03-18)

### Features

- **server:** export db from db-manager ([6524687](https://gitlab.coko.foundation/cokoapps/server/commit/652468782a52c5940807598a4eef75a59d4d135c))

## [1.10.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.9.1...v1.10.0) (2021-03-18)

### Features

- **server:** expose pubsubmanager from ps-server ([0f5db7e](https://gitlab.coko.foundation/cokoapps/server/commit/0f5db7e08909539ef92adf74e79ff1db30ca6014))

### [1.9.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.9.0...v1.9.1) (2021-03-10)

### Bug Fixes

- **server:** fix pg-boss version mismatch ([b27496e](https://gitlab.coko.foundation/cokoapps/server/commit/b27496e4ada78d51df1b40642277d9d781fb9034))

## [1.9.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.8.0...v1.9.0) (2021-03-03)

### Features

- **server:** expose pg-boss from ps-server ([ed611f7](https://gitlab.coko.foundation/cokoapps/server/commit/ed611f71927cc64b9b5b7e936a326a0e2e5185fc))

### Bug Fixes

- **server:** add error handling for graphql errors ([358d8fa](https://gitlab.coko.foundation/cokoapps/server/commit/358d8fafd9638afa993bd9a5e76acd3c8c2275f0))

## [1.8.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.7.1...v1.8.0) (2020-12-09)

### Features

- **server:** add ability to turn off pg-boos job queue ([35a56f1](https://gitlab.coko.foundation/cokoapps/server/commit/35a56f1f81b4bf3c276595e7525ea7e6648ce305))
- **server:** add health check endpoint ([a03a4cb](https://gitlab.coko.foundation/cokoapps/server/commit/a03a4cb9c1cd1dce84949ed58011019acc08c3ca))

### [1.7.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.7.0...v1.7.1) (2020-12-08)

### Bug Fixes

- **server:** fix bundle serving path ([71812d4](https://gitlab.coko.foundation/cokoapps/server/commit/71812d499572af0396be4736e09d27a4f578c68c))

## [1.7.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.6.3...v1.7.0) (2020-12-08)

### Features

- **server:** add env variable that will serve build ([e1bec79](https://gitlab.coko.foundation/cokoapps/server/commit/e1bec79db9c972ac9bd9edf0e9cdc58934603727))

### [1.6.3](https://gitlab.coko.foundation/cokoapps/server/compare/v1.6.2...v1.6.3) (2020-11-23)

### Bug Fixes

- **server:** handle client protocol and port not being defined ([a100b6b](https://gitlab.coko.foundation/cokoapps/server/commit/a100b6ba705e575cb200833fdf9ba8818861786f))

### [1.6.2](https://gitlab.coko.foundation/cokoapps/server/compare/v1.6.1...v1.6.2) (2020-11-23)

### Bug Fixes

- **server:** serve static folder from server ([e565522](https://gitlab.coko.foundation/cokoapps/server/commit/e565522b078c9396dede7815845d05731499d643))

### [1.6.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.6.0...v1.6.1) (2020-11-20)

### Bug Fixes

- **server:** make 0.0.0.0 be set as localhost for CORS setup ([ca2673b](https://gitlab.coko.foundation/cokoapps/server/commit/ca2673bdd3218d41e8b1bdadedd0c37d2abb7174))

## [1.6.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.5.0...v1.6.0) (2020-11-20)

### Features

- **server:** allow server to read broken down client url for cors ([a3997b7](https://gitlab.coko.foundation/cokoapps/server/commit/a3997b770883a53197686e98a6d7b30a21d67100))

## [1.5.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.4.1...v1.5.0) (2020-11-16)

### Features

- **server:** export startServer function from pubsweet ([e43dd53](https://gitlab.coko.foundation/cokoapps/server/commit/e43dd53f16ab90060cd7d4482c982870878ee490))

### [1.4.1](https://gitlab.coko.foundation/cokoapps/server/compare/v1.4.0...v1.4.1) (2020-10-27)

### Bug Fixes

- **server:** do not load subscriptions if gql is off ([b7359ae](https://gitlab.coko.foundation/cokoapps/server/commit/b7359ae67a5630581df35e77202e792dcfe42915))

## [1.4.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.3.0...v1.4.0) (2020-10-26)

### Features

- **middleware:** enable shield debug mode when not in production ([fa2ce20](https://gitlab.coko.foundation/cokoapps/server/commit/fa2ce20327724f75b877adbea28d18fd9d285f75))
- **server:** add ability to disable server ([4d89db0](https://gitlab.coko.foundation/cokoapps/server/commit/4d89db0b9832328e45801cb63ef4bfe9f77aca7a))

## [1.3.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.2.0...v1.3.0) (2020-06-13)

### Features

- **middleware:** add email middleware ([f0e6fb9](https://gitlab.coko.foundation/cokoapps/server/commit/f0e6fb9456f33e12be84181f2f70bf430f242399))

## [1.2.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.1.0...v1.2.0) (2020-05-28)

### Features

- **server:** export BaseModel ([82e7cd5](https://gitlab.coko.foundation/cokoapps/server/commit/82e7cd5c4de4d0b9e0017c24a52fee0cb36bdc62))
- **server:** export logger ([a3dfd2b](https://gitlab.coko.foundation/cokoapps/server/commit/a3dfd2b0df720cbb96c71c5c95977625058f97dc))

## [1.1.0](https://gitlab.coko.foundation/cokoapps/server/compare/v1.0.0...v1.1.0) (2020-05-20)

### Features

- **middleware:** add helpers for authorization middleware ([f17b265](https://gitlab.coko.foundation/cokoapps/server/commit/f17b2655d50764289a88e4fae5852f302e4bddc0))

### Bug Fixes

- **middleware:** ensure rules are not empty before applying shield ([557dc56](https://gitlab.coko.foundation/cokoapps/server/commit/557dc56dc2cf5d628aeca56422e8a78b61dd8c90))

## [1.0.0](https://gitlab.coko.foundation/cokoapps/server/compare/v0.1.0...v1.0.0) (2020-05-11)

### Features

- **middleware:** add middleware for authorization ([33659f4](https://gitlab.coko.foundation/cokoapps/server/commit/33659f424453f19f45f90eade432bc0df207e06c))

### Bug Fixes

- **server:** fix crash when trying to read empty config values ([c6c07e4](https://gitlab.coko.foundation/cokoapps/server/commit/c6c07e46141156a39c7e875223798303ea70e776))

## [0.1.0](https://gitlab.coko.foundation/cokoapps/server/compare/v0.0.2...v0.1.0) (2020-04-04)

### Features

- **server:** cors config to allow client running on a different port ([dff70dd](https://gitlab.coko.foundation/cokoapps/server/commit/dff70dd2623adc3855129f1e98ba1cda68f37a0d))

### [0.0.2](https://gitlab.coko.foundation/cokoapps/server/compare/v0.0.1...v0.0.2) (2020-03-28)

### Features

- bundle pubsweet cli with package ([0c4b206](https://gitlab.coko.foundation/cokoapps/server/commit/0c4b2060a6f453a12408bdb786967b6d709c2220))
- **server:** add cron support ([dcd352a](https://gitlab.coko.foundation/cokoapps/server/commit/dcd352ade1cc96583a1d86366fcc0a21aee77961))

### Bug Fixes

- **server:** resolve circular dependencies & make passport auth work ([5dffd0f](https://gitlab.coko.foundation/cokoapps/server/commit/5dffd0fbd65753181b4ac171cac40dd1b10df234))

### 0.0.1 (2020-03-27)

### Features

- **server:** export express app ([bdbab7d](https://gitlab.coko.foundation/cokoapps/server/commit/bdbab7d71d1ba8518ab40f60a8869975adf5dff8))

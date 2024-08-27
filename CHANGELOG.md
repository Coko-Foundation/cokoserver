# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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

#!/bin/sh
set -x
export NODE_CONFIG_DIR='./dev/config'

# This is run through docker. Its CWD will be the root folder.
chmod +x src/cli/coko-server.js
src/cli/coko-server.js migrate
node ./dev/scripts/ensureTempFolderExists.js
node ./dev/scripts/seedAdmin.js

exec "$@"

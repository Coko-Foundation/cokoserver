#!/bin/sh
set -x

# This is run through docker. Its CWD will be the root folder.
node ./dev/scripts/ensureTempFolderExists.js
# node ./dev/scripts/seedAdmin.js

exec "$@"

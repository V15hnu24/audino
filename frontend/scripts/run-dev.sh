#!/usr/bin/env bash

set -o errexit

app="/app/frontend"

cd "${app}" && npm run start

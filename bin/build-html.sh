#!/bin/bash

################################################################################
# Html build script
################################################################################

set -eou pipefail

echo 'Building html'

mkdir -p static/html && cp -r src/html/* static/html/

cache_key=$(date --utc -Iseconds)
cache_key="${cache_key%+*}"
sed -i "s/{cache_key}/$cache_key/g" static/html/*

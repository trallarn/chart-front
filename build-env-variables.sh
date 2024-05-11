#!/bin/bash

################################################################################
# Writes all environment variables prefixed by CHART_FRONT_ to
# ./static/env-variables.js which is exposed to the browser window.
################################################################################

set -eou pipefail

echo "Generating ./static/env-variables.js" >&2

# Reset config file
> ./static/env-variables.js
# Find all the CHART_FRONT_ environment variables in the environment
declare -a customVars
for key in $(env | awk -F "=" '{print $1}' | grep ".*CHART_FRONT_.*")
do
  customVars+=($key)
done
# Recreate a new config.js
for key in "${customVars[@]}"
do
  echo "window.$key='${!key}';" >> ./static/env-variables.js
done
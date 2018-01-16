#! /bin/bash
latest_version=$(npm info node version);
node_version=$(node -v);
if [ ${node_version:1:1} = ${latest_version:0:1} ]; then
  eval $1;
else
  echo "NodeJS ${node_version} instead of latest (${latest_version:0:1}) is detected. Skipping command";
fi

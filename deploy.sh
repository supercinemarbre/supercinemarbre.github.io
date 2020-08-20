#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

if [ -d "dist/" ]; then
  rm -rf docs/css docs/img docs/js
  cp -rf dist/* docs/
  rm -rf dist/
fi

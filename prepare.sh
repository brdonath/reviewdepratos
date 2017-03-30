#!/usr/bin/env bash
set -e

npm install -g cordova ionic gulp
npm install
git clone https://github.com/Telerik-Verified-Plugins/Facebook.git ../Facebook
ionic state restore
ionic browser add crosswalk


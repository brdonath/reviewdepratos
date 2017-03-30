#!/usr/bin/env bash
set -e

gulp ${1:-defaultprod}
cordova build android --release --inc-version
gulp dev

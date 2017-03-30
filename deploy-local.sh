#!/usr/bin/env bash
set -e

gulp ${1:-defaultdev}
#adb uninstall com.ionicframework.dishing
cordova run android
gulp dev

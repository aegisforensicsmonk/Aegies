@echo off
set "APP_ROOT=%~dp0"
set "OSINTFOOTPRINTS_DATA=%APP_ROOT%.osintfootprints-data"
set "OSINTFOOTPRINTS_CACHE=%APP_ROOT%.osintfootprints-cache"
set "OSINTFOOTPRINTS_LOGS=%APP_ROOT%.osintfootprints-logs"

pushd "%APP_ROOT%"
python sf.py -l 127.0.0.1:5001 > osintfootprints-server.stdout.log 2> osintfootprints-server.stderr.log
popd

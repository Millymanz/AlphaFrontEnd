@title Trade Riser Application Development
@echo off
setlocal enableextensions

set SCRIPT=%0
set DQUOTE="

:: Detect how script was launched
@echo %SCRIPT:~0,1% | findstr /l %DQUOTE% > NUL
if %ERRORLEVEL% EQU 0 set PAUSE_ON_CLOSE=1

:: Clear the screen
cls

:: Run mimosa adding on any parameters passed to the bat
//cd ./target/sources/mimosa

call node --debug=5858 node_modules/mimosa/bin/mimosa watch -s -d 

:EXIT
if defined PAUSE_ON_CLOSE pause
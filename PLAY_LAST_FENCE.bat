@echo off
setlocal
cd /d "%~dp0"

rem Start through a tiny local web server when Python is available.
rem This avoids browser restrictions that can affect file:// pages.
where py >nul 2>nul
if not errorlevel 1 goto :server_py
where python >nul 2>nul
if not errorlevel 1 goto :server_python

echo Python was not found. Opening the offline version directly...
start "LAST FENCE Beta" "%~dp0index.html"
exit /b

:server_py
start "LAST FENCE Server" /min py -m http.server 4173 --bind 127.0.0.1
goto :open

:server_python
start "LAST FENCE Server" /min python -m http.server 4173 --bind 127.0.0.1

:open
timeout /t 1 /nobreak >nul
start "LAST FENCE Beta" "http://127.0.0.1:4173/index.html"
exit /b

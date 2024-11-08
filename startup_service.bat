@echo off
:: Set variables for easy editing
set SERVICE_NAME=IDG1NodeApp
set NODE_PATH="C:\Program Files\nodejs\node.exe"
set APP_PATH=C:\TEMP\NodeJSWorking
set APP_FILE=server.js
set LOG_PATH=%APP_PATH%\logs
set STDOUT_LOG=%LOG_PATH%\stdout.log
set STDERR_LOG=%LOG_PATH%\stderr.log

:: Create the logs directory if it doesn't exist
if not exist %LOG_PATH% (
    mkdir %LOG_PATH%
)

:: Install the Node.js application as a service
nssm install %SERVICE_NAME% %NODE_PATH% %APP_PATH%\%APP_FILE%

:: Set up logging for the service
nssm set %SERVICE_NAME% AppStdout %STDOUT_LOG%
nssm set %SERVICE_NAME% AppStderr %STDERR_LOG%

:: Optional: Set the startup type to automatic so it starts on boot
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START

:: Start the service
nssm start %SERVICE_NAME%

echo Service %SERVICE_NAME% has been installed and started.
pause

@echo off

setlocal
set WEB_PROCESS_TITLE=Skywalking-Web
set WEB_RUNTIME_OPTIONS="-Xms256M -Xmx512M"

set CLASSPATH=%~dp0%..\config;
SET CLASSPATH=%CLASSPATH%;%~dp0%..\libs\*;

if ""%JAVA_HOME%"" == """" (
  set _EXECJAVA=java
) else (
  set _EXECJAVA="%JAVA_HOME%"/bin/java
)

start /MIN "%WEB_PROCESS_TITLE%" %_EXECJAVA% "%WEB_RUNTIME_OPTIONS%" -cp "%CLASSPATH%" com.a.eye.skywalking.ui.ApplicationStartUp &
echo Skywalking Web started successfully!

endlocal

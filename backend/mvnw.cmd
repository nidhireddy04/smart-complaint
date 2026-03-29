@REM Maven Wrapper startup batch script (simplified)
@setlocal

set MAVEN_PROJECTBASEDIR=%~dp0

@REM Check if Maven distribution is already downloaded
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6
if not exist "%MAVEN_HOME%\bin\mvn.cmd" (
    echo Downloading Maven 3.9.6...
    powershell -Command "& { $ProgressPreference='SilentlyContinue'; $url='https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip'; $dest='%TEMP%\maven.zip'; Invoke-WebRequest -Uri $url -OutFile $dest; Expand-Archive -Path $dest -DestinationPath '%USERPROFILE%\.m2\wrapper\dists' -Force; Remove-Item $dest }"
)

set MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd

if not exist "%MAVEN_CMD%" (
    echo ERROR: Maven download failed. Please install Maven manually.
    exit /b 1
)

"%MAVEN_CMD%" -f "%MAVEN_PROJECTBASEDIR%pom.xml" %*

@endlocal

@echo off

set CUR_DIR="%CD%"
set EXE_PATH=%CUR_DIR%\release\shed.exe
set ICO_PATH=%CUR_DIR%\src\shed.ico
set NWEXE_PATH=%CUR_DIR%\build\nw\nw.exe
set NWZIP_PATH=%CUR_DIR%\release\src.nw

SETLOCAL EnableDelayedExpansion
for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
  set "DEL=%%a"
)

call :ColorText 0C "nodebob v0.1"
echo.
call :ColorText 0C "---"
echo.
echo.

rmdir /S /Q release
md release

echo.
call :ColorText 0a "Creating src package..."
cd build\7z
7z a -r -tzip %NWZIP_PATH% ..\..\src\*
cd ..\..

echo.
call :ColorText 0a "Creating executable..."
echo.
copy /b /y %NWEXE_PATH% %EXE_PATH%
cd build\ar
if exist %ICO_PATH% Resourcer -op:upd -src:%EXE_PATH% -type:14 -name:IDR_MAINFRAME -file:%ICO_PATH%
copy /b /y %EXE_PATH% + %NWZIP_PATH% %EXE_PATH%
cd ..\..

echo.
call :ColorText 0a "Copying files..."
echo.
if not exist %CUR_DIR%\release\d3dcompiler_46.dll copy %CUR_DIR%\build\nw\d3dcompiler_46.dll %CUR_DIR%\release\d3dcompiler_46.dll
if not exist %CUR_DIR%\release\ffmpegsumo.dll copy %CUR_DIR%\build\nw\ffmpegsumo.dll %CUR_DIR%\release\ffmpegsumo.dll
if not exist %CUR_DIR%\release\icudtl.dat copy %CUR_DIR%\build\nw\icudtl.dat %CUR_DIR%\release\icudtl.dat
if not exist %CUR_DIR%\release\libEGL.dll copy %CUR_DIR%\build\nw\libEGL.dll %CUR_DIR%\release\libEGL.dll
if not exist %CUR_DIR%\release\libGLESv2.dll copy %CUR_DIR%\build\nw\libGLESv2.dll %CUR_DIR%\release\libGLESv2.dll
if not exist %CUR_DIR%\release\nw.pak copy %CUR_DIR%\build\nw\nw.pak %CUR_DIR%\release\nw.pak

echo.
call :ColorText 0a "Creating source archive..."
cd build\7z
7z a -r -tzip %CUR_DIR%\release\shed.zip %CUR_DIR%\release\*
cd ..\..

echo.
call :ColorText 0a "Deleting temporary files..."
echo.
del %NWZIP_PATH%

echo.
call :ColorText 0a "Done!"
echo.
goto :eof


:ColorText
echo off
<nul set /p ".=%DEL%" > "%~2"
findstr /v /a:%1 /R "^$" "%~2" nul
del "%~2" > nul 2>&1
goto :eof
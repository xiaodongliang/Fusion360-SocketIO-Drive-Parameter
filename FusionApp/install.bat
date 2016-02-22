@echo off 
if not exist "%AppData%\Autodesk\ApplicationPlugins\RemoteDriveParam.bundle" md "%AppData%\Autodesk\ApplicationPlugins\RemoteDriveParam.bundle"
set currentPath=%cd%
xcopy /Y /S "%currentPath%\RemoteDriveParam.bundle\*.*" "%AppData%\Autodesk\ApplicationPlugins\RemoteDriveParam.bundle\" 
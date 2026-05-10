; Smart Accounting Suite - Inno Setup Script
[Setup]
AppName=Smart Accounting Suite (SAS)
AppVersion=4.1
DefaultDirName={autopf}\SmartAccountingSuite
DefaultGroupName=SmartAccountingSuite
; SetupIconFile=static\favicon.ico
UninstallDisplayIcon={app}\SmartAccountingSuite.exe
Compression=lzma2
SolidCompression=yes
OutputDir=setup_out
OutputBaseFilename=SAS_Ultimate_Setup
ArchitecturesInstallIn64BitMode=x64

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "dist\SmartAccountingSuite.exe"; DestDir: "{app}"; Flags: ignoreversion


[Icons]
Name: "{group}\SmartAccountingSuite"; Filename: "{app}\SmartAccountingSuite.exe"
Name: "{autodesktop}\SmartAccountingSuite"; Filename: "{app}\SmartAccountingSuite.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\SmartAccountingSuite.exe"; Description: "{cm:LaunchProgram,SmartAccountingSuite}"; Flags: nowait postinstall skipifsilent

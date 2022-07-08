Set WshShell = CreateObject("WScript.Shell")
curDir = WshShell.CurrentDirectory
WshShell.Run "cmd.exe /C cd " & curDir & " && npm start", 0
Set WshShell = Nothing
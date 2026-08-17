Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\Main Branch\app helper\Studio-Launcher\App Launcher"
WshShell.Run "cmd /c start \"Shakib Studio Hub Server\" /min cmd /c \"node server.js\"", 0, False
WScript.Sleep 1200
WshShell.Run "http://localhost:4500"

rule AV_EXEC_SUSPICIOUS {
    meta:
        severity = 4
        description = "Potential executable indicator detected."
        category = "executables"
    strings:
        $a = ".bat" ascii
        $b = ".exe" ascii
        $c = ".jar" ascii
        $d = ".dll" ascii
        $e = ".so" ascii
        $f = ".dylib" ascii
        $g = ".ps1" ascii
        $h = "powershell" ascii
        $i = "pwsh" ascii
        $j = "iex " ascii
        $k = "Invoke-Expression" ascii
        $l = "Invoke-WebRequest" ascii
        $m = "Invoke-Shellcode" ascii
    condition:
        any of them
} 
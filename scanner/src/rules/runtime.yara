rule AV_RUNTIME_SUSPICIOUS {
    meta:
        severity = 5
        description = "Potential runtime/process execution indicator detected."
        category = "runtime"
    strings:
        $a = /java\/lang\/Runtime(\W|$)/ ascii
        $b = /exec(\W|$)/ ascii
        $c = /java\/lang\/ProcessBuilder(\W|$)/ ascii
        $d = /start(\W|$)/ ascii
        $e = /java\/lang\/Process(\W|$)/ ascii
        $f = /getRuntime(\W|$)/ ascii
        $g = /CompletableFuture\.runAsync(\W|$)/ ascii
        $h = /powershell(\.exe)?(\W|$)/ ascii nocase
        $i = /pwsh(\.exe)?(\W|$)/ ascii nocase
        $j = /cmd\.exe(\W|$)/ ascii nocase
        $k = /bash(\.exe)?(\W|$)/ ascii nocase
        $l = /iex\s/ ascii nocase
        $m = /Invoke-Expression(\W|$)/ ascii nocase
    condition:
        any of them
} 
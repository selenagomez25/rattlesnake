rule AV_URL_SUSPICIOUS {
    meta:
        severity = 4
        description = "Potential suspicious or exfiltration-related URL detected."
        category = "urls"
    strings:
        $a = "https://discordapp.com/api/v6/users/@me" ascii
        $b = "https://discord.com/api/v8/users/@me" ascii
        $c = /https:\/\/discord(app)?\.com\/api\/webhooks\/[0-9]{17,20}\/[A-Za-z0-9_-]{60,68}/ ascii
        $d = /https:\/\/ptb\.discord\.com\/api\/webhooks\/[0-9]{17,20}\/[A-Za-z0-9_-]{60,68}/ ascii
        $e = /https:\/\/canary\.discord\.com\/api\/webhooks\/[0-9]{17,20}\/[A-Za-z0-9_-]{60,68}/ ascii
        $f = /https?:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,}(\S*)?/ ascii
        $g = "http://checkip.amazonaws.com" ascii
        $h = "https://checkip.amazonaws.com" ascii
        $i = /pastebin\.com\/raw\// ascii
        $j = /https:\/\/discord(app)?\.com\/api\/v6\/users\/@me\/billing\/payment-sources/ ascii
    condition:
        any of them
}
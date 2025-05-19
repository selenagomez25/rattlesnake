rule AV_FILEPATH_SUSPICIOUS {
    meta:
        severity = 4
        description = "Potential file path indicator detected."
        category = "file_paths"
    strings:
        $a = ".feather/accounts.json" ascii
        $b = "essential/microsoft_accounts.json" ascii
        $c = ".lunarclient/settings/game/accounts.json" ascii
        $f = "\\Discord\\Local Storage\\leveldb" ascii
        $g = "\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb" ascii
        $h = ".config/BraveSoftware/Brave-Browser/Default/Local Storage/leveldb" ascii
        $i = "/Library/Application Support/discord/Local Storage/leveldb" ascii
        $j = "\\discordcanary\\Local Storage\\leveldb" ascii
        $k = "\\discordptb\\Local Storage\\leveldb" ascii
        $l = "\\Opera Software\\Opera Stable\\Local Storage\\leveldb" ascii
        $m = "\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Local Storage\\leveldb" ascii
        $n = "\\Yandex\\YandexBrowser\\User Data\\Default\\Local Storage\\leveldb" ascii
        $o = ".config/yandex-browser-beta/Default/Local Storage/leveldb" ascii
        $p = ".config/yandex-browser/Default/Local Storage/leveldb" ascii
        $q = ".config/google-chrome/Default/Local Storage/leveldb" ascii
        $r = ".config/opera/Local Storage/leveldb" ascii
        $s = ".config/discord/Local Storage/leveldb" ascii
        $t = ".config/discordcanary/Local Storage/leveldb" ascii
        $u = ".config/discordptb/Local Storage/leveldb" ascii
        $v = "discord/Local Storage/leveldb" ascii
    condition:
        any of them
}
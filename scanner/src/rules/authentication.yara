rule AV_AUTH_SUSPICIOUS {
    meta:
        severity = 4
        description = "Potential authentication indicator detected."
        category = "authentication"
    strings:
        $a = "getSessionId" ascii
        $b = "method_1548" ascii
        $c = "func_111286_b" ascii
        $d = "getSessionToken" ascii
        $e = "field_148258_c" ascii
        $f = "getAccessToken" ascii
        $g = "field_1983" ascii
        $h = "token:.*?:.*?" ascii
    condition:
        any of them
}
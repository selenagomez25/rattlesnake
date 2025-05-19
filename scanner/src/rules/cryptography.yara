rule AV_CRYPTO_SUSPICIOUS {
    meta:
        severity = 4
        description = "Potential cryptography indicator detected."
        category = "cryptography"
    strings:
        $a = "AES" ascii
        $b = "javax/crypto/spec/SecretKeySpec" ascii
        $c = "javax/crypto/Cipher" ascii
        $d = "Base64.getDecoder" ascii
        $e = "Base64.decode" ascii
        $f = "decodeBase64" ascii
        $g = "sun/misc/BASE64Decoder" ascii
        $h = /decode\s*\(.*string.*/ ascii
        $i = /decode\s*\(.*byte.*/ ascii
        $j = "java/security/MessageDigest" ascii
        $k = "java/security/Signature" ascii
        $l = "java/nio/charset/Charset" ascii
        $m = "java/nio/charset/StandardCharsets" ascii
        $n = "ConvertTo-SecureString" ascii
        $o = "Add-Type" ascii
        $p = "FromBase64String" ascii
        $q = "AesCryptoServiceProvider" ascii
        $r = "SecureString" ascii
    condition:
        any of them
}
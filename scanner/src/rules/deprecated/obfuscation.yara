rule branchlock_identifier {
    meta:
        severity = 3
        description = "Branchlock obfuscator identifier - indicates code has been obfuscated"
        category = "obfuscation"
    strings:
        $ = "branchlock.net"
    condition:
        any of them
}

rule skidfuscator_identifier {
    meta:
        severity = 3
        description = "Skidfuscator obfuscator identifier - indicates code has been obfuscated"
        category = "obfuscation"
    strings:
        $ = "nothing_to_see_here"
    condition:
        any of them
}

rule skidfuscator_encryption {
    meta:
        severity = 3
        description = "Skidfuscator obfuscator identifier - indicates code has been obfuscated"
        category = "obfuscation"
    strings:
        $ = "thisIsAInsaneEncryptionMethod"
    condition:
        any of them
}

rule skidfuscator_encryption_method {
    meta:
        severity = 3
        description = "Skidfuscator obfuscator identifier - indicates code has been obfuscated"
        category = "obfuscation"
    strings:
        $ = "EncryptionMethod1337"
    condition:
        any of them
}

rule jnic_identifier {
    meta:
        severity = 3
        description = "JNIC obfuscator identifier - indicates native code obfuscation"
        category = "obfuscation"
    strings:
        $ = "jnic"
    condition:
        any of them
}

rule zkm_identifier {
    meta:
        severity = 3
        description = "ZKM obfuscator identifier - indicates code has been obfuscated"
        category = "obfuscation"
    strings:
        $ = "ZKM"
    condition:
        any of them
}

rule stringer_identifier {
    meta:
        severity = 3
        description = "Stringer obfuscator identifier - indicates code has been obfuscated"
        category = "obfuscation"
    strings:
        $ = "[^\x00-\x7F]{5}.*?reflect.*?[^\x00-\x7F]{5}"
    condition:
        any of them
}

rule name_obfuscation_il {
    meta:
        severity = 2
        description = "Long sequences of I/l - common in name obfuscation"
        category = "obfuscation"
    strings:
        $ = "[Il]{9,}"
    condition:
        any of them
}

rule name_obfuscation_o0 {
    meta:
        severity = 2
        description = "Long sequences of O/0 - common in name obfuscation"
        category = "obfuscation"
    strings:
        $ = "[O0]{9,}"
    condition:
        any of them
}

rule name_obfuscation_letter_number {
    meta:
        severity = 2
        description = "Single letter followed by numbers - common in name obfuscation"
        category = "obfuscation"
    strings:
        $ = "[a-z]{1}\\d{3,}"
    condition:
        any of them
}

rule name_obfuscation_caps_number {
    meta:
        severity = 2
        description = "Multiple caps followed by numbers - common in name obfuscation"
        category = "obfuscation"
    strings:
        $ = "[A-Z]{2,}\\d+"
    condition:
        any of them
}

rule name_obfuscation_short_class {
    meta:
        severity = 2
        description = "Short class names - common in name obfuscation"
        category = "obfuscation"
    strings:
        $ = "(\\/|^).{1,2}\\.class"
    condition:
        any of them
}

rule string_obfuscation_array {
    meta:
        severity = 2
        description = "Array string initialization - common in string obfuscation"
        category = "obfuscation"
    strings:
        $ = "new String\\(\\[\\] \\{ [\\d, ]+ \\}\\)"
    condition:
        any of them
}

rule string_obfuscation_char_array {
    meta:
        severity = 2
        description = "String to char array conversion - common in string obfuscation"
        category = "obfuscation"
    strings:
        $ = "String\\.valueOf\\(.*?\\)\\.toCharArray\\(\\)"
    condition:
        any of them
}

rule string_obfuscation_bytes {
    meta:
        severity = 2
        description = "String to bytes conversion - common in string obfuscation"
        category = "obfuscation"
    strings:
        $ = "new String\\(.*?\\)\\.getBytes\\(\\)"
    condition:
        any of them
}

rule string_obfuscation_concatenation {
    meta:
        severity = 2
        description = "Multiple string concatenations - common in string obfuscation"
        category = "obfuscation"
    strings:
        $ = "\\+.*?\\+.*?\\+"
    condition:
        any of them
}

rule string_obfuscation_builder {
    meta:
        severity = 2
        description = "StringBuilder usage - common in string obfuscation"
        category = "obfuscation"
    strings:
        $ = "StringBuilder.*?append"
    condition:
        any of them
}

rule native_string_operations {
    meta:
        severity = 3
        description = "Native string operations - indicates native code usage"
        category = "obfuscation"
    strings:
        $ = "native.*?String"
    condition:
        any of them
}

rule jni_string_operations {
    meta:
        severity = 3
        description = "JNI string operations - indicates native code usage"
        category = "obfuscation"
    strings:
        $ = "JNI.*?String"
    condition:
        any of them
}

rule library_loading {
    meta:
        severity = 3
        description = "Library loading - indicates native code usage"
        category = "obfuscation"
    strings:
        $ = "System.loadLibrary"
    condition:
        any of them
}

rule resource_loading {
    meta:
        severity = 3
        description = "Resource loading - common in resource obfuscation"
        category = "obfuscation"
    strings:
        $ = "getResourceAsStream"
    condition:
        any of them
}

rule resource_access {
    meta:
        severity = 3
        description = "Resource loading - common in resource obfuscation"
        category = "obfuscation"
    strings:
        $ = "getResource"
    condition:
        any of them
}
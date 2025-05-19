rule excessive_dynamic_invocations {
    meta:
        severity = 1
        description = "Excessive dynamic invocations - potential runtime code generation"
        category = "code_analysis"
    strings:
        $ = "(invokedynamic.*){8,}"
    condition:
        any of them
}

rule complex_control_flow_lookup {
    meta:
        severity = 2
        description = "Complex control flow - multiple lookup switches"
        category = "code_analysis"
    strings:
        $ = "(lookupswitch\\s+\\{[^}]+\\}\\s*){4,}"
    condition:
        any of them
}

rule multiple_synchronization {
    meta:
        severity = 2
        description = "Multiple synchronization blocks - indicates potential thread safety concerns"
        category = "code_analysis"
    strings:
        $ = "(monitorenter.*monitorexit.*){6,}"
    condition:
        any of them
}

rule complex_control_flow_table {
    meta:
        severity = 2
        description = "Complex control flow - multiple table switches"
        category = "code_analysis"
    strings:
        $ = "(tableswitch\\s+\\{[^}]+\\}\\s*){4,}"
    condition:
        any of them
}

rule excessive_goto {
    meta:
        severity = 1
        description = "Excessive GOTO instructions - potential control flow obfuscation"
        category = "code_analysis"
    strings:
        $ = "(goto.*){12,}"
    condition:
        any of them
} 
rule path_operations {
    meta:
        description = "Path operations - can manipulate file paths"
        severity = 1
        category = "filesystem"
    strings:
        $path_ops = "Path" ascii
    condition:
        $path_ops
}

rule files_operations {
    meta:
        description = "Files operations - can read/write files"
        severity = 1
        category = "filesystem"
    strings:
        $files_ops = "Files" ascii
    condition:
        $files_ops
}

rule read_all_bytes {
    meta:
        description = "Reading file contents - can read file data"
        severity = 1
        category = "filesystem"
    strings:
        $read_bytes = "readAllBytes" ascii
    condition:
        $read_bytes
}

rule file_writing {
    meta:
        description = "File writing - can write to files"
        severity = 1
        category = "filesystem"
    strings:
        $write = "write" ascii
    condition:
        $write
}

rule file_permission_modification {
    meta:
        description = "File permission modification - can change file permissions"
        severity = 3
        category = "filesystem"
    strings:
        $set_permissions = "setPermissions" ascii
    condition:
        $set_permissions
} 
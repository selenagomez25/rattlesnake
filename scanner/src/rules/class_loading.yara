rule AV_CLASSLOAD_SUSPICIOUS {
    meta:
        severity = 4
        description = "Potential class loading indicator detected."
        category = "class_loading"
    strings:
        $a = "defineClass(Ljava/lang/String;[BII)Ljava/lang/Class;" ascii
        $b = "java/lang/ClassLoader" ascii
        $c = "loadClass(Ljava/lang/String;)Ljava/lang/Class;" ascii
        $d = "findClass(Ljava/lang/String;)Ljava/lang/Class;" ascii
        $e = "java/net/URLClassLoader" ascii
        $f = "loadClass" ascii
        $g = "getDeclaredConstructor" ascii
    condition:
        any of them
}
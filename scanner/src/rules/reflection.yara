rule AV_REFLECT_SUSPICIOUS {
    meta:
        severity = 4
        description = "Potential reflection indicator detected."
        category = "reflection"
    strings:
        $a = "java.lang.reflect.Method.invoke" ascii
        $b = "java.lang.reflect.Field.set" ascii
        $c = "Class.forName" ascii
        $d = "getDeclaredMethod" ascii
        $e = "getDeclaredField" ascii
        $f = "setAccessible(true)" ascii
        $g = "defineClass" ascii
        $h = "MethodType" ascii
        $i = "CallSite" ascii
        $j = "java/lang/reflect/Method" ascii
        $k = "java/lang/reflect/Constructor" ascii
        $l = "invoke" ascii
    condition:
        any of them
}
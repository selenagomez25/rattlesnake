rule url_class_loader {
    meta:
        description = "URLClassLoader usage - can load classes from remote locations"
        severity = 2
        category = "network"
    strings:
        $url_loader = "URLClassLoader" ascii
    condition:
        $url_loader
}

rule socket_creation {
    meta:
        description = "Socket creation - can establish network connections"
        severity = 1
        category = "network"
    strings:
        $socket = "Socket" ascii
    condition:
        $socket
}

rule url_connection {
    meta:
        description = "URLConnection usage - can make network requests"
        severity = 1
        category = "network"
    strings:
        $url = "URLConnection" ascii
    condition:
        $url
}

rule http_connection {
    meta:
        description = "HTTP connection - can make network requests"
        severity = 1
        category = "network"
    strings:
        $http = "HttpURLConnection" ascii
    condition:
        $http
} 

($let http ($node-require "http"))
($let url  ($node-require "url" ))


($local ((handlers nil)) ($capture (handlers)

    ($defun #get    (path handler) ($push handlers ($list "GET"    path handler)))
    ($defun #post   (path handler) ($push handlers ($list "POST"   path handler)))
    ($defun #put    (path handler) ($push handlers ($list "PUT"    path handler)))
    ($defun #delete (path handler) ($push handlers ($list "DELETE" path handler)))

    ($defun serve (port)
        ($let server (::http@createServer (-> (req res)
            ($let u (::url:parse ::req:url)) ($let i 0) ($let x nil) ($let h false)
            ($while ($and ($not h) (< i ($length handlers)))
                ($set x ($[ i ] handlers))
                ($set h ($if ($and (=== ($get x 0) ::req:method) ($match ($concat @"^" ($get x 1) @"(\?.*)?$") ::u:path))
                    ($last (($get x 2) req res) true)
                    false ))
                ($set i (+ i 1)) )
            ($if h nil
                ($last
                    (::res@writeHead 404 (# (Content-Type "text/html")))
                    (::res@end ($concat "Not found," ::req:method "," ::u:path)) )))))
        (::server@listen port) ) ))


;; exports
(#  (serve   (<- serve  ))
    (#get    (<- #get   ))
    (#post   (<- #post  ))
    (#put    (<- #put   ))
    (#delete (<- #delete)) )

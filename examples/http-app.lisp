
($console-error ($concat "file: " $__filename))

($let url ($node-require "url"))
($let srv ($require "./http-srv"))


(::srv:#get "/" (-> (req res)
    ($let u (::url:parse ::req:url))
    (::res@writeHead 200 (# (Content-Type "text/html")))
    (::res@end ($concat "hit / ," ::req:method "," ::u:path)) ))


(::srv:#get "/lsx" (-> (req res)
    ($let u (::url:parse ::req:url))
    ($render
        (html
            (head (title "hello"))
            (body (Hello)) )
        (|-> (e html) use (req res) ($if html
            ($last
                (::res@writeHead 200 (# (Content-Type "text/html")))
                (::res@end ($concat "<!DOCTYPE html>" html)) )
            ($last
                (::res@writeHead 500 (# (Content-Type "text/plain")))
                (::res@end ($concat "Error: " e)) ) )) ) ))


(::srv:serve 3000) ($last "start server")

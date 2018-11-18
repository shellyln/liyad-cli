

($$defun tarai(x y z)
    ($if (<= x y)
        y
        ($self ($self (- x 1) y z)
               ($self (- y 1) z x)
               ($self (- z 1) x y) )))

($local ()
    ($let fib-sub (=> (n a b)
        ($if (< n 3)
            ($cond (=== n 2) (+ a b)
                   (=== n 1) a
                   true      0)
            ($self (- n 1) (+ a b) a) ) ))
    ($capture (fib-sub)
        ($$defun fib (n) (fib-sub n 1 0)) ) )

($local ()
    ($let fac-sub (=> (n a)
        ($if (< n 2)
            ($cond (=== n 1) a
                   (=== n 0) 1
                   true      0)
            ($self (- n 1) (* n a)) )) )
    ($capture (fac-sub)
        ($$defun fac (n) (fac-sub n 1)) ))


;; exports
(#
    (tarai (<- tarai))
    (fib   (<- fib  ))
    (fac   (<- fac  )) )

($local ()
    ($let fac-sub (-> (n a)
        ;; ($pause)
        ($if (< n 2)
            ($cond (=== n 1) a
                   (=== n 0) 1
                   true      0)
            ($self (- n 1) (* n a)) )
            ))
    ($capture (fac-sub)
        ($defun fac (n) (fac-sub n 1)) ))

; ($require "./example2")
($concat "Hello, " (fac 5) "!")
($concat "Hello, " (fac 5) "!")
($concat "Hello, " (fac 5) "!")

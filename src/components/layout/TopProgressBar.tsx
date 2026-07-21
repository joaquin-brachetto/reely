import { useEffect } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Ocultar el spinner circular de la esquina por defecto
NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

export default function TopProgressBar() {
    useEffect(() => {
        NProgress.start()

        return () => {
            NProgress.done()
        }
    }, [])

    return (
        <style>{`
            #nprogress .bar {
                background: #16a34a !important;
                height: 3px !important;
            }
            #nprogress .peg {
                box-shadow: 0 0 10px #16a34a, 0 0 5px #16a34a !important;
            }
        `}</style>
    )
}

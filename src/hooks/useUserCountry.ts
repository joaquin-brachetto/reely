import { useState, useEffect } from 'react'

const FALLBACK_COUNTRY = 'AR'

function getCountryFromLocale(): string | null {
    const locales = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const locale of locales) {
        const region = locale?.split('-')[1]
        if (region && /^[a-zA-Z]{2}$/.test(region)) {
            return region.toUpperCase()
        }
    }
    return null
}

export function useUserCountry(): string {
    const [country, setCountry] = useState<string>(getCountryFromLocale() || FALLBACK_COUNTRY)

    useEffect(() => {
        if (getCountryFromLocale()) return

        const detectByIp = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/')
                if (!res.ok) throw new Error('No se pudo detectar el país')
                const data = await res.json()
                if (data.country_code) setCountry(data.country_code)
            } catch {
                setCountry(FALLBACK_COUNTRY)
            }
        }

        detectByIp()
    }, [])

    return country
}

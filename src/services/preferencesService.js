const BASE_URL = `${import.meta.env.VITE_API_URL}/preferences`

export const getPreferencesRequest = async (token) => {
    const res = await fetch(BASE_URL, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error al obtener las preferencias')
    return res.json()
}

export const updatePreferencesRequest = async (token, { region, language, providerIds }) => {
    const res = await fetch(BASE_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ region, language, providerIds })
    })
    if (!res.ok) throw new Error('Error al guardar las preferencias')
    return res.json()
}

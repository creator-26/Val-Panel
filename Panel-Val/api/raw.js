export default async function handler(req, res) {
    // 1. Obtenemos las llaves secretas (Las guardaremos en Vercel, no en el código visible)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

    try {
        // 2. Nos conectamos a la tabla 'whitelist' pidiendo solo los nombres de usuario y su estado
        const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist?select=username,status`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // 3. Filtramos la lista para obtener SOLO a los que tienen estado "Activo"
        const activeUsers = data
            .filter(user => user.status === 'Activo')
            .map(user => user.username);

        // 4. Juntamos todos los nombres con un salto de línea (Enter) entre cada uno
        const rawText = activeUsers.join('\n');

        // 5. Respondemos al script de Roblox en formato de TEXTO PLANO
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(rawText);

    } catch (error) {
        // Si algo falla, enviamos un error en texto
        res.setHeader('Content-Type', 'text/plain');
        res.status(500).send("Error de conexion con la base de datos");
    }
}


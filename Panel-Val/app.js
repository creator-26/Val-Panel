// ==========================================
// 1. CONFIGURACIÓN DE SUPABASE (Tus Llaves)
// ==========================================
const SUPABASE_URL = "https://guqtnlnkbernezblabfs.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_OO9dKgyJmzVsm1MEvdNPoA_3ow1L0TP"; 

// Referencias a los elementos de la página
const searchInput = document.getElementById('searchInput');
const addUserBtn = document.getElementById('addUserBtn');
const usersContainer = document.getElementById('usersContainer');
const totalCount = document.getElementById('totalCount');
const pendingCount = document.getElementById('pendingCount');

// Cabeceras estándar para hablar con Supabase
const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

// ==========================================
// 2. FUNCIÓN PARA CARGAR USUARIOS
// ==========================================
async function loadUsers() {
    try {
        // Pedimos los datos a la tabla 'whitelist'
        const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist?select=*`, {
            method: 'GET',
            headers: headers
        });
        
        const data = await response.json();
        
        // Limpiamos el contenedor (borramos el usuario de ejemplo)
        usersContainer.innerHTML = '';
        
        // Actualizamos el contador total
        totalCount.textContent = data.length;

        // Dibujamos las tarjetas reales con los datos de Supabase
        data.forEach(user => {
            const isElite = user.role === 'ELITE';
            const isActive = user.status === 'Activo';

            const cardHtml = `
                <div class="user-card ${isElite ? 'border-left-cyan' : 'border-left-purple'}">
                    <div class="avatar">
                        <img src="https://tr.rbxcdn.com/38c6edcb50633730ff4cf39458e0c165/150/150/AvatarHeadshot/Png" alt="Avatar">
                        <div class="status-dot ${isActive ? 'green' : 'gray'}"></div>
                    </div>
                    <div class="user-info">
                        <h4>${user.username}</h4>
                        <div class="badges">
                            <span class="badge ${isElite ? 'elite' : 'veteran'}">${user.role || 'MEMBER'}</span>
                            <span class="status-text">Estado: ${user.status || 'Desconocido'}</span>
                        </div>
                    </div>
                    <div class="menu-icon">⋮</div>
                </div>
            `;
            // Inyectamos la tarjeta en la página
            usersContainer.innerHTML += cardHtml;
        });

    } catch (error) {
        console.error("Error al cargar los usuarios:", error);
    }
}

// ==========================================
// 3. FUNCIÓN PARA AÑADIR UN NUEVO USUARIO
// ==========================================
async function addUser() {
    const username = searchInput.value.trim();
    
    if (username === '') {
        alert("¡Debes escribir un nombre de usuario!");
        return;
    }

    // Cambiamos el texto del botón temporalmente
    addUserBtn.innerHTML = `GUARDANDO... ⏳`;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                username: username,
                role: 'ELITE',      // Por defecto lo ponemos como Elite
                status: 'Activo'    // Por defecto entra Activo
            })
        });

        if (response.ok) {
            searchInput.value = ''; // Limpiamos la barra de búsqueda
            loadUsers();            // Recargamos la lista visualmente
        } else {
            alert("Hubo un error al guardar en la base de datos.");
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    } finally {
        // Devolvemos el botón a la normalidad
        addUserBtn.innerHTML = `AÑADIR USUARIO <span class="add-icon">👤+</span>`;
    }
}

// ==========================================
// 4. ACTIVADORES (Event Listeners)
// ==========================================
// Escuchamos el clic en el botón de añadir
addUserBtn.addEventListener('click', addUser);

// Al entrar a la página, cargamos los usuarios automáticamente
loadUsers();


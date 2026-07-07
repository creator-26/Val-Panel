// ==========================================
// 1. CONFIGURACIÓN DE SUPABASE (Tus Llaves)
// ==========================================
const SUPABASE_URL = "https://guqtnlnkbernezblabfs.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_OO9dKgyJmzVsm1MEvdNPoA_3ow1L0TP"; 

const searchInput = document.getElementById('searchInput');
const rankInput = document.getElementById('rankInput');
const addUserBtn = document.getElementById('addUserBtn');
const usersContainer = document.getElementById('usersContainer');
const totalCount = document.getElementById('totalCount');
const pendingCount = document.getElementById('pendingCount');

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
        const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist?select=*`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();
        usersContainer.innerHTML = '';
        totalCount.textContent = data.length;

        data.forEach(user => {
            const isActive = user.status === 'Activo';
            
            // ASIGNACIÓN ESTRICTA DE COLORES POR RANGO (CORREGIDO)
            let borderClass = 'border-left-purple'; // MEMBER por defecto es Morado
            let badgeClass = 'member';             // Medalla Morada
            
            if (user.role === 'VETERAN') {
                borderClass = 'border-left-red';   // VETERAN es Rojo
                badgeClass = 'veteran';            // Medalla Roja
            } else if (user.role === 'ELITE') {
                borderClass = 'border-left-cyan';  // ELITE es Cian
                badgeClass = 'elite';              // Medalla Gris
            } else if (user.role === 'SUPREMO') {
                borderClass = 'border-left-gold';  // SUPREMO es Dorado
                badgeClass = 'supremo';            // Medalla Dorada
            }

            const cardHtml = `
                <div class="user-card ${borderClass}">
                    <div class="avatar">
                        <img src="https://ui-avatars.com/api/?name=${user.username}&background=1A1A1A&color=00E5FF&bold=true" alt="Avatar">
                        <div class="status-dot ${isActive ? 'green' : 'gray'}"></div>
                    </div>
                    <div class="user-info">
                        <h4>${user.username}</h4>
                        <div class="badges">
                            <span class="badge ${badgeClass}">${user.role || 'MEMBER'}</span>
                            <span class="status-text">Estado: ${user.status || 'Desconocido'}</span>
                        </div>
                    </div>
                    <div class="delete-btn" onclick="deleteUser('${user.username}')">🗑️</div>
                </div>
            `;
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
    const selectedRole = rankInput.value;

    if (username === '') {
        alert("¡Debes escribir un nombre de usuario!");
        return;
    }

    // Cambiamos el texto para que sepas que está buscando
    addUserBtn.innerHTML = `VERIFICANDO... 🔍`; 

    try {
        // --- 🛡️ NUEVO: SISTEMA ANTI-DUPLICADOS ---
        // Hacemos una consulta rápida a Supabase buscando exactamente ese nombre
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/whitelist?username=eq.${username}&select=username`, {
            method: 'GET',
            headers: headers
        });
        
        const existingUsers = await checkResponse.json();

        // Si Supabase nos devuelve al menos 1 resultado, el usuario ya existe
        if (existingUsers.length > 0) {
            alert(`⚠️ ¡Alto ahí! El usuario "${username}" ya está registrado en el sistema.`);
            addUserBtn.innerHTML = `AÑADIR USUARIO <span class="add-icon">👤+</span>`;
            searchInput.value = ''; // Limpiamos la barra
            return; // Cortamos la función aquí para bloquear el guardado
        }
        // ------------------------------------------

        // Si el código llega hasta aquí, significa que el usuario es nuevo
        addUserBtn.innerHTML = `GUARDANDO... ⏳`;

        const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                username: username,
                role: selectedRole,
                status: 'Activo'
            })
        });

        if (response.ok) {
            searchInput.value = ''; 
            loadUsers();            
        } else {
            alert("Hubo un error al guardar en la base de datos.");
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    } finally {
        addUserBtn.innerHTML = `AÑADIR USUARIO <span class="add-icon">👤+</span>`;
    }
}

          


// ==========================================
// 4. FUNCIÓN PARA ELIMINAR USUARIO
// ==========================================
async function deleteUser(username) {
    const confirmar = confirm(`⚠️ ¿Estás seguro de que quieres eliminar a ${username} del Clan Val?`);
    
    if (confirmar) {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist?username=eq.${username}`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok) {
                loadUsers();
            } else {
                alert("Error al intentar eliminar el usuario.");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    }
}

// ==========================================
// 5. ACTIVADORES
// ==========================================
addUserBtn.addEventListener('click', addUser);
loadUsers();

// ==========================================
// 6. SISTEMA DE LOGIN Y SEGURIDAD
// ==========================================
const loginScreen = document.getElementById('loginScreen');
const mainContent = document.getElementById('mainContent');
const navMenu = document.getElementById('navMenu');
const topHeader = document.getElementById('topHeader');
const passInput = document.getElementById('passInput');
const loginBtn = document.getElementById('loginBtn');

function grantAccess() {
    loginScreen.style.display = 'none';
    mainContent.style.display = 'block';
    navMenu.style.display = 'flex';
    topHeader.style.display = 'flex';
}

if (sessionStorage.getItem('accesoClanVal') === 'concedido') {
    grantAccess();
}

loginBtn.addEventListener('click', () => {
    if (passInput.value === 'wamputsag') {
        sessionStorage.setItem('accesoClanVal', 'concedido');
        grantAccess();
    } else {
        alert('❌ ACCESO DENEGADO: Contraseña incorrecta');
        passInput.value = '';
    }
});

passInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

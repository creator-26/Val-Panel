// ==========================================
// 1. CONFIGURACIÓN DE SUPABASE (Tus Llaves)
// ==========================================
const SUPABASE_URL = "https://guqtnlnkbernezblabfs.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_OO9dKgyJmzVsm1MEvdNPoA_3ow1L0TP"; 

const searchInput = document.getElementById('searchInput');
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
            const isElite = user.role === 'ELITE';
            const isActive = user.status === 'Activo';

            const cardHtml = `
                <div class="user-card ${isElite ? 'border-left-cyan' : 'border-left-purple'}">
                    <div class="avatar">
                        <img src="https://ui-avatars.com/api/?name=${user.username}&background=1A1A1A&color=00E5FF&bold=true" alt="Avatar">
                        <div class="status-dot ${isActive ? 'green' : 'gray'}"></div>
                    </div>
                    <div class="user-info">
                        <h4>${user.username}</h4>
                        <div class="badges">
                            <span class="badge ${isElite ? 'elite' : 'veteran'}">${user.role || 'MEMBER'}</span>
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

    if (username === '') {
        alert("¡Debes escribir un nombre de usuario!");
        return;
    }

    addUserBtn.innerHTML = `GUARDANDO... ⏳`;

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                username: username,
                role: 'ELITE',
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
// 4. FUNCIÓN PARA ELIMINAR USUARIO (¡NUEVO!)
// ==========================================
async function deleteUser(username) {
    // 1. Pedimos confirmación para no borrar por accidente
    const confirmar = confirm(`⚠️ ¿Estás seguro de que quieres eliminar a ${username} del Clan Val?`);
    
    if (confirmar) {
        try {
            // 2. Le decimos a Supabase que borre la fila exacta de ese jugador
            const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist?username=eq.${username}`, {
                method: 'DELETE',
                headers: headers
            });

            if (response.ok) {
                // 3. Recargamos la lista visualmente
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
// 5. ACTIVADORES (Event Listeners)
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

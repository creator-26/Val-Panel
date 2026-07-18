// ==========================================
// 1. CONFIGURACIÓN DE SUPABASE (Tus Llaves)
// ==========================================
const SUPABASE_URL = "https://guqtnlnkbernezblabfs.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_OO9dKgyJmzVsm1MEvdNPoA_3ow1L0TP"; 

const searchInput = document.getElementById('searchInput');
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

        let activos = 0;
        let pendientes = 0;

        data.forEach(user => {
            if (user.status === 'Pendiente') {
                pendientes++;
            } else {
                activos++;
            }

            const isActive = user.status === 'Activo';
            let borderClass = user.status === 'Pendiente' ? 'border-left-orange' : 'border-left-purple'; 
            let badgeClass = user.status === 'Pendiente' ? 'pendiente' : 'member';             

            if (isActive) {
                if (user.role === 'VETERAN') {
                    borderClass = 'border-left-red';
                    badgeClass = 'veteran';
                } else if (user.role === 'ELITE') {
                    borderClass = 'border-left-cyan';
                    badgeClass = 'elite';
                } else if (user.role === 'SUPREMO') {
                    borderClass = 'border-left-gold';
                    badgeClass = 'supremo';
                }
            }

        
// -----------------------------------------------------
            // NUEVO: Detectar el dispositivo para asignarle un Ícono SVG
            // -----------------------------------------------------
            let deviceIcon = '';
            if (user.device === 'Movil') {
                deviceIcon = `<svg class="device-svg mobile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="Jugando en Celular"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`;
            } else if (user.device === 'PC') {
                deviceIcon = `<svg class="device-svg pc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="Jugando en PC"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
            } else {
                // Si no hay dato registrado aún (jugadores antiguos), muestra un signo de interrogación pequeño
                deviceIcon = `<span class="device-unknown" title="Dispositivo Desconocido">❓</span>`;
            }

            let cardHtml = '';

            if (user.status === 'Pendiente') {
                cardHtml = `
                    <div class="user-card ${borderClass}">
                        <div class="avatar">
                            <img src="https://ui-avatars.com/api/?name=${user.username}&background=FFA500&color=000&bold=true" alt="Avatar">
                            <div class="status-dot orange"></div>
                        </div>
                        <div class="user-info">
                            <h4 class="username-flex">${user.username} ${deviceIcon}</h4>
                            <div class="badges">
                                <span class="badge ${badgeClass}">NUEVO</span>
                                <span class="status-text">Solicitando Acceso...</span>
                            </div>
                            <div class="action-btns">
                                <button class="btn-accept" onclick="acceptUser('${user.username}')">✅ ACEPTAR</button>
                                <button class="btn-reject" onclick="deleteUser('${user.username}')">❌ RECHAZAR</button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                cardHtml = `
                    <div class="user-card ${borderClass}">
                        <div class="avatar">
                            <img src="https://ui-avatars.com/api/?name=${user.username}&background=1A1A1A&color=00E5FF&bold=true" alt="Avatar">
                            <div class="status-dot ${isActive ? 'green' : 'gray'}"></div>
                        </div>
                        <div class="user-info">
                            <h4 class="username-flex">${user.username} ${deviceIcon}</h4>
                            <div class="badges">
                                <span class="badge ${badgeClass}">${user.role || 'MEMBER'}</span>
                                <span class="status-text">Estado: ${user.status || 'Desconocido'}</span>
                            </div>
                        </div>
                        <!-- Aquí va la nueva basurita premium que ya pusiste -->
                        <div class="delete-btn" onclick="deleteUser('${user.username}')" title="Eliminar">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </div>
                    </div>
                `;
            }
              
                            
     
            usersContainer.innerHTML += cardHtml;
        });

        totalCount.textContent = activos;
        pendingCount.textContent = pendientes;

    } catch (error) {
        console.error("Error al cargar los usuarios:", error);
    }
}

// ==========================================
// 3. FUNCIÓN PARA ACEPTAR USUARIO PENDIENTE
// ==========================================
async function acceptUser(username) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist?username=eq.${username}`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({ 
                status: 'Activo',
                role: 'MEMBER' 
            })
        });

        if (response.ok) {
            loadUsers(); 
        } else {
            alert("Hubo un error al intentar aceptar al usuario.");
        }
    } catch (error) {
        console.error("Error al aceptar:", error);
    }
}

// ==========================================
// 4. SISTEMA DE ELIMINACIÓN (MODAL)
// ==========================================
let userToDelete = "";

function deleteUser(username) {
    userToDelete = username;
    document.getElementById('deleteModalText').innerHTML = `¿Estás seguro que deseas eliminar a <b>${username}</b> de la whitelist?`;
    document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    userToDelete = "";
}

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!userToDelete) return; 

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist?username=eq.${userToDelete}`, {
            method: 'DELETE',
            headers: headers
        });

        if (response.ok) {
            loadUsers(); 
            closeDeleteModal(); 
        } else {
            alert('Error al intentar eliminar al usuario.');
        }
    } catch (error) {
        console.error("Error en la eliminación:", error);
    }
});

// ==========================================
// 5. SISTEMA DE BÚSQUEDA EN TIEMPO REAL
// ==========================================
searchInput.addEventListener('input', function(e) {
    const text = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.user-card');

    cards.forEach(card => {
        const username = card.querySelector('h4').innerText.toLowerCase();
        if (username.includes(text)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// ==========================================
// 6. SISTEMA DE FILTROS POR RANGO
// ==========================================
document.getElementById('filterBtn').addEventListener('click', () => {
    document.getElementById('filterMenu').classList.toggle('show');
});

window.addEventListener('click', function(e) {
    if (!document.getElementById('filterBtn').contains(e.target)) {
        document.getElementById('filterMenu').classList.remove('show');
    }
});

function filterByRank(rank) {
    const cards = document.querySelectorAll('.user-card');
    
    cards.forEach(card => {
        const badgeText = card.querySelector('.badge').innerText;
        
        if (rank === 'TODOS') {
            card.style.display = 'flex';
        } else if (rank === 'Pendiente') {
            if (badgeText === 'NUEVO') card.style.display = 'flex';
            else card.style.display = 'none';
        } else {
            if (badgeText === rank) card.style.display = 'flex';
            else card.style.display = 'none';
        }
    });
}

// ==========================================
// 7. SISTEMA DE AGREGAR USUARIO (MODAL)
// ==========================================
document.getElementById('openAddModalBtn').addEventListener('click', () => {
    document.getElementById('addModal').classList.add('show');
});

function closeAddModal() {
    document.getElementById('addModal').classList.remove('show');
    document.getElementById('newUserName').value = ""; 
    document.getElementById('newUserRank').value = ""; 
}

document.getElementById('confirmAddBtn').addEventListener('click', async () => {
    const username = document.getElementById('newUserName').value.trim();
    const rank = document.getElementById('newUserRank').value;

    if (username === "" || rank === "") {
        alert("Por favor ingresa un nombre y selecciona un rol.");
        return;
    }

    // Botón en estado de carga
    const confirmBtn = document.getElementById('confirmAddBtn');
    confirmBtn.innerText = "Verificando...";

    try {
        // Anti-Duplicados
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/whitelist?username=eq.${username}&select=username`, {
            method: 'GET',
            headers: headers
        });

        const existingUsers = await checkResponse.json();

        if (existingUsers.length > 0) {
            alert(`⚠️ El usuario "${username}" ya está en la base de datos.`);
            confirmBtn.innerText = "Agregar a whitelist";
            return; 
        }

        confirmBtn.innerText = "Guardando...";

        const response = await fetch(`${SUPABASE_URL}/rest/v1/whitelist`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ 
                username: username, 
                role: rank,
                status: 'Activo' 
            })
        });

        if (response.ok) {
            loadUsers(); 
            closeAddModal(); 
            searchInput.value = ""; 
        } else {
            alert('Error al añadir a la base de datos.');
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        confirmBtn.innerText = "Agregar a whitelist";
    }
});

// ==========================================
// 8. SISTEMA DE LOGIN Y SEGURIDAD
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
    
    // Carga los usuarios SOLO cuando se concede el acceso
    loadUsers();
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

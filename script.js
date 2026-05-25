let state = {
    competitors: [],
    teams: [],
    games: [],
    matches: []
};

const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialData();
    setupNavigation();
});

async function loadInitialData() {
    try {
        const response = await fetch(`${API_URL}/state`);
        state = await response.json();
        renderAll();
    } catch (error) {
        console.error("Erro ao carregar dados da API:", error);
    }
}

async function saveItem(event, type) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_URL}/save/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            await loadInitialData();
            closeModal();
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
    }
}

async function finishMatch(id) {
    try {
        const response = await fetch(`${API_URL}/matches/${id}/finish`, {
            method: 'PUT'
        });
        if (response.ok) {
            await loadInitialData();
        }
    } catch (error) {
        console.error("Erro ao finalizar:", error);
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('#sidebar-nav li');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewId = item.getAttribute('data-view');
            switchView(viewId);
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modal-container');
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
}

function renderAll() {
    renderDashboard();
    renderJogos();
    renderTimes();
    renderCompetidores();
    renderConfrontos();
}

function renderDashboard() {
    const statsContainer = document.getElementById('dashboard-stats');
    const upcomingContainer = document.getElementById('upcoming-matches');
    if (!statsContainer || !upcomingContainer) return;

    statsContainer.innerHTML = `
        <div class="card"><h3>${state.teams.length}</h3><p>Equipes</p></div>
        <div class="card"><h3>${state.competitors.length}</h3><p>Competidores</p></div>
        <div class="card"><h3>${state.matches.filter(m => m.status === 'finished').length}</h3><p>Resultados</p></div>
        <div class="card"><h3>${state.matches.filter(m => m.status === 'scheduled').length}</h3><p>Pendentes</p></div>
    `;

    const upcoming = state.matches.filter(m => m.status === 'scheduled').slice(0, 3);
    upcomingContainer.innerHTML = upcoming.map(m => {
        const t1 = state.teams.find(t => t.id == m.team1Id);
        const t2 = state.teams.find(t => t.id == m.team2Id);
        return `<div class="card"><strong>${t1?.name || 'TBD'}</strong> VS <strong>${t2?.name || 'TBD'}</strong></div>`;
    }).join('');
}

function renderJogos() {
    const list = document.getElementById('list-jogos');
    if (list) list.innerHTML = state.games.map(g => `<div class="card"><h3>${g.name}</h3><p>${g.genre}</p></div>`).join('');
}

function renderTimes() {
    const list = document.getElementById('list-times');
    if (list) {
        list.innerHTML = state.teams.map(t => {
            // Filtra os competidores que pertencem a este time
            const members = state.competitors.filter(c => c.teamId == t.id);
            const membersList = members.length > 0 
                ? members.map(m => `<li>${m.nickname}</li>`).join('') 
                : '<li>Sem membros</li>';

            return `
                <div class="card" style="border-left: 4px solid ${t.color}">
                    <h3>${t.name}</h3>
                    <p style="font-size: 0.8rem; margin-top: 10px;"><strong>Membros:</strong></p>
                    <ul style="font-size: 0.8rem; padding-left: 15px; list-style: disc;">
                        ${membersList}
                    </ul>
                </div>
            `;
        }).join('');
    }
}

function renderCompetidores() {
    const list = document.getElementById('list-competidores');
    if (list) list.innerHTML = state.competitors.map(c => {
        const team = state.teams.find(t => t.id == c.teamId);
        return `<div class="card"><h3>${c.nickname}</h3><p>${c.name}</p><small>${team?.name || 'Sem Time'}</small></div>`;
    }).join('');
}

function renderConfrontos() {
    const list = document.getElementById('list-confrontos');
    if (list) list.innerHTML = state.matches.map(m => {
        const t1 = state.teams.find(t => t.id == m.team1Id);
        const t2 = state.teams.find(t => t.id == m.team2Id);
        const game = state.games.find(g => g.id == m.gameId);
        return `
            <div class="card">
                <span class="card-tag">${game?.name || 'Jogo'}</span>
                <div style="display:flex; justify-content: space-around; align-items: center; margin: 10px 0;">
                    <div><strong>${t1?.name}</strong><br>${m.score1}</div>
                    <div>VS</div>
                    <div><strong>${t2?.name}</strong><br>${m.score2}</div>
                </div>
                ${m.status === 'scheduled' ? `<button class="btn-primary" onclick="finishMatch(${m.id})">Finalizar</button>` : '<span style="color: green; font-weight: bold;">FINALIZADO</span>'}
            </div>
        `;
    }).join('');
}

function showForm(type) {
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('form-content');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';

    let html = '';
    if (type === 'competidor') {
        html = `
            <h2>Novo Competidor</h2>
            <form onsubmit="saveItem(event, 'competitors')">
                <input type="text" name="name" placeholder="Nome Completo" required>
                <input type="text" name="nickname" placeholder="Nickname" required>
                <select name="teamId" required>
                    <option value="">Selecione um Time</option>
                    ${state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
                <button type="submit" class="btn-primary">Salvar</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </form>
        `;
    } else if (type === 'jogo') {
        html = `
            <h2>Novo Jogo</h2>
            <form onsubmit="saveItem(event, 'games')">
                <input type="text" name="name" placeholder="Nome do Jogo" required>
                <input type="text" name="genre" placeholder="Gênero (ex: FPS)">
                <button type="submit" class="btn-primary">Salvar</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </form>
        `;
    } else if (type === 'time') {
        html = `
            <h2>Novo Time</h2>
            <form onsubmit="saveItem(event, 'teams')">
                <input type="text" name="name" placeholder="Nome da Equipe" required>
                <input type="color" name="color" value="#6366f1">
                <button type="submit" class="btn-primary">Salvar</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </form>
        `;
    } else if (type === 'confronto') {
        html = `
            <h2>Novo Confronto</h2>
            <form onsubmit="saveItem(event, 'matches')">
                <select name="gameId" required>
                    <option value="">Selecione o Jogo</option>
                    ${state.games.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
                </select>
                <select name="team1Id" required>
                    <option value="">Time A</option>
                    ${state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
                <select name="team2Id" required>
                    <option value="">Time B</option>
                    ${state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                </select>
                <input type="hidden" name="score1" value="0">
                <input type="hidden" name="score2" value="0">
                <input type="hidden" name="status" value="scheduled">
                <input type="hidden" name="date" value="${new Date().toISOString()}">
                <button type="submit" class="btn-primary">Salvar</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </form>
        `;
    }
    content.innerHTML = html;
}

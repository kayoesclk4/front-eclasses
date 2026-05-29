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
    const response = await fetch(`${API_URL}/state`);
    state = await response.json();
    renderAll();
}

async function saveItem(event, type) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch(`${API_URL}/save/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        await loadInitialData();
        closeModal();
    }
}

async function finishMatch(id) {
    const match = state.matches.find(m => m.id == id);
    const t1 = state.teams.find(t => t.id == match.team1Id);
    const t2 = state.teams.find(t => t.id == match.team2Id);

    // Abre modal de placar
    const modal = document.getElementById('modal-container');
    const content = document.getElementById('form-content');
    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';

    content.innerHTML = `
        <h2>Finalizar Confronto</h2>
        <p style="color: var(--text-dim); margin-bottom: 1.5rem;">${t1?.name || 'Time A'} vs ${t2?.name || 'Time B'}</p>
        <form onsubmit="submitFinish(event, ${id})">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                <div class="form-group">
                    <label>${t1?.name || 'Time A'}</label>
                    <input type="number" name="score1" min="0" value="0" required>
                </div>
                <div class="form-group">
                    <label>${t2?.name || 'Time B'}</label>
                    <input type="number" name="score2" min="0" value="0" required>
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn-primary">Confirmar</button>
                <button type="button" onclick="closeModal()">Cancelar</button>
            </div>
        </form>
    `;
}

async function submitFinish(event, id) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch(`${API_URL}/matches/${id}/finish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        await loadInitialData();
        closeModal();
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
        const game = state.games.find(g => g.id == m.gameId);
        const dateStr = m.date ? new Date(m.date).toLocaleString('pt-BR') : 'Sem data';
        return `
            <div class="card">
                <span class="card-tag">${game?.name || 'Jogo'}</span>
                <div style="display:flex; justify-content: space-around; align-items: center; margin: 10px 0;">
                    <strong>${t1?.name || 'TBD'}</strong>
                    <span style="color: var(--text-dim);">VS</span>
                    <strong>${t2?.name || 'TBD'}</strong>
                </div>
                <p style="color: var(--text-dim); font-size: 0.8rem; text-align: center;">${dateStr}</p>
            </div>
        `;
    }).join('');
}

function renderJogos() {
    const list = document.getElementById('list-jogos');
    if (list) list.innerHTML = state.games.map(g => `
        <div class="card">
            <h3>${g.name}</h3>
            <p>${g.genre}</p>
        </div>
    `).join('');
}

function renderTimes() {
    const list = document.getElementById('list-times');
    if (list) {
        list.innerHTML = state.teams.map(t => {
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
        return `
            <div class="card">
                <h3>${c.nickname}</h3>
                <p>${c.name}</p>
                <small>${team?.name || 'Sem Time'}</small>
            </div>
        `;
    }).join('');
}

function renderConfrontos() {
    const list = document.getElementById('list-confrontos');
    if (list) list.innerHTML = state.matches.map(m => {
        const t1 = state.teams.find(t => t.id == m.team1Id);
        const t2 = state.teams.find(t => t.id == m.team2Id);
        const game = state.games.find(g => g.id == m.gameId);
        const dateStr = m.date ? new Date(m.date).toLocaleString('pt-BR') : 'Sem data';
        return `
            <div class="card">
                <span class="card-tag">${game?.name || 'Jogo'}</span>
                <p style="color: var(--text-dim); font-size: 0.8rem; margin-bottom: 0.75rem;">${dateStr}</p>
                <div style="display:flex; justify-content: space-around; align-items: center; margin: 10px 0;">
                    <div style="text-align: center;">
                        <strong>${t1?.name || '???'}</strong>
                        <div class="score">${m.score1}</div>
                    </div>
                    <div style="color: var(--text-dim); font-weight: 800;">VS</div>
                    <div style="text-align: center;">
                        <strong>${t2?.name || '???'}</strong>
                        <div class="score">${m.score2}</div>
                    </div>
                </div>
                ${m.status === 'scheduled'
                    ? `<button class="btn-primary" onclick="finishMatch(${m.id})">Finalizar</button>`
                    : '<span style="color: #10b981; font-weight: bold;">✓ FINALIZADO</span>'
                }
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
                <div class="form-group">
                    <label>Nome Completo</label>
                    <input type="text" name="name" placeholder="Nome Completo" required>
                </div>
                <div class="form-group">
                    <label>Nickname</label>
                    <input type="text" name="nickname" placeholder="Nickname" required>
                </div>
                <div class="form-group">
                    <label>Time</label>
                    <select name="teamId" required>
                        <option value="">Selecione um Time</option>
                        ${state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Salvar</button>
                    <button type="button" onclick="closeModal()">Cancelar</button>
                </div>
            </form>
        `;
    } else if (type === 'jogo') {
        html = `
            <h2>Novo Jogo</h2>
            <form onsubmit="saveItem(event, 'games')">
                <div class="form-group">
                    <label>Nome do Jogo</label>
                    <input type="text" name="name" placeholder="Nome do Jogo" required>
                </div>
                <div class="form-group">
                    <label>Gênero</label>
                    <input type="text" name="genre" placeholder="Ex: FPS">
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Salvar</button>
                    <button type="button" onclick="closeModal()">Cancelar</button>
                </div>
            </form>
        `;
    } else if (type === 'time') {
        html = `
            <h2>Novo Time</h2>
            <form onsubmit="saveItem(event, 'teams')">
                <div class="form-group">
                    <label>Nome da Equipe</label>
                    <input type="text" name="name" placeholder="Nome da Equipe" required>
                </div>
                <div class="form-group">
                    <label>Cor</label>
                    <input type="color" name="color" value="#6366f1">
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Salvar</button>
                    <button type="button" onclick="closeModal()">Cancelar</button>
                </div>
            </form>
        `;
    } else if (type === 'confronto') {
        html = `
            <h2>Novo Confronto</h2>
            <form onsubmit="saveItem(event, 'matches')">
                <div class="form-group">
                    <label>Jogo</label>
                    <select name="gameId" required>
                        <option value="">Selecione o Jogo</option>
                        ${state.games.map(g => `<option value="${g.id}">${g.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Time A</label>
                    <select name="team1Id" required>
                        <option value="">Selecione o Time A</option>
                        ${state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Time B</label>
                    <select name="team2Id" required>
                        <option value="">Selecione o Time B</option>
                        ${state.teams.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Data e Hora</label>
                    <input type="datetime-local" name="date" required value="${new Date().toISOString().slice(0,16)}">
                </div>
                <input type="hidden" name="score1" value="0">
                <input type="hidden" name="score2" value="0">
                <input type="hidden" name="status" value="scheduled">
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn-primary">Agendar</button>
                    <button type="button" onclick="closeModal()">Cancelar</button>
                </div>
            </form>
        `;
    }

    content.innerHTML = html;
}
let state = { jogos: [], times: [], competidores: [], confrontos: [] };

const mapaTipoColecao = {
    jogo: 'jogos',
    time: 'times',
    competidor: 'competidores',
    confronto: 'confrontos'
};

const modal = document.getElementById('modal-container');
const formContent = document.getElementById('form-content');

document.addEventListener('DOMContentLoaded', async () => {
    configurarNavegacao();
    await carregarDados();
    renderizarTudo();
});

async function carregarDados() {
    const [jogos, times, competidores, confrontos] = await Promise.all([
        getJogos(), getTimes(), getCompetidores(), getConfrontos()
    ]);
    state = { jogos, times, competidores, confrontos };
}

function configurarNavegacao() {
    document.querySelectorAll('#sidebar-nav li').forEach(item => {
        item.addEventListener('click', () => {
            trocarView(item.dataset.view);
            document.querySelectorAll('#sidebar-nav li').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function trocarView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewId}`).classList.add('active');
}

function renderizarTudo() {
    renderizarDashboard(); renderizarJogos(); renderizarTimes(); renderizarCompetidores(); renderizarConfrontos();
}

function renderizarDashboard() {
    const stats = document.getElementById('dashboard-stats');
    const proximos = document.getElementById('upcoming-matches');
    const encerrados = state.confrontos.filter(c => c.status === 'finished').length;
    const agendados = state.confrontos.filter(c => c.status === 'scheduled').length;
    stats.innerHTML = `
        <div class="card"><span class="card-tag">Torneio</span><h3>${state.times.length}</h3><p class="subtitle">Equipes</p></div>
        <div class="card"><span class="card-tag">Atletas</span><h3>${state.competidores.length}</h3><p class="subtitle">Competidores</p></div>
        <div class="card"><span class="card-tag">Encerrados</span><h3>${encerrados}</h3><p class="subtitle">Resultados</p></div>
        <div class="card"><span class="card-tag">Pendentes</span><h3>${agendados}</h3><p class="subtitle">Agendamentos</p></div>`;
    const lista = state.confrontos.filter(c => c.status === 'scheduled').slice(0, 3);
    proximos.innerHTML = lista.length ? lista.map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const time1 = state.times.find(t => t.id == c.team1Id);
        const time2 = state.times.find(t => t.id == c.team2Id);
        return `<div class="card"><span class="card-tag">${jogo?.name || 'Jogo'}</span><div class="match-card"><div class="team-score"><strong>${time1?.name || 'TBD'}</strong></div><div class="vs">VS</div><div class="team-score"><strong>${time2?.name || 'TBD'}</strong></div></div></div>`;
    }).join('') : '<p class="subtitle">Nenhum confronto agendado.</p>';
}

function botoes(colecao, id) {
    return `<div class="card-actions"><button onclick="abrirFormulario('${colecao === 'jogos' ? 'jogo' : colecao === 'times' ? 'time' : colecao === 'competidores' ? 'competidor' : 'confronto'}', ${id})">Editar</button><button onclick="removerRegistro('${colecao}', ${id})">Apagar</button></div>`;
}

function renderizarJogos() {
    document.getElementById('list-jogos').innerHTML = state.jogos.map(j => `<div class="card"><span class="card-tag">${j.genre}</span><h3>${j.name}</h3><p class="subtitle">ID: ${j.id}</p>${botoes('jogos', j.id)}</div>`).join('') || '<p class="subtitle">Nenhum jogo cadastrado.</p>';
}

function renderizarTimes() {
    document.getElementById('list-times').innerHTML = state.times.map(t => `<div class="card" style="border-right:4px solid ${t.color}"><span class="card-tag">EQUIPE</span><h3>${t.name}</h3><p class="subtitle">${state.competidores.filter(c => c.teamId == t.id).length} Jogadores</p>${botoes('times', t.id)}</div>`).join('') || '<p class="subtitle">Nenhum time cadastrado.</p>';
}

function renderizarCompetidores() {
    document.getElementById('list-competidores').innerHTML = state.competidores.map(c => {
        const time = state.times.find(t => t.id == c.teamId);
        return `<div class="card"><span class="card-tag">${time?.name || 'Sem Time'}</span><h3>${c.nickname}</h3><p class="subtitle">${c.name}</p>${botoes('competidores', c.id)}</div>`;
    }).join('') || '<p class="subtitle">Nenhum competidor cadastrado.</p>';
}

function renderizarConfrontos() {
    document.getElementById('list-confrontos').innerHTML = state.confrontos.map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const time1 = state.times.find(t => t.id == c.team1Id);
        const time2 = state.times.find(t => t.id == c.team2Id);
        const data = new Date(c.date).toLocaleString('pt-BR');
        return `<div class="card"><span class="card-tag">${jogo?.name || 'Jogo'} | ${data}</span><div class="match-card"><div class="team-score"><strong>${time1?.name || '???'}</strong><div class="score">${c.score1}</div></div><div class="vs">VS</div><div class="team-score"><strong>${time2?.name || '???'}</strong><div class="score">${c.score2}</div></div></div><div class="match-actions"><span class="card-tag status-${c.status}">${c.status === 'finished' ? 'FINALIZADO' : 'AGENDADO'}</span>${c.status === 'scheduled' ? `<button onclick="encerrarConfrontos(${c.id})">Finalizar</button>` : ''}<button onclick="abrirFormulario('confronto', ${c.id})">Editar</button><button onclick="removerRegistro('confrontos', ${c.id})">Apagar</button></div></div>`;
    }).join('') || '<p class="subtitle">Nenhum confronto cadastrado.</p>';
}

window.abrirFormulario = function(tipo, id) {
    const colecao = mapaTipoColecao[tipo];
    const item = id !== undefined ? state[colecao].find(i => i.id == id) : null;
    const optionsTimes = selecionado => state.times.map(t => `<option value="${t.id}" ${item && Number(selecionado) === Number(t.id) ? 'selected' : ''}>${t.name}</option>`).join('');
    const optionsJogos = selecionado => state.jogos.map(j => `<option value="${j.id}" ${item && Number(selecionado) === Number(j.id) ? 'selected' : ''}>${j.name}</option>`).join('');
    const idAtributo = item ? `, ${item.id}` : '';

    const formularios = {
        jogo: `<h2>${item ? 'Editar Jogo' : 'Adicionar Jogo'}</h2><form onsubmit="salvarItem(event, 'jogos'${idAtributo})"><div class="form-group"><label>Nome do Jogo</label><input type="text" name="name" required value="${item?.name || ''}"></div><div class="form-group"><label>Gênero</label><input type="text" name="genre" required value="${item?.genre || ''}"></div><div class="form-buttons"><button type="submit" class="btn-primary">${item ? 'Salvar alterações' : 'Salvar'}</button><button type="button" onclick="fecharModal()">Cancelar</button></div></form>`,
        time: `<h2>${item ? 'Editar Time' : 'Adicionar Time'}</h2><form onsubmit="salvarItem(event, 'times'${idAtributo})"><div class="form-group"><label>Nome da Equipe</label><input type="text" name="name" required value="${item?.name || ''}"></div><div class="form-group"><label>Cor</label><input type="color" name="color" value="${item?.color || '#6366f1'}"></div><div class="form-buttons"><button type="submit" class="btn-primary">${item ? 'Salvar alterações' : 'Criar'}</button><button type="button" onclick="fecharModal()">Cancelar</button></div></form>`,
        competidor: `<h2>${item ? 'Editar Competidor' : 'Registrar Competidor'}</h2><form onsubmit="salvarItem(event, 'competidores'${idAtributo})"><div class="form-group"><label>Nome Completo</label><input type="text" name="name" required value="${item?.name || ''}"></div><div class="form-group"><label>Nickname</label><input type="text" name="nickname" required value="${item?.nickname || ''}"></div><div class="form-group"><label>Time</label><select name="teamId" required>${optionsTimes(item?.teamId)}</select></div><div class="form-buttons"><button type="submit" class="btn-primary">${item ? 'Salvar alterações' : 'Registrar'}</button><button type="button" onclick="fecharModal()">Cancelar</button></div></form>`,
        confronto: `<h2>${item ? 'Editar Confronto' : 'Novo Confronto'}</h2><form onsubmit="salvarItem(event, 'confrontos'${idAtributo})"><div class="form-group"><label>Jogo</label><select name="gameId" required>${optionsJogos(item?.gameId)}</select></div><div class="two-columns"><div class="form-group"><label>Time A</label><select name="team1Id" required>${optionsTimes(item?.team1Id)}</select></div><div class="form-group"><label>Time B</label><select name="team2Id" required>${optionsTimes(item?.team2Id)}</select></div></div><div class="form-group"><label>Data/Hora</label><input type="datetime-local" name="date" required value="${item ? String(item.date).slice(0,16) : new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,16)}"></div><input type="hidden" name="score1" value="${item?.score1 ?? 0}"><input type="hidden" name="score2" value="${item?.score2 ?? 0}"><input type="hidden" name="status" value="${item?.status || 'scheduled'}"><div class="form-buttons"><button type="submit" class="btn-primary">${item ? 'Salvar alterações' : 'Agendar'}</button><button type="button" onclick="fecharModal()">Cancelar</button></div></form>`
    };

    formContent.innerHTML = formularios[tipo];
    modal.classList.add('open');
};

window.fecharModal = function() { modal.classList.remove('open'); };

window.salvarItem = async function(event, colecao, id) {
    event.preventDefault();
    const dados = Object.fromEntries(new FormData(event.target).entries());
    ['teamId','gameId','team1Id','team2Id','score1','score2'].forEach(campo => { if (dados[campo] !== undefined) dados[campo] = Number(dados[campo]); });
    if (dados.date) dados.date = new Date(dados.date).toISOString();
    try {
        if (id !== undefined) await atualizarItem(colecao, id, dados);
        else await criarItem(colecao, dados);
        await carregarDados();
        renderizarTudo();
        fecharModal();
    } catch (erro) {
        alert('Não foi possível salvar o registro.');
        console.error(erro);
    }
};

window.encerrarConfrontos = async function(id) {
    const confronto = state.confrontos.find(c => c.id == id);
    if (!confronto) return;
    const time1 = state.times.find(t => t.id == confronto.team1Id);
    const time2 = state.times.find(t => t.id == confronto.team2Id);
    const placar1 = prompt(`Placar para ${time1?.name}:`, '0');
    const placar2 = prompt(`Placar para ${time2?.name}:`, '0');
    if (placar1 === null || placar2 === null) return;
    await atualizarItem('confrontos', id, { score1: Number(placar1), score2: Number(placar2), status: 'finished' });
    await carregarDados();
    renderizarTudo();
};

window.removerRegistro = async function(colecao, id) {
    if (!confirm('Tem certeza que deseja apagar este registro?')) return;
    await removerItem(colecao, id);
    await carregarDados();
    renderizarTudo();
};

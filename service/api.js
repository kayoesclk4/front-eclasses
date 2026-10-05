const BASE_URL = 'http://localhost:3000/api/';

async function getData(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function getJogos() { return getData('jogos'); }
async function getTimes() { return getData('times'); }
async function getCompetidores() { return getData('competidores'); }
async function getConfrontos() { return getData('confrontos'); }

async function enviarDados(endpoint, dados, metodo) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

async function criarItem(endpoint, dados) { return enviarDados(endpoint, dados, 'POST'); }
async function atualizarItem(endpoint, id, dados) { return enviarDados(`${endpoint}/${id}`, dados, 'PUT'); }

async function removerItem(endpoint, id) {
    const response = await fetch(`${BASE_URL}${endpoint}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

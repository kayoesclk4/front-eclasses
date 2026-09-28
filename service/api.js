const BASE_URL = 'http://localhost:3000/api/';

async function getData(endpoint) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Erro ao buscar ${endpoint}:`, error);
        alert(`Erro ao carregar ${endpoint}. Verifique se o servidor está rodando.`);
        return [];
    }
}

async function getJogos() {
    return getData('jogos');
}

async function getTimes() {
    return getData('times');
}

async function getCompetidores() {
    return getData('competidores');
}

async function getConfrontos() {
    return getData('confrontos');
}

// Envia dados pra API (usado por POST e PUT) e trata erro igual ao getData
async function enviarDados(endpoint, dados, metodo) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro ao ${metodo} ${endpoint}:`, error);
        alert(`Erro ao salvar em ${endpoint}. Verifique se o servidor está rodando.`);
        throw error;
    }
}

// Cria um novo item (POST /api/<endpoint>)
async function criarItem(endpoint, dados) {
    return enviarDados(endpoint, dados, 'POST');
}

// Atualiza um item existente (PUT /api/<endpoint>/:id)
async function atualizarItem(endpoint, id, dados) {
    return enviarDados(`${endpoint}/${id}`, dados, 'PUT');
}

// Remove um item (DELETE /api/<endpoint>/:id)
async function removerItem(endpoint, id) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}/${id}`, { method: 'DELETE' });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro ao remover ${endpoint}/${id}:`, error);
        alert(`Erro ao remover. Verifique se o servidor está rodando.`);
        throw error;
    }
}
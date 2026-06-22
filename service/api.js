const BASE_URL = 'http://localhost:3000/api/';

async function trataErros(response) {
    try {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao carregar os dados. Verifique se o servidor está rodando.');
        return [];
    }
}

// Retorna todos os jogos
async function getJogos() {
    const response = await fetch(`${BASE_URL}jogos`);
    return trataErros(response);
}

// Retorna todos os times
async function getTimes() {
    const response = await fetch(`${BASE_URL}times`);
    return trataErros(response);
}

// Retorna todos os competidores
async function getCompetidores() {
    const response = await fetch(`${BASE_URL}competidores`);
    return trataErros(response);
}

// Retorna todos os confrontos
async function getConfrontos() {
    const response = await fetch(`${BASE_URL}confrontos`);
    return trataErros(response);
}
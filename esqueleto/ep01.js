/* ==================================================
    EP01 - Exercício programa de MAC0420/MAC5744

    Nome: João Guilherme Barbosa de Souza
    NUSP: 12543850

    Ao preencher esse cabeçalho com o meu nome e o meu número USP,
    declaro que todas as partes originais desse exercício programa (EP)
    foram desenvolvidas e implementadas por mim e que portanto não 
    constituem desonestidade acadêmica ou plágio.
    Declaro também que sou responsável por todas as cópias desse
    programa e que não distribui ou facilitei a sua distribuição.
    Estou ciente que os casos de plágio e desonestidade acadêmica
    serão tratados segundo os critérios divulgados na página da 
    disciplina.
    Entendo que EPs sem assinatura devem receber nota zero e, ainda
    assim, poderão ser punidos por desonestidade acadêmica.

    Abaixo descreva qualquer ajuda que você recebeu para fazer este
    EP.  Inclua qualquer ajuda recebida por pessoas (inclusive
    monitores e colegas). Com exceção de material da disciplina, caso
    você tenha utilizado alguma informação, trecho de código,...
    indique esse fato abaixo para que o seu programa não seja
    considerado plágio ou irregular.

    Exemplo:

        A minha função quicksort() foi baseada na descrição encontrada na 
        página https://www.ime.usp.br/~pf/algoritmos/aulas/quick.html.

    Descrição de ajuda ou indicação de fonte:
        O uso das minhas funções every() foram baseados na página
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every

        Todo o uso de drag's and drops e etc foram tirados da página (e outros encontrados na mesma guia):
        https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

        As funções de desenhar retângulo e desenhar texto foram tiradas da seguinte página:
        https://panda.ime.usp.br/introcg/static/introcg/04-canvas.html
================================================== */

// ALGUMAS CONSTANTES USADAS NO EP01 DEMO
const BG_COLOR = 'black';
const BG_FONT  = '14px Arial';
const COR_CINZA = '#d0d0d0';
const COR_CERTA = '#00FF00';
const COR_ERRADA = '#FF0000';
const GRID_GAP_SIZE = 2;
const BOLINHAS_GAP_SIZE = 4;

const MAX_NUM = 99; // usado nas equações
const MIN_NUM = 10;

// ==================================================================
window.onload = main;

var gCanvas;
var gCtx;
// Declare outras variáveis globais que desejar
// recomendamos o padrão camel case e um código para identificar 
// variáveis globais e seus tipos.

// ------------------------------------------------------------------
/**
 * função main
 */
function main() {
    window.botoes = declaraObjetoComponente('button');
    window.inputs = declaraObjetoComponente('input');
    window.bolinhas = []
    document.body.ondrop = bolinhaOnDrop;
    window.textoResultado = document.createElement("p");
    document.body.appendChild(textoResultado);
    declaraCallBackComponentes('onClick', botoes, "click");   
    window.canvas = declaraObjetoCanvas()

    redefineRodada();
}


// ------------------------------------------------------------------
/**
 * Redefine o estado do jogo para uma nova rodada.
 */
function redefineRodada() {
    calculaProblemasMatematicos();
    resetaTabuleiro();
    removeBolinhasAntigas();
    posicionaNovasBolinhas();
    textoResultado.textContent = '';
    botoes['bCheck'].disabled = true;
}

// ------------------------------------------------------------------
/**
 * Declara o objeto canvas e armazena suas propriedades principais.
 * @returns {Object} Objeto canvas contendo referência ao elemento, contexto, e dimensões.
 */
function declaraObjetoCanvas() {
    canvas = {}
    canvas['element'] = document.getElementById("gridCanvas");
    canvas['gCtx'] =  canvas['element'].getContext("2d");
    canvas['element'].ondrop = bolinhaOnDrop;
    canvas['element'].ondragover = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "copy";
    };
    canvas['pos'] = {};
    canvas['pos']['x'] = canvas['element'].getBoundingClientRect().x;
    canvas['pos']['y'] = canvas['element'].getBoundingClientRect().y;

    canvas['nrLinhas'] = parseInt(inputs['nRows'].value);
    canvas['nrColunas'] = parseInt(inputs['nCols'].value);

    return canvas
}

// ------------------------------------------------------------------
/**
 * Cria um dicionário com os componentes HTML de um determinado tipo.
 * @param {string} tipo - Tipo de elemento HTML (ex: 'button', 'input')
 * @returns {Object} Dicionário com os elementos encontrados indexados pelo id.
 */
function declaraObjetoComponente(tipo) {
    let componentes = document.querySelectorAll(tipo);
    let dictComponente = {}
    componentes.forEach(componente =>{
        dictComponente[componente.id] = componente
    })

    return dictComponente;
}

// ------------------------------------------------------------------
/**
 * Declara callbacks para um conjunto de componentes.
 * @param {string} sufixo - Sufixo usado para montar o nome da função de callback.
 * @param {Object} componentes - Dicionário de componentes.
 * @param {string} evento - Evento DOM (ex: 'click')
 */
function declaraCallBackComponentes(sufixo, componentes, evento) {
    for (let componenteId in componentes) {
        let componente = componentes[componenteId];
        let nomeCallback = sufixo + componenteId; // Aqui é 'componenteId' e não 'componente.id'
        if (typeof window[nomeCallback] === "function") {
            componente.addEventListener(evento, window[nomeCallback]);
        } else {
            console.log(`Callback ${nomeCallback} não encontrado.`);
        }
    }
}

// ------------------------------------------------------------------
/**
 * Callback do botão "Check". Verifica se os resultados estão corretos.
 * @param {Event} e - Evento de clique.
 */
function onClickbCheck(e) {
    let i = 0;
    canvas['grids'].forEach(grid => {
        if (grid.bolinha.resultado === grid.problema.resultado) {
            grid.cor = COR_CERTA;
            i++;
        } else {
            grid.cor = COR_ERRADA;
        }
    }

    );
    textoResultado.textContent = `Você fez ${i} ponto(s)`;
    desenhaTabuleiro();
}

// ------------------------------------------------------------------
/**
 * Callback do botão "Regenerate". Inicia uma nova rodada.
 * @param {Event} e - Evento de clique.
 */
function onClickbRegenerate(e) {
    redefineRodada()    
}

// ------------------------------------------------------------------
/**
 * Reinicializa o tabuleiro para uma nova rodada.
 */
function resetaTabuleiro() {
    limpaGrid();
    atualizaGrid();
    desenhaTabuleiro();
}

// ------------------------------------------------------------------
/**
 * Desenha o estado atual do tabuleiro.
 */
function desenhaTabuleiro() {
    desenhaGrids();
    escreveEquacoesProblemasMatematicos();
}

// ------------------------------------------------------------------
/**
 * Limpa o conteúdo desenhado no canvas.
 */
function limpaGrid() {
    canvas['gCtx'].clearRect(0, 0, canvas['element'].width, canvas['element'].height);
}

// ------------------------------------------------------------------
/**
 * Atualiza o grid com base nas entradas do usuário e gera novos problemas.
 */
function atualizaGrid() {
    canvas['nrLinhas'] = parseInt(inputs['nRows'].value);
    canvas['nrColunas'] = parseInt(inputs['nCols'].value);

    canvas['tamLinhas'] = (canvas['element'].height - GRID_GAP_SIZE * (canvas['nrLinhas'] )) / canvas['nrLinhas'];
    canvas['tamColunas'] = (canvas['element'].width - GRID_GAP_SIZE * (canvas['nrColunas'] )) / canvas['nrColunas'];
    
    canvas['linhasInicio'] = [];
    canvas['colunasInicio'] = [];
    canvas['grids'] = Array.from({ length: canvas['nrLinhas'] * canvas['nrColunas'] }, () => ({'bolinha': null, problema: calculaProblemasMatematicos(), 'cor': COR_CINZA}));

    defineLinhasEColunas();
}

// ------------------------------------------------------------------
/**
 * Define as posições iniciais das linhas e colunas no canvas.
 */
function defineLinhasEColunas(){
    defineEixoGrid('linhasInicio', canvas['tamLinhas'], canvas['nrLinhas']);
    defineEixoGrid('colunasInicio', canvas['tamColunas'], canvas['nrColunas']);
}

// ------------------------------------------------------------------
/**
 * Calcula as posições dos eixos (linhas ou colunas) no canvas.
 * @param {string} eixo - Nome do eixo (linhasInicio ou colunasInicio)
 * @param {number} eixoSize - Tamanho da célula no eixo
 * @param {number} nrEixos - Número de linhas ou colunas
 */
function defineEixoGrid(eixo, eixoSize, nrEixos){
    eixoPos = GRID_GAP_SIZE;

    for (let i = 0; i < nrEixos; i++) {
        canvas[eixo].push(eixoPos);
        eixoPos += eixoSize + GRID_GAP_SIZE;
    }
}

// ------------------------------------------------------------------
/**
 * Desenha todas as células (grids) no canvas.
 */
function desenhaGrids() {
    for (let linha = 0; linha < canvas['nrLinhas']; linha++) {
        for (let coluna = 0; coluna < canvas['nrColunas']; coluna++) {
            const gridNr = linha * canvas['nrColunas'] + coluna;

            desenheRect(
                canvas['grids'][gridNr].cor,
                canvas['colunasInicio'][coluna],
                canvas['linhasInicio'][linha],
                canvas['tamColunas'] - GRID_GAP_SIZE,
                canvas['tamLinhas']- GRID_GAP_SIZE,
            )
        }
    }
}

// ------------------------------------------------------------------
/**
 * Desenha um retângulo colorido no canvas.
 * @param {string} cor - Cor de preenchimento
 * @param {number} left - Posição x
 * @param {number} top - Posição y
 * @param {number} width - Largura
 * @param {number} height - Altura
 */
function desenheRect(cor, left, top, width, height) {
    canvas['gCtx'].fillStyle = cor;
    canvas['gCtx'].fillRect(left, top, width, height);
};

// ------------------------------------------------------------------
/**
 * Gera um número aleatório entre MIN_NUM e MAX_NUM.
 * @returns {number} Número aleatório
 */
function geraNumeroAleatorio() {
    return Math.floor((MAX_NUM - MIN_NUM) * Math.random()) + MIN_NUM;
}

// ------------------------------------------------------------------
/**
 * Gera um problema matemático aleatório (adição, subtração ou divisão).
 * @returns {Object} Objeto contendo a equação e seu resultado
 */
function calculaProblemasMatematicos() {
    let problema = {}
    let resultado = geraNumeroAleatorio();
    let primeiroValorOperacao = geraNumeroAleatorio();
    let segundoValorDaOperacao = 0;
    let operacao = Math.floor(Math.random() * 3)

    switch(operacao){
        case 0: //Operação de adição
            segundoValorDaOperacao = resultado - primeiroValorOperacao;
            problema['equacao'] = `${segundoValorDaOperacao} + ${primeiroValorOperacao}`;
            break;
        case 1: //Operação de subtreação
            segundoValorDaOperacao = resultado + primeiroValorOperacao;
            problema['equacao'] = `${segundoValorDaOperacao} - ${primeiroValorOperacao}`;
            break;
        case 2: //Operação de divisão
            segundoValorDaOperacao = resultado * primeiroValorOperacao;
            problema['equacao'] = `${segundoValorDaOperacao} / ${primeiroValorOperacao}`;
            break; 
    }
    problema['resultado'] = resultado;
    return problema;
}


function escreveEquacoesProblemasMatematicos() {
    for (let linha = 0; linha < canvas['nrLinhas']; linha ++) {
        for (let coluna = 0; coluna < canvas['nrColunas']; coluna ++){
            let x = canvas['colunasInicio'][coluna] + (canvas['tamColunas'] / 2) - GRID_GAP_SIZE;
            let y = canvas['linhasInicio'][linha] + ((canvas['tamLinhas'] / 2) > 70 ? (canvas['tamLinhas'] / 2) : 30) - GRID_GAP_SIZE;
            const gridNr = linha * canvas['nrColunas'] + coluna;
            console.log('GRID', linha, coluna, 'GRIDNR', gridNr)
            desenheTexto(canvas['grids'][gridNr].problema.equacao, x, y, canvas['tamLinhas']/8);
        }
    }
}

// ------------------------------------------------------------------
/**
 * recebe o texto msg e o desenha na posição (x - tamanho_do_texto/2,y) do canvas.
 * @param {string} msg 
 * @param {number} x 
 * @param {number} y 
 * @param {number} tam - tamanho da fonte
 * @param {string} cor - cor do texto
 */
function desenheTexto (msg, x, y, font = BG_FONT, cor = BG_COLOR) {
    canvas['gCtx'].fillStyle = cor;
    canvas['gCtx'].font = font;  
    const tamanhoTexto = canvas['gCtx'].measureText(msg).width;
    canvas['gCtx'].fillText(msg, x - (tamanhoTexto / 2), y);
}

// ------------------------------------------------------------------
/**
 * Escreve o resultado do problema matemático dentro da bolinha.
 * @param {number} nrBolinha - Índice da bolinha
 */
function escreveResultadoProblemasMatematicos(nrBolinha) {
        const bolinha = bolinhas[nrBolinha];
        bolinha.resultado = canvas['grids'][nrBolinha].problema.resultado;

        let paragrafo = bolinha.getElementsByTagName("p")[0];
        paragrafo.textContent = bolinha.resultado;
    }

// ------------------------------------------------------------------
/**
 * Remove todas as bolinhas do DOM.
 */
function removeBolinhasAntigas() {
    const numberPoolDiv = document.getElementById('numberPool');
    while (numberPoolDiv.firstChild) {
        numberPoolDiv.removeChild(numberPoolDiv.firstChild);
    }

    bolinhas = [];
}

// ------------------------------------------------------------------
/**
 * Cria novas bolinhas e as posiciona na pool.
 */
function posicionaNovasBolinhas() {
    const numberPoolDiv = document.getElementById('numberPool');
    const nrBolinhas = canvas['nrLinhas'] * canvas['nrColunas'];
    for (let bolinha = 0; bolinha < nrBolinhas; bolinha++) {
            const novaBolinha = criaBolinha(bolinha);
            numberPoolDiv.appendChild(novaBolinha);
            escreveResultadoProblemasMatematicos(bolinha);
    }

    embaralhaBolinhas();

}

// ------------------------------------------------------------------
/**
 * Cria uma nova bolinha com o ID correspondente.
 * @param {number} numero - Índice da bolinha
 * @returns {HTMLElement} Elemento div da bolinha
 */
function criaBolinha(numero) {
    const bolinha = document.createElement("div");
    bolinha.id = 'b' + numero;
    bolinha.draggable = true;
    bolinha.className = "number";
    const texto = document.createElement("p");
    bolinha.appendChild(texto);
    bolinha.ondragover = (e) => e.preventDefault();
    bolinha.ondragstart = (e) => e.dataTransfer.setData("text/plain", e.target.id);
    bolinha.ondrop = bolinhaOnDrop;
    bolinha.grid = null;
    bolinhas.push(bolinha);

    return bolinha
}

// ------------------------------------------------------------------
/**
 * Callback executado ao soltar uma bolinha no canvas.
 * @param {DragEvent} e - Evento de drop
 */
function bolinhaOnDrop(e) {
    e.preventDefault()
    const rect = canvas['element'].getBoundingClientRect();
    const dropPosX = e.clientX - rect.left;
    const dropPosY = e.clientY - rect.top;
    const bolinhaId = e.dataTransfer.getData("text/plain");
    const bolinha = document.getElementById(bolinhaId);
    const gridPos = defineGridDrop(dropPosX, dropPosY);
 
    if (dropPosX >= 0 && dropPosX <= canvas['element'].width
        && dropPosY >= 0 && dropPosY <= canvas['element'].height
    ) {
        console.log(gridPos);
        posicionaBolinhaNoGrid(bolinha, gridPos);
    } else {
        bolinha.style.position = "static";
        bolinha.grid = null;
        const gridNr = gridPos[0] * canvas['nrColunas'] + gridPos[1];
        canvas['grids'][gridNr].bolinha = null;
    }
}

// ------------------------------------------------------------------
/**
 * Define em qual grid a bolinha foi solta com base nas coordenadas.
 * @param {number} x - Posição x do drop
 * @param {number} y - Posição y do drop
 * @returns {Array} Par [coluna, linha]
 */
function defineGridDrop(x, y) {
    let i = 0;
    let j = 0;

    for (i=0; i < canvas['nrColunas']; i++) {
        if (canvas['colunasInicio'][i] > x) {
            break;
        } 
    }

    for (j=0; j < canvas['nrLinhas']; j++) {
        if (canvas['linhasInicio'][j] > y) {
            break;
        }
    }

    return [i-1,j-1];
}

// ------------------------------------------------------------------
/**
 * Posiciona visualmente a bolinha no grid especificado.
 * @param {HTMLElement} bolinha - Elemento bolinha
 * @param {Array} gridPos - Posição [coluna, linha] no grid
 */
function posicionaBolinhaNoGrid(bolinha, gridPos){
    const posX = gridPos[0] * (canvas['tamColunas'] + GRID_GAP_SIZE) + ((canvas['tamColunas'] + GRID_GAP_SIZE)/2) + canvas['pos']['x'] - 30;
    const posY = gridPos[1] * (canvas['tamLinhas'] + GRID_GAP_SIZE) + (canvas['tamLinhas'] - 65)  + canvas['pos']['y'];
    const gridNr = gridPos[1] * canvas['nrColunas'] + gridPos[0];
    console.log('COLOCANDO A BOLINHA NO GRID', gridPos[1], gridPos[0], gridNr);
    const bolinhaAnterior = canvas['grids'][gridNr].bolinha;

    if (bolinhaAnterior) {
        bolinhaAnterior.style.position = "static";
        bolinhaAnterior.grid = null;
    }

    if (bolinha.grid){
        canvas['grids'][bolinha.grid].bolinha = null;
    }
    
    bolinha.style.top = `${posY}px`;
    bolinha.style.left = `${posX}px`;
    bolinha.style.zIndex = "999";
    bolinha.style.position = "absolute";
    canvas['grids'][gridNr].bolinha = bolinha;
    bolinha.grid = gridNr;

    if (isGridsPreenchidos()){
        botoes['bCheck'].disabled = false;
    }
}

// ------------------------------------------------------------------
/**
 * Verifica se todas as células do grid possuem bolinhas.
 * @returns {boolean} true se todos os grids estiverem preenchidos
 */
function isGridsPreenchidos() {
    console.log(canvas['grids'].every(grid => grid.bolinha))
    return canvas['grids'].every(grid => grid.bolinha);
}

// ------------------------------------------------------------------
/**
 * Embaralha as bolinhas na pool usando o algoritmo de Fisher-Yates.
 */
function embaralhaBolinhas(){
    const numberPoolDiv = document.getElementById('numberPool');
    const items = Array.from(numberPoolDiv.children);

    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }

    items.forEach(item => numberPoolDiv.appendChild(item));
}
// ------------------------------------------------------------------

/* ==================================================
    EP01 - Exercício programa de MAC0420/MAC5744

    Nome: 
    NUSP:

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



================================================== */

// ALGUMAS CONSTANTES USADAS NO EP01 DEMO
const BG_COLOR = 'black';
const BG_FONT  = '14px Arial';
const COR_CINZA = '#d0d0d0';
const COR_CERTA = '#00FF00';
const COR_ERRADA = '#FF0000';
const GAP_SIZE = 2;
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
    window.canvas = declaraObjetoCanvas()
    window.botoes = declaraObjetoComponente('button');
    window.inputs = declaraObjetoComponente('input');

    declaraCallBackComponentes('onClick', botoes, "click");   
    desenhaTabuleiro()
}

function declaraObjetoCanvas() {
    canvas = {}
    canvas['element'] = document.getElementById("gridCanvas");
    canvas['gCtx'] =  canvas['element'].getContext("2d");

    return canvas
}



function declaraObjetoComponente(tipo) {
    let componentes = document.querySelectorAll(tipo);
    let dictComponente = {}
    componentes.forEach(componente =>{
        console.log(componente.id)
        dictComponente[componente.id] = componente
    })

    return dictComponente;
}

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

function onClickbCheck(e) {
    console.log(e.target.id)
}

function onClickbRegenerate(e) {
    desenhaTabuleiro()    
}

function desenhaTabuleiro() {
    limpaGrid();
    atualizaGrid();
    console.log(canvas);
    desenhaGrids();

}

function limpaGrid() {
    canvas['gCtx'].clearRect(0, 0, canvas['element'].width, canvas['element'].height);
}

function atualizaGrid() {
    canvas['nrLinhas'] = parseInt(inputs['nRows'].value);
    canvas['nrColunas'] = parseInt(inputs['nCols'].value);

    canvas['tamLinhas'] = (canvas['element'].height - GAP_SIZE * (canvas['nrLinhas'] )) / canvas['nrLinhas'];
    canvas['tamColunas'] = (canvas['element'].width - GAP_SIZE * (canvas['nrColunas'] )) / canvas['nrColunas'];
    
    canvas['linhasInicio'] = [];
    canvas['colunasInicio'] = [];

    defineLinhasEColunas();
}

function defineLinhasEColunas(){
    defineEixoGrid('linhasInicio', canvas['tamLinhas'], canvas['nrLinhas']);
    defineEixoGrid('colunasInicio', canvas['tamColunas'], canvas['nrColunas']);
}

function defineEixoGrid(eixo, eixoSize, nrEixos){
    eixoPos = GAP_SIZE;

    for (let i = 0; i < nrEixos; i++) {
        canvas[eixo].push(eixoPos);
        eixoPos += eixoSize + GAP_SIZE;
    }
}

function desenhaGrids() {
    for (let linha = 0; linha < canvas['nrLinhas']; linha++) {
        for (let coluna = 0; coluna < canvas['nrColunas']; coluna++) {
            desenheRect(
                COR_CINZA,
                canvas['colunasInicio'][coluna],
                canvas['linhasInicio'][linha],
                canvas['tamColunas'] - GAP_SIZE,
                canvas['tamLinhas']- GAP_SIZE,
            )
        }
    }
}

function desenheRect(cor, left, top, width, height) {
    console.log("Desenhando retângulo ", cor, left, top, width, height);
    canvas['gCtx'].fillStyle = cor;
    canvas['gCtx'].fillRect(left, top, width, height);
};


// ------------------------------------------------------------------

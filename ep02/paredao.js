/* ==================================================
    EP02 - Exercício programa de MAC0420/MAC5744

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

    O Código dos Shaders foi pego/adaptado a partir dos códigos encontrados nas aulas 
    sobre programação com webgl e animação com webgl, bem como outras sobre como animar
    com webGl utilizando transformações.

    A colisão entre os tijolos e a bolinha foi baseado na implementação de detecção de colisão
    aabb para encontrar os eixos de colisão/detectar a colisão e foram baseados principalmente em:
    https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
    https://happycoding.io/tutorials/processing/collision-detection#rectangle-rectangle-collision-detection
    https://stackoverflow.com/questions/62804578/aabb-separating-axis-theorem-finding-overlap-depth#:~:text=if%20%28xOverlap%20,0%2C1%5D%3B%20penetration%20%3D%20yOverlap%3B

    Além disso, algumas partes desse código para a criação das classes foram feitos com base em conhecimento
    compartilhado durante o ep lab04 (labV).

    Outros códigos como o de obter algums elementos, adicionar automaticamente os callbacks foram reutilizados
    do último ep
================================================== */


// ========================================================
// Código fonte dos shaders em GLSL
// a primeira linha deve conter "#version 300 es"
// para WebGL 2.0

let gsVertexShaderSrc = `#version 300 es

    // aPosition é um buffer de entrada
    in vec2 aPosition;
    uniform mat4 uMatrix;
    uniform vec4 uColor;  // uniform com a cor de cada vértice
    uniform vec4 uResolution;

    out vec4 vColor; // varying -> passado ao fShader

    void main() {

        gl_Position = vec4( uMatrix * vec4(aPosition,0,1) );
        vColor = uColor;
    }
`;

let gsFragmentShaderSrc = `#version 300 es

    precision highp float;

    // out define a saída 
    in vec4 vColor;
    out vec4 outColor;

    void main() {
    outColor = vColor;
    }
`;

var gShader = {};
var gaPositions = [];

/* CORES */
const GREEN07 = vec4(0.0, 0.7, 0.0, 1.0);
const WHITE   = vec4(1.0, 1.0, 1.0, 1.0);
const BLACK   = vec4(0.0, 0.0, 0.0, 1.0);
const RED     = vec4(1.0, 0.0, 0.0, 1.0);
const GREEN   = vec4(0.0, 1.0, 0.0, 1.0);
const BLUE    = vec4(0.0, 0.0, 1.0, 1.0);
const MAGENTA = vec4(1.0, 0.0, 1.0, 1.0);
const YELLOW  = vec4(1.0, 1.0, 0.0, 1.0);

const COR_FUNDO   = [0.0, 0.25, 0.0, 1.0];
const COR_RAQUETE = vec4(0.3, 0.5, 1.0, 1.0);
const COR_BOLA = YELLOW;
const COR_TIJOLO  = MAGENTA;

// ---------------------------------------------------
// passo é o intervalo de tempo usado na depuração
const PASSO = 0.10;  

// dimensão da raquete
const RAQ_H     = 0.01;
var   RAQ_MIN_W = 0.05;
// posição inicial da raquete na janela
const RAQ_ALT = 0.10;
const RAQ_ESQ = 0.5 - RAQ_MIN_W/2;
// velocidade da raquete 
var   RAQ_VEL = 0.5;

// a bola é um quadrado! Isso facilita vários cálculos.
const BOLA_LADO  = 0.02;
// posição inicial
const BOLA_ESQ = 0.5 - BOLA_LADO/2;
const BOLA_ALT = RAQ_ALT + RAQ_H;
// mínimo da velocidade da bola, tanto x quanto y. Veja slider
const BOLA_MIN_VEL = 0.05;

// grid de tijolos
const NLINS = 5;
const NCOLS = 10;
const BORDA = 0.003;  // entre 2 tijolos vizinhos
const ALTURA_PAREDE = 0.3; // relativo a altura da quadra

window.onload = main

function main() {
    window.botoes = declaraObjetoComponente('button');
    window.inputs = declaraObjetoComponente('input');
    window.canvas = declaraObjetoCanvas()
    declaraCallBackComponentes('onClick', botoes, "click");  
    inputs.tamanhoRaquete.onchange = onchangetamanhoRaquete;
    inputs.velocidadeBola.onchange = onchangevelocidadeBola;   
    window.onkeydown = movimentaRaquete;

    window.game = new Game();
    crieShaders();

    render();
}

function render() {
    canvas['gCtx'].clear(canvas['gCtx'].COLOR_BUFFER_BIT);

    game.render();
    window.requestAnimationFrame(render);

}

class Quadrado {
    static aPosicoes = [
        vec2(0.5, 0.5),
        vec2(0.5, -0.5),
        vec2(-0.5, 0.5),
        vec2(-0.5, -0.5),
        vec2(-0.5, 0.5),
        vec2(0.5, -0.5),
    ];

    static first = true;

    constructor(x, y, cor, sx, sy, vx = 0, vy = 0) {
        this.x = x;
        this.y = y;
        this.cor = cor;
        this.sx = sx;
        this.sy = sy;
        this.vx = vx;
        this.vy = vy;

        if (this.constructor.first) {
            this.constructor.first = false;
            this.constructor.aPosicoes.forEach((posicao) =>
            gaPositions.push(posicao));
        }
    }

    render(delta) {
        if(!game.pause) this.update(delta);
        this.generate()
        this.draw();
    }

    update(delta) {
        this.x += delta * this.vx;
        this.y += delta * this.vy;
    }

    generate() {
        let modelView = translate(this.x, this.y, 0);
        modelView = mult(modelView, scale(this.sx, this.sy, 0));
        let uMatrix = mult(projection, modelView);

        canvas['gCtx'].uniformMatrix4fv(gShader.uMatrix, false, flatten(uMatrix));
    }

    detectaColisao() {
        //pass
    }

    draw() {
        canvas['gCtx'].uniform4fv(gShader.uColor, this.cor);
        canvas['gCtx'].drawArrays(canvas['gCtx'].TRIANGLES, 0, this.constructor.aPosicoes.length);
    }
}

class Bola extends Quadrado {
    constructor(vel) {
        super(
            BOLA_ESQ + BOLA_LADO/2, 
            1 - BOLA_ALT - RAQ_H/2, 
            COR_BOLA, 
            BOLA_LADO, 
            BOLA_LADO, 
            vel, 
            vel);
        this.xAnterior = this.x;
        this.yAnterior = this.y;
        }

    detectaColisao() {
        let colisaoX = false;
        let colisaoY = false;

        if (this.x >= 1 - this.sx/2 || this.x <= this.sx/2){
            colisaoX = true;
        }

        if (this.y <= this.sx/2){
            colisaoY = true;
        }

        if (this.y >= 1 - this.sx/2){
            game.over = true
        }

        if (
            this.y <= ALTURA_PAREDE + this.sy
        ) {
            game.tijolos.forEach((tijolo) => {
            const dx = (tijolo.x + tijolo.sx / 2) - (this.x + this.sx / 2);
            const dy = (tijolo.y + tijolo.sy / 2) - (this.y + this.sy / 2);

            const metadeTamanhoLadosX = (tijolo.sx + this.sx) / 2;
            const metadeTamanhoLadosY = (tijolo.sy + this.sy) / 2;

            const overlapX = metadeTamanhoLadosX - Math.abs(dx);
            const overlapY = metadeTamanhoLadosY - Math.abs(dy);

            if (overlapX > 0 && overlapY > 0) {
                game.removeTijolo(tijolo);
              
                if (overlapX < overlapY) {
                    colisaoX = true;
                } else {
                    colisaoY = true;
                }
              }
            });

        }

        if (this.x + this.sx/2 >= game.raquete.x - game.raquete.sx/2 &&
            this.x - this.sx/2 <= game.raquete.x + game.raquete.sx/2 &&
            game.raquete.y - this.y <= game.raquete.sy/2 + this.sy/2
        ) {
            colisaoY = true;
            this.y = game.raquete.y - game.raquete.sy/2 - this.sy/2;
        }

        if(colisaoX) this.vx = -this.vx;
        if(colisaoY) this.vy = -this.vy;
    }

    setVelocidade(velocidade){
        this.vx = this.vx === 0 ? velocidade : Math.abs(this.vx)/this.vx * velocidade;
        this.vy = this.vy === 0 ? velocidade : Math.abs(this.vy)/this.vy * velocidade;
    }
}

class Raquete extends Quadrado {
    static sentido;
    constructor(sx) {
        super(
            RAQ_ESQ + RAQ_MIN_W/2, 
            1 - RAQ_ALT, 
            COR_RAQUETE, 
            sx,
            RAQ_H, 
            0, 
            0);
        this.constructor.sentido = 0;
    }

    detectaColisao(){   
        if (this.x > 1 - this.sx/2 && this.vx > 0){
            this.vx = 0;
            this.x = 1 - this.sx/2;
        } else if (this.x < 0 + this.sx/2 && this.vx < 0){
            this.vx = 0;
            this.x = 0 + this.sx/2;
        }
    }

    setVelocidade(velocidadeX) {
        this.vx = velocidadeX
    }

    setLargura(largura){
        this.sx = largura;
    }
}

class Tijolo extends Quadrado {
    static altura;
    static largura;

    constructor(x, y, sx, sy) {
        super(x, y, COR_TIJOLO, sx, sy);
    }

    static setAltura(altura) {
        this.altura = altura;
    }

    static setLargura(largura) {
        this.largura = largura;
    }
}

class Game {
    static self = null;
    pause = true;
    over = false;
    animationId = null;
    
    constructor() {
        if(this.constructor.self) {
            return self;
        } 
        else {
            self = this;
        }

        this.posicionaTijolos();
        this.posicionaBolinha();
        this.posicionaRaquete();
    }

    posicionaTijolos() {
        let posX, posY, paridade, deslocamento;
        
        const alturaTijolos = (ALTURA_PAREDE - NLINS * BORDA) / NLINS;
        const larguraTijolos = (1 - (NCOLS + 1) * BORDA )/ NCOLS;
        Tijolo.setAltura(alturaTijolos);
        Tijolo.setLargura(larguraTijolos);

        this.tijolos = [];

        for(let linha = 0; linha<NLINS; linha++) {
            paridade = (linha % 2);
            posY = (linha + 1) * BORDA + (linha + 0.5) * alturaTijolos;
            deslocamento = (1 - paridade) * larguraTijolos/2;
            for(let coluna = paridade; coluna<NCOLS; coluna++){
                posX = (coluna + 1) * BORDA + coluna * larguraTijolos + deslocamento;
                this.tijolos.push(new Tijolo(posX,posY, larguraTijolos, alturaTijolos));
            }
        }
    }

    posicionaRaquete() {
        let sx = inputs['tamanhoRaquete'].value * RAQ_MIN_W;
        
        this.raquete = new Raquete(sx);
    }

    posicionaBolinha() {
        let vel = inputs['velocidadeBola'].value * BOLA_MIN_VEL;
        
        this.bolinha = new Bola(vel)
    }

    removeTijolo(tijoloRemovido) {
        let tijolos = this.tijolos.filter((tijolo) =>  tijolo !== tijoloRemovido);
        this.tijolos = tijolos;
        if (tijolos.length === 0) game.over = true;
    }

    render(delta = 0.01) {
        canvas['gCtx'].clear(canvas['gCtx'].COLOR_BUFFER_BIT | canvas['gCtx'].DEPTH_BUFFER_BIT);
        
        this.tijolos.forEach((item) => {
            item.detectaColisao(this.bolinha);
            item.render(delta);
        });

        this.raquete.detectaColisao();
        this.raquete.render(delta);

        this.bolinha.detectaColisao();
        this.bolinha.render(delta);
    }

    update(delta) {
        this.tijolos.forEach((item) => {
            item.update(delta);
        });

        this.raquete.update(delta);

        this.bolinha.update(delta);
    }
    
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

function crieShaders() {
    //  cria o programa
    gShader.program = makeProgram(canvas['gCtx'], gsVertexShaderSrc, gsFragmentShaderSrc);
    canvas['gCtx'].useProgram(gShader.program);
  
    // carrega dados na GPU
    var bufVertices = canvas['gCtx'].createBuffer();
    canvas['gCtx'].bindBuffer(canvas['gCtx'].ARRAY_BUFFER, bufVertices);
    canvas['gCtx'].bufferData(canvas['gCtx'].ARRAY_BUFFER, flatten(gaPositions), canvas['gCtx'].STATIC_DRAW);
    // Associa as variáveis do shader ao buffer
    var aPositionLoc = canvas['gCtx'].getAttribLocation(gShader.program, "aPosition");
  
    // Configuração do atributo para ler do buffer
    // atual ARRAY_BUFFER
    let size = 2;          // 2 elementos de cada vez - vec2
    let type = canvas['gCtx'].FLOAT;   // tipo de 1 elemento = float 32 bits
    let normalize = false; // não normalize os dados
    let stride = 0;        // passo, quanto avançar a cada iteração depois de size*sizeof(type) 
    let offset = 0;        // começo do buffer
    canvas['gCtx'].vertexAttribPointer(aPositionLoc, size, type, normalize, stride, offset);
    canvas['gCtx'].enableVertexAttribArray(aPositionLoc);

    // resolve os uniforms
    gShader.uResolution = canvas['gCtx'].getUniformLocation(gShader.program, "uResolution");
    gShader.uColor = canvas['gCtx'].getUniformLocation(gShader.program, "uColor");
    gShader.uMatrix = canvas['gCtx'].getUniformLocation(gShader.program, "uMatrix");

  };

// ------------------------------------------------------------------
/**
 * Declara o objeto canvas e armazena suas propriedades principais.
 * @returns {Object} Objeto canvas contendo referência ao elemento, contexto, e dimensões.
 */
function declaraObjetoCanvas() {
    canvas = {}
    canvas['element'] = document.getElementById("gridCanvas");
    canvas['element'].style.backgroundColor = `rgba(${COR_FUNDO[0] * 255}, ${COR_FUNDO[1] * 255}, ${COR_FUNDO[2] * 255}, ${COR_FUNDO[3]})`;

    canvas['gCtx'] =  canvas['element'].getContext("webgl2");
    if (!canvas['gCtx']) alert("WebGL 2.0 isn't available");
    canvas['gCtx'].clearColor(COR_FUNDO[0], COR_FUNDO[1], COR_FUNDO[2], COR_FUNDO[3]);

    window.projection = mat4(
        2,    0,  0, -1,
        0, -2,  0,  1,
        0,     0,  1, 0,
        0,     0,  0, 1
        );

    return canvas;
}

/**
 * Calcula a distância entre o ponto p e o segmento definido pelos pontos a e b
 * usando operações do MVnew.js.
 *
 * @param {vec2} p - Ponto (px, py)
 * @param {vec2} a - Início do segmento (ax, ay)
 * @param {vec2} b - Fim do segmento (bx, by)
 * @returns {number} Distância mínima do ponto p ao segmento ab
 */
function distanciaPontoSegmento(p, a, b) {
    let ab = subtract(b, a);
    let ap = subtract(p, a);

    let ab_ab = dot(ab, ab);
    if (ab_ab === 0.0) {
        return length(subtract(p, a));
    }

    let t = dot(ap, ab) / ab_ab;
    t = Math.max(0, Math.min(1, t));

    let q = add(a, mult(t, ab));
    return length(subtract(p, q));
}

function onClickJogar() {
    if(game.pause){
        botoes['Jogar'].innerText = 'Pausar'
    } else {
        botoes['Jogar'].innerText = 'Jogar'
    }

    game.pause = !game.pause;
}

function onClickLimpar() {
    window.game = new Game();
    botoes['Jogar'].innerText = 'Jogar';
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

function movimentaRaquete(e){
    switch(e.key) {
        case 's':
        case 'k':
        case 'S':
        case 'K':
            game.raquete.setVelocidade(0);
            break;
        case 'a':
        case 'j':
        case 'A':
        case 'J':
            game.raquete.setVelocidade(-RAQ_VEL);
            break;
        case 'd':
        case 'l':
        case 'D':
        case 'L':
            game.raquete.setVelocidade(RAQ_VEL);
            break;
        case 'p':
        case 'P':
            if(game.pause) game.update(PASSO);
            break;
    }
}

function onchangevelocidadeBola(e) {
    game.bolinha.setVelocidade(inputs.velocidadeBola.value * BOLA_MIN_VEL);
}

function onchangetamanhoRaquete(e) {
    game.raquete.setLargura(inputs.tamanhoRaquete.value * RAQ_MIN_W);
}

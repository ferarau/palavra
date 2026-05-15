// elementos da tela
const body = document.getElementById('body')

const setupContainer = document.getElementById('setup-container')
const gameContainer = document.getElementById('game-container')
const wordDisplay = document.getElementById('word-display')
const gameMessage = document.getElementById('game-message')
const errorCount = document.getElementById('error-count')
const resetBtn = document.getElementById('reset-btn')
const hintDisplay = document.getElementById('hint-display')

const URL_API = 'https://api-palavras-8ptt.onrender.com'

// sons
const somAcerto = new Audio('./sons/acerto.mp3')
const somErro = new Audio('./sons/buzzer-error.mp3')

// volume
somAcerto.volume = 1
somErro.volume = 1

function tocarSom(tipo) {

    // pausa tudo antes
    somAcerto.pause()
    somErro.pause()

    // reinicia
    somAcerto.currentTime = 0
    somErro.currentTime = 0

    if (tipo === 'acerto') {

        somAcerto.play().catch((erro) => {
            console.log('Erro ao tocar som de acerto:', erro)
        })

    } else {

        somErro.play().catch((erro) => {
            console.log('Erro ao tocar som de erro:', erro)
        })
    }
}

async function iniciarJogo(event) {

    if (event.key == "Enter") {

        const nickname = document.getElementById('nickname-input').value

        if (!nickname) {
            alert('Preencha o nickname')
            return
        }

        const response = await fetch(`${URL_API}/iniciar`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nickname: nickname
            })
        })

        const data = await response.json()

        if (data.erro) {
            alert(data.erro)
            return
        }

        setupContainer.classList.add('hidden')
        gameContainer.classList.remove('hidden')

        document.getElementById('player-display').innerText =
            data.mensagem

        buscarPalavra()
    }
}

async function buscarPalavra() {

    const response = await fetch(`${URL_API}/status`, {
        credentials: 'include',
        method: 'GET',
    })

    const data = await response.json()

    wordDisplay.innerHTML = ''

    // dica
    hintDisplay.innerText = data.dica

    for (let i = 0; i < data.qtde_caracteres; i++) {

        const span = document.createElement('span')

        span.className = 'letter-slot'
        span.id = `slot-${i}`

        wordDisplay.appendChild(span)
    }
}

async function tentarLetra(event) {

    if (event.key == "Enter") {

        const input = document.getElementById('letter-input')

        const caractere = input.value.toLowerCase().trim()

        input.value = ''
        input.focus()

        if (!caractere) {
            alert('Digite uma letra!')
            return
        }

        const response = await fetch(`${URL_API}/tentativa`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                caractere: caractere
            })
        })

        const data = await response.json()

        // atualiza letras
        data.posicoes.forEach(pos => {

            const slot = document.getElementById(`slot-${pos}`)

            if (slot) {
                slot.innerText = caractere.toUpperCase()
            }
        })

        // toca som
        if (data.posicoes.length > 0) {
            tocarSom('acerto')
        } else {
            tocarSom('erro')
        }

        // atualiza infos
        errorCount.innerText = data.erros_atuais
        gameMessage.innerText = data.mensagem

        // fim do jogo
        if (data.status_jogo != 'jogando') {

            resetBtn.classList.remove('hidden')

            if (data.status_jogo == 'derrota') {

                gameMessage.style.color = '#ffb3b3'

                body.classList.remove('win-bg')
                body.classList.add('lose-bg')

            } else {

                gameMessage.style.color = '#d4ffd4'

                body.classList.remove('lose-bg')
                body.classList.add('win-bg')
            }
        }
    }
}

function reiniciarJogo() {
    location.reload()
}
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

    somAcerto.pause()
    somErro.pause()

    somAcerto.currentTime = 0
    somErro.currentTime = 0

    if (tipo === 'acerto') {

        somAcerto.play().catch((erro) => {
            console.log('Erro ao tocar som:', erro)
        })

    } else {

        somErro.play().catch((erro) => {
            console.log('Erro ao tocar som:', erro)
        })
    }
}

// ENTER
async function iniciarJogo(event) {

    if (event.key === 'Enter') {
        await iniciarPartida()
    }
}

// BOTÃO
async function iniciarJogoPorBotao() {
    await iniciarPartida()
}

// INICIAR PARTIDA
async function iniciarPartida() {

    const nicknameInput =
        document.getElementById('nickname-input')

    const levelInput =
        document.getElementById('level-input')

    const nickname =
        nicknameInput.value.trim()

    const nivel =
        levelInput.value

    // validações
    if (nickname === '' || nivel === '') {

        alert('Nickname e níveis são obrigatórios')

        return
    }

    try {

        const response = await fetch(`${URL_API}/iniciar`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nickname: nickname,
                nivel: nivel
            })
        })

        const data = await response.json()

        if (data.erro) {

            alert(data.erro)

            return
        }

        // mostra tela jogo
        setupContainer.classList.add('hidden')

        gameContainer.classList.remove('hidden')

        document.getElementById('player-display').innerText =
            `${data.mensagem} | Nível: ${nivel}`

        buscarPalavra()

    } catch (erro) {

        console.log(erro)

        alert('Erro ao conectar com servidor.')
    }
}

// BUSCAR PALAVRA
async function buscarPalavra() {

    try {

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

    } catch (erro) {

        console.log(erro)

        alert('Erro ao buscar palavra.')
    }
}

// TENTAR LETRA
async function tentarLetra(event) {

    if (event.key === 'Enter') {

        const input =
            document.getElementById('letter-input')

        const caractere =
            input.value.toLowerCase().trim()

        input.value = ''

        input.focus()

        if (!caractere) {

            alert('Digite uma letra!')

            return
        }

        try {

            const response =
                await fetch(`${URL_API}/tentativa`, {

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

            // letras
            data.posicoes.forEach(pos => {

                const slot =
                    document.getElementById(`slot-${pos}`)

                if (slot) {
                    slot.innerText =
                        caractere.toUpperCase()
                }
            })

            // sons
            if (data.posicoes.length > 0) {
                tocarSom('acerto')
            } else {
                tocarSom('erro')
            }

            // infos
            errorCount.innerText =
                data.erros_atuais

            gameMessage.innerText =
                data.mensagem

            // fim
            if (data.status_jogo !== 'jogando') {

                resetBtn.classList.remove('hidden')

                // derrota
                if (data.status_jogo === 'derrota') {

                    gameMessage.style.color = '#ffb3b3'

                    body.classList.remove('win-bg')
                    body.classList.add('lose-bg')

                } else {

                    gameMessage.style.color = '#d4ffd4'

                    body.classList.remove('lose-bg')
                    body.classList.add('win-bg')
                }

                // mostra palavra
                if (data.palavra) {

                    const palavra =
                        data.palavra.toUpperCase()

                    for (let i = 0; i < palavra.length; i++) {

                        const slot =
                            document.getElementById(`slot-${i}`)

                        if (slot) {
                            slot.innerText = palavra[i]
                        }
                    }
                }
            }

        } catch (erro) {

            console.log(erro)

            alert('Erro ao enviar tentativa.')
        }
    }
}

// REINICIAR
function reiniciarJogo() {
    location.reload()
}
import getAPIKey from './apikey';

const apiKey = getAPIKey();

document.addEventListener('DOMContentLoaded', () => {
  const searchBox = document.getElementById('searchBox')
  const contentDiv = document.getElementById('content')
  const showAwaitingButton = document.getElementById('showAwaiting')
  const showAvailableButton = document.getElementById('showAvailable')
  const showArchivedButton = document.getElementById('showArchived')

  

  function saveToLocalStorage(data) {
    localStorage.setItem('namesData', JSON.stringify(data))
  }

  function updateFilterCounts(data) {
    const availableCount = data.filter(
      (person) => person.status === 'available',
    ).length
    const awaitingCount = data.filter((person) => person.status === 'awaiting')
      .length
    const archivedCount = data.filter((person) => person.status === 'archived')
      .length

    showAvailableButton.textContent = `Disponíveis (${availableCount})`
    showAwaitingButton.textContent = `Em Aguardo (${awaitingCount})`
    showArchivedButton.textContent = `Arquivados (${archivedCount})`
  }

  function updateList(filteredNames) {
    const ul = document.getElementById('namesList')
    ul.innerHTML = ''

    filteredNames.forEach((person) => {
      const li = document.createElement('li')

      const nameContainer = document.createElement('div')
      nameContainer.classList.add('name-container')

      const nameText = document.createElement('span')
      nameText.textContent = person.name
      nameContainer.appendChild(nameText)

      const addedTimeParts = person.tempo.split(/[\s/:]+/)
      const addedTime = new Date(
        addedTimeParts[2], // Ano
        addedTimeParts[1] - 1, // Mês (subtrai 1 pois os meses em JavaScript são baseados em zero)
        addedTimeParts[0], // Dia
        addedTimeParts[3], // Horas
        addedTimeParts[4], // Minutos
        addedTimeParts[5], // Segundos,
      )
      const currentTime = new Date()
      const timeDiff = Math.abs(currentTime - addedTime)
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))
      const daysDiff = Math.floor(hoursDiff / 24)
      const minutesDiff = Math.floor(timeDiff / (1000 * 60))

      let timeAgoText = ''
      if (daysDiff > 0) {
        timeAgoText = `${daysDiff}d`
      } else if (hoursDiff > 0) {
        timeAgoText = `${hoursDiff}h`
      } else if (minutesDiff > 0) {
        timeAgoText = `${minutesDiff}m`
      } else {
        timeAgoText = '<1m'
      }

      const timeAgoContainer = document.createElement('div')
      timeAgoContainer.classList.add('time-ago-container')

      const timeAgoTextElement = document.createElement('span')
      timeAgoTextElement.textContent = 'Adicionado há '
      timeAgoTextElement.classList.add('time-ago')
      timeAgoContainer.appendChild(timeAgoTextElement)

      const timeAgoElement = document.createElement('span')
      timeAgoElement.textContent = timeAgoText
      timeAgoElement.classList.add('time-ago')
      timeAgoContainer.appendChild(timeAgoElement)

      nameContainer.appendChild(timeAgoContainer)
      li.appendChild(nameContainer)

      const iconContainer = document.createElement('div')
      iconContainer.classList.add('icon-container')

      const icon = document.createElement('i')
      switch (person.status) {
        case 'available':
          icon.classList.add('fas', 'fa-thumbs-up', 'icon')
          icon.style.color = 'green'
          break
        case 'awaiting':
          icon.classList.add('fas', 'fa-calendar', 'icon')
          icon.style.color = 'orange'
          break
        case 'archived':
          icon.classList.add('fas', 'fa-archive', 'icon')
          icon.style.color = 'red'
          break
      }

      iconContainer.addEventListener('click', (event) => {
        event.stopPropagation()
        switch (person.status) {
          case 'available':
            icon.classList.remove('fa-thumbs-up')
            icon.classList.add('fa-calendar')
            icon.style.color = 'orange'
            person.status = 'awaiting'
            break
          case 'awaiting':
            icon.classList.remove('fa-calendar')
            icon.classList.add('fa-archive')
            icon.style.color = 'red'
            person.status = 'archived'
            break
          case 'archived':
            icon.classList.remove('fa-archive')
            icon.classList.add('fa-thumbs-up')
            icon.style.color = 'green'
            person.status = 'available'
            break
        }
        saveToLocalStorage(namesData)
        updateFilterCounts(namesData)
      })

      iconContainer.appendChild(icon)
      li.appendChild(iconContainer)

      li.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'fillForm',
            data: person,
          })
        })
      })

      ul.appendChild(li)
    })
    saveToLocalStorage(namesData)
  }

  fetch(apiKey)
    .then((response) => response.json())
    .then((data) => {
      const fetchedData = data.values.map((row) => {
        let isPrincipalDriver

        if (row[9] === 'Sim') {
          isPrincipalDriver = true
        } else if (row[9] === 'Não') {
          isPrincipalDriver = false
        }

        return {
          isPrincipalDriver: isPrincipalDriver,
          tempo: row[0], // Coluna A: Carimbo de data/hora
          cpf: row[1], // Coluna B: CPF
          estadoCivil: row[2], // Coluna C ou Z: Estado Civil
          telefone: row[3], // Coluna D ou AA: Telefone
          email: row[4], // Coluna E ou AB: Email
          autorizacao: row[5], // Coluna F ou AC: Autorização de envio de informações por SMS
          name: row[6], // Coluna G ou AH: Nome
          dataNascimento: row[7], // Coluna H ou AI: Data de Nascimento
          sexo: row[8],
          resideEm: row[10], // Coluna K: Reside em
          tipoSeguranca: row[11], // Coluna L: Tipo de Segurança
          usoVeiculo: row[12], // Coluna M: Uso do Veículo
          kmTrabalho: row[13], // Coluna N: KM até trabalho ida
          garagem: row[14], // Coluna O: Garagem
          resideComJovens: row[15], // Coluna P: Reside com pessoas entre 18 e 25 anos?
          placa: row[16], // Coluna Q: Placa
          idadeResidente1: row[17], // Coluna R: Idade do Residente 1
          sexoResidente1: row[18], // Coluna S: Sexo do Residente 1
          idadeResidente2: row[19], // Coluna T: Idade do Residente 2
          sexoResidente2: row[20], // Coluna U: Sexo do Residente 2
          numHabilitacao: isPrincipalDriver ? row[23] : row[34], // Coluna V ou AF: Nº da Habilitação
          dataHabilitacao: isPrincipalDriver ? row[24] : row[35], // Coluna W ou AG: Data da Primeira Habilitação
          nomeMotorista: isPrincipalDriver ? row[6] : row[37], // Coluna G ou AK: Nome do Motorista
          cpfMotorista: isPrincipalDriver ? row[1] : row[38], // Coluna B ou AL: CPF do Motorista
          dataNascimentoMotorista: isPrincipalDriver ? row[7] : row[39], // Coluna H ou AM: Data de Nascimento do Motorista
          sexoMotorista: isPrincipalDriver ? row[8] : row[40], // Coluna I ou AN: Sexo do Motorista
          cepPernoite: row[41], // Coluna AO: CEP de Pernoite
          status: 'available', // Status padrão
        }
      })

      let namesData = fetchedData

      const savedData = localStorage.getItem('namesData')
      if (savedData) {
        const parsedSavedData = JSON.parse(savedData)
        namesData = namesData.map((person) => {
          const savedPerson = parsedSavedData.find((p) => p.cpf === person.cpf)
          return savedPerson
            ? { ...person, status: savedPerson.status }
            : person
        })
      }

      updateFilterCounts(namesData)

      namesData.sort((a, b) => {
        const timeA = new Date(
          a.tempo.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'),
        )
        const timeB = new Date(
          b.tempo.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'),
        )
        return timeB - timeA
      })

      const ul = document.createElement('ul')
      ul.id = 'namesList'

      namesData.forEach((person) => {
        console.log(person)

        function createDownloadIcon(person) {
          const downloadIcon = document.createElement('i')
          downloadIcon.classList.add('fas', 'fa-download', 'icon')
          downloadIcon.style.color = 'rgb(0, 123, 255)' // Definir cor do ícone de download

          downloadIcon.addEventListener('click', (event) => {
            event.stopPropagation() // Evitar que o evento de clique do li seja disparado
            const formattedData = formatData(person)
            const firstName = person.name.split(' ')[0]
            const filename = `${firstName}_dados_seguro.txt`
            downloadTextFile(formattedData, filename)
          })

          return downloadIcon
        }

        function formatData(data) {
          return `
É o motorista principal? = ${data.isPrincipalDriver ? 'Sim' : 'Não'}
Data do envio = ${data.tempo}
CPF = ${data.cpf}
Estado Civil = ${data.estadoCivil}
Telefone = ${data.telefone}
Email = ${data.email}
Autorização envio SMS = ${data.autorizacao}
Nome = ${data.name}
Data de Nascimento = ${data.dataNascimento}
Sexo = ${data.sexo}
Reside Em = ${data.resideEm}
Tipo de Segurança = ${data.tipoSeguranca}
Uso do Veículo = ${data.usoVeiculo}
Quilômetros até o Trabalho = ${data.kmTrabalho}
Garagem = ${data.garagem}
Reside com Jovens = ${data.resideComJovens}
Placa = ${data.placa}
Número da Habilitação = ${data.numHabilitacao}
Data da Habilitação = ${data.dataHabilitacao}
Nome do Motorista = ${data.nomeMotorista}
CPF do Motorista = ${data.cpfMotorista}
Data de Nascimento do Motorista = ${data.dataNascimentoMotorista}
Sexo do Motorista = ${data.sexoMotorista}
CEP do Pernoite = ${data.cepPernoite}
Status = ${data.status}
          `
        }

        const li = document.createElement('li')

        // Adiciona o contêiner do nome e da data
        const nameContainer = document.createElement('div')
        nameContainer.classList.add('name-container')

        // Adiciona o nome da pessoa
        const nameText = document.createElement('span')
        nameText.textContent = person.name
        nameContainer.appendChild(nameText)

        // Calcula o tempo decorrido desde o envio do formulário
        const addedTimeParts = person.tempo.split(/[\s/:]+/)
        const addedTime = new Date(
          addedTimeParts[2], // Ano
          addedTimeParts[1] - 1, // Mês (subtrai 1 pois os meses em JavaScript são baseados em zero)
          addedTimeParts[0], // Dia
          addedTimeParts[3], // Horas
          addedTimeParts[4], // Minutos
          addedTimeParts[5], // Segundos
        )
        const currentTime = new Date()
        const timeDiff = Math.abs(currentTime - addedTime)
        const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))
        const daysDiff = Math.floor(hoursDiff / 24)
        const minutesDiff = Math.floor(timeDiff / (1000 * 60))

        let timeAgoText = ''
        if (daysDiff > 0) {
          timeAgoText = `${daysDiff}d`
        } else if (hoursDiff > 0) {
          timeAgoText = `${hoursDiff}h`
        } else if (minutesDiff > 0) {
          timeAgoText = `${minutesDiff}m`
        } else {
          timeAgoText = '<1m'
        }

        const timeAgoContainer = document.createElement('div')
        timeAgoContainer.classList.add('time-ago-container')

        const timeAgoTextElement = document.createElement('span')
        timeAgoTextElement.textContent = 'Adicionado há '
        timeAgoTextElement.classList.add('time-ago')
        timeAgoContainer.appendChild(timeAgoTextElement)

        const timeAgoElement = document.createElement('span')
        timeAgoElement.textContent = timeAgoText
        timeAgoElement.classList.add('time-ago')
        timeAgoContainer.appendChild(timeAgoElement)

        nameContainer.appendChild(timeAgoContainer)
        li.appendChild(nameContainer)

        const iconContainer = document.createElement('div')
        iconContainer.classList.add('icon-container')

        const icon = document.createElement('i')
        icon.classList.add('icon-status')
        switch (person.status) {
          case 'available':
            icon.classList.add('fas', 'fa-thumbs-up', 'icon')
            icon.style.color = 'green'
            break
          case 'awaiting':
            icon.classList.add('fas', 'fa-calendar', 'icon')
            icon.style.color = 'orange'
            break
          case 'archived':
            icon.classList.add('fas', 'fa-archive', 'icon')
            icon.style.color = 'red'
            break
        }

        icon.addEventListener('click', (event) => {
          event.stopPropagation()
          switch (person.status) {
            case 'available':
              icon.classList.remove('fa-thumbs-up')
              icon.classList.add('fa-calendar')
              icon.style.color = 'orange'
              person.status = 'awaiting'
              break
            case 'awaiting':
              icon.classList.remove('fa-calendar')
              icon.classList.add('fa-archive')
              icon.style.color = 'red'
              person.status = 'archived'
              break
            case 'archived':
              icon.classList.remove('fa-archive')
              icon.classList.add('fa-thumbs-up')
              icon.style.color = 'green'
              person.status = 'available'
              break
          }
          saveToLocalStorage(namesData)
          updateFilterCounts(namesData)
        })

        // Ícone de download
        const downloadIcon = createDownloadIcon(person)

        iconContainer.appendChild(icon)
        iconContainer.appendChild(downloadIcon)

        function downloadTextFile(text, filename) {
          const blob = new Blob([text], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          a.click()
          URL.revokeObjectURL(url)
        }

        li.appendChild(iconContainer)

        li.addEventListener('click', () => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'fillForm',
              data: person,
            })
          })
        })

        ul.appendChild(li)
      })

      contentDiv.appendChild(ul)

      searchBox.addEventListener('input', () => {
        const filter = searchBox.value.toLowerCase()
        const filteredNames = namesData.filter((person) =>
          person.name.toLowerCase().includes(filter),
        )
        updateList(filteredNames)
      })

      showAwaitingButton.addEventListener('click', () => {
        const availableNames = namesData.filter(
          (person) => person.status === 'awaiting',
        )
        updateList(availableNames)
      })

      showAvailableButton.addEventListener('click', () => {
        const availableNames = namesData.filter(
          (person) => person.status === 'available',
        )
        updateList(availableNames)
      })

      showArchivedButton.addEventListener('click', () => {
        const archivedNames = namesData.filter(
          (person) => person.status === 'archived',
        )
        updateList(archivedNames)
      })
    })
    .catch((error) => {
      console.error('Erro ao buscar os dados:', error)
      contentDiv.textContent = 'Erro ao carregar os dados.'
    })
})

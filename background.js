import getAPIKey from './apikey';

const apiKey = getAPIKey();

let lastClientCount = 0

async function checkForNewClients() {
  try {
    const response = await fetch(
      apiKey,
    )
    const data = await response.json()
    const currentClientCount = data.values.length - 1 // subtrai 1 para ignorar o cabeçalho
    console.log(`Número atual de clientes: ${currentClientCount}`)

    if (currentClientCount > lastClientCount) {
      const newClients = currentClientCount - lastClientCount
      lastClientCount = currentClientCount

      console.log(`Criando notificação para ${newClients} novo(s) cliente(s).`)
      chrome.notifications.create(
        {
          type: 'basic',
          iconUrl: 'icon-128.png',
          title: 'Novo Cliente!',
          message: `Você tem ${newClients} novo(s) cliente(s)!`,
        },
        (notificationId) => {
          if (chrome.runtime.lastError) {
            console.error(
              'Erro ao criar notificação:',
              chrome.runtime.lastError,
            )
          } else {
            console.log('Notificação criada com ID:', notificationId)
          }
        },
      )
    }
  } catch (error) {
    console.error('Erro ao buscar o JSON:', error)
  }
}

// Verificar a cada 1 minuto
chrome.alarms.create('checkClients', { periodInMinutes: 0.5 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkClients') {
    checkForNewClients()
  }
})

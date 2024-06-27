// Função para disparar eventos em um elemento
let listaValores = []

function dispararEventos(elemento, eventos) {
  eventos.forEach((evento) => {
    const evt = new Event(evento, { bubbles: true })
    elemento.dispatchEvent(evt)
  })
}

function selectCampo(documento, campoId, valor) {
  var selectElement = documento.getElementById(campoId)

  if (selectElement) {
    for (var i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].text === valor) {
        // Define a opção selecionada
        selectElement.selectedIndex = i
        // Dispara os eventos onchange e input, se necessário
        var event = new Event('change', { bubbles: true })
        selectElement.dispatchEvent(event)
        selectElement.style.backgroundColor = 'green'
        break
      }
    }
  } else {
    console.error(`Campo ${campoId} não encontrado`)
  }
}

function clickCampo(documento, campoId) {
  const campo = documento.getElementById(campoId)

  if (campo) {
    campo.click()
    campo.style.backgroundColor = 'green'
  } else {
    console.error(`Campo ${campoId} não encontrado`)
    listaValores.push(campoId)
  }
}

function marcarCheckboxPorTexto(iframeDocument, textoAlvo) {
  let idCheck
  switch (textoAlvo) {
    case 'Lazer':
      console.log('Texto alvo é Lazer / particular')
      idCheck = 'DIVPadrao2000_Cobertura80021'
      break
    case 'Trabalho/Comercial':
      console.log('Texto alvo é Atividade comercial')
      idCheck = 'DIVPadrao2000_Cobertura80022'
      break
    case 'Faculdade':
      console.log(
        'Texto alvo é Ida e volta ao colégio / faculdade / pós graduação',
      )
      idCheck = 'DIVPadrao2000_Cobertura80023'
      break
    case 'Ida e Volta/Trabalho':
      console.log('Texto alvo é Ida e volta ao trabalho')
      idCheck = 'DIVPadrao2000_Cobertura80024' + ' > span'
      break
    default:
      console.log('Texto alvo não corresponde a nenhum caso especificado')
  }
  if (idCheck) {
    console.log('Tentando ID CHECK')
    console.log(idCheck)
    const checkDiv = iframeDocument.querySelector(idCheck)
    if (checkDiv) {
      checkDiv.click()
    } else {
      console.log('Nenhuma check encontrada.')
    }
  } else {
    console.error('Grupo de checkboxes não encontrado.')
  }
}

// Função para preencher um campo de formulário
function preencherCampo(documento, campoId, valor) {
  const campo = documento.getElementById(campoId)

  if (campo) {
    campo.click()
    campo.value = valor
    campo.focus()
    dispararEventos(campo, ['keydown', 'keypress', 'keyup'])
    campo.dispatchEvent(new Event('input', { bubbles: true }))
    campo.dispatchEvent(new Event('change', { bubbles: true }))
    campo.style.backgroundColor = 'green'
  } else {
    console.error(`Campo ${campoId} não encontrado`)
  }
}

// Event listener para receber mensagens do popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillForm') {
    console.log('Dados recebidos:', message.data)
    // Encontrar todos os iframes na página
    const iframes = document.querySelectorAll('iframe')
    // Iterar sobre os iframes
    iframes.forEach((iframe) => {
      // Acessar o conteúdo do iframe
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document
      // Verificar se o conteúdo do iframe está acessível

      if (iframeDocument) {
        console.log('ID do iframe:', iframe.id)
        ddd = message.data.telefone.slice(0, 2)
        telefone = message.data.telefone.slice(2)

        // Parte 1 - SEGURO
        try {
          clickCampo(iframeDocument, 'Padrao2000_Cobertura21') // Tipo de Seguro -> Seguro Novo
        } catch (erro) {}

        // Parte 2 - Informações do Segurado // Condutor, CPF, Nome, Nome Social, Sexo, Estado Civil, Data de Nascimento
        try {
          if (message.data.isPrincipalDriver === true) {
            clickCampo(iframeDocument, 'Padrao2000_Cobertura199909')
          }
          preencherCampo(iframeDocument, 'Padrao2000_Cgc_cpf', message.data.cpf)
          preencherCampo(iframeDocument, 'Padrao2000_Nome', message.data.name)
          preencherCampo(
            iframeDocument,
            'Padrao2000_NomeSocial',
            message.data.name,
          )
          // Sexo
          if (message.data.sexo.toLowerCase() === 'masculino') {
            clickCampo(iframeDocument, 'Padrao2000_SexoM')
          } else if (message.data.sexo.toLowerCase() === 'feminino') {
            clickCampo(iframeDocument, 'Padrao2000_SexoF')
          } else {
            console.error('Valor inválido para sexo:', message.data.sexo)
          }
          preencherCampo(
            iframeDocument,
            'Padrao2000_Datanascimento',
            message.data.dataNascimento,
          )
          selectCampo(
            iframeDocument,
            'Padrao2000_Estado_civil',
            message.data.estadoCivil,
          )
          preencherCampo(iframeDocument, 'Padrao2000_Ddd_cel', ddd)
          preencherCampo(iframeDocument, 'Padrao2000_Telefone_cel', telefone)
          preencherCampo(
            iframeDocument,
            'Padrao2000_E_mail',
            message.data.email,
          )
          // if (message.data.autorizacao === 'Sim') {
          //   clickCampo(iframeDocument, 'Padrao2000_Cobertura8249')
          // } // Camilla pediu para nunca autorizar.
        } catch (erro) {}

        // Parte 3 - Veículo //NÃO CONSEGUI, INSERIR PLACA MANUALMENTE
        // const selectModel = iframeDocument.querySelector(
        //   '[data-select2-id="16"]',
        // )
        // if (selectModel) {
        //   console.log(selectModel)
        //   selectModel.click()
        //   const inputElements = iframeDocument.querySelector(
        //     'select2-search__field',
        //   )
        //   if (inputElements) {
        //     console.log(inputElements)
        //     inputElements.value = message.data.placa
        //     console.log('FOI')
        //   } else {
        //     console.log('Mas dá tudo errado nessa porra?')
        //   }
        // } else {
        //   console.log('shiet')
        // }
        preencherCampo(iframeDocument, 'Padrao2000_Placa', message.data.placa)

        if (message.data.resideComJovens === 'Sim') {
          clickCampo(iframeDocument, 'Padrao2000_Cobertura80090')
        }
        selectCampo(
          iframeDocument,
          'Padrao2000_Cobertura16',
          message.data.resideEm,
        )
        marcarCheckboxPorTexto(iframeDocument, message.data.usoVeiculo)
        preencherCampo(
          iframeDocument,
          'Padrao2000_Cobertura1851',
          message.data.cepPernoite,
        )
        preencherCampo(
          iframeDocument,
          'Padrao2000_Ceppernoite',
          message.data.cepPernoite,
        )
        preencherCampo(
          iframeDocument,
          'Padrao2000_Cep',
          message.data.cepPernoite,
        )

        // Parte 3 - Principal Condutor
        if (isPrincipalDriver === false) {
          selectCampo(
            iframeDocument,
            'Padrao2000_Condutor01_Propriosegurado',
            'Pai',
          )
          preencherCampo(
            iframeDocument,
            'Padrao2000_Condutor01_Cpf',
            message.data.cpfMotorista,
          )
          preencherCampo(
            iframeDocument,
            'Padrao2000_Condutor01_Nome',
            message.data.nomeMotorista,
          )
          preencherCampo(
            iframeDocument,
            'Padrao2000_Condutor01_NomeSocial',
            message.data.nomeMotorista,
          )
        } else {
          console.error(
            'Não foi possível acessar o conteúdo do iframe:',
            iframe,
          )
        }
      }
      // let mensagem = ''

      // // Itera sobre a lista em pares
      // for (let i = 0; i < listaValores.length; i += 2) {
      //   mensagem += `${listaValores[i]} = ${listaValores[i + 1]}\n`
      // }

      // // Exibe a mensagem em um alert
      // alert(mensagem)
    })
  }
})

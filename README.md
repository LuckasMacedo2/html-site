# Uma pergunta especial

Pequena experiência romântica em HTML, CSS e JavaScript puro. Não requer instalação, build ou dependências. As ilustrações são SVGs locais em `assets/`.

## Executar

Abra `index.html` em um navegador moderno. Para servir localmente, use qualquer servidor estático, por exemplo `python -m http.server 8000` no diretório do projeto e acesse `http://localhost:8000`.

## Fluxo e envio

Cada clique em “Sim” ou “Não” na pergunta inicial ou nas confirmações envia o texto exibido e a opção selecionada ao endpoint. A navegação continua mesmo se o envio falhar, sem exibir aviso de falha. No caminho “Sim”, o formulário aparece após a celebração. Os dados do formulário só são enviados depois da validação; se o envio falhar, os dados permanecem preenchidos e o botão pode ser usado novamente, sem exibir aviso.

Em `script.js`, configure `SUBMISSION_ENDPOINT` com o endereço real do webhook ou do seu endpoint. Para um webhook Discord direto, `enviarFormulario(dados)` transforma os dados em uma mensagem JSON com `embeds` e `allowed_mentions`, e usa `wait=true` para confirmar o envio. Para um backend intermediário, adapte a função ou o formato conforme o contrato dessa rota.

Há duas opções de integração:

1. **Webhook direto, apenas para testes ou quando a URL puder ser pública:** use a URL real do webhook em `SUBMISSION_ENDPOINT`. A URL ficará visível para qualquer pessoa que inspecionar o JavaScript e poderá ser abusada. Nunca trate essa URL como segredo no navegador; se ela já foi publicada ou compartilhada, revogue-a e gere outra no Discord.
2. **Recomendado para publicação:** configure `SUBMISSION_ENDPOINT` para uma rota serverless/backend sua. Essa rota valida os dados e encaminha a mensagem ao Discord usando a URL guardada em variável de ambiente no servidor. Não inclua essa URL no repositório nem no JavaScript público.

A mensagem do Discord pode ser criada no backend como embed com título, campos (local, data, anel escolhido, quantidade de filhos) e cor discreta. O anel é uma seleção única por radio button. Nenhum webhook fictício vem pré-configurado.

## Publicação

Publique os arquivos `index.html`, `styles.css`, `script.js` e a pasta `assets/` em qualquer hospedagem estática. Para usar o formulário em produção, publique também o endpoint intermediário e configure o endereço correspondente no script. Como não há build, não é preciso compilar o projeto.

## Verificação manual

- Teste Sim → celebração → formulário e confira campos obrigatórios, data passada, seleção de anéis e mínimo de quatro filhos.
- Sem configurar endpoint, tente concluir: a mensagem de configuração aparece e os valores permanecem no formulário.
- Para testar o sucesso, configure um endpoint de teste que aceite POST JSON e responda 2xx; para testar falhas, faça-o responder com erro ou interrompa a conexão.
- Teste Sim e Não → cada clique envia sua opção; as três confirmações avançam uma após a outra e a última resposta chega ao encerramento dramático.
- Confira o layout em celular, desktop, teclado e com redução de movimento ativada.

(() => {
  'use strict';
  const screen = document.querySelector('#screen');
  const today = new Date();
  const dateMin = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  // Configure with a real same-origin/serverless endpoint, or explicitly opt into a public test webhook.
  // Leave empty until configured; no network request is made in that state.
  const SUBMISSION_ENDPOINT = 'https://discord.com/api/webhooks/1558823014592806974/6DZBVe_KGCeyrYeMEsvnhfHQfixjPZpHDi3EcC39flp-1gkhYhovluybkaYHKp1M42Ff';
  let submitting = false;
  let confirmationStep = 0;
  const cat = (sad = false, small = false, tender = false) => `<img class="art${small?' small':''}" src="assets/cat${tender?'-tender':sad?'-sad':''}.svg" alt="${tender?'Gatinho com olhos marejados desejando melhoras':sad?'Gatinho triste':'Gatinho fofo com flores e anel'}">`;

  function show(markup, focusSelector) {
    screen.innerHTML = markup;
    if (focusSelector) screen.querySelector(focusSelector)?.focus({preventScroll:true});
  }
  function start() { submitting = false; show(`<div class="intro">${cat(false)}<h1>Quer casar<br>comigo?</h1><p class="lead">Tenho uma perguntinha importante pra você…</p><div class="actions"><button class="btn primary" data-action="yes">Sim 💍</button><button class="btn secondary" data-action="no">Não 😿</button></div></div>`, '[data-action="yes"]'); }
  function celebration() {
    show(`<div>${cat(false)}<h2>Eu sabia! 💍</h2><p class="lead">Vamos organizar o casório 🧐</p><p class="lead">Aguarde o carregamento das opções... 🧐</p><div class="heart-line" aria-hidden="true">✦ ♡ ✦</div></div>`);
    screen.querySelector('.art')?.classList.add('celebrate');
    window.setTimeout(form, 2300);
  }
  function form() {
    if (submitting) return;
    show(`<form class="form-card" novalidate>
      <header>${cat(false,true)}<h2>Obrigado 😊</h2><p class="lead">Agora precisamos organizar os detalhes desse grande dia.</p></header>
      <div class="field"><label for="place">Onde será a cerimônia?</label><input id="place" name="place" type="text" maxlength="160" placeholder="Escolha o lugar dos nossos sonhos..." required autocomplete="off"><p class="error" data-error="place"></p></div>
      <div class="field"><label for="date">Quando será a cerimônia?</label><input id="date" name="date" type="date" min="${dateMin}" required><p class="error" data-error="date"></p></div>
      <fieldset class="field" style="border:0;padding:0"><legend class="group-label">Que tipo de anel você prefere?</legend><div class="choices"><label class="choice"><input type="radio" name="ring" value="Esmeralda" required><span>💚 Esmeralda</span></label><label class="choice"><input type="radio" name="ring" value="Rubi" required><span>❤️ Rubi</span></label><label class="choice"><input type="radio" name="ring" value="Diamante" required><span>💎 Diamante</span></label></div><p class="error" data-error="ring"></p></fieldset>
      <div class="field"><label for="children">Quantos filhos?</label><input id="children" name="children" type="number" min="4" step="1" inputmode="numeric" required><p class="hint">No mínimo 4 🤭</p><p class="error" data-error="children"></p></div>
      <p class="form-error" data-form-error hidden></p><button class="btn primary submit" type="submit">Concluir 💍</button>
    </form>`, '#place');
    screen.querySelector('form').addEventListener('submit', submitForm);
  }
  function confirm(step) {
    confirmationStep = step;
    const questions = ['Tem certeza? 🤨','Tem certeza absoluta? 🤨🤨','Tem certeza absoluta? Última chance 🤨🤨🤨'];
    show(`<div>${cat(true)}<h2>${questions[step]}</h2><p class="lead">${step===0?'Tudo bem, só quero confirmar…':'Ainda dá para escolher de novo.'}</p><div class="actions"><button class="btn primary" data-action="confirm">Sim</button><button class="btn secondary" data-action="return">Não</button></div></div>`, '[data-action="confirm"]');
  }
  function sadEnd() { show(`<div>${cat(true)}<h2>Tudo bem 💔💔💔</h2><p class="lead">Vou ficar aqui, dramaticamente bem… 🥲</p></div>`); }
  function errorFor(name, message) { const target=screen.querySelector(`[data-error="${name}"]`); if(target) target.textContent=message; }
  function validate(formEl) {
    const place=formEl.elements.place, date=formEl.elements.date, kids=formEl.elements.children;
    let valid=true;
    if(!place.value.trim()){errorFor('place','Conte pra gente onde será a cerimônia 🥹');valid=false;}
    if(!date.value){errorFor('date','Escolha uma data para a cerimônia 🥹');valid=false;} else if(date.value<dateMin){errorFor('date','A data precisa ser hoje ou no futuro 🥹');valid=false;}
    if(!formEl.querySelector('input[name="ring"]:checked')){errorFor('ring','Escolha um tipo de anel 🥹');valid=false;}
    if(!kids.value){errorFor('children','Informe quantos filhos você quer 🥹');valid=false;}
    else if(!Number.isInteger(Number(kids.value)) || Number(kids.value)<4){errorFor('children',`Só ${kids.value}? Não seriam no mínimo 4? 🥹`);valid=false;}
    return valid;
  }
  async function enviarFormulario(dados) {
    if(!SUBMISSION_ENDPOINT) throw new Error('not-configured');
    const webhookUrl=new URL(SUBMISSION_ENDPOINT);
    webhookUrl.searchParams.set('wait','true');
    const payload={
      allowed_mentions:{parse:[]},
      embeds:[{
        title:'💍 Detalhes da cerimônia',
        color:0xA85261,
        fields:[
          {name:'Local',value:dados.local},
          {name:'Data',value:dados.data},
          {name:'Anel escolhido',value:dados.anel},
          {name:'Quantidade de filhos',value:String(dados.quantidadeDeFilhos)}
        ]
      }]
    };
    const response=await fetch(webhookUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(!response.ok) {
      // Do not surface the response body: it can contain endpoint details.
      throw new Error(`discord-${response.status}`);
    }
  }
  async function enviarResposta(textoDaTela, opcao) {
    if(!SUBMISSION_ENDPOINT) throw new Error('not-configured');
    const webhookUrl=new URL(SUBMISSION_ENDPOINT);
    webhookUrl.searchParams.set('wait','true');
    const payload={
      allowed_mentions:{parse:[]},
      embeds:[{
        title:`Resposta: ${opcao}`,
        color:0xA85261,
        fields:[
          {name:'Texto da tela',value:textoDaTela.slice(0,1024)},
          {name:'Opção selecionada',value:opcao}
        ]
      }]
    };
    const response=await fetch(webhookUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(!response.ok) throw new Error(`discord-${response.status}`);
  }
  function textoDaTela() {
    return [...screen.querySelectorAll('h1,h2,.lead')].map(node=>node.textContent.trim()).filter(Boolean).join('\n');
  }
  function registrarResposta(opcao, texto) {
    // A entrega é independente da navegação; falhas ficam silenciosas.
    enviarResposta(texto, opcao).catch(() => {});
  }
  function handleNo() {
    const texto=textoDaTela();
    const isConfirmation=screen.querySelector('[data-action="return"]') !== null;

    // Avança em todo clique, mesmo se a rede estiver lenta ou indisponível.
    // Cada clique continua iniciando seu próprio envio.
    if(!isConfirmation) confirm(0);
    else if(confirmationStep < 2) confirm(confirmationStep + 1);
    else sadEnd();

    registrarResposta('Não', texto);
  }
  function handleYes() {
    const texto=textoDaTela();
    const isConfirmation=screen.querySelector('[data-action="confirm"]') !== null;
    registrarResposta('Sim', texto);
    if(!isConfirmation) celebration();
    else {
      const next=confirmationStep+1;
      if(next>=3) sadEnd();
      else confirm(next);
    }
  }
  async function submitForm(event) {
    event.preventDefault();
    const formEl=event.currentTarget;
    if(submitting) return;
    formEl.querySelectorAll('.error').forEach(node=>node.textContent='');
    const formError=formEl.querySelector('[data-form-error]');formError.hidden=true;
    if(!validate(formEl)){formEl.querySelector('.error:not(:empty)')?.scrollIntoView({behavior:'smooth',block:'center'});return;}
    const dados={local:formEl.elements.place.value.trim(),data:formEl.elements.date.value,anel:formEl.querySelector('input[name="ring"]:checked').value,quantidadeDeFilhos:Number(formEl.elements.children.value)};
    submitting=true;const button=formEl.querySelector('[type="submit"]');button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Enviando…';
    try { await enviarFormulario(dados); show(`<div class="final-screen">${cat(false,false,true)}<h2>Obrigado 😊.<br>Está tudo pronto para a cerimônia</h2><p class="lead recovery-note">Um gatinho fofo trouxe flores e um anel, e está desejando que você melhore logo 🐱🌷💍<br>Descanse bastante e se cuide com carinho 💕</p><div class="heart-line" aria-hidden="true">✦ ♡ ✦</div></div>`);screen.querySelector('.art')?.classList.add('celebrate'); }
    catch { submitting=false;button.disabled=false;button.removeAttribute('aria-busy');button.textContent='Concluir 💍';formError.hidden=true;formError.textContent=''; }
  }
  screen.addEventListener('click', event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(action==='yes'||action==='confirm') handleYes();else if(action==='no'||action==='return') handleNo();});
  start();
})();

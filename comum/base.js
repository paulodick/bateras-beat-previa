/* Bateras Beat — comportamento comum às 3 landing pages.
 * Tudo que é dado de negócio fica em BB, no topo. O motor de rolagem
 * (sites-incriveis.js) é separado e não é editado. */

var BB = {
  // PENDENTE: número do WhatsApp central (bot), só dígitos com DDI. Ex.: "5511999999999".
  // Enquanto vazio, o botão leva para o Fale Conosco do site atual.
  whatsapp: "",
  semWhatsapp: "https://www.baterasbeat.com.br/quem-somos/contato/faleconosco",

  // TESTE — aguardando aprovação do dono. Deixe "" para tirar o bônus de todas as páginas.
  bonus: "1ª mensalidade por R$ 99,90"
};

(function () {
  "use strict";
  var doc = document;
  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- CTA → WhatsApp ---------- */
  doc.querySelectorAll("[data-cta]").forEach(function (a) {
    var msg = a.getAttribute("data-msg") || doc.body.getAttribute("data-msg") || "Olá! Quero agendar minha aula cortesia.";
    if (BB.whatsapp) {
      a.href = "https://wa.me/" + BB.whatsapp + "?text=" + encodeURIComponent(msg);
    } else {
      a.href = BB.semWhatsapp;
    }
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- bônus ---------- */
  doc.querySelectorAll("[data-bonus]").forEach(function (el) {
    if (BB.bonus) {
      el.textContent = BB.bonus;
      el.hidden = false;
      var caixa = el.closest("[data-bonus-caixa]");
      if (caixa) caixa.hidden = false;
    }
  });

  /* ---------- menu: encolhe, seção atual, menu do celular ---------- */
  var topo = doc.querySelector(".topo");
  function aoRolar() {
    if (topo) topo.classList.toggle("encolhido", window.scrollY > 40);
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  var links = Array.prototype.slice.call(doc.querySelectorAll("[data-nav] a[href^='#']"));
  var secoes = links.map(function (l) { return doc.querySelector(l.getAttribute("href")); }).filter(Boolean);
  function marcarAtual() {
    var linha = window.innerHeight * 0.4;
    var atual = -1;
    secoes.forEach(function (s, i) {
      if (s.getBoundingClientRect().top <= linha) atual = i;
    });
    links.forEach(function (l, i) {
      var alvo = l.getAttribute("href");
      var idx = secoes.findIndex(function (s) { return "#" + s.id === alvo; });
      if (idx === atual) l.setAttribute("aria-current", "true");
      else l.removeAttribute("aria-current");
      l.classList.toggle("passou", idx > -1 && idx < atual);
    });
    doc.documentElement.style.setProperty("--secao-atual", atual);
    doc.dispatchEvent(new CustomEvent("bb:secao", { detail: { indice: atual, total: secoes.length } }));
  }
  var agendado = false;
  window.addEventListener("scroll", function () {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () { agendado = false; marcarAtual(); });
  }, { passive: true });
  window.addEventListener("resize", marcarAtual);
  marcarAtual();

  var botaoMenu = doc.querySelector("[data-menu-botao]");
  var painel = doc.querySelector("[data-nav]");
  if (botaoMenu && painel) {
    botaoMenu.addEventListener("click", function () {
      var aberto = botaoMenu.getAttribute("aria-expanded") === "true";
      botaoMenu.setAttribute("aria-expanded", String(!aberto));
      painel.classList.toggle("aberto", !aberto);
    });
    painel.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        botaoMenu.setAttribute("aria-expanded", "false");
        painel.classList.remove("aberto");
      }
    });
  }

  /* ---------- barra de CTA fixa (celular) ---------- */
  var barra = doc.querySelector(".barra-cta");
  var abertura = doc.querySelector("[data-abertura]");
  var final = doc.querySelector("[data-final]");
  if (barra && abertura && "IntersectionObserver" in window) {
    var estado = { abertura: true, final: false };
    var atualizarBarra = function () {
      var mostrar = !estado.abertura && !estado.final;
      barra.classList.toggle("visivel", mostrar);
      barra.setAttribute("aria-hidden", String(!mostrar));
      barra.querySelectorAll("a").forEach(function (a) { a.tabIndex = mostrar ? 0 : -1; });
    };
    new IntersectionObserver(function (e) { estado.abertura = e[0].isIntersecting; atualizarBarra(); }).observe(abertura);
    if (final) new IntersectionObserver(function (e) { estado.final = e[0].isIntersecting; atualizarBarra(); }).observe(final);
    atualizarBarra();
  }

  /* ---------- YouTube leve: só carrega ao tocar ---------- */
  doc.querySelectorAll("[data-yt]").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = doc.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + b.dataset.yt + "?autoplay=1&rel=0";
      f.title = b.getAttribute("aria-label") || "Vídeo";
      f.allow = "autoplay; encrypted-media; picture-in-picture";
      f.allowFullscreen = true;
      f.className = "yt-frame";
      b.replaceWith(f);
    });
  });

  /* ---------- âncoras: rolagem suave (respeita movimento-reduzido) ---------- */
  doc.addEventListener("click", function (e) {
    var a = e.target.closest("a[href^='#']");
    if (!a) return;
    var alvo = doc.querySelector(a.getAttribute("href"));
    if (!alvo) return;
    e.preventDefault();
    alvo.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", a.getAttribute("href"));
  });
})();

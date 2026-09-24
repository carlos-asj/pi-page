const historico = ["login"];

function irPara(idTela, salvarHistorico = true) {
  const telaAtual = document.querySelector(".tela.ativa");
  if (telaAtual) {
    limparTela(telaAtual.id);
    if (telaAtual.id === "lerQr") {
      pararCamera(); // desliga a câmera ao sair dessa tela
    }
  }

  document
    .querySelectorAll(".tela")
    .forEach((t) => t.classList.remove("ativa"));
  document.getElementById(idTela).classList.add("ativa");

  document.getElementById("btnVoltar").style.display =
    idTela === "login" ? "none" : "block";

  if (idTela === "lerQr") {
    iniciarCamera(); // liga a câmera ao entrar nessa tela
  }

  if (salvarHistorico) {
    historico.push(idTela);
  }
}

function limparTela(idTela) {
  const tela = document.getElementById(idTela);
  if (!tela) return;

  tela.querySelectorAll("form").forEach((form) => form.reset());

  const erro = tela.querySelector("#erro");
  if (erro) erro.textContent = "";

  const qrBtn = tela.querySelector("#qrCodeBtn");
  if (qrBtn) qrBtn.classList.add("escondido");
}

function voltar() {
  if (historico.length > 1) {
    historico.pop();
    const telaAnterior = historico[historico.length - 1];
    irPara(telaAnterior, false);
  }
}

function login() {
  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erroEl = document.getElementById("erro");

  if (usuario === "admin" && senha === "1234") {
    erroEl.textContent = "";
    irPara("dados");
  } else {
    erroEl.textContent = "Usuário ou senha inválidos.";
  }
}

function dados() {
  const nome = document.getElementById("nome").value;
  document.getElementById("nomeUser").textContent = nome;
  irPara("rota");
}

function presY() {
  document.getElementById("qrCodeBtn").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    login();
  });

  document.getElementById("formData").addEventListener("submit", (e) => {
    e.preventDefault();
    dados();
  });
});

let streamAtivo = null;
let scanAnimationId = null;

function iniciarCamera() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const contexto = canvas.getContext("2d");
  const qrErro = document.getElementById("qrErro");

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } }) // câmera traseira
    .then((stream) => {
      streamAtivo = stream;
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // necessário no iOS
      video.play();
      scanAnimationId = requestAnimationFrame(() =>
        escanearFrame(video, canvas, contexto),
      );
    })
    .catch((err) => {
      qrErro.textContent =
        "Não foi possível acessar a câmera. Verifique as permissões.";
      console.error(err);
    });
}

function escanearFrame(video, canvas, contexto) {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    contexto.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imagemFrame = contexto.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const codigo = jsQR(
      imagemFrame.data,
      imagemFrame.width,
      imagemFrame.height,
    );

    if (codigo) {
      pararCamera();
      irPara("sucesso");
      return;
    }
  }
  scanAnimationId = requestAnimationFrame(() =>
    escanearFrame(video, canvas, contexto),
  );
}

function pararCamera() {
  if (streamAtivo) {
    streamAtivo.getTracks().forEach((track) => track.stop());
    streamAtivo = null;
  }
  if (scanAnimationId) {
    cancelAnimationFrame(scanAnimationId);
    scanAnimationId = null;
  }
}

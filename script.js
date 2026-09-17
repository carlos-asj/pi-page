document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const senha = document.getElementById("senha").value;
  const erroEl = document.getElementById("erro");

  if (usuario === "admin" && senha === "1234") {
    window.location.href = "mainPage.html";
  } else {
    erroEl.textContent = "Usuário ou senha inválidos.";
  }
});

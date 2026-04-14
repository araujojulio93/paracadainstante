// ================= FIREBASE =================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// ================= CONFIG =================

const firebaseConfig = {
  apiKey: "AIzaSyCs_8yfB6SI1dhn-yg6YbGeZVWn-Qeba_0",
  authDomain: "para-cada-instante.firebaseapp.com",
  projectId: "para-cada-instante",
  storageBucket: "para-cada-instante.firebasestorage.app",
  messagingSenderId: "1011959284933",
  appId: "1:1011959284933:web:92687246cf2c5f69161cac",
  measurementId: "G-Q8SD0Q9JGD"
};

// ================= INIT =================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// ================= LOGIN =================

const erroLogin = document.getElementById("erro-login");

async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  erroLogin.style.display = "none";

  try {
    await signInWithEmailAndPassword(auth, email, senha);
  } catch {
    erroLogin.style.display = "block";
  }
}

document.getElementById("btnLogin")?.addEventListener("click", login);

["email", "senha"].forEach(id => {
  document.getElementById(id)?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") login();
  });
});

// ================= AUTH =================

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("login-area").style.display = "none";
    document.getElementById("admin-area").style.display = "block";
    mostrarTela("home-admin");
  } else {
    document.getElementById("login-area").style.display = "flex";
    document.getElementById("admin-area").style.display = "none";
  }
});

// logout
document.getElementById("logout")?.addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth);
});

// ================= SPA =================

function mostrarTela(id) {
  const telas = ["home-admin", "novo-admin", "posts-admin"];

  telas.forEach(sec => {
    const el = document.getElementById(sec);
    if (!el) return;

    if (sec === id) {
      el.style.display = "block";
      setTimeout(() => el.classList.add("fade-in"), 10);
    } else {
      el.classList.remove("fade-in");
      setTimeout(() => el.style.display = "none", 200);
    }
  });
}

function setActive(linkId) {
  document.querySelectorAll(".side-nav a").forEach(a => {
    a.classList.remove("active");
  });

  document.getElementById(linkId)?.classList.add("active");
}

// NAV
document.getElementById("nav-home")?.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarTela("home-admin");
  setActive("nav-home");
});

document.getElementById("nav-novo")?.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarTela("novo-admin");
  setActive("nav-novo");
});

document.getElementById("nav-posts")?.addEventListener("click", (e) => {
  e.preventDefault();
  mostrarTela("posts-admin");
  setActive("nav-posts");
  listarPosts();
});

// ================= EDITOR =================

const inputTitulo = document.getElementById("titulo");
const inputConteudo = document.getElementById("conteudo");
const inputAutor = document.getElementById("autor");

const previewTitulo = document.getElementById("preview-titulo");
const previewConteudo = document.getElementById("preview-conteudo");

// 🔥 NOVO
const checkboxFoto = document.getElementById("tipoFoto");
const dropAreaContainer = document.getElementById("drop-area");

let editandoId = null;
let arquivo = null;
let imagemPreviewURL = null;

// limpeza
function limparHTML(html) {
  return html
    .replace(/<div>/g, "<p>")
    .replace(/<\/div>/g, "</p>");
}

// ================= PREVIEW =================

function atualizarPreview() {

  const isFoto = checkboxFoto.checked;

  previewTitulo.textContent = inputTitulo.value || "Título";

  // TEXTO
  if (!isFoto) {
    previewConteudo.innerHTML = limparHTML(inputConteudo.innerHTML);
    return;
  }

  // FOTO
  if (imagemPreviewURL) {
    previewConteudo.innerHTML = `
      <img src="${imagemPreviewURL}" style="max-width:100%; margin-bottom:10px;">
    `;
  } else {
    previewConteudo.innerHTML = `
      <p style="opacity:0.5;">Nenhuma imagem selecionada</p>
    `;
  }
}

inputTitulo?.addEventListener("input", atualizarPreview);
inputConteudo?.addEventListener("input", atualizarPreview);

// ================= FORMATAÇÃO =================

function aplicarFormatacao(tipo) {
  inputConteudo.focus();

  if (tipo === "bold") document.execCommand("bold");
  if (tipo === "italic") document.execCommand("italic");
  if (tipo === "title") document.execCommand("formatBlock", false, "h2");
  if (tipo === "left") document.execCommand("justifyLeft");
  if (tipo === "center") document.execCommand("justifyCenter");
  if (tipo === "right") document.execCommand("justifyRight");
}

document.querySelectorAll(".editor-toolbar button").forEach(btn => {

  btn.addEventListener("click", () => {

    const action = btn.dataset.action;

    inputConteudo.focus();

    switch (action) {
      case "bold":
        document.execCommand("bold");
        break;

      case "italic":
        document.execCommand("italic");
        break;

      case "strike":
        document.execCommand("strikeThrough");
        break;

      case "ul":
        document.execCommand("insertUnorderedList");
        break;

      case "quote":
        document.execCommand("formatBlock", false, "blockquote");
        break;

      case "left":
        document.execCommand("justifyLeft");
        break;

      case "center":
        document.execCommand("justifyCenter");
        break;

      case "right":
        document.execCommand("justifyRight");
        break;
    }

  });

});

// ================= ANIMAÇÃO TIPO =================

checkboxFoto.addEventListener("change", () => {

  const isFoto = checkboxFoto.checked;

  // 🔥 MOSTRA/ESCONDE AREA DE IMAGEM
  dropAreaContainer.style.display = isFoto ? "block" : "none";

  // 🔥 ATIVA/DESATIVA TEXTO
  inputConteudo.contentEditable = !isFoto;
  inputConteudo.style.opacity = isFoto ? "0.5" : "1";

  if (!isFoto) {
    // 🔥 RESET TOTAL
    imagemPreviewURL = null;
    arquivo = null;

    // 🔥 LIMPA VISUAL DO PREVIEW
    previewConteudo.innerHTML = limparHTML(inputConteudo.innerHTML) || "";

    // 🔥 GARANTE QUE O EDITOR CONTINUE VISÍVEL
    inputConteudo.style.display = "block";
    // inputConteudo.focus();
  }

  atualizarPreview();
});

// ================= UPLOAD =================

// let arquivo = null;

const inputFile = document.getElementById("imagem");
const preview = document.getElementById("preview");
const dropArea = document.getElementById("drop-area");

function handleFile(file) {
  if (!file) return;

  arquivo = file; // 🔥 GUARDA O ARQUIVO

  const reader = new FileReader();
  reader.onload = () => {
    imagemPreviewURL = reader.result;
    atualizarPreview();
  };

  reader.readAsDataURL(file);
}

inputFile?.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

dropArea?.addEventListener("click", () => {
  inputFile.click();
});

dropArea?.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("drag-over");
});

dropArea?.addEventListener("dragleave", () => {
  dropArea.classList.remove("drag-over");
});

dropArea?.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("drag-over");

  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// ================= SALVAR =================

async function salvar(modo = "agora") {

  const titulo = inputTitulo.value;
  const conteudo = limparHTML(inputConteudo.innerHTML);
  const autor = "Prado, Ronaldo";

  const inputData = document.getElementById("dataPublicacao");

  const tipo = checkboxFoto?.checked ? "foto" : "texto";

  let publicado = false;
  let dataPublicacao = null;

  if (modo === "agora") {
    publicado = true;
    dataPublicacao = new Date();
  } else {
    if (!inputData.value) {
      alert("Escolha uma data para agendar");
      return;
    }

    publicado = false;
    dataPublicacao = new Date(inputData.value);
  }

  let imageUrl = "";

  try {

    if (tipo === "foto" && arquivo) {
      const refImg = ref(storage, "imagens/" + Date.now());
      await uploadBytes(refImg, arquivo);
      imageUrl = await getDownloadURL(refImg);
    }

    if (editandoId) {

      const docRef = doc(db, "artigos", editandoId);

      await updateDoc(docRef, {
        titulo,
        conteudo,
        autor,
        tipo,
        publicado,
        dataPublicacao,
        ...(imageUrl && { imagem: imageUrl })
      });

      alert("Atualizado ✨");
      editandoId = null;

    } else {

      await addDoc(collection(db, "artigos"), {
        titulo,
        conteudo,
        imagem: imageUrl,
        autor,
        tipo,
        publicado,
        dataPublicacao,
        dataCriacao: new Date()
      });

      alert(modo === "agora" ? "Publicado 🔥" : "Agendado ⏳");
    }

    inputTitulo.value = "";
    inputConteudo.innerHTML = "";
    document.getElementById("dataPublicacao").value = "";
    checkboxFoto.checked = false;

    imagemPreviewURL = null;
    arquivo = null;
  
    atualizarPreview();

    mostrarTela("posts-admin");
    setActive("nav-posts");
    listarPosts();

  } catch (error) {
    console.error(error);
    alert("Erro ao salvar");
  }
}

// ================= BOTÕES =================

document.getElementById("btn-publicar")
  ?.addEventListener("click", () => salvar("agora"));

document.getElementById("btn-agendar")
  ?.addEventListener("click", () => salvar("agendar"));

// ================= LISTAR POSTS =================

async function listarPosts() {
  const container = document.getElementById("lista-admin");

  container.innerHTML = "Carregando...";

  const snapshot = await getDocs(collection(db, "artigos"));

  if (snapshot.empty) {
    container.innerHTML = "Nenhum post encontrado.";
    return;
  }

  container.innerHTML = "";

  snapshot.forEach((docItem) => {
    const data = docItem.data();

    // ✅ CALCULA STATUS FORA DO HTML
    const statusClass = data.publicado ? "publicado" : "agendado";

    const statusTexto = data.publicado
      ? "Publicado"
      : data.dataPublicacao
        ? new Date(data.dataPublicacao).toLocaleString()
        : "Agendado";

    const div = document.createElement("article");

    div.innerHTML = `
      <div class="post-info">
        <span>${data.tipo || "texto"} • ${data.autor || "Prado, Ronaldo"} • ${status}</span>
        <h2>${data.titulo || "Sem título"}</h2>
      </div>

      <div class="post-actions">
        <button class="btn-edit" data-id="${docItem.id}">
          Editar
        </button>

        <button class="btn-delete" data-id="${docItem.id}">
          Deletar
        </button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ================= AÇÕES =================

document.addEventListener("click", async (e) => {

  if (e.target.classList.contains("btn-edit")) {
    const id = e.target.dataset.id;

    const snapshot = await getDocs(collection(db, "artigos"));

    snapshot.forEach((docItem) => {
      if (docItem.id === id) {
        const data = docItem.data();

        inputTitulo.value = data.titulo || "";
        inputConteudo.innerHTML = data.conteudo || "";

        editandoId = id;

        atualizarPreview();

        mostrarTela("novo-admin");
        setActive("nav-novo");
      }
    });
  }

  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;

    if (confirm("Deseja deletar?")) {
      await deleteDoc(doc(db, "artigos", id));
      listarPosts();
    }
  }

});

// ================= ICONES =================

lucide.createIcons();
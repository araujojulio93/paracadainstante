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
const inputAutor = document.getElementById("autor"); // 🔥 NOVO

const btnSalvarTexto = document.getElementById("salvar-texto");
const btnSalvarFoto = document.getElementById("salvar-foto");

const previewTitulo = document.getElementById("preview-titulo");
const previewConteudo = document.getElementById("preview-conteudo");

let editandoId = null;

// limpeza
function limparHTML(html) {
  return html
    .replace(/<div>/g, "<p>")
    .replace(/<\/div>/g, "</p>");
}

// preview
function atualizarPreview() {
  previewTitulo.textContent = inputTitulo.value || "Título";
  previewConteudo.innerHTML = limparHTML(inputConteudo.innerHTML);
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
    document.querySelectorAll(".editor-toolbar button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const tipo = btn.id.replace("btn-", "");
    aplicarFormatacao(tipo);
  });
});

// ================= UPLOAD =================

let arquivo = null;

const inputFile = document.getElementById("imagem");
const preview = document.getElementById("preview");
const dropArea = document.getElementById("drop-area");

// ---------- FUNÇÃO CENTRAL ----------
function handleFile(file) {
  if (!file) return;

  arquivo = file;

  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
}

// ---------- CLIQUE NORMAL ----------
inputFile?.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

// ---------- CLIQUE NA ÁREA ----------
dropArea?.addEventListener("click", () => {
  inputFile.click();
});

// ---------- DRAG ----------
dropArea?.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("drag-over");
});

dropArea?.addEventListener("dragleave", () => {
  dropArea.classList.remove("drag-over");
});

// ---------- DROP ----------
dropArea?.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("drag-over");

  const file = e.dataTransfer.files[0];
  handleFile(file);
});

// ================= SALVAR =================

async function salvar(tipo) {
  const titulo = inputTitulo.value;
  const conteudo = limparHTML(inputConteudo.innerHTML);
  const autor = "Ronaldo Prado"; // 🔥 FIXO

  let imageUrl = "";

  try {
    if (arquivo) {
      const refImg = ref(storage, "imagens/" + Date.now());
      await uploadBytes(refImg, arquivo);
      imageUrl = await getDownloadURL(refImg);
    }

    // 🔥 EDITAR
    if (editandoId) {
      const docRef = doc(db, "artigos", editandoId);

      await updateDoc(docRef, {
        titulo,
        conteudo,
        autor,
        ...(imageUrl && { imagem: imageUrl })
      });

      alert("Atualizado ✨");
      editandoId = null;

    } else {

      // 🔥 NOVO
      await addDoc(collection(db, "artigos"), {
        titulo,
        conteudo,
        imagem: imageUrl,
        autor,
        data: new Date(),
        tipo
      });

      alert("Publicado 🔥");
    }

    // 🔥 RESET BOTÃO
    btnSalvarTexto.textContent = "Publicar";
    btnSalvarFoto.textContent = "Publicar";

    // 🔥 LIMPAR
    inputTitulo.value = "";
    inputConteudo.innerHTML = "";
    preview.src = "";
    preview.style.display = "none";
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

document.getElementById("salvar-texto")?.addEventListener("click", () => salvar("texto"));
document.getElementById("salvar-foto")?.addEventListener("click", () => salvar("foto"));

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

    const div = document.createElement("article");

    div.innerHTML = `
      <div class="post-info">
        <span>${data.tipo || "texto"} • ${data.autor || "Prado, Ronaldo"}</span>
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

  // 🔥 EDITAR
  if (e.target.classList.contains("btn-edit")) {
    const id = e.target.dataset.id;

    const snapshot = await getDocs(collection(db, "artigos"));

    snapshot.forEach((docItem) => {
      if (docItem.id === id) {
        const data = docItem.data();

        inputTitulo.value = data.titulo || "";
        inputConteudo.innerHTML = data.conteudo || "";

        editandoId = id;

        // 🔥 MUDA BOTÃO
        btnSalvarTexto.textContent = "Atualizar Texto ✏️";
        btnSalvarFoto.textContent = "Atualizar Foto ✏️";

        atualizarPreview();

        mostrarTela("novo-admin");
        setActive("nav-novo");
      }
    });
  }

  // 🔥 DELETAR
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
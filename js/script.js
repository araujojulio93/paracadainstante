/**
 * SCRIPT EDITORIAL - FIREBASE + AUTOR + HOTKEY + SEO
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("🔥 Sistema ativo");

    async function initApp() {
        await initFirebase();

        if (document.getElementById('lista-poemas')) {
            await carregarPoemas();
        }

        if (document.getElementById('gallery-grid')) {
            await carregarGaleria();
        }

    }

    // ---------------- FIREBASE ----------------
    const firebaseConfig = {
        apiKey: "AIzaSyCs_8yfB6SI1dhn-yg6YbGeZVWn-Qeba_0",
        authDomain: "para-cada-instante.firebaseapp.com",
        projectId: "para-cada-instante",
        storageBucket: "para-cada-instante.firebasestorage.app",
        messagingSenderId: "1011959284933",
        appId: "1:1011959284933:web:92687246cf2c5f69161cac"
    };

    let db = null;

    async function initFirebase() {
        if (db) return db;

        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js");
        const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js");

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);

        console.log("✅ Firebase conectado");
        return db;
    }

    // ---------------- UTILS ----------------
    function formatarData(data) {
        if (!data) return "";

        try {
            const date = data instanceof Date ? data : new Date(data);
            return date.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        } catch {
            return "";
        }
    }

    function limparHTML(html) {
        if (!html) return "";

        return html
            .replace(/<div>/g, "<p>")
            .replace(/<\/div>/g, "</p>");
    }

    // ---------------- TEXTOS ----------------
    async function carregarPoemas(filtro = '') {
        const container = document.getElementById('lista-poemas');
        if (!container) return;

        const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js");

        const q = query(collection(db, "artigos"), orderBy("dataPublicacao", "desc"));
        const snapshot = await getDocs(q);

        let poemas = [];

        snapshot.forEach(doc => {
            const data = doc.data();
        
            const tipo = (data.tipo || "texto").toLowerCase();
            if (tipo !== "texto" && tipo !== "text") return;
        
            // 🔥 FILTRO CORRETO
            const agora = new Date();
        
            let dataPost = null;

            if (data.dataPublicacao?.toDate) {
              dataPost = data.dataPublicacao.toDate();
            } else if (data.dataPublicacao) {
              dataPost = new Date(data.dataPublicacao);
            } else {
              dataPost = new Date(); // fallback
            }

            if (!data.publicado || dataPost > agora) return;
        
            poemas.push({
                id: doc.id,
                titulo: data.titulo || "Sem título",
                texto: limparHTML(data.conteudo || ""),
                imagem: data.imagem || "",
                autor: data.autor || "Prado, Ronaldo",
                data: dataPost
            });
        });

        const filtrados = poemas.filter(p =>
            p.titulo.toLowerCase().includes(filtro.toLowerCase())
        );

        container.innerHTML = '';

        filtrados.forEach((poema, index) => {
            const card = document.createElement('article');
            card.className = 'card-poema';

            const imagemUrl = poema.imagem ||
                `https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80&sig=${index}`;

            card.innerHTML = `
                <div class="capa-container">
                    <img src="${imagemUrl}" loading="lazy">
                </div>
                <div class="info-container">
                    <span class="metadados">
                        ${formatarData(poema.data)} • ${poema.autor}
                    </span>
                    <h2>${poema.titulo}</h2>
                    <p class="preview">
                        ${poema.texto.replace(/<[^>]+>/g, '').substring(0, 120)}...
                    </p>
                    <span class="metadados view-btn">Ler completo —</span>
                </div>
            `;

            card.onclick = () => abrirModalTexto(poema);

            container.appendChild(card);
        });
    }

    // ---------------- GALERIA ----------------
    async function carregarGaleria() {
        const gallery = document.getElementById('gallery-grid');
        if (!gallery) return;

        const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js");

        const snapshot = await getDocs(collection(db, "artigos"));

        gallery.innerHTML = '';

        snapshot.forEach(doc => {
            const foto = doc.data();

            const tipo = (foto.tipo || "").toLowerCase();
            if (tipo !== "foto") return;

            const dataConvertida = foto.dataPublicacao?.toDate ? foto.dataPublicacao.toDate() : new Date();

            const item = document.createElement('div');
            item.className = 'photo-item';

            item.innerHTML = `
                <div class="capa-container">
                    <img src="${foto.imagem}" loading="lazy">
                </div>
                <div class="info-container">
                    <span class="metadados">
                        ${formatarData(dataConvertida)} • ${foto.autor || "Prado, Ronaldo"}
                    </span>
                    <h2>${foto.titulo}</h2>
                    <p>${foto.legenda || ''}</p>
                </div>
            `;

            item.onclick = () => abrirModalFoto(foto);
            gallery.appendChild(item);
        });
    }

    // ---------------- MODAIS ----------------
    function abrirModalTexto(poema) {
        const modal = document.getElementById('poemaModal');
        const body = document.getElementById('modalBody');

        body.innerHTML = `
            <div style="text-align:center; margin-bottom:40px;">
                <span class="metadados">
                    ${formatarData(poema.data)}
                </span>
                <h2>${poema.titulo}</h2>
            </div>

            <div class="conteudo-texto">
                ${poema.texto}
            </div>

            <div class="autor-rodape">
                — ${poema.autor}
            </div>
        `;

        document.title = `${poema.titulo} | Prado, Ronaldo`;

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute(
                "content",
                poema.texto.replace(/<[^>]+>/g, '').substring(0, 150)
            );
        }

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    function abrirModalFoto(foto) {
        const modal = document.getElementById('photoModal');
        const imgFull = document.getElementById('imgFull');
        const caption = document.getElementById('photoCaption');

        imgFull.src = foto.imagem;

        caption.innerHTML = `
            <div class="foto-container">

                <div class="foto-topo">
                    <span class="metadados">
                        ${formatarData(foto.data?.toDate?.())}
                    </span>
                    <h2>${foto.titulo}</h2>
                </div>

                <div class="foto-rodape">
                    — ${foto.autor || "Ronaldo Prado"}
                </div>

            </div>
        `;

        document.title = `${foto.titulo} | Prado, Ronaldo`;

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }

    window.fecharQualquerModal = function () {
        document.querySelectorAll('.modal').forEach(m => m.style.display = "none");
        document.body.style.overflow = "auto";
    };

    // ---------------- HOTKEY ADMIN ----------------
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
            window.location.href = "admin.html";
        }
    });

    // ---------------- NEWSLETTER ----------------
    const form = document.getElementById("newsletter-form");
    const mensagem = document.getElementById("mensagem-sucesso");

    form?.addEventListener("submit", () => {
      setTimeout(() => {

        mensagem.classList.add("show");
        form.reset();

        setTimeout(() => {
          mensagem.classList.remove("show");
        }, 3000);

      }, 800);
    });

    // ---------------- EVENTOS ----------------
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        carregarPoemas(e.target.value);
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') || e.target.classList.contains('close-modal')) {
            fecharQualquerModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") fecharQualquerModal();
    });

    initApp();
});
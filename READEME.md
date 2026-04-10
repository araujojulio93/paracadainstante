# ✍️ Para Cada Instante

Plataforma autoral de textos e fotografia, com publicação dinâmica, painel administrativo e envio automático de newsletter.

🔗 Acesse: https://paracadainstante.netlify.app/

---

## 📖 Sobre o projeto

"Para Cada Instante" é um espaço digital dedicado à escrita sensível e à imagem.  
O projeto combina um CMS próprio com automação de envio de textos para leitores inscritos.

---

## 🚀 Funcionalidades

### 🧠 CMS (Admin)
- Login com Firebase Auth
- Criação, edição e exclusão de posts
- Upload de imagens (Firebase Storage)
- Preview em tempo real
- SPA (Single Page Application)

### 🌐 Frontend
- Listagem dinâmica de textos e fotos
- Filtro e ordenação
- Modal de leitura
- Design responsivo

### 📬 Newsletter
- Inscrição via Brevo
- Envio automático ao publicar novo post
- Layout de email estilo editorial
- Sistema anti-duplicação

---

## ⚙️ Tecnologias

- **Firebase**
  - Firestore (banco de dados)
  - Authentication
  - Storage
  - Cloud Functions

- **Brevo (Sendinblue)**
  - Gestão de contatos
  - Envio de campanhas

- **Frontend**
  - HTML, CSS, JavaScript (Vanilla)

- **Deploy**
  - Netlify (frontend)
  - Firebase Functions (backend)

---

## 🧠 Arquitetura

```text
Admin → Firebase → Cloud Function → Brevo → Email enviado
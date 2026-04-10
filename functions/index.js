const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { defineString } = require("firebase-functions/params");
const axios = require("axios");

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

admin.initializeApp();
const db = getFirestore();

// 🔐 PARAM (NOVO PADRÃO)
const BREVO_API_KEY = defineString("BREVO_API_KEY");

exports.enviarNovoPost = onDocumentCreated("artigos/{id}", async (event) => {

  const docRef = db.collection("artigos").doc(event.params.id);
  const snapshot = await docRef.get();
  const data = snapshot.data();

  // 🔥 EVITA ENVIO DUPLICADO
  if (data.emailEnviado) {
    console.log("⚠️ Já enviado, ignorando...");
    return;
  }

  const titulo = data.titulo || "Novo texto";

  const conteudo = data.conteudo
    ?.replace(/<[^>]+>/g, '')
    .substring(0, 300) || "";

  const link = `https://paracadainstante.netlify.app/article.html?id=${event.params.id}`;

  // 📖 HTML ESTILO LIVRO (COMPATÍVEL COM EMAIL)
  const html = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdfbf7; padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:40px; font-family: Georgia, serif;">
          
          <tr>
            <td align="center" style="font-size:12px; letter-spacing:3px; color:#b0a99f;">
              PARA CADA INSTANTE
            </td>
          </tr>

          <tr><td height="30"></td></tr>

          <tr>
            <td align="center" style="font-size:26px; color:#2c2c2c;">
              ${titulo}
            </td>
          </tr>

          <tr><td height="30"></td></tr>

          <tr>
            <td style="font-size:17px; line-height:1.8; color:#3a3a3a;">
              ${conteudo}...
            </td>
          </tr>

          <tr><td height="40"></td></tr>

          <tr>
            <td align="center">
              <a href="${link}" style="color:#555; text-decoration:none; font-style:italic;">
                continuar leitura →
              </a>
            </td>
          </tr>

          <tr><td height="40"></td></tr>

          <tr>
            <td align="right" style="color:#555;">
              — Ronaldo Prado
            </td>
          </tr>

          <tr><td height="40"></td></tr>

          <tr>
            <td align="center" style="font-size:11px; color:#b0a99f;">
              Você está recebendo este texto porque se inscreveu.
              <br><br>
              <a href="{{ unsubscribe }}" style="color:#b0a99f;">
                cancelar inscrição
              </a>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
  `;

  try {

    // 🔥 1. CRIAR CAMPANHA
    const campanha = await axios.post(
      "https://api.brevo.com/v3/emailCampaigns",
      {
        name: `Novo texto - ${titulo}`,
        subject: `Novo texto: ${titulo}`,

        sender: {
          name: "Ronaldo Prado",
          email: "paracadainstante@gmail.com"
        },

        type: "classic",

        htmlContent: html,

        recipients: {
          listIds: [3] // 🔥 SUA LISTA
        }
      },
      {
        headers: {
          "api-key": BREVO_API_KEY.value(),
          "Content-Type": "application/json"
        }
      }
    );

    const campaignId = campanha.data.id;

    // 🔥 2. ENVIAR CAMPANHA
    await axios.post(
      `https://api.brevo.com/v3/emailCampaigns/${campaignId}/sendNow`,
      {},
      {
        headers: {
          "api-key": BREVO_API_KEY.value()
        }
      }
    );

    // 🔥 3. MARCAR COMO ENVIADO
    await docRef.update({
      emailEnviado: true,
      dataEnvio: new Date()
    });

    console.log("✅ Campanha enviada e registrada");

  } catch (error) {
    console.error("❌ Erro:", error.response?.data || error.message);
  }

});
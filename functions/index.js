const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const axios = require("axios");

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

admin.initializeApp();
const db = getFirestore();

const BREVO_API_KEY = defineSecret("BREVO_API_KEY");

// ================= FUNÇÃO CENTRAL (REUTILIZÁVEL) =================

async function enviarEmail(data, docRef, id) {

  if (!data.publicado) return;
  if (data.emailEnviado) return;

  const titulo = data.titulo || "Novo texto";

  const conteudo = data.conteudo
    ?.replace(/<[^>]+>/g, '')
    .substring(0, 300) || "";

  const link = `https://paracadainstante.netlify.app/article.html?id=${id}`;

  console.log("🔥 Enviando email:", titulo);

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
              — Prado, Ronaldo
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

    const campanha = await axios.post(
      "https://api.brevo.com/v3/emailCampaigns",
      {
        name: `Novo texto - ${titulo}`,
        subject: `Novo texto: ${titulo}`,
        sender: {
          name: "Prado, Ronaldo",
          email: "paracadainstante@gmail.com"
        },
        type: "classic",
        htmlContent: html,
        recipients: { listIds: [7] }
      },
      {
        headers: {
          "api-key": BREVO_API_KEY.value(),
          "Content-Type": "application/json"
        }
      }
    );

    await axios.post(
      `https://api.brevo.com/v3/emailCampaigns/${campanha.data.id}/sendNow`,
      {},
      {
        headers: {
          "api-key": BREVO_API_KEY.value()
        }
      }
    );

    await docRef.update({
      emailEnviado: true,
      dataEnvio: new Date()
    });

    console.log("✅ Email enviado com sucesso");

  } catch (error) {
    console.error("❌ Erro ao enviar email:", error.response?.data || error.message);
  }
}

// ================= PUBLICAÇÃO DIRETA =================

exports.enviarPostCriado = onDocumentCreated(
  {
    document: "artigos/{id}",
    secrets: ["BREVO_API_KEY"]
  },
  async (event) => {

    const data = event.data.data();
    const docRef = event.data.ref;
    const id = event.params.id;

    console.log("🆕 Novo post criado");

    await enviarEmail(data, docRef, id);
  }
);

// ================= PUBLICAÇÃO AGENDADA =================

exports.enviarPostAtualizado = onDocumentUpdated(
  {
    document: "artigos/{id}",
    secrets: ["BREVO_API_KEY"]
  },
  async (event) => {

    const before = event.data.before.data();
    const after = event.data.after.data();
    const docRef = event.data.after.ref;
    const id = event.params.id;

    if (!before.publicado && after.publicado) {
      console.log("⏳ Post agendado foi publicado");
      await enviarEmail(after, docRef, id);
    }
  }
);

// ================= AGENDAMENTO =================

exports.publicarAgendados = onSchedule("every 1 minutes", async () => {

  const agora = new Date();

  const snapshot = await db.collection("artigos")
    .where("publicado", "==", false)
    .where("dataPublicacao", "<=", agora)
    .get();

  const batch = db.batch();

  snapshot.forEach(doc => {
    batch.update(doc.ref, {
      publicado: true,
      dataPublicado: new Date()
    });
  });

  await batch.commit();

  console.log(`🕒 ${snapshot.size} posts publicados automaticamente`);
});
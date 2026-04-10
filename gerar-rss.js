const fs = require("fs");
const { MEUS_POEMAS } = require("./js/dados.js");

const SITE_URL = "https://paracadainstante.netlify.app";

// converte "02 ABR 2026" → data válida RSS
function converterData(dataBR) {
  const meses = {
    JAN:0, FEV:1, MAR:2, ABR:3, MAI:4, JUN:5,
    JUL:6, AGO:7, SET:8, OUT:9, NOV:10, DEZ:11
  };

  const [dia, mes, ano] = dataBR.split(" ");
  return new Date(ano, meses[mes], dia).toUTCString();
}

const items = MEUS_POEMAS.map(poema => `
<item>
<title>${poema.titulo}</title>
<link>${SITE_URL}/#poema-${poema.id}</link>
<description>${poema.texto.substring(0,120)}...</description>
<pubDate>${converterData(poema.data)}</pubDate>
</item>
`).join("");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>Para Cada Instante</title>
<link>${SITE_URL}</link>
<description>Poemas e escritos de Ronaldo Prado</description>
<language>pt-br</language>
${items}
</channel>
</rss>`;

fs.writeFileSync("./rss.xml", rss);

console.log("✅ RSS gerado com sucesso");
/**
 * ============================================================
 * LA NUEVA ERA — Backend en Google Apps Script
 * ============================================================
 * Qué hace este archivo:
 *  1. Guarda y lista integrantes en una Google Sheet (tu "base de datos").
 *  2. Expone una URL tipo API (doGet / doPost) que usan index.html y
 *     dashboard.html.
 *  3. Tiene una función revisarCumpleanos() que, corriendo una vez al
 *     día con un disparador automático, envía un WhatsApp a tu número
 *     902242903 avisando el cumpleaños, y otro de felicitación al
 *     propio integrante si cargaste su WhatsApp.
 *
 * INSTALACIÓN: ver README.md (paso a paso, sin código).
 * ============================================================
 */

const NUMERO_DIRECTIVA = "51902242903"; // <-- tu número con código de país (Perú = 51)
const CALLMEBOT_APIKEY = "https://api.callmebot.com/whatsapp.php?phone=51902242903&text=This+is+a+test&apikey=5599632";
const SHEET_NAME = "Integrantes";

function getSheet_(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if(!sheet){
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["id","nombre","cargo","cumpleanos","foto","whatsapp"]);
  }
  return sheet;
}

// ---------- API ----------

function doGet(e){
  const action = (e.parameter.action || "listar");
  if(action === "listar"){
    return respuestaJson_({ integrantes: listarIntegrantes_() });
  }
  return respuestaJson_({ error: "acción no reconocida" });
}

function doPost(e) {
  try {

    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    // =========================
    // CREAR
    // =========================
    if (action === "crear") {

      const sheet = getSheet_();
      const id = Utilities.getUuid();

      sheet.appendRow([
        id,
        body.nombre || "",
        body.cargo || "",
        body.cumpleanos || "",
        body.foto || "",
        body.whatsapp || ""
      ]);

      return respuestaJson_({
        ok: true,
        id: id
      });
    }

    // =========================
    // EDITAR
    // =========================
    if (action === "editar") {

      const sheet = getSheet_();
      const data = sheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {

        if (String(data[i][0]) === String(body.id)) {

          sheet.getRange(i + 1, 1, 1, 6).setValues([[
            body.id || "",
            body.nombre || "",
            body.cargo || "",
            body.cumpleanos || "",
            body.foto || "",
            body.whatsapp || ""
          ]]);

          return respuestaJson_({
            ok: true,
            mensaje: "Integrante actualizado correctamente"
          });
        }
      }

      return respuestaJson_({
        ok: false,
        error: "No se encontró el integrante con ese ID"
      });
    }

    // =========================
    // ELIMINAR
    // =========================
    if (action === "eliminar") {

      const sheet = getSheet_();
      const data = sheet.getDataRange().getValues();

      for (let i = 1; i < data.length; i++) {

        if (String(data[i][0]) === String(body.id)) {

          sheet.deleteRow(i + 1);

          return respuestaJson_({
            ok: true,
            mensaje: "Integrante eliminado correctamente"
          });
        }
      }

      return respuestaJson_({
        ok: false,
        error: "No se encontró el integrante con ese ID"
      });
    }

    // =========================
    // ACCIÓN NO RECONOCIDA
    // =========================
    return respuestaJson_({
      ok: false,
      error: "Acción no reconocida: " + action
    });

  } catch (error) {

    return respuestaJson_({
      ok: false,
      error: error.toString()
    });
  }
}

function listarIntegrantes_(){
  const sheet = getSheet_();
  const data = sheet.getDataRange().getValues();
  const filas = data.slice(1);
  return filas.map(r => ({
    id: r[0],
    nombre: r[1],
    cargo: r[2],
    cumpleanos: formatearFecha_(r[3]),
    foto: r[4],
    whatsapp: r[5]
  })).filter(m => m.nombre);
}

function formatearFecha_(valor){
  if(!valor) return "";
  if(valor instanceof Date){
    return Utilities.formatDate(valor, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(valor);
}

function respuestaJson_(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- Revisión diaria de cumpleaños ----------

function revisarCumpleanos(){
  const hoy = new Date();
  const hoyMes = hoy.getMonth() + 1;
  const hoyDia = hoy.getDate();

  const integrantes = listarIntegrantes_();

  integrantes.forEach(m => {
    if(!m.cumpleanos) return;
    const partes = m.cumpleanos.split("-"); // yyyy-MM-dd
    const mes = parseInt(partes[1], 10);
    const dia = parseInt(partes[2], 10);

    if(mes === hoyMes && dia === hoyDia){
      // Aviso a la directiva
      enviarWhatsApp_(
        NUMERO_DIRECTIVA,
        `🎉 Hoy es el cumpleaños de ${m.nombre} (${m.cargo}) de La Nueva Era. ¡No olvides saludarle!`
      );
      // Felicitación al propio integrante (si cargó su número)
      if(m.whatsapp){
        enviarWhatsApp_(
          m.whatsapp,
          `🎂 ¡Feliz cumpleaños, ${m.nombre}! Todo el equipo de La Nueva Era te desea un día increíble. 💛`
        );
      }
    }
  });
}

function enviarWhatsApp_(numero, mensaje){
  const url = "https://api.callmebot.com/whatsapp.php"
    + "?phone=" + encodeURIComponent(numero)
    + "&text=" + encodeURIComponent(mensaje)
    + "&apikey=" + CALLMEBOT_APIKEY;
  try{
    UrlFetchApp.fetch(url);
  }catch(err){
    Logger.log("Error enviando WhatsApp a " + numero + ": " + err);
  }
}

/**
 * Ejecuta esta función UNA VEZ manualmente desde el editor
 * para crear el disparador diario automático (9:00 am).
 */
function crearDisparadorDiario(){
  ScriptApp.newTrigger("revisarCumpleanos")
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .create();
}

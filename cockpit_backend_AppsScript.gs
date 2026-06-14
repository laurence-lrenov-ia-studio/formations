/**
 * COCKPIT FORMATEUR — Backend Google Apps Script
 * L'Rénov IA Studio
 *
 * Rôle : recevoir l'état du cockpit (live) et l'enregistrer dans un Google Sheet.
 *   - Onglet "sessions" : 1 ligne par formation (dernier état connu) -> sert au rechargement.
 *   - Onglet "log"      : chaque envoi ajouté (historique immuable) -> rien n'est jamais perdu.
 *
 * Sécurité : un TOKEN partagé (à recopier dans le cockpit). Pas de clé Google exposée.
 *
 * --- DÉPLOIEMENT (voir les étapes détaillées fournies à côté) ---
 * 1. Crée un Google Sheet vierge.
 * 2. Menu Extensions > Apps Script. Colle ce code. Remplace TOKEN ci-dessous.
 * 3. Déployer > Nouveau déploiement > type "Application Web".
 *    - Exécuter en tant que : Moi.
 *    - Accès : "Tout le monde".
 * 4. Copie l'URL /exec fournie -> à coller dans l'onglet Cloud du cockpit.
 */

const TOKEN = 'CHANGE-MOI-mdp-2026';   // <-- mets ta propre valeur, recopie-la dans le cockpit
const SHEET_ID = '';                    // laisse vide si le script est lié au Sheet (cas normal)
const TAB_SESSIONS = 'sessions';
const TAB_LOG = 'log';

function ss_() {
  return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}
function tab_(name, headers) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); }
  return sh;
}
function out_(cb, obj) {
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + JSON.stringify(obj) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Écriture live : appelée à chaque save du cockpit (POST text/plain). */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (TOKEN && body.token !== TOKEN) return out_(null, { ok: false, error: 'token' });

    const key = String(body.session || 'default');
    const savedAt = body.savedAt || new Date().toISOString();
    const data = JSON.stringify(body.data || {});

    // 1) upsert dans "sessions" (dernier état par formation)
    const sh = tab_(TAB_SESSIONS, ['session', 'savedAt', 'json']);
    const vals = sh.getDataRange().getValues();
    let row = -1;
    for (let i = 1; i < vals.length; i++) { if (vals[i][0] === key) { row = i + 1; break; } }
    if (row > 0) sh.getRange(row, 2, 1, 2).setValues([[savedAt, data]]);
    else sh.appendRow([key, savedAt, data]);

    // 2) append dans "log" (historique complet, jamais écrasé)
    tab_(TAB_LOG, ['savedAt', 'session', 'json']).appendRow([savedAt, key, data]);

    return out_(null, { ok: true, session: key, savedAt: savedAt });
  } catch (err) {
    return out_(null, { ok: false, error: String(err) });
  }
}

/** Lecture (rechargement cross-PC) : JSONP via ?callback= pour contourner CORS. */
function doGet(e) {
  const cb = e.parameter.callback || '';
  try {
    if ((e.parameter.action || '') === 'get') {
      if (TOKEN && e.parameter.token !== TOKEN) return out_(cb, { ok: false, error: 'token' });
      const key = String(e.parameter.session || 'default');
      const sh = tab_(TAB_SESSIONS, ['session', 'savedAt', 'json']);
      const vals = sh.getDataRange().getValues();
      for (let i = vals.length - 1; i >= 1; i--) {
        if (vals[i][0] === key) {
          return out_(cb, { ok: true, session: key, savedAt: vals[i][1], data: JSON.parse(vals[i][2] || '{}') });
        }
      }
      return out_(cb, { ok: true, session: key, data: null }); // pas encore de session sauvegardée
    }
    return out_(cb, { ok: true, msg: 'cockpit backend OK' });
  } catch (err) {
    return out_(cb, { ok: false, error: String(err) });
  }
}

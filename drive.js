const CLIENT_ID = '275477780459-hqq1r65323se19oj02qivn426v51eft3.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBBbeJdA-opqLE6ix_UbKGblzZB1S-xfJ0';
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

// 1️⃣ Inicializar Google API
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  });
  gapiInited = true;
  maybeEnableButtons();
}

// 2️⃣ Inicializar el cliente de OAuth
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // se asignará al iniciar sesión
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited)
    document.getElementById('login-btn').disabled = false;
}

// 3️⃣ Iniciar sesión
document.getElementById('login-btn').onclick = () => {
  tokenClient.callback = async (resp) => {
    if (resp.error) throw (resp);
    document.getElementById('status').innerText = 'Conectado a Google Drive';
    await listarArchivos();
  };
  tokenClient.requestAccessToken({ prompt: 'consent' });
};

// 4️⃣ Cerrar sesión
document.getElementById('logout-btn').onclick = () => {
  google.accounts.oauth2.revoke(tokenClient.access_token);
  tokenClient.access_token = null;
  document.getElementById('status').innerText = 'Desconectado';
  document.querySelector("#file-table tbody").innerHTML = "";
};

// 5️⃣ Listar archivos
async function listarArchivos() {
  try {
    const res = await gapi.client.drive.files.list({
      pageSize: 20,
      fields: 'files(id, name, mimeType)'
    });

    const files = res.result.files;
    const tbody = document.querySelector("#file-table tbody");
    tbody.innerHTML = "";

    if (!files || files.length === 0) {
      tbody.innerHTML = "<tr><td colspan='2'>No hay archivos</td></tr>";
      return;
    }

    files.forEach(file => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${file.name}</td><td>${file.mimeType}</td>`;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error al listar archivos:", err);
    document.getElementById('status').innerText = 'Error al listar archivos';
  }
}

gapiLoaded();

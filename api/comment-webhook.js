// SYSTEMENOTIFY COMMENTS - Bot per notifiche commenti 💬
// Versione semplice per Vercel

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN_COMMENTS;
const CHAT_IDS = process.env.TELEGRAM_CHAT_IDS_COMMENTS.split(',').map(id => id.trim());
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

// Funzione per inviare messaggi a Telegram
async function sendTelegramMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML',
                disable_web_page_preview: false
            })
        });
        
        const result = await response.json();
        console.log(`✅ Messaggio inviato a ${chatId}:`, result.ok);
        return result;
    } catch (error) {
        console.error(`❌ Errore invio a ${chatId}:`, error.message);
        return null;
    }
}

module.exports = async (req, res) => {
    console.log('🔥 Richiesta:', req.method, req.url);
    
    // Abilita CORS per permettere richieste dal browser
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Gestisci preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Homepage
    if (req.method === 'GET' && req.url === '/') {
        return res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SystemeNotify Comments</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px;
                        background: #f0f2f5;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 { color: #0088cc; }
                    .status { 
                        background: #d4edda; 
                        color: #155724;
                        padding: 10px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    a { 
                        display: inline-block; 
                        margin: 20px 10px; 
                        padding: 12px 24px; 
                        background: #0088cc; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px;
                        transition: background 0.3s;
                    }
                    a:hover { background: #0066aa; }
                    .info {
                        text-align: left;
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    code {
                        background: #e9ecef;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-family: monospace;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>💬 SystemeNotify Comments</h1>
                    <div class="status">✅ Bot Attivo e Funzionante!</div>
                    
                    <p>Ricevi notifiche Telegram quando qualcuno commenta nei tuoi corsi!</p>
                    
                    <div class="info">
                        <h3>📋 Come usarlo:</h3>
                        <ol>
                            <li>Copia lo script JavaScript dal link sotto</li>
                            <li>Incollalo nell'HTML delle tue lezioni su Systeme.io</li>
                            <li>Modifica le variabili <code>COURSE_NAME</code> e <code>LESSON_TITLE</code></li>
                            <li>Salva e pubblica la lezione</li>
                        </ol>
                    </div>
                    
                    <a href="/test">🧪 Test Notifica</a>
                    <a href="/script">📄 Ottieni Script</a>
                </div>
            </body>
            </html>
        `);
    }
    
    // Test notifica
    if (req.method === 'GET' && req.url === '/test') {
        const testMessage = `💬 <b>NUOVO COMMENTO!</b>

📚 <b>Corso:</b> Test Corso
📄 <b>Lezione:</b> Test Lezione
👤 <b>Autore:</b> Test Utente
💭 <b>Commento:</b> "Questo è un commento di test!"
🔗 <b>Link:</b> https://example.com/test-lesson
📅 <b>Data:</b> ${new Date().toLocaleString('it-IT')}

<i>SystemeNotify Comments 💬</i>`;

        let successCount = 0;
        for (const chatId of CHAT_IDS) {
            const result = await sendTelegramMessage(chatId, testMessage);
            if (result && result.ok) successCount++;
        }
        
        return res.status(200).send(`
            <div style="text-align: center; padding: 50px; font-family: Arial;">
                <h2>✅ Test completato!</h2>
                <p>Inviato a ${successCount}/${CHAT_IDS.length} destinatari</p>
                <p><a href="/" style="color: #0088cc;">Torna alla home</a></p>
            </div>
        `);
    }
    
    // 🆕 NUOVO CODICE: Ricevi notifica di nuovo commento via GET (per aggirare CORS)
    if (req.method === 'GET' && req.url.startsWith('/comment-notification')) {
        console.log('💬 Notifica commento ricevuta via GET!');
        
        try {
            // Estrai parametri dalla query string
            const urlObj = new URL(req.url, `https://${req.headers.host}`);
            const data = {
                course: urlObj.searchParams.get('course') || 'Corso sconosciuto',
                lesson: urlObj.searchParams.get('lesson') || 'Lezione sconosciuta',
                url: urlObj.searchParams.get('url') || 'N/D',
                comment: urlObj.searchParams.get('comment') || 'Nuovo commento',
                author: urlObj.searchParams.get('author') || 'Utente'
            };
            
            // Crea messaggio
            const message = `💬 <b>NUOVO COMMENTO!</b>

📚 <b>Corso:</b> ${data.course}
📄 <b>Lezione:</b> ${data.lesson}
👤 <b>Autore:</b> ${data.author}
💭 <b>Info:</b> ${data.comment}

🔗 <b>Vai alla lezione:</b>
${data.url}

<i>SystemeNotify Comments 💬</i>`;

            // Invia a tutti i destinatari
            const promises = CHAT_IDS.map(chatId => sendTelegramMessage(chatId, message));
            await Promise.all(promises);
            
            // Rispondi con un pixel trasparente (1x1 GIF)
            const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
            res.setHeader('Content-Type', 'image/gif');
            return res.status(200).send(pixel);
            
        } catch (error) {
            console.error('❌ Errore:', error);
            // In caso di errore, rispondi comunque con il pixel
            const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
            res.setHeader('Content-Type', 'image/gif');
            return res.status(200).send(pixel);
        }
    }
    
    // Fornisci lo script da inserire
    if (req.method === 'GET' && req.url === '/script') {
        const scriptUrl = `https://${req.headers.host}/comment-notification`;
        const script = `<!-- SYSTEMENOTIFY COMMENTS - Incolla questo codice nelle tue lezioni -->
<script>
(function() {
    // CONFIGURA QUESTI VALORI
    const WEBHOOK_URL = '${scriptUrl}';
    const COURSE_NAME = 'NOME_DEL_TUO_CORSO'; // Sostituisci!
    const LESSON_TITLE = 'TITOLO_DELLA_LEZIONE'; // Sostituisci!
    const SECRET = '${WEBHOOK_SECRET || 'opzionale'}'; // Opzionale
    
    // Monitora i nuovi commenti
    let lastCommentCount = 0;
    
    function checkComments() {
        const comments = document.querySelectorAll('.comment, .comment-item, [class*="comment"]');
        
        if (comments.length > lastCommentCount) {
            // Nuovo commento rilevato!
            const newComment = comments[comments.length - 1];
            const commentText = newComment.textContent || 'Nuovo commento';
            
            // Invia notifica
            fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    course: COURSE_NAME,
                    lesson: LESSON_TITLE,
                    url: window.location.href,
                    comment: commentText.substring(0, 200),
                    secret: SECRET
                })
            }).catch(err => console.error('Errore notifica:', err));
        }
        
        lastCommentCount = comments.length;
    }
    
    // Controlla ogni 5 secondi
    setInterval(checkComments, 5000);
    
    console.log('SystemeNotify Comments attivo!');
})();
</script>`;
        
        return res.status(200).send(`
            <html>
            <head>
                <title>Script SystemeNotify Comments</title>
                <style>
                    body { font-family: Arial; padding: 20px; }
                    pre { 
                        background: #f4f4f4; 
                        padding: 20px; 
                        border-radius: 5px;
                        overflow-x: auto;
                    }
                    button {
                        background: #0088cc;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 10px 0;
                    }
                    .success {
                        background: #d4edda;
                        color: #155724;
                        padding: 10px;
                        border-radius: 5px;
                        display: none;
                    }
                </style>
            </head>
            <body>
                <h1>📄 Script per le notifiche commenti</h1>
                <p>Copia questo codice e incollalo nell'HTML delle tue lezioni:</p>
                <pre id="script">${script.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                <button onclick="copyScript()">📋 Copia Script</button>
                <div id="success" class="success">✅ Copiato negli appunti!</div>
                <p><a href="/">← Torna alla home</a></p>
                
                <script>
                function copyScript() {
                    const text = document.getElementById('script').textContent;
                    navigator.clipboard.writeText(text).then(() => {
                        document.getElementById('success').style.display = 'block';
                        setTimeout(() => {
                            document.getElementById('success').style.display = 'none';
                        }, 3000);
                    });
                }
                </script>
            </body>
            </html>
        `);
    }
    
    // Ricevi notifica di nuovo commento (POST originale)
    if (req.method === 'POST' && req.url === '/comment-notification') {
        console.log('💬 Notifica commento ricevuta!');
        
        try {
            const data = req.body;
            
            // Estrai dati
            const course = data.course || 'Corso sconosciuto';
            const lesson = data.lesson || 'Lezione sconosciuta';
            const url = data.url || 'N/D';
            const comment = data.comment || 'Commento vuoto';
            const author = data.author || 'Utente';
            
            // Crea messaggio
            const message = `💬 <b>NUOVO COMMENTO!</b>

📚 <b>Corso:</b> ${course}
📄 <b>Lezione:</b> ${lesson}
👤 <b>Autore:</b> ${author}
💭 <b>Commento:</b> "${comment.substring(0, 200)}${comment.length > 200 ? '...' : ''}"

🔗 <b>Vai alla lezione:</b>
${url}

<i>SystemeNotify Comments 💬</i>`;

            // Invia a tutti i destinatari
            const promises = CHAT_IDS.map(chatId => sendTelegramMessage(chatId, message));
            await Promise.all(promises);
            
            console.log('✅ Notifiche inviate con successo');
            
            return res.status(200).json({
                success: true,
                message: 'Notification sent'
            });
            
        } catch (error) {
            console.error('❌ Errore:', error);
            return res.status(200).json({ success: true });
        }
    }
    
    // 404
    return res.status(404).send('Not Found');
};
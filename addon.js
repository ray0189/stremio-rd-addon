const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const RD_TOKEN = process.env.RD_TOKEN;

const manifest = {
    id: "org.rayyan.realdebrid",
    version: "1.0.0",
    name: "Real-Debrid RD Addon (Filtered)",
    description: "Streams only high-quality Real-Debrid content (4K/HDR/10bit/1080p/Atmos/English)",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
    try {
        const res = await fetch(`https://api.real-debrid.com/rest/1.0/torrents/instantAvailability/${id}`, {
            headers: { Authorization: `Bearer ${RD_TOKEN}` }
        });

        const json = await res.json();
        let streams = [];

        const MIN_SIZE_MB = 700;
        const MAX_SIZE_MB = 15000;

        for (const [hash, data] of Object.entries(json)) {
            if (data.rd && data.rd.length > 0) {
                const filtered = data.rd.filter(file => {
                    const name = file.filename.toLowerCase();
                    const sizeMB = file.filesize / (1024 * 1024);

                    const is1080p = name.includes("1080p");
                    const is4k = name.includes("2160p") || name.includes("4k");
                    const isHDR = name.includes("hdr");
                    const is10bit = name.includes("10bit");
                    const isDolby = name.includes("atmos") || name.includes("dolby");

                    const isEnglish = !name.includes("french") &&
                                      !name.includes("german") &&
                                      !name.includes("spanish") &&
                                      !name.includes("hindi") &&
                                      !name.includes("dual") &&
                                      !name.includes("dub") &&
                                      !name.includes("sub");

                    const isSizeOK = sizeMB > MIN_SIZE_MB && (sizeMB <= MAX_SIZE_MB || is4k);

                    return (is1080p || is4k) && (isHDR || is10bit || isDolby) && isEnglish && isSizeOK;
                });

                const sorted = filtered.sort((a, b) => {
                    const getScore = f => {
                        const n = f.filename.toLowerCase();
                        let score = 0;
                        if (n.includes("4k") || n.includes("2160p")) score += 50;
                        else if (n.includes("1080p")) score += 30;
                        if (n.includes("hdr")) score += 15;
                        if (n.includes("10bit")) score += 10;
                        if (n.includes("atmos") || n.includes("dolby")) score += 5;
                        score += f.filesize / (1024 * 1024 * 1024);
                        return score;
                    };
                    return getScore(b) - getScore(a);
                });

                for (const file of sorted) {
                    streams.push({
                        title: `🎬 ${Math.round(file.filesize / 1e9)}GB | ${file.filename}`,
                        url: file.download
                    });
                }
            }
        }

        return { streams };
    } catch (e) {
        console.error(e);
        return { streams: [] };
    }
});

module.exports = builder.getInterface();

const { addonBuilder } = require("stremio-addon-sdk");
const fetch = require("node-fetch");

const RD_TOKEN = process.env.RD_TOKEN;

const manifest = {
    id: "org.rayyan.realdebrid",
    version: "1.0.0",
    name: "Real-Debrid RD Addon",
    description: "Streams cached torrents from Real-Debrid",
    resources: ["stream"],
    types: ["movie", "series"],
    idPrefixes: ["tt"],
    catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id }) => {
    try {
        const infoHash = id.replace("tt", ""); // simplistic
        const rdRes = await fetch(`https://api.real-debrid.com/rest/1.0/streaming/transcode/${infoHash}`, {
            headers: { Authorization: `Bearer ${RD_TOKEN}` }
        });

        if (!rdRes.ok) throw new Error("RD lookup failed");
        const json = await rdRes.json();

        return { streams: [{ title: "RD Cached", url: json.stream_url }] };
    } catch (e) {
        return { streams: [] };
    }
});

module.exports = builder.getInterface();

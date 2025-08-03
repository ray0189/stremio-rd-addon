const { addonBuilder } = require("stremio-addon-sdk");

const manifest = {
  id: "org.rayyan.realdebrid",
  version: "1.0.0",
  name: "RD Ultra Filtered",
  description: "Real Debrid + Quality Filtering Addon",
  resources: ["stream"],
  types: ["movie"],
  idPrefixes: ["tt"],
  catalogs: [],
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(({ id }) => {
  const streams = [
    {
      name: "RealDebrid 4K HDR10+",
      url: "https://real-debrid-link-placeholder.com/stream.mp4",
      title: "4K HDR10+ Dolby Atmos",
    },
    {
      name: "RealDebrid 1080p",
      url: "https://real-debrid-link-placeholder.com/1080p.mp4",
      title: "1080p English",
    },
  ];
  return Promise.resolve({ streams });
});

module.exports = builder.getInterface();
require('dotenv').config();
const express = require("express");
const app = express();
const addonInterface = require("./addon");

app.get("/manifest.json", (req, res) => {
    res.send(addonInterface.manifest);
});

app.get("/:resource/:type/:id", (req, res) => {
    addonInterface.get(req.params.resource, req.params.type, req.params.id)
        .then(resp => res.send(resp))
        .catch(err => res.status(500).send({ err: err.message }));
});

app.listen(7000, () => console.log("Addon running on :7000"));

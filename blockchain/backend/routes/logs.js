const express = require("express");
const router = express.Router();

const { generateHash } = require("../utils/hash");
const { saveLogOnChain, verifyLogOnChain } = require("../services/blockchain");

router.post("/verify", async (req, res) => {
  try {
    const { hash } = req.body;
    if (!hash) {
      return res.status(400).json({ error: "Hash is required" });
    }
    const exists = await verifyLogOnChain(hash);
    res.json({ success: true, exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/log", async (req, res) => {
  try {
    const hash = generateHash(req.body);
    const txHash = await saveLogOnChain(hash);

    res.json({
      success: true,
      hash,
      txHash,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

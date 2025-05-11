export default async function handler(req, res) {
    const key = process.env.FIREBASE_ADMIN_KEY;
  
    if (!key) {
      console.error("🚫 FIREBASE_ADMIN_KEY is undefined!");
      return res.status(500).json({ error: "Missing FIREBASE_ADMIN_KEY" });
    }
  
    console.log("✅ FIREBASE_ADMIN_KEY is loaded.");
    return res.status(200).json({ ok: true, keyStart: key.slice(0, 40) });
  }
  
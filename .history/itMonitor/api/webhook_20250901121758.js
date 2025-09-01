// Webhook Receiver
export default async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;
    console.log("📩 Incoming webhook:", data);

    // Example: Save to temporary file/database
    // In production use Firebase, Supabase, or another DB

    return res.status(200).json({ success: true, received: data });
  }

  if (req.method === "GET") {
    // Just a test route to fetch last data
    return res.status(200).json({ message: "Webhook is alive ✅" });
  }

  res.status(405).json({ error: "Method not allowed" });
}

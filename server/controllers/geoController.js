import fetch from "node-fetch";

export const reverseGeocode = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing lat or lon query parameter" });
    }

    // Allow setting a contact email via env to satisfy Nominatim policy
    const contact = process.env.NOMINATIM_EMAIL || "youremail@example.com";

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&format=json&email=${encodeURIComponent(contact)}`;

    const response = await fetch(url, {
      headers: {
        // Important: provide a User-Agent per Nominatim usage policy
        "User-Agent": `EcoLens/1.0 (contact: ${contact})`,
        Accept: "application/json",
      },
      // You could set an AbortController timeout here if desired
    });

    // If upstream returns a non-OK, attempt to read the body for diagnostics
    if (!response.ok) {
      let textBody = "";
      try {
        textBody = await response.text();
      } catch (e) {
        textBody = `<unable to read body: ${String(e)}>`;
      }
      console.error(`Nominatim responded ${response.status}:`, textBody);
      // If the body looks like HTML, forward a helpful message
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("text/html")) {
        return res.status(502).json({ error: "Upstream returned HTML (likely blocked or rate-limited)", bodyPreview: textBody.slice(0, 1000) });
      }
      return res.status(response.status).json({ error: "Reverse geocode upstream error", bodyPreview: textBody.slice(0, 1000) });
    }

    // Try parsing JSON; if parsing fails, read text and return for debugging
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const txt = await response.text();
      console.error("Unexpected content-type from Nominatim:", contentType, txt.slice(0, 1000));
      return res.status(502).json({ error: "Unexpected upstream content-type", contentType, bodyPreview: txt.slice(0, 1000) });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    console.error("Geo reverse error:", err);
    return res.status(500).json({ error: "Reverse geocode failed", details: String(err) });
  }
};

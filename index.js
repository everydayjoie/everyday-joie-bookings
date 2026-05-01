const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get("/", (req, res) => {
  res.send("Backend is working");
});

function cleanDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

app.post("/webhook", async (req, res) => {
  try {
    console.log("BODY:", JSON.stringify(req.body, null, 2));

    const email = req.body.customer_email || req.body.email || "";
    const name = req.body.customer_name || req.body.name || "";
    const service = req.body.service_name || req.body.service || "Scheduled Service";
    const start = cleanDate(req.body.start_time || req.body.start);
    const end = cleanDate(req.body.end_time || req.body.end);

    if (!email) {
      return res.status(400).send("Missing email");
    }

    const { error } = await supabase.from("appointments").insert([
      {
        customer_email: email,
        customer_name: name,
        service_name: service,
        start_time: start,
        end_time: end,
        status: "confirmed"
      }
    ]);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      return res.status(500).send(error.message);
    }

    return res.status(200).send("Saved");
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).send(err.message);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

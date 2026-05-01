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

app.post("/webhook", async (req, res) => {
  try {
    console.log("FULL BODY:", JSON.stringify(req.body, null, 2));

    const body = req.body || {};
    const data = body.data || {};
    const payload = body.payload || {};

    const email =
      body.customer_email ||
      body.email ||
      data.customer_email ||
      data.email ||
      payload.email ||
      payload.invitee?.email ||
      "";

    const name =
      body.customer_name ||
      body.name ||
      data.customer_name ||
      data.name ||
      payload.name ||
      payload.invitee?.name ||
      "";

    const service =
      body.service_name ||
      body.service ||
      data.service_name ||
      data.service ||
      payload.event_type?.name ||
      payload.scheduled_event?.name ||
      "Scheduled Service";

    const start =
      body.start_time ||
      body.start ||
      data.start_time ||
      data.start ||
      payload.scheduled_event?.start_time ||
      null;

    const end =
      body.end_time ||
      body.end ||
      data.end_time ||
      data.end ||
      payload.scheduled_event?.end_time ||
      null;

    if (!email) {
      console.log("NO EMAIL FOUND. BODY WAS:", JSON.stringify(req.body, null, 2));
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
      return res.status(500).send("Database error");
    }

    return res.status(200).send("Saved");
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).send("Server error");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

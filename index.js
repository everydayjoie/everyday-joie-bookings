const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

// Connect to Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is working");
});

// Calendly webhook
app.post("/webhook", async (req, res) => {
  try {
    const payload = req.body.payload;

    if (!payload) return res.sendStatus(400);

    await supabase.from("appointments").insert([
      {
        customer_email: payload.email,
        customer_name: payload.name,
        service_name: payload.event_type?.name || "Service",
        start_time: payload.scheduled_event?.start_time,
        end_time: payload.scheduled_event?.end_time,
        status: "confirmed",
        reschedule_url: payload.reschedule_url,
        cancel_url: payload.cancel_url
      }
    ]);

    console.log("Saved appointment");
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

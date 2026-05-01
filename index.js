const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get("/", (req, res) => {
  res.send("Backend is working");
});

app.post("/webhook", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const email = req.body.email;
    const name = req.body.name;
    const service = req.body.service;
    const start = req.body.start;
    const end = req.body.end;

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
      console.error("DB ERROR:", error);
      return res.status(500).send("Database error");
    }

    res.status(200).send("Saved");
  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).send("Server error");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});

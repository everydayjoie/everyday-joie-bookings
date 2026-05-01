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
    console.log("BODY:", req.body);

    const email = req.body.customer_email || req.body.email || "test@email.com";
    const name = req.body.customer_name || req.body.name || "";
    const service = req.body.service_name || req.body.service || "Scheduled Service";

    const { error } = await supabase.from("appointments").insert([
      {
        customer_email: email,
        customer_name: name,
        service_name: service,
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

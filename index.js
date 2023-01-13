const express = require("express");

const app = express();
app.use(express.json());

// application routes
const routes = require("./routes/routes");
app.use("/", routes.appRoutes);

// start application
const port = process.env.PORT || 6001;
app.listen(port, () => {
    console.log(`Service endpoint = http://localhost:${port}`);
});

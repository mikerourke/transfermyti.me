import bodyParser from "body-parser";
import express from "express";
import morgan from "morgan";

import { assignClockifyRoutes } from "./routes/clockify.mjs";
import { assignTogglRoutes } from "./routes/toggl.mjs";

export function startServer() {
  const app = express();

  console.log(process.env);

  const port = process.env.TMT_LOCAL_API_PORT || 9009;

  assignMiddleware(app);
  assignRoutes(app);

  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost/${port}`);

      resolve();
    });
  });
}

function assignMiddleware(thisApp) {
  // We don't care about CORS because this will only ever run locally:
  const allowCrossDomainMiddleware = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "*");

    next();
  };

  // Adds an artificial delay for API calls:
  const addDelayMiddleware = (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next();
    }

    let delayInMs = 100;

    // Increase the delay when performing the transfer:
    if (req.method === "POST" && /clockify/g.test(req.url)) {
      delayInMs = 1000;
    }

    setTimeout(() => {
      next();
    }, delayInMs);
  };

  thisApp.use(bodyParser.urlencoded({ extended: true }));
  thisApp.use(bodyParser.json());
  thisApp.use(morgan("dev"));

  thisApp.use(allowCrossDomainMiddleware);
  thisApp.use(addDelayMiddleware);
}

function assignRoutes(thisApp) {
  const clockifyRouter = new express.Router();
  assignClockifyRoutes(clockifyRouter);
  thisApp.use("/api/clockify", clockifyRouter);

  const togglRouter = new express.Router();
  assignTogglRoutes(togglRouter);
  thisApp.use("/api/toggl", togglRouter);

  thisApp.get("*", (req, res) => {
    res.status(200).send(null);
  });
}

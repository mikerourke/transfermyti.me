import express, { Router } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { assignClockifyRoutes } from './routes/clockify';
import { assignTogglRoutes } from './routes/toggl';

const app = express();

const port = process.env.LOCAL_API_PORT || 3005;

assignMiddleware(app);
assignRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost/${port}`);
});

function assignMiddleware(thisApp) {
  // We don't care about CORS because this will only ever run locally:
  const allowCrossDomainMiddleware = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', '*');

    next();
  };

  // Adds an artificial delay for API calls:
  const addDelayMiddleware = (req, res, next) => {
    if (req.method === 'OPTIONS') {
      return next();
    }

    let delayInMs = 250;

    // Increase the delay when performing the transfer:
    if (req.method === 'POST' && /clockify/g.test(req.url)) {
      delayInMs = 1000;
    }

    setTimeout(() => {
      next();
    }, delayInMs);
  };

  thisApp.use(bodyParser.urlencoded({ extended: true }));
  thisApp.use(bodyParser.json());
  thisApp.use(morgan('dev'));

  thisApp.use(allowCrossDomainMiddleware);
  thisApp.use(addDelayMiddleware);
}

function assignRoutes(thisApp) {
  const clockifyRouter = new Router();
  assignClockifyRoutes(clockifyRouter);
  thisApp.use('/api/clockify', clockifyRouter);

  const togglRouter = new Router();
  assignTogglRoutes(togglRouter);
  thisApp.use('/api/toggl', togglRouter);

  thisApp.get('*', (req, res) => {
    res.status(200).send(null);
  });
}

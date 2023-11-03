module.exports = ({ localMysqlServerPort, remoteDBConfig }) => {
  const path = require('path');
  global.appRoot = path.resolve(__dirname);

  const PORT = process.env.PORT || 8085

  const DataSyncer = require('./data-syncer');
  const config = require('./config');
  const restify = require('restify');
  const errors = require('restify-errors');
  const CookieParser = require('restify-cookies');
  const corsMiddleware = require('restify-cors-middleware');
  const dbConnection = require('./models/index')(localMysqlServerPort);
  const { services } = require('./services');

  const auth = require('./auth/auth');
  const router = require('./routes/index');

  const bots = require('./bots/index');
  bots.init();

  const server = restify.createServer();

  server.use(CookieParser.parse);
  const cors = corsMiddleware({
    preflightMaxAge: 5, //Optional
    origins: ['*'],
    allowHeaders: ['Authorization'],
    exposeHeaders: ['API-Token-Expiry']
  });
  server.pre(cors.preflight);
  server.use(cors.actual);

  server.use((req, res, next) => {
      if(req.route.path == '/auth' || req.route.path == '/stats' || req.route.path.split('/')[1] == 'download'){
        return next();
      }else{
        const token = req.headers['authorization'] || '---';
        auth.checkToken(token).then(userId => {
          if (userId || config.debug){
            req.userId = userId || 0;
            next();
          }else{
            return next(new errors.UnauthorizedError());
          }
        }).catch(error => {
          console.log('Error:', error);
        });
      }
    }
  );

  server.use(restify.plugins.queryParser());
  server.use(restify.plugins.bodyParser({ mapParams: false, requestBodyOnGet: true }));

  router(server);

  server.on('error', err => console.error(err))

  services.init(server);

  server.listen(PORT, function() {
      console.log('%s listening at %s', server.name, server.url);
      // initDataSyncer();
  });

  function initDataSyncer(){
    console.log('Starting data syncer service...');
    DataSyncer.init(dbConnection, remoteDBConfig).then(() => {
      DataSyncer.start();
      console.log('Data syncer service started!');
    });
  }

  const TESTING = require('./TESTING');
  setTimeout(() => TESTING.do(), 1000);
}
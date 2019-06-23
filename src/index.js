const { createWrapper } = require('./loaderWrapper');
const { connect } = require('./db');
const server = require('./server');

const config = {
  host: process.env.HOST,
  port: process.env.PORT,
  dbString: process.env.DATABASE_URL
};

//connect to the database
connect(config.dbString)
  .then(client => {
    config.dbClient = client;
    //when db is connected, create the stats object to handle loading files
    return createWrapper(config.dbClient);
  })
  .then(loadFiles => {
    config.loadFiles = loadFiles;
    server.start(config);
  });
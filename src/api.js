module.exports = (app, options) => {
  
  //end point to calculate intersection between two files
  app.get('/intersection', (req, res) => {
    if(!req.query.fileA || !req.query.fileB) {
      res.status(400).json({msg: 'query params file1 and file2 are required'})
    }

    options.loadFiles([req.query.fileA, req.query.fileB])
      .then( results => {
        res.status(200).json(results);
      })
      .catch(err => {
        console.log(err)
        res.status(500).json({error: 'Error trying to process files'});
      })
  });

  //end point to get past results
  app.get('/results', (req, res) => {

    options.dbClient.query('SELECT * FROM RESULTS')
      .then( results => {
        res.status(200).json(results);
      })
      .catch(err => {
        res.status(500).json({error: 'Error trying to fetch results files'});
      })
  });
}
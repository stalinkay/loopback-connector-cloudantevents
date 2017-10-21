var cloudant = require('cloudant');

/*
 Constructor
 */
function cloudantInboundConnector(dataSourceProps){
  this.cloudantInstance     = cloudant(dataSourceProps.url);
  this._models =  {};
}

exports.initialize = function (dataSource, callback) {

  var dataSourceProps = dataSource.settings || {}; // The settings is passed in from the dataSource
  dataSource.connector = new cloudantInboundConnector(dataSourceProps); // Construct the connector instance
  dataSource.connector.dataSource = dataSource; // Hold a reference to dataSource

  process.nextTick(function () {
    callback && callback();
  });
}

function CustomDAO(){};

cloudantInboundConnector.prototype.DataAccessObject = CustomDAO;

CustomDAO.start = function (listenerEmitter,callback) {
  console.log(this.modelName);
  var modelName = this.modelName;
  var cloudantIns = this.dataSource.connector.cloudantInstance;
  var db = cloudantIns.db.use(modelName);
  this.feed = db.follow({include_docs: true, since: "now"});
  this.feed.on('change', function (change) {
    console.log(change.doc);
    listenerEmitter.emit('eventMessage',modelName,change.doc);
  });
  this.feed.follow();
};

CustomDAO.stop = function (callback) {
  console.log(this.modelName);
  this.feed.stop();
};

const dbConnection = require('../dbconnection/DBConnection');
const dbConfig = require('../config/DBConfig').dbConfig;

class loanWorker {
  
  static async getloan() {
    try {
      const selectedCollection = await dbConnection(dbConfig.collection);
      let result = await selectedCollection.find({}).toArray();
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  
}

module.exports = loanWorker;

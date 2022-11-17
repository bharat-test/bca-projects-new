const dbConnection = require('./../dbconnection/DBConnection');
const dbConfig = require('./../config/DBConfig').dbConfig;

class balanceWorker {
  
  static async getbalance(num) {
    try {
      const selectedCollection = await dbConnection(dbConfig.customers);
      let result = await selectedCollection.find({"phone":num}).limit(1).toArray();
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  static async gettransaction(ac_no) {
    try {
      const selectedCollection = await dbConnection(dbConfig.transaction);
      let result = await selectedCollection.find({"ac_no":ac_no}).sort({"payment_date":-1}).limit(5).toArray();
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = balanceWorker;

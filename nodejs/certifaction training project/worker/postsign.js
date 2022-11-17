const dbConnection = require('../dbconnection/DBConnection');
const dbConfig = require('../config/DBConfig').dbConfig;
const axios = require('axios');
const { json } = require('body-parser');

class postsign {
  
  static async sign(base64,name) {
    try {
        
        //const json = JSON.stringify();
       //  data = JSON.stringify(data)
        let result = await axios.post(
            'https://test.zoop.one/contract/esign/v4/aadhaar/init',
            {
                'document': {
                     'data': base64,
                     'info': 'Bad Habits'
                 },
                 'signer_name': name,
                 'signer_email': 'kiranpandiya18@gmail.com',
                 'signer_city': 'mumbai',
                'purpose': 'Purpose of transaction, Mandatory',
                 'response_url': 'https://webhook.site/e7d48f25-1a26-4c7b-8019-da4952a3cafe',
                 'redirect_url': 'http://api.webhookinbox.com/i/HYWEYJTT/in/'
             },
            {
                headers: {
                    'app-id': '636cce4ff94eab001d6ae8fd',
                    'api-key': 'H3VZ9KY-Z4ZMQ9B-KMRQ5KA-NDN09X2',
                    'Content-Type': 'application/json'
                }
            }
        );
        
      return result;
    } catch (error) {
      console.log(error);
    }
  }
  
}

module.exports = postsign;

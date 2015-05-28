console.log("API key example start");
var API_KEY = process.env.API_KEY;
var API_SECRET = process.env.API_SECRET;
var ACCESS_TOKEN = "";

var MaiCoinClient = require("./maicoin");
var client = new MaiCoinClient();

//Result callback
var result = function(res){
  console.log(JSON.stringify(res));
};

console.log("Prices");
//client.prices(result);
//client.prices("TWD", result);
//client.prices("USD", result);

console.log("Currencies");
//client.currencies(result);

console.log("Authentication");
//client.user(result);

client = new MaiCoinClient(API_KEY, API_SECRET, ACCESS_TOKEN);
console.log("Account");
client.user(result);
//client.balance(result);
//client.receiveAddress(result);
//client.addresses(result);
//client.generateReceiveAddress(result);
//client.createAccountPin("1234", result);
//client.updateAccountPin("1234", "1234", result);

console.log("Order");
//client.orders(result);
//client.orders(1, 2, result);
//client.order("29cc1be74eae927f5d5833707d21b9d4842f56779a243ca3", result);
//client.buyOrder(0.123, result);
//client.sellOrder(0.01, result);

console.log("Transaction");
//client.transactions(result);
//client.transactions(1, 2, result);
//client.transaction("88871b949c6a7613b0c0b03fafb559ff88b658d9a5f33883", result);
//client.requestTransaction('yutelin@gmail.com', 0.1234, 'btc', 'Show me the coin', result);
//client.cancelRequestTransaction('5f2bd94800f9033156b5b076209fd5f50d0bec457a9b4e6a', result);
//client.approveRequestTransaction("308e6533ff88cc2fab643a232a6933fc6dabbf7fadb3b735", "1234", result);

console.log("Checkout");
//var param = client.createCheckoutParam(150, "twd", "http://my.com/return",
//  "http://my.com/cancel", "http://my.com/callback", "mer_id_123", "my pos data", "en");
//param = client.setCheckoutBuyerParam(param, "YL", "ad1", "ad2", "palo alto", "ca", "1234", "us", "abc@example.com", "650493949843");
//param = client.addCheckoutItemParam(param, "desc1", "code1", "124", "twd", "true");
//param = client.addCheckoutItemParam(param, "desc2", "code2", "4556", "usd", "false");
////console.log(JSON.stringify(param));
//client.createCheckout(param, result);
//client.checkouts(result);
//client.checkouts(1, 2, result);
//client.checkout("MAI_a8dcec9e83fbadc3d9ab74b8183f425cc6538f213e84", result);

console.log("Access token example start");
var API_KEY = "";
var API_SECRET = "";
var ACCESS_TOKEN = process.env.ACCESS_TOKEN;
client = new MaiCoinClient(API_KEY, API_SECRET, ACCESS_TOKEN);
console.log("Account");
client.user(result);



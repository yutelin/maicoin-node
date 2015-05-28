var overload = require("node-overload");
var request = require('request');
var crypto = require('crypto');
var fs = require("fs");
var https = require("https");
var url = require("url");

var BASE_URI =  "https://api.maicoin.com/v1";

var MaiCoinClient = function (apiKey, apiSecret, accessToken){
  this.apiKey = typeof apiKey !== 'undefined' ? apiKey : "";
  this.apiSecret = typeof apiSecret !== 'undefined' ? apiSecret : "";
  this.accessToken = typeof accessToken !== 'undefined' ? accessToken : "";
}

/********** Private ***********/
MaiCoinClient.prototype.getHttpsCa = function(){
  if (this.httpsCa === undefined || this.httpsCa == null) {
    this.httpsCa = fs.readFileSync("./ca-maicoin.crt")
  }
  return this.httpsCa;
};

MaiCoinClient.prototype.getHttpsAgent = function(){
  if (this.httpsAgent === undefined || this.httpsAgent == null) {
    var urlObjects = url.parse(BASE_URI);
    this.httpsAgent = new https.Agent({ host: urlObjects.hostname, port: 443, ca: this.getHttpsCa() });
  }
  return this.httpsAgent;
};

MaiCoinClient.prototype.httpVerb = function(verb, path, options, next){
  if (options === undefined || options == null) {
    options = {};
  }
  var requestOptions = {};

  if( verb == "GET" || verb == "DELETE") {
    var queryString = "";
    var keys = Object.keys(options).sort();
    for (var i=0; i < keys.length; i++){
      var key = keys[i];
      if (queryString.length > 0) {
        queryString += "&";
      }
      queryString += key + "=" + encodeURIComponent(options[key]);
    }
    if (queryString.length > 0) {
      queryString = "?" + queryString;
    }
    path += queryString;
  }
  var url = BASE_URI + path;

  if(this.apiKey.length > 0 && this.apiSecret.length > 0){
    //1. Get nonce
    var nonce = options["nonce"];
    if (nonce === undefined) {
      nonce = new Date().getTime()*1000;
    }

    //2. Generate path and get signature
    var hmacMessage = "";
    if( verb == "GET" || verb == "DELETE") {
      hmacMessage = nonce + BASE_URI + path;
    } else {
      hmacMessage = nonce + BASE_URI + path + JSON.stringify(options);
    }
    var signature = crypto.createHmac('sha256', this.apiSecret).update(hmacMessage).digest('hex');
    //3. Http request
    requestOptions = {
      url: url,
      headers: {
        "ACCESS_KEY" : this.apiKey,
        "ACCESS_SIGNATURE" : signature,
        "ACCESS_NONCE" : nonce
      }
    };
  } else {
    requestOptions = {
      url: url,
      headers: {
        "AUTHORIZATION" : "Bearer " + this.accessToken
      }
    };
  }

  var requestCallback = function(err, response, body) {
    if ( err ) {
      console.log(err);
      console.log(response);
      console.log(body);
      return next(err);
    } else {
      var json = JSON.parse(body);
      next(json);
    }
  }

  if( BASE_URI != "http://127.0.0.1:3000/v1" && false) {
    requestOptions.ca = [this.getHttpsCa()];
    requestOptions.agent = this.getHttpsAgent();
  }
  if (verb == "GET") {
    request.get(url, requestOptions, requestCallback);
  } else if(verb == "DELETE") {
    request.del(url, requestOptions, requestCallback);
  } else if(verb == "POST") {
    requestOptions.body = JSON.stringify(options);
    request.post(url, requestOptions, requestCallback);
  } else if(verb == "PUT") {
    requestOptions.body = JSON.stringify(options);
    request.put(url, requestOptions, requestCallback);
  }
};

MaiCoinClient.prototype.httpGet = function(path, options, next){
  return this.httpVerb("GET", path, options, next);
};

MaiCoinClient.prototype.httpPost = function(path, options, next){
  return this.httpVerb("POST", path, options, next);
};

MaiCoinClient.prototype.httpPut = function(path, options, next){
  return this.httpVerb("PUT", path, options, next);
};

MaiCoinClient.prototype.httpDelete = function(path, options, next){
  return this.httpVerb("DELETE", path, options, next);
};


/********** Start of API **********/

/***** Prices *****/
overload.add(MaiCoinClient.prototype, "prices", 2, function(currency, next) {
  var path = "/prices/" + currency;
  return this.httpGet(path, null, next);
});

overload.add(MaiCoinClient.prototype, "prices", 1, function(next) {
  return this.prices("TWD", next);
});

/***** Currencies *****/
MaiCoinClient.prototype.currencies = function(next) {
  var path = "/currencies";
  return this.httpGet(path, null, next);
};

/***** Account *****/
MaiCoinClient.prototype.user = function(next) {
  var path = "/user";
  return this.httpGet(path, null, next);
};

MaiCoinClient.prototype.balance = function(next) {
  path = "/account/balance";
  return this.httpGet(path, null, next);
};

MaiCoinClient.prototype.receiveAddress = function(next) {
  var path = "/account/receive_address/btc";
  return this.httpGet(path, null, next);
};

MaiCoinClient.prototype.addresses = function(next) {
  var path = "/account/addresses";
  return this.httpGet(path, null, next);
};

MaiCoinClient.prototype.generateReceiveAddress = function(next) {
  var path = "/account/receive_address";
  var options = {currency: "btc"};
  return this.httpPost(path, options, next);
};

MaiCoinClient.prototype.createAccountPin = function(pin, next) {
  var path = "/user/account_pin";
  var options = {pin: pin};
  return this.httpPost(path, options, next);
};

MaiCoinClient.prototype.updateAccountPin = function(oldPin, newPin, next) {
  var path = "/user/account_pin";
  var options = {old_pin: oldPin, new_pin: newPin};
  return this.httpPut(path, options, next);
};

/***** Orders *****/
overload.add(MaiCoinClient.prototype, "orders", 3, function(limit, page, next) {
  var path = "/orders";
  return this.httpGet(path, {page: page, limit: limit}, next);
});

overload.add(MaiCoinClient.prototype, "orders", 1, function(next) {
  return this.orders(25, 1, next);
});

MaiCoinClient.prototype.order = function(txid, next) {
  var path = "/orders/"+txid;
  return this.httpGet(path, null, next);
};

MaiCoinClient.prototype.buyOrder = function(amount, next) {
  var path = "/orders";
  var options = {amount: amount, currency: "btc", type: "buy"};
  return this.httpPost(path, options, next);
};

MaiCoinClient.prototype.sellOrder = function(amount, next) {
  var path = "/orders";
  var options = {amount: amount, currency: "btc", type: "sell"};
  return this.httpPost(path, options, next);
};

/***** Transactions *****/
overload.add(MaiCoinClient.prototype, "transactions", 3, function(limit, page, next) {
  var path = "/transactions";
  return this.httpGet(path, {page: page, limit: limit}, next);
});

overload.add(MaiCoinClient.prototype, "transactions", 1, function(next) {
  return this.transactions(25, 1, next);
});

MaiCoinClient.prototype.transaction = function(txid, next){
  var path = "/transactions/" + txid;
  return this.httpGet(path, null, next);
};


MaiCoinClient.prototype.requestTransaction = function(address, amount, currency, notes, next) {
  var path = "/transactions";
  var options = { amount: amount,
              address: address,
              currency: currency,
              type: "request",
              notes: notes};
  return this.httpPost(path, options, next);
};

MaiCoinClient.prototype.cancelRequestTransaction = function(txid, next){
  var path = "/transactions/" + txid;
  return this.httpDelete(path, null, next);
};

MaiCoinClient.prototype.approveRequestTransaction = function(txid, pin, next) {
  var path = "/transactions/"+txid+"/approve";
  var options = { account_pin: pin};
  return this.httpPut(path, options, next);
};

/***** Checkout *****/
MaiCoinClient.prototype.createCheckoutParam = function(amount, currency,
  returnUrl, cancelUrl, callbackUrl, merchantRefId, posData, locale){
  var param = {
    checkout:{
      amount: amount,
      currency: currency,
      cancel_url: cancelUrl,
      return_url: returnUrl,
      callback_url: callbackUrl,
      locale: locale,
      merchant_ref_id: merchantRefId,
      pos_data: posData,
      items: []
    }
  }
  return param;
}

MaiCoinClient.prototype.setCheckoutBuyerParam = function(param,
  name, address1, address2, city, state, zip, country, email, phone){
  var buyer = {
    buyer_name: name,
    buyer_address1: address1,
    buyer_address2: address2,
    buyer_city: city,
    buyer_state: state,
    buyer_zip: zip,
    buyer_country: country,
    buyer_email: email,
    buyer_phone: phone,
  }
  param["checkout"]["buyer"] = buyer
  return param;
}

MaiCoinClient.prototype.addCheckoutItemParam = function(param,
  description, code, price, currency, isPhysical){
  var item = {
    item: {
      description: description,
      code: code,
      price: price,
      currency: currency,
      is_physical: isPhysical
    }
  }
  param["checkout"]["items"].push(item)
  return param;
}

MaiCoinClient.prototype.createCheckout = function(param, next) {
  var path = "/checkouts";
  return this.httpPost(path, param, next);
};

overload.add(MaiCoinClient.prototype, "checkouts", 3, function(limit, page, next) {
  var path = "/checkouts";
  return this.httpGet(path, {page: page, limit: limit}, next);
});

overload.add(MaiCoinClient.prototype, "checkouts", 1, function(next) {
  return this.checkouts(25, 1, next);
});

MaiCoinClient.prototype.checkout = function(uid, next) {
  var path = "/checkouts/"+uid;
  return this.httpGet(path, null, next);
};

/********** End of API **********/

module.exports = MaiCoinClient;
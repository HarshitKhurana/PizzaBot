var express = require('express')
var bodyParser = require('body-parser')
var util = require('util')
var app = express();

/*
Author: Harshit

This is a simple node-express based back-end for YoYo Pizza Bot(A pizza ordering chatbot).
It has 2 functionalities:
    1. User can order a new pizza
        -> API will return the order_id.
    2. User can ask for the status of pizza.
        -> API will return time left in completion of the pizza.

Note: Pizza order completion takes 3 minutes(hard-coded).
*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var absPath = "./";
var global_order_id = 1234;
var completion_time = 3 * 60;   // 3 minutes

var redis = require('redis');
var client = redis.createClient();

var clientGet = util.promisify(client.get).bind(client);

function insert_in_db(user_name, user_number, pizza_type, order_id, order_time) {
    order_id = String(order_id);
    row_json = {
        "user_name": user_name,
        "user_number": user_number,
        "pizza_type": pizza_type,
        "order_time": order_time,
        "order_id": order_id
    };
    console.log("insert in redis: ", row_json);
    client.set(order_id, JSON.stringify(row_json) , function(err, redisData) {
        console.log ("REDIS REPLY : " , redisData);
        if (redisData == undefined) {
            console.log ("REDIS returned empty|null|undefined\n")
        }
    });
}

app.get("/" , function (req , res){
  console.log ("request on '/' : ");
  res.sendFile(__dirname + '/index.html'); // __dirname is a method of global object
  return;
});

app.get('/new_order' , function(req,res){
    console.log ('Requested /new_order: ',req.query)
    let user_name = req.query.user_name;
    let pizza_type = req.query.pizza_type;
    let user_number = req.query.user_number;
    let order_id = global_order_id;
    let order_time = Math.floor(Number(new Date)/1000);  // In seconds
    global_order_id += 1;

    console.log ("pizza_type : ", pizza_type)
    insert_in_db (user_name, user_number, pizza_type , order_id , order_time);
    let response_str = "Order Confirmed! Your order id is: " + String(order_id);
    console.log(response_str);
    res.json({"response": response_str});
});


async function get_order_state(order_id) {
    order_id = String(order_id);
    console.log("order_id as key in redis: ", order_id);
    let order_time = "";
    try{
        data = await clientGet(order_id) 
        data = JSON.parse(data);
        return data["order_time"];
    }catch(e){
        console.log(e);
        return -1;
    }
}

app.get('/order_status' , async function(req,res){
    console.log ('Requested /order_status: ',req.query)
    let order_id = req.query.order_id;
    if (order_id == "")
        res.json({'response':'order_id not found'});
    order_id = String(order_id);
    console.log(order_id)
    let curr_time = Math.floor(Number(new Date)/1000);  // In seconds
    let order_time = -1;

    order_time = await get_order_state(order_id);
    console.log("order_time: ", order_time);
    console.log("curr _time: ", curr_time);
    let response_str = "";
    if (order_time == -1)
        response_str = "Order ID not found"
    else if ( order_time + completion_time <= curr_time)
        response_str = "Yayy! Order Completed"
    else {
        diff = Math.floor((order_time+completion_time)-curr_time);
        response_str = "Your pizza will be ready in " + String(diff) + " seconds";
    }
    res.json({"response": response_str});
});


client.on('connect', function() {

  console.log('connected to redis');
});

app.listen(80, function (req , res) {
    console.log ("__dirname : " , __dirname)
    console.log ("Server started on http://127.0.0.1:80")
});

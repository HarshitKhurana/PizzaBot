var express = require('express')
var bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var absPath = "./";
var global_order_id = 1234;
var completion_time = 3 * 60;   // 3 minutes

var redis = require('redis');
var client = redis.createClient();

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
        else {
            client.get(order_id)
        }
    });
}

function get_order_state(order_id) {
        order_id = String(order_id);
        console.log("order_id as key in redis: ", order_id);
        let order_time = "";
        client.get(order_id , function(err, data) {
        if (err) {
            console.log ("Error pulling form redis: ",err);
            return -1;
        }
        else {
            console.log("redis out: ", data);
            return order_time;
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
    res.json({"order_id": order_id});
});

app.get('/order_status' , function(req,res){
    console.log ('Requested /order_status: ',req.query)
    let order_id = req.query.order_id;
    if (order_id == "")
        res.json({'response':'order_id not found'});
    let curr_time = Number(new Date)/1000;  // In seconds
    let order_time =  131323232;
    order_time = get_order_state(order_id);
    let response_str = "";
    if (order_time == -1)
        response_str = "Order ID not found"
    else if ( order_time + completion_time >= curr_time)
        response_str = "Yayy! Order Completed"
    else {
        diff = Math.floor(curr_time-order_time);
        response_str = "Your pizza will take " + String() + "seconds more";
    }
    res.json({"response": response_str});
});


client.on('connect', function() {
  console.log('connected to redis');
});

app.listen(8080, function (req , res) {
    console.log ("__dirname : " , __dirname)
    console.log ("Server started on http://127.0.0.1:8080")
});

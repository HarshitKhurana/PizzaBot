
#!/usr/bin/python3

from flask import Flask           # import flask
app = Flask(__name__)             # create an app instance

'''
Author: Harshit

This is a simple flask based back-end for YoYo Pizza Bot(A pizza ordering chatbot).
It has 2 functionalities:
    1. User can order a new pizza
        -> API will return the order_id.
    2. User can ask for the status of pizza.
        -> API will return time left in completion of the pizza.

Note: Pizza order completion takes 3 minutes(hard-coded).
'''
pizza_completion = 180          # Seconds for pizza completion
order_id_counter = 1234         # Random initial value for order_id


def insert_in_db(user_name, user_number, pizza_type, curr_time, order_id):
    '''
    This function inserts into database the details as required.
    With 'order_id' being the primary key for database.
    '''

@app.route("/")   
def home():
    return app.send_static_file('index.html')   # index.html contains dialogflow iframe

@app.route ("/new_order", methods = ["POST"])
def new_order():
    global order_id_counter
    user_name = ""
    pizza_type = ""
    user_number = ""
    current_time = int(time.time()) # Epoch time in seconds
    order_id = order_id_counter
    order_id_counter = order_id_counter + 1
    if (request.method == 'POST'):
        data = request.get_json(silent=True)
        user_name     = data["parameters"]["user_name"] 
        user_number   = data["parameters"]["user_number"] 
        pizza_type    = data["parameters"]["pizza_type"] 
        insert_in_db(user_name, user_number, pizza_type, curr_time, order_id)
        return order_id
  else:
      return render_template('404.html'), 404

@app.route ("/order_status", methods = ["POST"])
def order_status():
    '''
    This function is called when a request comes on end-point: '/order_status'.
    This checks whether the order_id is completed or not.
    '''

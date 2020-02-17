#! README

* This is back-end for a simple YoYo Pizza Chatbot.
* It uses REDIS as is back-end as a database for storing pizza orders.
* It uses dialogFlow API for chatbot functionality.

[\*] **Usage**:

* The user can use the chatbot for 
    * ordering of Pizza.
    * Asking for order status of previously ordered pizza.

[\*] **Installation**:

* Simply install all the packages using nodejs.

```bash
npm install
```

* Redis installation
    * Use docker
        * Install docker from package manager.
        * Execute the following commands to install redis docker image
        
        ```bash
        $ docker pull redis
        ```
        * Once installed, in order to run docker, execute:

        ```bash
        $ docker run -it -p 6379:6379 redis     
        # This will not persist the dataa and once the container goes down, data would be lost.
        # Incase you need to persist the storage, you would need to mount the volumes.
        ```
    
    * redis server install

    ```bash
    $ sudo apt-get -y install redis-server    # ubuntu
    ```

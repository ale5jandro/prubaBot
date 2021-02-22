//EMPIEZO CON 10 ETHER


var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

let upInRow=3
let downInRow=3

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });

    connection.on('ping', function(cancel, data){
        connection.pong(data)
    });

    connection.on('message', function(message) {
        

        let op = checkPrice(JSON.parse(message.utf8Data))
        if(op === "comprar" && !prices[JSON.parse(message.utf8Data).s].own){
            if(!total) total = 10 * parseFloat(JSON.parse(message.utf8Data).c)
            console.log("compro a ", JSON.parse(message.utf8Data).c)
            total -= 10*parseFloat(JSON.parse(message.utf8Data).c)
            prices[JSON.parse(message.utf8Data).s].own=true
            console.log("NUEVO TOTAL ", total)
        }
        else if(op === "vender" && prices[JSON.parse(message.utf8Data).s].own){
            console.log("vendo a ", JSON.parse(message.utf8Data).c)
            total += parseFloat(10*JSON.parse(message.utf8Data).c)
            prices[JSON.parse(message.utf8Data).s].own=false
            console.log("NUEVO TOTAL ", total)
        }
        
    });
    
    // function sendNumber() {
    //     if (connection.connected) {
    //         var number = Math.round(Math.random() * 0xFFFFFF);
    //         connection.sendUTF(number.toString());
    //         setTimeout(sendNumber, 1000);
    //     }
    // }
    // sendNumber();
});

client.connect('wss://stream.binance.com:9443/ws/etheur@ticker');




/*
{
    "e": "24hrTicker",  // Event type
    "E": 123456789,     // Event time
    "s": "BNBBTC",      // Symbol
    "p": "0.0015",      // Price change
    "P": "250.00",      // Price change percent
    "w": "0.0018",      // Weighted average price
    "x": "0.0009",      // First trade(F)-1 price (first trade before the 24hr rolling window)
    "c": "0.0025",      // Last price
    "Q": "10",          // Last quantity
    "b": "0.0024",      // Best bid price
    "B": "10",          // Best bid quantity
    "a": "0.0026",      // Best ask price
    "A": "100",         // Best ask quantity
    "o": "0.0010",      // Open price
    "h": "0.0025",      // High price
    "l": "0.0010",      // Low price
    "v": "10000",       // Total traded base asset volume
    "q": "18",          // Total traded quote asset volume
    "O": 0,             // Statistics open time
    "C": 86400000,      // Statistics close time
    "F": 0,             // First trade ID
    "L": 18150,         // Last trade Id
    "n": 18151          // Total number of trades
  }
  */


//////////////////FUNCIONES/////////////////
let total = null
let prices = {}

function checkPrice(obj){
    // console.log(obj)
    if(prices[obj.s] && prices[obj.s].values[prices[obj.s].values.length-1]==parseFloat(obj.c)) return//controlo de no guardar precios q no cambiaron

    // if(prices[obj.s]) console.log("STATUS "+ prices[obj.s].values +", newPrice: " + obj.c)

    if(prices.hasOwnProperty(obj.s)){//checkeo q no sea el primer precio
        if(prices[obj.s].status === "up"){//viene subiendo
            if(prices[obj.s].values.every((o)=>{return o<parseFloat(obj.c)})){//controlo q todos los anteriores sean menores
                if(prices[obj.s].values.length>=upInRow){//checkeo q tenga tres datos anteriores        
                    prices[obj.s].values.shift()
                    prices[obj.s].values.push(parseFloat(obj.c))
                    return "comprar"
                }
                else{
                    prices[obj.s].values.push(parseFloat(obj.c))
                    return
                }
            }
            else{
                prices[obj.s].status="down"
                prices[obj.s].values=[parseFloat(obj.c)]
                return
            }
        }
        else{//viene bajando
            if(prices[obj.s].values.every((o)=>{return o>parseFloat(obj.c)})){//controlo q todos los anteriores sean mayores
                if(prices[obj.s].values.length>=downInRow){//checkeo q tenga tres datos anteriores        
                    prices[obj.s].values.shift()
                    prices[obj.s].values.push(parseFloat(obj.c))
                    return "vender"
                }
                else{
                    prices[obj.s].values.push(parseFloat(obj.c))
                    return
                }
            }
            else{
                prices[obj.s].status="up"
                prices[obj.s].values=[parseFloat(obj.c)]
                return
            }
        }
    }
    else{
        let newCoin = {
            values:[parseFloat(obj.c)],
            status:"up",
            own:false
        }
        prices[obj.s]=newCoin
    }
    return
}


////////////////////////////////////////////




function buy(coin){

}

//{{url}}/api/v3/order/test?symbol=BTCBUSD&side=BUY&type=MARKET&quoteOrderQty=10&timestamp={{timestamp}}&signature={{signature}}

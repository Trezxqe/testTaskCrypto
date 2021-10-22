const express = require('express');
const axios = require('axios');
require('dotenv').config()

const app = express();

const PORT = process.env.PORT;


// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// axios('https://api.etherscan.io/api?module=proxy&action=eth_blockNumber')
//   .then(res => console.log(res.result))
//   .catch(err => console.error(err))

// axios(`https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x10d4f&boolean=true&apikey=${process.env.API_KEY}`)
//   .then(res => console.log(res.transactions[1]))
//   .catch(err => console.error(err))

// axios(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.API_KEY}`)
//   .then(res => console.log(res))
//   .catch(err => console.error(err))
// https://api.etherscan.io/api?module=proxy&action=eth_blockNumber
// var block = api.proxy.eth_blockNumber();
// console.log(block);

app.listen(PORT, () => {
  console.log('server listen', PORT);
});

const express = require('express');
const axios = require('axios');
require('dotenv').config()

var co = require('co');
var api = require('etherscan-api').init(`${process.env.API_KEY}`);
const app = express();

const PORT = process.env.PORT;


// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// helper
function roughScale(x, base) {
  const parsed = parseInt(x, base);
  if (isNaN(parsed)) { return 0; }
  return parsed * 100;
}

// запрос с целью получить номер последнего блока
axios(`https://api.etherscan.io/api?module=proxy&action=eth_blockNumber&apikey=${process.env.API_KEY}`)
  .then(res => {
    // преобразовываем в десятичное число, срезая 0х - первые 2 символа
    return roughScale(res.data.result.slice(2), 16)
  })
  .then((blockNum) => {
    const dataObj = {};
    // получаем десятичное число
    const blockDec = blockNum.toString().slice(0, -2)

    // с помощью функции-генератора настраиваем задержку между запросами, шлём сами запросы
    function* waitAndAxios(blockDec) {
      for (let i = blockDec - 99; i <= blockDec; i++) {
        // преобразовываем обратно в шестнадцатиричную систему, чтобы использовать номер блока в axios-запросе
        const blockHex = Number(i).toString(16)
        // настраиваем задержку между запросами с помощью функции-генератора(иначе крашится, сетТаймауты тоже не дали результата)
        yield function (sendAxios) {
          setTimeout(sendAxios, 1 * 1000);
        }

        console.log('sending a request');
        //шлём запрос на каждый из 100 последних блоков
        axios(`https://api.etherscan.io/api?module=proxy&action=eth_getBlockByNumber&tag=0x${blockHex}&boolean=true&apikey=${process.env.API_KEY}`)
          .then(res => {
            console.log(res.data.result.transactions[0].value)
            //формируем объект с полученными данными
            dataObj[res.data.result.transactions[0].from] = res.data.result.transactions[0].value
          })
          .catch(console.error)
      }
      console.log(dataObj);
      // находим наибольшее значение в объекте
      function getTheMostValue(dataObj) {
        const valueArrHex = [];
        for (let key in dataObj) {
          // заполняем массив данными "значения" из пары ключ-значение
          valueArrHex.push(dataObj[key]);
        }

        // преобразовываем массив с 16-ричными в 10-ричный массив
        const valueArrDec = valueArrHex.map((el) => roughScale(el, 16));
        // находим в нём максимум
        maxOfArrDec = valueArrDec.reduce((a, b) => a > b ? a : b);
        // преобразовываем обратно в 16-ричный
        maxOfArrHex = (maxOfArrDec / 100).toString(16)
        console.log('maxOfArrHex', maxOfArrHex)

        //ищем ключ из объекта, который соответствует максимальному значению
        const key = Object.keys(dataObj).find(key => dataObj[key] === `0x${maxOfArrHex}`);
        console.log('The adress with the most value of 100 last transactions is:', key)
      }
      getTheMostValue(dataObj);
    }
    // вызываем функцию генератор, для наших запросов
    co(function* () {
      yield waitAndAxios(blockDec);
    });
  })
  .catch(err => console.error(err))



app.listen(PORT, () => {
  console.log('server listen', PORT);
});

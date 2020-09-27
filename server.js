var compression = require('compression');
const express = require('express');
const SSE = require('express-sse');
const cors = require('cors');
const { setegid } = require('process');
const { clearInterval } = require('timers');
const app = express();
app.use(cors());
app.use(compression());
var sse = new SSE(['Connection from SSE']);
app.get('/rates', sse.init);
let interval;
app.get('/ticker/:currency/:fiat', (req, res) => {
  const currency = req.params.currency;
  const fiat = req.params.fiat;
  console.log('In ticker ' + currency);
  interval = setInterval(() => {
    console.log('In interval with ' + currency + fiat);
    require('axios')
      .get(
        `https://api.nomics.com/v1/currencies/ticker?key=demo-26240835858194712a4f8cc0dc635c7a&ids=${currency}&interval=1d,30d&convert=${fiat}`
      )
      .then((response) => {
        sse.send(
          [response.data[0].price, response.data[0].price_timestamp],
          `rateUpdate-${currency}-${fiat}`
        );
        console.log(` Sent Event: rateUpdate-${currency}-${fiat}`);
      });
  }, 1000);
});

app.get('/stop' ,(req,res) => {
  clearInterval(interval);
  res.send(200)
})

const server = app.listen(4000, function () {
  console.log('CORS-enabled web server listening on port 4000');
});

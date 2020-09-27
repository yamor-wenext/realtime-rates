import React, { useState } from 'react';
import './App.css';

function App() {
  const [rate, setRate] = useState();
  const [currency, setCurrency] = useState('BTC');
  const [fiat, setFiat] = useState('EUR');
  const [isLoading, setIsLoading] = useState(false);
  const [isDisplaying, setIsDisplaying] = useState(false);
  const [date, setDate] = useState();
  let prevCurrency = 'BTC';
  let prevFiat = 'EUR';

  let eventSource = new EventSource(`http://localhost:4000/rates`);
  eventSource.onmessage = (event) => {
    console.log('Message received! ' + event.data);
  };

  const updateRate = (event) => {
    setIsLoading(false);
    console.log('Update from event listener ' + event.data);
    const date = event.data
      .substr(event.data.indexOf(','), event.data.length)
      .replace('"', '')
      .replace(']', '')
      .replace('"', '')
      .replace(',', '')
      .replace('T', ' ')
      .replace('Z', ' UTC+0');
    setDate(date);
    const rate = event.data
      .substr(0, event.data.indexOf(','))
      .replace('"', '')
      .replace('[', '')
      .replace('"', '');
    setRate(rate);
    setIsDisplaying(true);
  };

  const fetchData = async () => {
    console.log(`listening for rateUpdate-${currency}-${fiat}`);
    setIsLoading(true);
    console.log('fetching data..');
    console.log(`removing rateUpdate-${prevCurrency}-${prevFiat}....`);
    eventSource.addEventListener(
      `rateUpdate-${currency}-${fiat}`,
      updateRate,
      false
    );
    await require('axios').get(
      `http://localhost:4000/ticker/${currency}/${fiat}/`
    );

    prevCurrency = currency;
    prevFiat = fiat;
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <p>Choose cryptocurrency to watch</p>
        <p>
          <input
            type="text"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          ></input>
          Against
          <select value={fiat} onChange={(e) => setFiat(e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          <button onClick={fetchData}>Go</button>
        </p>

        {isLoading ? (
          'Loading...'
        ) : isDisplaying ? (
          <p>
            1 {currency} = {rate.split(',')[0]} {fiat} as of {date}
          </p>
        ) : (
          ''
        )}
      </header>
    </div>
  );
}

export default App;

import './App.css';
import { useEffect, useState } from 'react';

function parseHtmlEntities(str) {
  return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
    var num = parseInt(numStr, 10); // read num as normal number
    return String.fromCharCode(num);
  });
}

const isInTime = (showInstance, timeWindow) => {
  if (!timeWindow) {
    return true;
  }
  console.log('in time?', showInstance.date, timeWindow);
  return (Date.now() - new Date(showInstance?.date).getTime()) <= timeWindow;
}


function App() {
  const [all, setAll] = useState();
  const [timeWindow, setTimeWindow] = useState(1000 * 60 * 60 * 24 * 7 * 4);

  useEffect(() => {
    (async () => {
      const all = await (await fetch('all-results.json')).json();
      setAll(all);
    })()
  }, [])

  return (
    <div className="App">
      <div style={{ display: 'flex', alignItems: 'center', 'justifyContent': 'center', gap: '5px' }}>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 4 * 6)}>last 6 months</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 4 * 3)}>last 3 months</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 4)}>last month</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7)}>last week</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(undefined)}>all</a>
      </div>
      {
        all?.map((showData) => {

          let hasShowInTime = true;
          if (timeWindow) {
            hasShowInTime = showData.data.some(x => isInTime(x, timeWindow));
          }

          if (!hasShowInTime) {
            return null;
          }

          return <div style={{ padding: '10px' }}>
            <div>{parseHtmlEntities(showData.show.broadcaster)}</div>
            <div>{parseHtmlEntities(showData.show.title)}</div>
            {
              showData?.data?.map((showInstance, i) => {
                return isInTime(showInstance, timeWindow) ? <div style={{display:'flex', justifyContent:'center', gap:'4px'}}>
                  <a target='_blank' rel="noreferrer" onClick={() => {
                    console.log(showData);
                  }} href={`https://www.teder.fm/archive?show=${showData.show.id}&listen=${showInstance.id}`}>
                    {`${showInstance.broadcaster} ${showInstance.subtitle ? `/ ${showInstance.subtitle} /` : `/`} ${showInstance.date_display}`}
                    </a>
                    <div style={{fontSize:'10px', display: 'flex', alignItems: 'center'}}>{`(${atob(showInstance.src)})`}</div>
                </div> : null
              })
            }
          </div>
        })
      }
    </div>
  );
}

export default App;

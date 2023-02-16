import './App.css';
import { useEffect, useState } from 'react';

function parseHtmlEntities(str) {
  if (!str) {
    return '';
  }
  return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
    var num = parseInt(numStr, 10); // read num as normal number
    return String.fromCharCode(num);
  });
}

const isInTime = (showInstance, timeWindow) => {
  if (!timeWindow) {
    return true;
  }
  return (Date.now() - new Date(showInstance?.date).getTime()) <= timeWindow;
}

const isInSearch = (showData, search) => {
  if (!search) {
    return true;
  }
  if (parseHtmlEntities(showData?.show?.broadcaster).match(search)) {
    return true;
  }
  if (parseHtmlEntities(showData?.show?.title).match(search)) {
    return true;
  }
  return showData?.data?.some((showInstance) => {
    return `${showInstance.broadcaster} ${showInstance.subtitle ? `/ ${showInstance.subtitle} /` : `/`} ${showInstance.date_display} ${atob(showInstance.src)}`.toLowerCase().match(search.toLowerCase())
  })
}


function App() {
  const [all, setAll] = useState();
  const [search, setSearch] = useState('');
  const [timeWindow, setTimeWindow] = useState(1000 * 60 * 60 * 24 * 7 * 4);

  useEffect(() => {
    (async () => {
      const all = await (await fetch(`all-results.json?t=${Date.now()}`)).json();
      setAll(all);
    })()
  }, [])

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', 'justifyContent': 'center', gap: '5px' }}>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 4 * 6)}>last 6 months</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 4 * 3)}>last 3 months</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 4)}>last month</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7)}>last week</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(undefined)}>all</a>
      </div>
      <div style={{ width: '100px' }}>
        <input value={search} placeholder='filter' onChange={(e) => {
          setTimeWindow(undefined);
          setSearch(e.target.value)
        }}></input>
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

          if (!isInSearch(showData, search)) {
            return null;
          }

          return <div style={{ padding: '10px', flexDirection: 'column' }}>
            <div>{parseHtmlEntities(showData?.show?.broadcaster)}</div>
            <div>{parseHtmlEntities(showData?.show?.title)}</div>
            {
              showData?.data?.map((showInstance, i) => {
                if (!isInSearch({ data: [showInstance] }, search)) {
                  return null;
                }
                return isInTime(showInstance, timeWindow) ? <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                  <a target='_blank' rel="noreferrer" onClick={() => {
                    console.log(showData);
                  }} href={`https://www.teder.fm/archive?show=${showData.show.id}&listen=${showInstance.id}`}>
                    {`${showInstance.broadcaster} ${showInstance.subtitle ? `/ ${showInstance.subtitle} /` : `/`} ${showInstance.date_display}`}
                  </a>
                  <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center' }}>{`(${atob(showInstance.src)})`}</div>
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

import './App.css';
import { memo, useEffect, useRef, useState } from 'react';
import { Routes, Route, useSearchParams } from "react-router-dom";
import debounce from 'lodash/debounce';



function parseHtmlEntities(str) {
  if (!str) {
    return '';
  }
  return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
    var num = parseInt(numStr, 10); // read num as normal number
    return String.fromCharCode(num);
  });
}

const _isInTime = (showInstance, timeWindow) => {
  if (!timeWindow) {
    return true;
  }
  return (Date.now() - new Date(showInstance?.date).getTime()) <= timeWindow;
}

const isTitleInSearch = (showData, search) => {
  if (!search) {
    return true;
  }
  if (parseHtmlEntities(showData?.show?.broadcaster).match(search)) {
    return true;
  }
  if (parseHtmlEntities(showData?.show?.title).match(search)) {
    return true;
  }
}

const isShowInSearchAndTime = (showData, search, timeWindow) => {
  const showsInTime = showData.data.filter(x => _isInTime(x, timeWindow));
  if (!showsInTime.length) {
    console.log('no show in time');
    return false;
  }

  if (!search) {
    return true;
  }
  return showsInTime?.some((showInstance) => {
    return `${showInstance.broadcaster} ${showInstance.subtitle ? `/ ${showInstance.subtitle} /` : `/`} ${showInstance.date_display} ${atob(showInstance.src)}`.toLowerCase().match(search.toLowerCase())
  })
}

function useQueryParam(
  key,
  fn = x=>x,
) {
  let [searchParams, setSearchParams] = useSearchParams();
  console.log('search params', searchParams.toString());
  let paramValue = searchParams.get(key);

  let setValue = (newValue, options) => {
      let newSearchParams = new URLSearchParams(window.location.hash.slice(2));
      newSearchParams.set(key, newValue);
      setSearchParams(newSearchParams, options);
    };

  return [fn(paramValue), setValue];
}

const Results = memo(({ all, search, timeWindow }) => {
  console.log('rendering results', search, timeWindow);
  return <>{
    all?.map((showData) => {

      if (!isTitleInSearch(showData, search) && !isShowInSearchAndTime(showData, search, timeWindow)) {
        console.log('title not in search');
        return null;
      }

      if (!isShowInSearchAndTime(showData, search, timeWindow)) {
//        console.log('show not in search / time');
        return null;
      }

      console.log('> hasShowInTime?', parseHtmlEntities(showData?.show?.broadcaster), isShowInSearchAndTime(showData, search, timeWindow));

      return <div style={{ padding: '10px', flexDirection: 'column' }}>
        <div>{parseHtmlEntities(showData?.show?.broadcaster)}</div>
        <div>{parseHtmlEntities(showData?.show?.title)}</div>
        {
          showData?.data?.map((showInstance, i) => {
            if (!isShowInSearchAndTime({ data: [showInstance] }, search, timeWindow)) {
              //console.log('show not in search and time...', showInstance);
              return null;
            }
            return <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
              <a target='_blank' rel="noreferrer" onClick={() => {
                console.log(showData);
              }} href={`https://www.teder.fm/archive?show=${showData.show.id}&listen=${showInstance.id}`}>
                {`${showInstance.broadcaster} ${showInstance.subtitle ? `/ ${showInstance.subtitle} /` : `/`} ${showInstance.date_display}`}
              </a>
              <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center' }}>{`(${atob(showInstance.src)})`}</div>
            </div>
          })
        }
      </div>
    })
  }
  </>
}, (prev, next) => {
  return prev.search === next.search && prev.timeWindow === next.timeWindow
})


function Comp() {
  const [all, setAll] = useState();
  const [search, setSearch] = useQueryParam("filter");
  const [inputValue, setInputValue] = useState(search);
  const [timeWindow, setTimeWindow] = useQueryParam("timeWindow", x=>parseInt(x));

  const handleSearch = useRef(debounce((value) => {
    console.log('>>> setting search', JSON.stringify(value));
    setSearch(value);
  }, 1000)).current;

  useEffect(() => {
    if (inputValue !== undefined && inputValue !== null) {
      handleSearch(inputValue);
    }
  }, [inputValue]);


  useEffect(() => {
    (async () => {
      const all = await (await fetch(`all-results.json?t=${Date.now()}`)).json();
      setAll(all);
    })()
  }, [])

  console.log('rendering main comp', all?.length);

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', 'justifyContent': 'center', gap: '6px' }}>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 4 * 6)}>[6 months]</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 4 * 3)}>[3 months]</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 4)}>[1 month]</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7 * 2)}>[2 weeks]</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(1000 * 60 * 60 * 24 * 7)}>[1 week]</a>
        <a href="javascript:void(0);" onClick={() => setTimeWindow(0)}>[all]</a>
      </div>
      <div style={{ width: '100px' }}>
        <input value={inputValue} placeholder='filter' onChange={(e) => {
          setInputValue(e.target.value)
        }}></input>
      </div>
      {all?.length ?
        <Results all={all} search={search} timeWindow={timeWindow} /> : null}

    </div>
  );
}

function App() {
  console.log('rendering app');
  return <Routes>
    <Route index element={<Comp />} />
  </Routes>
}

export default App;

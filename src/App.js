import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';

const getShows = async (start, end) => {
  const res = await (await fetch(`https://ayalgelles6.wixsite.com/my-site-4/_functions/pseder?start=${start}&end=${end}&t=1`)).json();
  return res;
}

const sleep = (t) => new Promise(res => setTimeout(res, t))

function App() {

  const [all, setAll] = useState();

  useEffect(() => {
    (async () => {
      let all = [];
      const res = await getShows(0, 10);
      all = all.concat(res.items);
      const count = res.count;
      for (let i = 10; i < count - 10; i += 10) {
        //await sleep(1000);
        const newres = await getShows(i, i + 10);
        //console.log('>pseder results', all, newres);
        all = all.concat(newres.items);
      }
      console.log('>pseder all results', all);
      setAll(all);
    })()
  }, [])

  return (
    <div className="App">
      {
        all?.map((showData) => {
          return <div style={{ padding: '10px' }}>
            <div>{showData.show.broadcaster}</div>
            <div>{showData.show.title}</div>
            {
              showData?.data?.map((showInstance, i) => {
                return <div>
                  <a target='_blank' rel="noreferrer" onClick={() => {
                    console.log(showData);
                  }} href={`https://www.teder.fm/archive?show=${showData.show.id}&listen=${showInstance.id}`}>{`${showInstance.broadcaster} ${showInstance.subtitle ? `/ ${showInstance.subtitle} /` : `/`}  ${showInstance.date_display}`}</a>
                </div>
              })
            }
          </div>
        })
      }
    </div>
  );
}

export default App;

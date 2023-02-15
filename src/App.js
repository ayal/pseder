import './App.css';
import { useEffect, useState } from 'react';


function App() {
  const [all, setAll] = useState();

  useEffect(() => {
    (async () => {
      const all = await (await fetch('/all-results.json')).json();
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

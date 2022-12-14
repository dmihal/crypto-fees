import React, { useState, useEffect } from 'react';

interface Size {
  width: number | undefined;
  height: number | undefined;
}


function useWindowSize() {

  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
}

export function Header(props: { siteName: string}) {

  const size:Size = useWindowSize()

  const allSites = [
    { name: 'cryptofees.info', url: 'https://cryptofees.info/' },
    { name: 'cryptoflows.info', url: 'https://cryptoflows.info/' },
    { name: 'moneyprinter.info', url: 'https://moneyprinter.info/' },
    { name: 'l2fees.info', url: 'https://l2fees.info/' },
    { name: 'simplestakers.info', url: 'https://simplestakers.info/' },
    { name: 'openorgs.info', url: 'https://openorgs.info/' },
    { name: 'ethburned.info', url: 'https://ethburned.info/' },
    { name: 'money-movers.info', url: 'https://money-movers.info/' },
    { name: 'stakers.info', url: 'https://stakers.info/' },
    { name: 'ethereumnodes.com', url: 'https://ethereumnodes.com/' },
  ];

  const currentSite = allSites.find((site) => props.siteName == site.name);
  if (currentSite) {
    const index = allSites.indexOf(currentSite);
    allSites.splice(index, 1);
  }
  let mainSites: { name: string; url: string }[];
  let extraSites: { name: string; url: string }[];

  if (size.width >= 330) {
    mainSites = allSites.slice(0, 1);
    extraSites = allSites.slice(1);
  }

  if (size.width >= 768) {
    mainSites = allSites.slice(0, 3);
    extraSites = allSites.slice(3);
  }

  if (size.width >= 1366) {
    mainSites = allSites.slice(0, 4);
    extraSites = allSites.slice(4);
  }

  if (size.width >= 1440) {
    mainSites = allSites.slice(0, 6);
    extraSites = allSites.slice(6);
  }

  return (
    <header>
      <ul className="header-links">
        <li className="header-link">
          <div>{currentSite?.name}</div>
        </li>
        {mainSites?.map((el: { name: string; url: string }, index) => {
          return (
            <li key={index} className="header-link">
              <a href={el?.url}>{el?.name}</a>
            </li>
          );
        })}
        <li className="header-link">
          <a>More</a>

          <ul className="dropdown">
            {extraSites?.map((el: { name: string; url: string }, index) => {
              return (
                <li key={index} className="header-link">
                  <a href={el?.url}>{el?.name}</a>
                </li>
              );
            })}
          </ul>
        </li>
      </ul>

      <style>{`
        header {
          display: flex;
          justify-content: center;
        }
        .header-links {
          display: flex;
          margin: 0;
          padding: 0;
          align-items: center;
        }

        .header-link {
          list-style: none;
          position: relative;
        }

        .header-link > a,
        .header-link > div {
          padding: 8px;
          display: block;
          border: solid 1px transparent;
          margin: 0 4px;
          text-align: center;
        }

        .header-link > a:hover {
          border-radius: 3px;
          border: solid 1px #d0d1d9;
          text-decoration: none;
        }

        .dropdown {
          position: absolute;
          background: #f9fafc;
          display: none;
          right: 0;
          padding: 4px;
          border: solid 1px #d0d1d9;
          border-radius: 4px;
        }

        .dropdown .header-link a {
          text-align: right;
        }

        .header-link:hover .dropdown,
        .dropdown:hover {
          display: block;
        }

        .showable {
          display: none;
        }

        @media (max-width: 700px) {
          .header-link > a,
          .header-link > div {
            margin: 0 1px;
            padding: 4px;
          }

          .hideable {
            display: none;
          }

          .showable {
            display: block;
          }
        }

      `}</style>
    </header>
  );
}

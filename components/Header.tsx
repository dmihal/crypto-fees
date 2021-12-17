import React from 'react';

const Header = () => {
  return (
    <header>
      <ul className="header-links">
        <li className="header-link">
          <div>cryptofees.info</div>
        </li>
        <li className="header-link">
          <a href="https://openorgs.info/">openorgs.info</a>
        </li>
        <li className="header-link hideable">
          <a href="https://moneyprinter.info/">moneyprinter.info</a>
        </li>
        <li className="header-link hideable">
          <a href="https://ethburned.info/">ethburned.info</a>
        </li>
        <li className="header-link hideable">
          <a href="https://l2fees.info/">l2fees.info</a>
        </li>
        <li className="header-link">
          <a>More</a>

          <ul className="dropdown">
            <li className="header-link showable">
              <a href="https://openorgs.info/">openorgs.info</a>
            </li>
            <li className="header-link showable">
              <a href="https://moneyprinter.info/">moneyprinter.info</a>
            </li>
            <li className="header-link showable">
              <a href="https://l2fees.info/">l2fees.info</a>
            </li>
            <li className="header-link">
              <a href="https://money-movers.info/">money-movers.info</a>
            </li>
            <li className="header-link">
              <a href="https://stakers.info/">stakers.info</a>
            </li>
            <li className="header-link">
              <a href="https://ethereumnodes.com/">ethereumnodes.com</a>
            </li>
          </ul>
        </li>
      </ul>

      <style jsx>{`
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
};

export default Header;

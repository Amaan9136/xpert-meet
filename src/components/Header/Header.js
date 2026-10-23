// Header.jsx

import {
  faCalendarAlt,
  faExclamationCircle,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from 'react';
import './Header.css';

export default function Header({ handleCalendar, handleSettings }) {
  return (
    <>
      <div className="header">
        <div className="logo">
          <p className='text-3xl'>Xpert</p>
          <span className='mt-3'>Meet</span>
        </div>
        <div>
          <button className='head-icon'><FontAwesomeIcon  className='rotate text-[24px] p-[10px]' icon={faExclamationCircle} /></button>
          <button className='head-icon' onClick={handleCalendar}><FontAwesomeIcon className='rotate text-[24px] p-[10px]' icon={faCalendarAlt} /></button>
          <button className='head-icon' onClick={handleSettings}><FontAwesomeIcon className='rotate text-[24px] p-[10px]' icon={faGear} /></button>
        </div>
      </div>
    </>
  );
}

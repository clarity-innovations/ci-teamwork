import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import '../styles/CalendarRange.css';

function CalendarRange({ onDateRangeChange }) {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const handleDate = (startDateInput, endDateInput) => {
    const formattedStartDate = format(new Date(startDateInput), 'yyyy-MM-dd');
    const formattedEndDate = format(new Date(endDateInput), 'yyyy-MM-dd');
    onDateRangeChange(formattedStartDate, formattedEndDate);
  };

  return (
    <>
      <div className="pl-2 pt-1 text-sm flex items-center">
        <h3>Filter by date:</h3>
      </div>
      <div className="grid grid-rows-2 grid-flow-col pt-1 pl-4 flex h-2/3 sm:flex-col">
        <div className="flex text-center h-6 sm:mb-2">
          <label htmlFor="fromDateFilterField" className="w-1/2 text-sm">From</label>
          <DatePicker
            id="fromDateFilterField"
            dateFormat="yyyy-MM-dd"
            placeholderText="yyyy-mm-dd"
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="text-sm w-2/3 text-darkGrey hover:cursor-pointer bg-offWhite mr-0 pl-1"
          />
        </div>

        <div className="flex text-center h-6">
          <label htmlFor="toDateFilterField" className="w-1/2 text-sm">To</label>
          <DatePicker
            id="toDateFilterField"
            dateFormat="yyyy-MM-dd"
            placeholderText="yyyy-mm-dd"
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="text-sm w-2/3 text-darkGrey hover:cursor-pointer bg-offWhite mr-0 pl-1"
          />
        </div>
        <div className="buttonDate pr-2 pt-1">
          <button
            type="button"
            onClick={() => handleDate(startDate, endDate)}
            className="ml-auto rounded-t-xl rounded-b-xl bg-pine hover:bg-lightPine text-offWhite p-2 ml-0"
          >
            Filter
          </button>
        </div>
      </div>
    </>
  );
}
CalendarRange.propTypes = {
  onDateRangeChange: PropTypes.func.isRequired,
};

export default CalendarRange;

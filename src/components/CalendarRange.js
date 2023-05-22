import { useState } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import '../styles/CalendarRange.css';

const CalendarRange = ({ onDateRangeChange }) => {
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const handleDate = (startDate, endDate) => {
    startDate = format(new Date(startDate), 'yyyy-MM-dd');
    endDate = format(new Date(endDate), 'yyyy-MM-dd');
    onDateRangeChange(startDate, endDate);
  };

  return (
    <>
      <div className='pl-2 pt-1 text-sm flex items-center'>
        <label>Filter by date:</label>
      </div>
      <div className='grid grid-rows-2 grid-flow-col pt-1 pl-4 flex h-2/3 sm:flex-col'>
        <div className='flex text-center h-6 sm:mb-2'>
          <label className='w-1/2 text-sm'>From</label>
          <DatePicker
            id='fromDateFilterField'
            dateFormat='yyyy-MM-dd'
            placeholderText='yyyy-mm-dd'
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className='text-sm w-2/3 hover:cursor-pointer'
          />
        </div>

        <div className='flex text-center h-6'>
          <label className='w-1/2 text-sm'>To</label>
          <DatePicker
            id='toDateFilterField'
            dateFormat='yyyy-MM-dd'
            placeholderText='yyyy-mm-dd'
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className='text-sm w-2/3 hover:cursor-pointer'
          />
        </div>
        <div className='buttonDate pr-2 pt-1'>
          <button
            onClick={() => handleDate(startDate, endDate)}
            className='ml-auto rounded-t-xl rounded-b-xl bg-pine hover:bg-lightPine font-raleway text-offWhite p-2'
          >
            Filter
          </button>
        </div>
      </div>
    </>
  );
};

export default CalendarRange;

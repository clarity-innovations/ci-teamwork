import React from 'react';
import PropTypes from 'prop-types';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { getWeeklyTime } from '../api-utils';

export default function WeeklyTimeList({ hoursByDate }) {
  const weeklyTime = getWeeklyTime(hoursByDate);
  const totalData = Object.values(weeklyTime);

  const boxWidth = 24;
  const totalCells = totalData.length;
  const sparkWidth = boxWidth * totalCells;

  return (
    <div className="flex flex-col">
      <div className="flex">
        {Object.entries(weeklyTime).map(([week, total]) => (
          <div
            key={week}
            className={`mr-4 ${total === 0 ? 'opacity-40' : ''}`}
          >
            <p className="mt-1 text-sm text-center">{week}</p>
            <p className="border border-gray-500 w-20 text-center">{total.toFixed(1)}</p>
          </div>
        ))}
      </div>
      {totalData.length > 1 && (
        <div className="block sparkline task-sparkline py-1">
          <Sparklines
            data={totalData}
            height={15}
            width={sparkWidth}
          >
            <SparklinesLine color="#000000" style={{ strokeWidth: 0.5 }} />
          </Sparklines>
        </div>
      )}
    </div>
  );
}

WeeklyTimeList.propTypes = {
  hoursByDate: PropTypes.objectOf(PropTypes.number).isRequired,
};

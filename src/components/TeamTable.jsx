import React from 'react';
import PropTypes from 'prop-types';

export default function TeamTable({ peopleTime }) {
  return (
    <table aria-label="Hours by team member" className="border-collapse border border-black m-2">
      <tbody>
        <tr>
          <th scope="col" className="border border-gray-500 px-2">Name</th>
          <th scope="col" className="border border-gray-500 px-2">Hours</th>
        </tr>
        {peopleTime && Object.entries(peopleTime).map(([name, hours]) => (
          <tr key={name}>
            <td className="border border-gray px-2">{name}</td>
            <td className="border border-gray-500 px-2">{hours.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
TeamTable.defaultProps = {
  peopleTime: {},
};
TeamTable.propTypes = {
  peopleTime: PropTypes.objectOf(PropTypes.number),
};

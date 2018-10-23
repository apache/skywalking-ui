import React from 'react';

const Cell = ({ timeZone }) => {
  return (
    <span>
      {timeZone}
    </span>
  );
};

Cell.defaultProps = {
  timeZone: '',
};

export default Cell;

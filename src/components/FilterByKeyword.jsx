import React, { useState } from 'react';
import PropTypes from 'prop-types';

function FilterByKeyword({ onKeywordChange }) {
  const [keyword, setKeyword] = useState('');

  const handleKeywordFilter = (e) => {
    e.preventDefault();
    onKeywordChange(keyword);
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  return (
    <form onSubmit={handleKeywordFilter}>
      <div className="pl-2 pt-1 text-sm">
        <label htmlFor="keywordFilterField">Filter by Keyword: </label>
      </div>
      <div className="text-center">
        <input
          id="keywordFilterField"
          className="w-1/2 text-darkGrey pl-1"
          type="text"
          name="keyword-input"
          onChange={handleKeywordChange}
          placeholder="keyword"
        />
        <button
          type="submit"
          className="rounded-t-xl rounded-b-xl bg-pine hover:bg-lightPine text-offWhite p-2 mt-2 ml-6"
        >
          Filter
        </button>
      </div>
    </form>
  );
}

FilterByKeyword.propTypes = {
  onKeywordChange: PropTypes.func.isRequired,
};

export default FilterByKeyword;

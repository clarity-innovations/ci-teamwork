import { useState } from 'react';

const FilterByKeyword = ({ onKeywordChange }) => {
  const [keyword, setKeyword] = useState('');

  const handleKeywordFilter = (e) => {
    e.preventDefault();
    onKeywordChange(keyword);
  };

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
  };

  return (
    <>
      <form onSubmit={handleKeywordFilter}>
         <div className='pl-2 pt-1 text-sm'>
        <label>Filter by Keyword: </label>
        </div>
         <div className='text-center'>
        <input
          id='keywordFilterField'
          className='w-1/2'
          type='text'
          name='keyword-input'
          onChange={handleKeywordChange}
          placeholder='keyword'
        />
        <button
          type='submit'
          className='rounded-t-xl rounded-b-xl bg-pine hover:bg-lightPine font-raleway text-offWhite p-2 mt-2'
        >
          Filter
        </button></div>
      </form>
    </>
  );
};
export default FilterByKeyword;

/* eslint-disable no-use-before-define */
/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import NavBar from './NavBar';
import SearchContainer from './SearchContainer';
import ResultsContainer from './ResultsContainer';
import ModalContent from '../components/ModalContent';
// import db from '../../db/cma-artworks-export';
// import indexDatabase from '../helpers/indexDatabase';
// import filterResults from '../helpers/filterResults';

const ENDPOINT = 'https://openaccess-api.clevelandart.org/api/artworks/';
// const OPTIONS = '?has_image=1&limit=4';
const OPTIONS = '?has_image=1&limit=20';
const RESULTS_PER_PAGE = 20;

// WAI-ARIA standard to hide other content from screenreaders when a modal is open
Modal.setAppElement('#root');

const MainContainer = () => {
  const [url, setUrl] = useState(ENDPOINT + OPTIONS);
  const [results, setResults] = useState([]);
  const artworkMap = useRef(new Map());

  const [numResults, setNumResults] = useState(0);
  const [curPage, setCurPage] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const idForModal = useRef('-1');

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setNumResults(result.info.total);
        setResults(result.data);
      })
      .catch((e) => {
        console.log('Error fetching data my dog!', e);
        setIsError(true);
        setIsLoading(false);
      });
  }, [url]);

  useEffect(() => setIsLoading(false), [results]);

  useEffect(() => {
    console.log('🚀 ~ file: MainContainer.js ~ line 57 ~ useEffect ~ results', results);
    if (results) {
      results.forEach((artwork) => {
        if (!artworkMap.current.has(artwork.id)) { artworkMap.current.set(artwork.id, artwork); }
      });
    }
    console.log('artworkMap', artworkMap.current);
    // destroy map item(s) here?
  }, [results]);

  // Update filtered (displayed) results using new searchText and tags
  const updateSearchResults = (searchText, tagFilter) => {
    console.log('updateSearchResults ~ searchText', searchText);
    // setFilteredResults(filterResults(dbCleaned, searchText, tagFilter));
    setCurPage(0);
    const SEARCH_STRING = searchText.length > 0 ? `&artists=${searchText}` : '';
    setUrl(`${ENDPOINT + OPTIONS + SEARCH_STRING}`);
  };

  const handleModalOpen = (id) => {
    idForModal.current = id;
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handlePageChange = (num) => {
    const offset = (RESULTS_PER_PAGE * curPage).toString();
    console.log('offset', offset);
    setCurPage(num);
    setUrl(`${ENDPOINT + OPTIONS}&skip=${offset}`);
  };

  return (
    <>
      <NavBar />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        style={modalStyle}
        contentLabel="modal label"
      >
        <ModalContent id={idForModal.current} artworkMap={artworkMap} />
      </Modal>
      <SearchContainer updateSearchResults={updateSearchResults} />
      <ResultsContainer
        handlePageChange={handlePageChange}
        numPages={Math.floor(numResults / RESULTS_PER_PAGE)}
        filteredResults={results}
        handleModalOpen={handleModalOpen}
        isLoading={isLoading}
        isError={isError}
      />
    </>
  );
};
export default MainContainer;

const modalStyle = {
  content: {
    top: '10vh',
    bottom: 'auto',
    backgroundColor: 'rgb(233,233,233)',
    borderStyle: 'none',
    zIndex: '2',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: '1',
  },
};

// const [filteredResults, setFilteredResults] = useState([]);
// const deptMap = useRef(null);
// const dbCleaned = useRef([]);
// const [modalStyle] = useState(getModalStyle);
// const classes = useStyles();

// Set dbCleaned by removing duplicates and adding all creators under a single artwork record
// Then set initial filtered results to show all. This runs only once on app startup
// useEffect(() => {
//   [artworkMap.current, deptMap.current] = indexDatabase(db);
//   dbCleaned.current = Array.from(artworkMap.current.values());
//   console.log('artworkMap.current', artworkMap.current);
//   console.log('dbCleaned', dbCleaned.current);

//   setFilteredResults(dbCleaned.current);
// }, []);

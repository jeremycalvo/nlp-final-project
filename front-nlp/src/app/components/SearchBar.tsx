'use client';
import { useState, useEffect, FormEvent } from 'react';
import Papa from 'papaparse';
import { MovieCard } from './MovieCard';

function parseResult(resultString) {
  const result = {
    word: '',
    expandedKeywords: [],
    numberOfScripts: 0,
    topMovies: []
  };

  const lines = resultString.split('\n');

  const expandedKeywordsLine = lines.find((line) => line.startsWith('Expanded keywords:'));
  if (expandedKeywordsLine) {
    const keywords = expandedKeywordsLine.split(':')[1].trim();
    result.expandedKeywords = keywords.slice(1, -1).split(', ').map((keyword) => keyword.slice(1, -1));
  }

  const numberOfScriptsLine = lines.find((line) => line.startsWith('Number of scripts loaded and preprocessed:'));
  if (numberOfScriptsLine) {
    result.numberOfScripts = parseInt(numberOfScriptsLine.split(':')[1].trim(), 10);
  }

  const topMoviesStartIndex = lines.findIndex((line) => line.startsWith('Top 10 movies related to'));
  if (topMoviesStartIndex !== -1) {
    result.word = lines[topMoviesStartIndex].split("'")[1];
    for (let i = topMoviesStartIndex + 1; i < lines.length; i++) {
      const movieLine = lines[i].trim();
      if (movieLine) {
        const [rankAndTitle, score] = movieLine.split(' (Score: ');
        const rankAndTitleParts = rankAndTitle.split('. ');
        if (rankAndTitleParts.length === 2) {
          const rank = parseInt(rankAndTitleParts[0], 10);
          const title = rankAndTitleParts[1];
          const scoreValue = parseInt(score.slice(0, -1), 10);
          result.topMovies.push({ rank, title, score: scoreValue });
        }
      }
    }
  }

  return result;
}

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [movieDetails, setMovieDetails] = useState<any[]>([]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      const response = await fetch('/movie_details_no_scripted.csv');
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setMovieDetails(results.data);
        },
      });
    };

    fetchMovieDetails();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const result = await response.json();
      const parsedResult = parseResult(result.stdout);
      setResult(parsedResult);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const matchedMovies = result ? result.topMovies.map((topMovie: any) => {
    return movieDetails.find((movie: any) => movie.title === topMovie.title);
  }) : [];

  return (
    <div className="mb-60 mx-auto p-4">
      <div className="text-white">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mb-8">
          <div className="flex flex-col  md:flex-row md:space-x-4 md:items-center">
            <input
              className=" w-full h-15 border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm bg-white/30 placeholder-white"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
            />
            <button
              type="submit"
              className=" backdrop-blur-sm bg-white/30 h-15 bg-blue-500 text-white p-3 rounded-md hover:bg-cyan-600 transition-colors"
            >
              Search
            </button>
          </div>
    </form>
      </div>

      { loading && <p className="text-center mt-4 text-white ">Loading...</p> }

  {
    result && !loading && (
      <div className="mt-4">
        <div className="p-2 text-sm text-white mb-4 rounded border-2 backdrop-blur-sm bg-white/30">
          <h2 className="text-lg font-semibold mb-4">Result:</h2>
          <div className="text-sm mb-4">
            <p><strong>Word(s):</strong> {result.word}</p>
            <p><strong>Expanded Keywords:</strong> {result.expandedKeywords.join(', ')}</p>
            <p><strong>Number of Scripts Loaded:</strong> {result.numberOfScripts}</p>
          </div>
        </div>
        <h3 className="font-semibold mb-4 text-white">Top 10 Movies:</h3>
        <div className="flex flex-wrap gap-4">
          {matchedMovies.map((movie, index) => (
            movie && (
              <MovieCard
                key={index}
                title={movie.title}
                imageUrl={movie.imageUrl}
                rating={movie.rating}
                releaseDate={movie.releaseDate}
                genre={movie.genre}
                score={result.topMovies.find(topMovie => topMovie.title === movie.title).score}
              />
            )
          ))}
        </div>
      </div>
    )
  }
    </div >
  );
}

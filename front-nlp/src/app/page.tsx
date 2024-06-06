import SearchBar from './components/SearchBar';

export default function Home() {
  return (
    <div className=" min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-cyan-950 via-sky-500 to-cyan-950">
      <h1 className="text-white text-3xl mb-8">Search Page</h1>
      <SearchBar />
    </div>
  );
}

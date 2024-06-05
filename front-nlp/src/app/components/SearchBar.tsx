"use client";

import { useState, FormEvent } from 'react';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: searchQuery }),
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input style={{ color: '#000' }}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  );
}

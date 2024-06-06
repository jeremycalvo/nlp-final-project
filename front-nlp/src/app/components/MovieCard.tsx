import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MovieCardProps {
  title: string;
  imageUrl: string;
  rating: string;
  releaseDate: string;
  genre: string;
  score: number;
}

export function MovieCard(props: MovieCardProps) {
  const { title, imageUrl, rating, releaseDate, genre, score } = props;

  return (
    <Card className="w-[250px] bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-500 hover:scale-105 hover:shadow-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Score: {score}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-64 mb-4">
          <img src={imageUrl} alt={title} className="object-cover w-full h-full" />
        </div>
        <p><strong>Rating:</strong> {rating}</p>
        <p><strong>Release Date:</strong> {releaseDate}</p>
        <p><strong>Genre:</strong> {genre}</p>
      </CardContent>
    </Card>
  );
}

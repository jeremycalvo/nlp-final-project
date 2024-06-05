import pandas as pd
import spacy
import numpy as np
from collections import Counter
import os
import pickle
from multiprocessing import Pool
import sys

# Load spaCy model
nlp = spacy.load('en_core_web_md')
print("Loaded spaCy model")

def load_glove_embeddings(file_path):
    embeddings_index = {}
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            values = line.split()
            word = values[0]
            coefs = np.asarray(values[1:], dtype='float32')
            embeddings_index[word] = coefs
    return embeddings_index

glove_embeddings = load_glove_embeddings('glove.6B.100d.txt')

def load_scripts():
    df = pd.read_csv('movie_scripts.csv')
    df = df.dropna(subset=['script'])
    scripts = {row['title']: str(row['script']) for _, row in df.iterrows()}
    return scripts

def preprocess(text):
    doc = nlp(text.lower())
    return [token.lemma_ for token in doc if not token.is_stop and not token.is_punct]

def get_similar_words_glove(word, embeddings, top_n=10):
    if word not in embeddings:
        return []
    word_vector = embeddings[word]
    similarities = {}
    for other_word, other_vector in embeddings.items():
        if other_word != word:
            sim = np.dot(word_vector, other_vector) / (np.linalg.norm(word_vector) * np.linalg.norm(other_vector))
            similarities[other_word] = sim
    sorted_similarities = sorted(similarities.items(), key=lambda item: item[1], reverse=True)
    return [item[0] for item in sorted_similarities[:top_n]]

def expand_keywords(subject):
    keywords = set()
    subject_tokens = nlp(subject.lower())
    for token in subject_tokens:
        similar_words = {token.text}
        similar_words.update(get_similar_words_glove(token.text, glove_embeddings))
        for word in nlp.vocab:
            if word.has_vector and word.is_lower and word.is_alpha:
                similarity = token.similarity(word)
                if similarity > 0.5:
                    similar_words.add(word.text)
        keywords.update(similar_words)
    return keywords

def preprocess_scripts(scripts):
    preprocessed_scripts = {}
    for movie, script in scripts.items():
        preprocessed_scripts[movie] = preprocess(script)
    return preprocessed_scripts

def save_preprocessed_scripts(preprocessed_scripts, file_path):
    with open(file_path, 'wb') as file:
        pickle.dump(preprocessed_scripts, file)

def load_preprocessed_scripts(file_path):
    with open(file_path, 'rb') as file:
        return pickle.load(file)

def search_subject_in_script(args):
    movie, script, expanded_keywords = args
    word_freq = Counter(script)
    score = sum(word_freq[word] for word in expanded_keywords if word in word_freq)
    return (movie, score)

def search_subject(subject):
    expanded_keywords = expand_keywords(subject)
    print("Expanded keywords:", expanded_keywords)
    
    preprocessed_file = 'preprocessed_scripts.pkl'
    if os.path.exists(preprocessed_file):
        preprocessed_scripts = load_preprocessed_scripts(preprocessed_file)
    else:
        scripts = load_scripts()
        preprocessed_scripts = preprocess_scripts(scripts)
        save_preprocessed_scripts(preprocessed_scripts, preprocessed_file)
    
    print("Number of scripts loaded and preprocessed:", len(preprocessed_scripts))

    with Pool() as pool:
        scores = pool.map(search_subject_in_script, [(movie, script, expanded_keywords) for movie, script in preprocessed_scripts.items()])
    
    top_movies = sorted(scores, key=lambda item: item[1], reverse=True)[:10]
    return top_movies

def main():
    # subject = input("Enter the subject to search for: ")
    subject = sys.argv[1]
    matching_movies = search_subject(subject)
    if matching_movies:
        print("Top 10 movies related to '{}':".format(subject))
        for rank, (movie, score) in enumerate(matching_movies, start=1):
            print(f"{rank}. {movie} (Score: {score})")
    else:
        print("No movies found related to '{}'".format(subject))

if __name__ == "__main__":
    main()

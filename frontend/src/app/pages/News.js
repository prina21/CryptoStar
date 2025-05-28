"use client";
import { useEffect, useState } from "react";

export default function News() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN");
        if (!res.ok) throw new Error("Failed to fetch crypto news");
        const data = await res.json();
        setArticles(data.Data || []);
      } catch (err) {
        console.error(err);
        setError("Unable to load crypto news.");
      }
    };

    fetchNews();
  }, []);

  return (
    <div className=" h-[400px] overflow-y-auto">
      <div className="m-2 border-b border-[#afafaf] text-white"> News</div>
      <ul className="p-2 space-y-2 text-sm">
        {error ? (
          <li className="text-red-400">{error}</li>
        ) : (
          articles.map((article, index) => (
            <li key={index}>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                {article.title}
              </a>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

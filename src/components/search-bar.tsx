"use client";

import type React from "react";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchRecipes } from "@/lib/graphql/hooks/use-search-recipes";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const { search, results, loading } = useSearchRecipes();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search(query);
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative", className)}>
      <Input
        type="text"
        placeholder="Search recipes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-12"
        disabled={loading}
      />
      <Button
        aria-label="Search"
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute right-0 top-0 h-full"
        disabled={loading}
      >
        <Search className="size-4" />
      </Button>
      {results && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-md shadow-lg">
          {results.map((recipe) => (
            <div key={recipe.id} className="p-2 hover:bg-muted">
              <h3 className="font-medium">{recipe.title}</h3>
              <p className="text-sm text-muted-foreground">
                {recipe.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

"use client";

import type React from "react";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedParams = new URLSearchParams(searchParams.toString());
    if (query) {
      updatedParams.set("search", query);
    } else {
      updatedParams.delete("search");
    }
    router.push(`/?${updatedParams.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative", className)}>
      <Input
        type="text"
        placeholder="Search recipes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pr-12"
      />
      <div className="absolute right-0 top-0 h-full flex gap-x-4">
        {query && (
          <Button
            aria-label="Clear"
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => setQuery("")}
          >
            <X className="size-4" />
          </Button>
        )}
        <Button aria-label="Search" type="submit" size="icon" variant="ghost">
          <Search className="size-4" />
        </Button>
      </div>
    </form>
  );
}

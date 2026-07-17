"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchFormProps {
  defaultValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export function SearchForm({
  defaultValue = "",
  onSearch,
  placeholder = "Cari...",
}: SearchFormProps) {
  const [value, setValue] = useState(defaultValue);

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
      }}
      className="flex gap-2"
    >
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="max-w-sm pr-8"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit" variant="secondary">
        <Search className="h-4 w-4 mr-2" />
        Cari
      </Button>
    </form>
  );
}

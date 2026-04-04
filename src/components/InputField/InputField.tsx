import type React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./InputField.css";

interface SearchProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
}

export default function Search({ query, onQueryChange, onSearch }: SearchProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="search-bar">
      <Form onSubmit={handleSubmit} className="search-bar__form">
        <Form.Control
          type="text"
          name="query"
          className="search-input"
          placeholder="Поиск по отделам"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <Button type="submit" className="search-btn">
          Найти
        </Button>
      </Form>
    </div>
  );
}

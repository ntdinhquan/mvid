"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function InputVariousDemo() {
  const [checked, setChecked] = useState(false);
  const [radio, setRadio] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-4 w-64">
      {/* Checkbox */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        Accept Terms
      </label>
      <div className="text-xs text-gray-500">Checked: {checked ? "Yes" : "No"}</div>

      {/* Radio */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Choose option:</span>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="option1"
            checked={radio === "option1"}
            onChange={(e) => setRadio(e.target.value)}
          />
          Option 1
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="option2"
            checked={radio === "option2"}
            onChange={(e) => setRadio(e.target.value)}
          />
          Option 2
        </label>
        <div className="text-xs text-gray-500">Selected: {radio || "None"}</div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Password:</span>
        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-xs text-gray-500">{password ? "Filled" : "Empty"}</div>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Search:</span>
        <Input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="text-xs text-gray-500">{search || "No search term"}</div>
      </div>

      <Button onClick={() => alert("Submitted")} className="mt-2">
        Submit
      </Button>
    </div>
  );
}

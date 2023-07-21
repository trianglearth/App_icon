import React from "react";
import { renderToString } from "react-dom/server";
import fs from "fs";
import SearchResultPage from "../src/SearchResultPage";

function generatePage(searchResult, res) {
  const html = renderToString(<SearchResultPage searchResult={searchResult} />);
  res.send(html);
}

export default generatePage;

import generatePage from "../pages/generatePage";

app.get("/search", (req, res) => {
  const searchResult = getSearchResult(req.query);
  generatePage(searchResult, res);
});
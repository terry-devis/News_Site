"use client";

import React from "react";
import ArticleEditorClient from "../ArticleEditorClient";

export default function EditArticlePage({ params }) {
  return <ArticleEditorClient initialId={params?.id} />;
}

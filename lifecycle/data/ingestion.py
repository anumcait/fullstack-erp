import re
from typing import List
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    CSVLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from pathlib import Path


# -----------------------------
# 1. Document Loaders
# -----------------------------

def load_documents(file_path: str) -> List[Document]:
    """
    Loads raw documents from lifecycle/data/raw/
    """
    path = Path(file_path)

    if path.suffix == ".pdf":
        loader = PyPDFLoader(file_path)
    elif path.suffix == ".txt":
        loader = TextLoader(file_path, encoding="utf-8")
    elif path.suffix == ".csv":
        loader = CSVLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {path.suffix}")

    return loader.load()


# -----------------------------
# 2. Cleaning
# -----------------------------

def clean_documents(documents: List[Document]) -> List[Document]:
    """
    Cleans raw documents by removing noise and unwanted text.
    """
    cleaned_docs = []

    for doc in documents:
        text = doc.page_content

        # Remove URLs
        text = re.sub(r"http\S+|www\S+", "", text)

        # Remove extra whitespace
        text = re.sub(r"\s+", " ", text).strip()

        # Skip empty content
        if not text:
            continue
        
        # Replaces original noisy text, Keeps metadata unchanged
        doc.page_content = text
        cleaned_docs.append(doc)

    return cleaned_docs


# -----------------------------
# 3. Chunking (Text Splitting)
# -----------------------------

def chunk_documents(
    documents: List[Document],
    chunk_size: int = 500,
    chunk_overlap: int = 80
) -> List[Document]:
    """
    Splits documents into chunks using LangChain splitter.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    return splitter.split_documents(documents)


# -----------------------------
# 4. Metadata Injection
# -----------------------------

def enrich_metadata(
    documents: List[Document],
    metadata: dict
) -> List[Document]:
    """
    Injects domain-specific metadata into each chunk.
    """
    for doc in documents:
        doc.metadata.update(metadata)
    return documents

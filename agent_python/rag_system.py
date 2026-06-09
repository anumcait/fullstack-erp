import os
from langchain_community.document_loaders import TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Configuration
KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "knowledge")
DB_DIR = os.path.join(os.path.dirname(__file__), "vector_db")

class RAGSystem:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_db = None

    def initialize_db(self):
        """
        Loads documents and builds the local vector database.
        """
        print("📚 Loading knowledge documents...")
        if not os.path.exists(KNOWLEDGE_DIR):
            os.makedirs(KNOWLEDGE_DIR)
            
        loader = DirectoryLoader(KNOWLEDGE_DIR, glob="**/*.txt", loader_cls=TextLoader)
        documents = loader.load()
        
        if not documents:
            print("⚠️ No documents found in knowledge/ directory.")
            return

        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = text_splitter.split_documents(documents)
        
        # Create/Load ChromaDB
        self.vector_db = Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            persist_directory=DB_DIR
        )
        print(f"✅ RAG System ready with {len(chunks)} knowledge chunks.")

    def search(self, query: str, k: int = 3):
        """
        Searches for the most relevant documents.
        """
        if not self.vector_db:
            return "Knowledge base not initialized."
            
        results = self.vector_db.similarity_search(query, k=k)
        return "\n".join([doc.page_content for doc in results])

# Global instance
rag_system = RAGSystem()

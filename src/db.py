from flask import Flask, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient("mongodb+srv://sanjay:sanjay@cluster0.fjcbkym.mongodb.net/test?retryWrites=true&w=majority")
db = client['cms']
collection = db['posts']

# Create a new document
@app.route("/api/documents", methods=["POST"])
def create_document():
    data = request.get_json()
    document = collection.insert_one(data)
    return jsonify({"_id": str(document.inserted_id)})

# Read all documents
@app.route("/api/documents", methods=["GET"])
def get_documents():
    documents = list(collection.find({}, {"_id": False}))
    return jsonify(documents)

# Read a single document
@app.route("/api/documents/<document_id>", methods=["GET"])
def get_document(document_id):
    document = collection.find_one({"_id": document_id}, {"_id": False})
    if document:
        return jsonify(document)
    else:
        return jsonify({"error": "Document not found"}), 404

# Update a document
@app.route("/api/documents/<document_id>", methods=["PUT"])
def update_document(document_id):
    data = request.get_json()
    result = collection.update_one({"_id": document_id}, {"$set": data})
    if result.modified_count > 0:
        return jsonify({"message": "Document updated successfully"})
    else:
        return jsonify({"error": "Document not found"}), 404

# Delete a document
@app.route("/api/documents/<document_id>", methods=["DELETE"])
def delete_document(document_id):
    result = collection.delete_one({"_id": document_id})
    if result.deleted_count > 0:
        return jsonify({"message": "Document deleted successfully"})
    else:
        return jsonify({"error": "Document not found"}), 404

if __name__ == "__main__":
    app.run(debug=True)

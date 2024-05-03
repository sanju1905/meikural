# Import necessary modules
from flask import Flask, request, jsonify
from pymongo import MongoClient

# Initialize Flask app
app = Flask(__name__)

# Initialize MongoDB client
# Replace the connection string with your MongoDB Atlas connection string
client = MongoClient("mongodb+srv://sanjay:sanjay@cluster0.fjcbkym.mongodb.net/test?retryWrites=true&w=majority")
db = client['cms']
collection = db['posts']

# Route to handle saving data
@app.route("/saveDataEndpoint", methods=["POST"])
def save_data():
    data = request.get_json()
    print(data)
    document = collection.insert_one(data)
    return jsonify({"_id": str(document.inserted_id)})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)

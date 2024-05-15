from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Update the MongoClient connection string
client = MongoClient('mongodb+srv://sanjay:sanjay@cluster0.fjcbkym.mongodb.net/test?retryWrites=true&w=majority')
db = client['editorjs']  # Ensure 'editorjs' is the correct database name
collection = db['articles']  # Ensure 'articles' is the correct collection name

@app.route('/savedata', methods=['POST'])
def add_data():
    data = request.json
    if data:
        result = collection.insert_one(data)
        inserted_id = str(result.inserted_id)
        return jsonify({'id': inserted_id, 'message': 'Data added successfully'}), 200
    else:
        return jsonify({'error': 'No data provided'}), 400


@app.route('/data', methods=['GET'])   
def get_all_data():
    try:
        data = list(collection.find())
        for item in data:
            item['_id'] = str(item['_id'])
        return jsonify(data), 200
    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred while fetching data'}), 500

@app.route('/data/<string:id>', methods=['GET'])
def get_data(id):
    try:
        data = collection.find_one({'_id': ObjectId(id)})
        if data:
            data['_id'] = str(data['_id'])
            return jsonify(data), 200
        else:
            return jsonify({'error': 'Data not found'}), 404
    except Exception as e:
        print(e)
        return jsonify({'error': 'Invalid ID format'}), 400
    
def convert_objectid_to_str(doc):
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc

@app.route('/fetchdata/<string:doc_id>', methods=['GET'])
def fetch_data(doc_id):
    try:
        doc = collection.find_one({'_id': ObjectId(doc_id)})
        if doc:
            doc = convert_objectid_to_str(doc)
            return jsonify(doc), 200
        else:
            return jsonify({'message': 'Document not found'}), 404
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@app.route('/updatedata/<string:id>', methods=['PUT'])
def update_data(id):
    data = request.json
    if data:
        try:
            result = collection.update_one({'_id': ObjectId(id)}, {'$set': data})
            if result.matched_count > 0:
                return jsonify({'message': 'Data updated successfully'}), 200
            else:
                return jsonify({'error': 'Data not found'}), 404
        except Exception as e:
            return jsonify({'error': str(e)}), 400
    else:
        return jsonify({'error': 'No data provided'}), 400



if __name__ == '__main__':
    app.run(debug=True,port=5000)

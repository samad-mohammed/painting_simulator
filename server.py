from flask import Flask, request, jsonify, send_file, make_response
from flask_mysqldb import MySQL
import os
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime
   
import base64
from PIL import Image
from io import BytesIO
import traceback
from werkzeug.utils import secure_filename

import pytz
from datetime import datetime


app = Flask(__name__)

app.config['SECRET_KEY'] = os.urandom(24)

CORS(app)
bcrypt = Bcrypt(app)


app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Samad@123'
app.config['MYSQL_DB'] = 'weld'
app.config['MYSQL_PORT'] = 3306


mysql = MySQL(app)

@app.route('/login', methods=['POST'])
def login(): 
    data = request.get_json()
    userid = data.get('myArmyId')
    password = data.get('myPassword')
    # print(userid + " "+ password)
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM student_table WHERE myArmyId = %s", (userid,))
    user = cursor.fetchone()

    if user and bcrypt.check_password_hash(user[4], password):
        return jsonify({'message': 'Login successful', 'name': user[1]})
    else:
        print()
        return jsonify({'message': 'Login failed'})


@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        my_name = data.get('myName')
        my_army_id = data.get('myArmyId')
        my_batch_no = data.get('myBatchNo')
        my_set_password = data.get('mySetPassword')
        hashed_password = bcrypt.generate_password_hash(my_set_password).decode('utf-8')
        print(my_name)
        with mysql.connection.cursor() as cursor:
            cursor.execute("SELECT * FROM student_table WHERE myArmyId = %s", (my_army_id,))
            existing_user = cursor.fetchone()

            if existing_user:
                return jsonify({'message': 'Army ID already exists'}), 203

            # Insert the new user into the database
            insert_query = "INSERT INTO student_table (myName, myArmyId, myBatchNo, mySetPassword) VALUES (%s, %s, %s, %s)"
            cursor.execute(insert_query, (my_name, my_army_id, my_batch_no, hashed_password))
            mysql.connection.commit()

        return jsonify({'message': 'Registration successful'}), 200

    except Exception as e:
        return jsonify({'error': 'Internal Server Error'}), 500



@app.route('/game_login', methods=['POST'])
def game_login(): 
    try:
        # Get the data sent from Unity
        data = request.json
        # Extract login and password from the JSON data
    
        login = data.get('Login')   
        password = data.get('Password')
        
        # Query the database for the user
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM student_table WHERE myArmyId = %s", (login,))
        user = cursor.fetchone()

        # Check if user exists and password is correct
        if user and bcrypt.check_password_hash(user[4], password):
            return jsonify({'message': 'Login successful', 'name': user[1]}), 200
        else:
            return jsonify({'message': 'Login failed'}), 401
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
    
@app.route('/upload_image', methods=['POST'])
def upload_image():
    try:
        # Get form data
        army_id = request.form['armyId']
        score = request.form.get('score')
        image_file = request.files['image']

        if not all([army_id, image_file]):
            return jsonify({"error": "Incomplete form data"}), 400
        
        # Read image data as binary
        image_data = image_file.read()

        # Set score to 0 if it is None, empty, or not a valid integer
        try:
            score = int(score)
        except (TypeError, ValueError):
            score = 0

        # Convert image data to binary format
        blob_data = BytesIO(image_data).read()

        # Generate filename using timestamp
        timestamp = datetime.now(pytz.timezone('Asia/Kolkata')).strftime('%m-%d_%H-%M-%S')
        filename = f'{army_id}_{timestamp}.png'

        # Determine final result
        final_result = 'Pass' if score >= 40 else 'Fail'

        # Insert data into database
        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO students_result_table (myArmyId, image_blob, created_at, score, final_result) VALUES (%s, %s, %s, %s, %s)",
                       (army_id, blob_data, datetime.now(pytz.timezone('Asia/Kolkata')), score, final_result))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "Image uploaded successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred while processing the image: {str(e)}"}), 500


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/get_latest_student_activity', methods=['GET'])
def get_latest_student_activity():
    try:
        search_name = request.args.get('name', '')
        batch_no = request.args.get('batch', '')  # Get the batch number parameter

        cursor = mysql.connection.cursor()

        # SQL query to fetch the most recent date
        max_date_query = "SELECT MAX(created_at) FROM students_result_table"
        cursor.execute(max_date_query)
        latest_date = cursor.fetchone()[0].strftime('%Y-%m-%d')

        # SQL query to fetch results of the most recent date with optional batch filter
        query = """
        SELECT s.myArmyId, s.myName, i.image_blob, i.created_at, i.score, i.final_result, s.myBatchNo
        FROM students_result_table i
        JOIN student_table s ON i.myArmyId = s.myArmyId
        WHERE DATE(i.created_at) = %s AND s.myName LIKE %s
             ORDER BY i.score DESC
        """
        if batch_no:  # Check if batch number is provided
            query += " AND s.myBatchNo = %s"
            cursor.execute(query, (latest_date, '%' + search_name + '%', batch_no))
        else:
            cursor.execute(query, (latest_date, '%' + search_name + '%'))

        results = cursor.fetchall()
        cursor.close()

        # Create a list of dictionaries with the required data
        data_list = []
        for result in results:
            # Convert the binary image data to base64
            image_base64 = base64.b64encode(result[2]).decode('utf-8')
            data = {
                'myArmyId': result[0],
                'myName': result[1],
                'imageData': image_base64,  # Include the base64 encoded image data
                'created_at': result[3],
                'score': result[4],
                'final_result': result[5],
                'batch_no' : result[6]
            }
            data_list.append(data)

        return jsonify({'dataList': data_list})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_all_student_activity', methods=['GET'])
def get_all_student_activity():
    try:
        # Retrieve the 'name' query parameter from the request
        search_name = request.args.get('name', '')

        cursor = mysql.connection.cursor()

        # Adjusted SQL query to filter by name if provided
        query = """
        SELECT s.myArmyId, s.myName, i.image_blob, i.created_at, i.score, i.final_result, s.myBatchNo
        FROM students_result_table i
        JOIN student_table s ON i.myArmyId = s.myArmyId
        WHERE s.myName LIKE %s
        ORDER BY i.score DESC
        """
        
        cursor.execute(query, ('%' + search_name + '%',))

        results = cursor.fetchall()
        cursor.close()

        # Create a list of dictionaries with the required data
        data_list = []
        for result in results:
            # Convert the binary image data to base64
            image_base64 = base64.b64encode(result[2]).decode('utf-8')
            data = {
                'myArmyId': result[0],
                'myName': result[1],
                'imageData': image_base64,  # Include the base64 encoded image data
                'created_at': result[3],
                'score': result[4],
                'final_result': result[5],
                'batch_no' : result[6]
            }
            data_list.append(data)

        return jsonify({'dataList': data_list})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get_particular_student_activity', methods=['GET'])
def get_particular_student_activity():
    try:
        armyId = request.args.get('myArmyId')
        cursor = mysql.connection.cursor()
        query = """
        SELECT s.myArmyId, s.myName, i.image_blob, i.created_at, i.score, i.final_result, s.myBatchNo
        FROM students_result_table i
        JOIN student_table s ON i.myArmyId = s.myArmyId
        WHERE i.myArmyid = %s
        ORDER BY i.score DESC
        """
        
        cursor.execute(query, (armyId,))

        results = cursor.fetchall()
        cursor.close()

        # Create a list of dictionaries with the required data
        data_list = []
        for result in results:
            # Convert the binary image data to base64
            image_base64 = base64.b64encode(result[2]).decode('utf-8')
            data = {
                'myArmyId': result[0],
                'myName': result[1],
                'imageData': image_base64,  # Include the base64 encoded image data
                'created_at': result[3],
                'score': result[4],
                'final_result': result[5],
                'batch_no' : result[6]
            }
            data_list.append(data)

        return jsonify({'dataList': data_list})

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/get_total_students', methods=['GET'])
def get_total_students():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT COUNT(DISTINCT myArmyId) FROM students_result_table")
        result = cursor.fetchone()
        total_students = result[0] if result else 0
        cursor.close()

        return jsonify({'totalStudents': total_students})

    except Exception as e:
        return jsonify({'error': str(e)})

# -------------------------- Delete students ---------------------------------------
@app.route('/batch_summary', methods=['GET'])
def batch_summary():
    try:
        # Query to get batch summary with count of students enrolled in each batch
        query = """
            SELECT s.myBatchNo, COUNT(s.myArmyId) AS student_count
            FROM student_table s
            LEFT JOIN students_result_table i ON i.myArmyId = s.myArmyId
            GROUP BY s.myBatchNo
        """

        cursor = mysql.connection.cursor()
        cursor.execute(query)
        batch_summary = cursor.fetchall()
        cursor.close()
        # print(batch_summary.student_count)
        return jsonify(batch_summary), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred while fetching batch summary: {str(e)}"}), 500
@app.route('/batches', methods=['GET'])
def batches():
    try:
        # Query to get batch summary with count of students enrolled in each batch
        query = """
            SELECT s.myBatchNo AS batches
            FROM student_table s
            LEFT JOIN students_result_table i ON i.myArmyId = s.myArmyId
            GROUP BY s.myBatchNo
        """

        cursor = mysql.connection.cursor()
        cursor.execute(query)
        all_batches = cursor.fetchall()
        cursor.close()
        # print(batch_summary.student_count)
        return jsonify(all_batches), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred while fetching batch summary: {str(e)}"}), 500

@app.route('/remove_student', methods=['POST'])
def remove_student():
    try:
        # Get batch number from request data
        data = request.get_json()
        armyId = data.get("armyId")
        batch_number = data.get('batchNumber')

        if not batch_number:
            return jsonify({"error": "No batch number provided"}), 400

        # Start a database transaction
        cursor = mysql.connection.cursor()

        try:
            # Prepare SQL query to delete students from student_table by batch number
            query1 = "DELETE FROM student_table WHERE myArmyId = %s AND myBatchNo = %s"
            cursor.execute(query1, (armyId, batch_number,))

            # Prepare SQL query to delete corresponding students from students_result_table
            query2 = "DELETE FROM students_result_table WHERE myArmyId = %s"
            cursor.execute(query2, (armyId,))

            # Commit the transaction
            mysql.connection.commit()
            cursor.close()

            return jsonify({"message": f"All students of batch {batch_number} deleted successfully"}), 200

        except Exception as e:
            # Rollback the transaction if an error occurs
            mysql.connection.rollback()
            cursor.close()
            traceback.print_exc()  # Log the exception traceback
            return jsonify({"error": f"An error occurred while deleting students: {str(e)}"}), 500

    except Exception as e:
        traceback.print_exc()  # Log the exception traceback
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    
@app.route('/delete_students_by_batch', methods=['POST'])
def delete_students_by_batch():
    try:
        # Get batch number from request data
        data = request.get_json()
        batch_number = data.get('deleteBatchNumber')

        if not batch_number:
            return jsonify({"error": "No batch number provided"}), 400

        # Start a database transaction
        cursor = mysql.connection.cursor()

        try:
            # Prepare SQL query to delete students from student_table by batch number
            query1 = "DELETE FROM student_table WHERE myBatchNo = %s"
            cursor.execute(query1, (batch_number,))

            # Prepare SQL query to delete corresponding students from students_result_table
            query2 = "DELETE FROM students_result_table WHERE myArmyId IN (SELECT myArmyId FROM student_table WHERE myBatchNo = %s)"
            cursor.execute(query2, (batch_number,))

            # Commit the transaction
            mysql.connection.commit()
            cursor.close()

            return jsonify({"message": f"All students of batch {batch_number} deleted successfully"}), 200

        except Exception as e:
            # Rollback the transaction if an error occurs
            mysql.connection.rollback()
            cursor.close()
            traceback.print_exc()  # Log the exception traceback
            return jsonify({"error": f"An error occurred while deleting students: {str(e)}"}), 500

    except Exception as e:
        traceback.print_exc()  # Log the exception traceback
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

#---------------------   Books uploads, view, delete   -------------------------------------

@app.route('/upload-file', methods=['POST'])
def upload_file():
    try:
       
        instructor_name = request.form.get('instructorName')
        book_name = request.form.get('bookName')

        if 'file' not in request.files:
            return jsonify(error="No file uploaded"), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify(error="No selected file"), 400

        if file:
            filename = secure_filename(file.filename)
            file_data = file.read()

            # Insert data into the database
            insert_query = "INSERT INTO uploads_table (filename, file_data, instructor_name, book_name) VALUES (%s, %s, %s, %s)"

            with mysql.connection.cursor() as cursor:
                values = (filename, file_data, instructor_name, book_name)
                cursor.execute(insert_query, values)
                mysql.connection.commit()
                cursor.close()

            return jsonify(message="File uploaded successfully"), 200

    except Exception as e:
        # print(f"Error uploading file: {e}")
        return jsonify(error="Internal Server Error"), 500


@app.route('/get-files', methods=['GET'])
def get_files():
    with mysql.connection.cursor() as cursor:
        cursor.execute("SELECT id,instructor_name,  book_name FROM uploads_table")
        files = cursor.fetchall()
        # print(files)
    file_list = [{'id': file[0],'instructor_name':file[1],'book_name': file[2], 'url': f'/view-file/{file[0]}'}
                 for file in files]

    return jsonify({'files': file_list})

@app.route('/delete-file/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    try:
        with mysql.connection.cursor() as cursor:
            cursor.execute("DELETE FROM uploads_table WHERE id = %s", (file_id,))
            mysql.connection.commit()

        return jsonify({'message': 'File deleted successfully', 'success': True})
    except Exception as e:
        return jsonify({'message': f'Error deleting file: {str(e)}', 'success': False})


# Assuming you have a route like this to get the blob data for a file
@app.route('/get-file/<file_id>', methods=['GET'])
def get_file(file_id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT file_data FROM uploads_table WHERE id = %s", (file_id,))
    result = cursor.fetchone()

    if result:
        file_data = result[0]

        # Create a BytesIO object to store the blob data
        bytes_io = BytesIO(file_data)

        # Create a response with appropriate content type and headers
        response = make_response(send_file(bytes_io, as_attachment=True, download_name=f'file_{file_id}'))
        response.headers['Content-Type'] = 'application/pdf'  # Modify content type based on your file type

        return response
    else:
        return jsonify({'message': 'File not found'}), 404

#---------------------   ***** Books API End *****   -------------------------------------


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000,debug=True)

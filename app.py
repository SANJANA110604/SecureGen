from flask import Flask, request, jsonify, send_from_directory
import secrets
import string
import json
import os
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store for passwords (in production, use a database)
passwords_store = []

def generate_password_api(length, use_uppercase, use_lowercase, use_numbers, use_symbols, exclude_similar):
    """Generate a secure password based on given parameters"""
    
    # Build character pool
    char_pool = ''
    
    if use_uppercase:
        char_pool += string.ascii_uppercase
    if use_lowercase:
        char_pool += string.ascii_lowercase
    if use_numbers:
        char_pool += string.digits
    if use_symbols:
        char_pool += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Remove similar characters if requested
    if exclude_similar:
        similar_chars = "il1Lo0O"
        for char in similar_chars:
            char_pool = char_pool.replace(char, '')
    
    # Ensure character pool is not empty
    if not char_pool:
        char_pool = string.ascii_letters + string.digits
    
    # Generate password using cryptographically secure random generator
    password = ''.join(secrets.choice(char_pool) for _ in range(length))
    
    return password

def calculate_password_strength(password):
    """Calculate the strength of a password (0-100)"""
    score = 0
    
    # Length contributes up to 40 points
    score += min(len(password) * 3, 40)
    
    # Character variety contributes up to 60 points
    has_lowercase = any(c.islower() for c in password)
    has_uppercase = any(c.isupper() for c in password)
    has_numbers = any(c.isdigit() for c in password)
    has_symbols = any(not c.isalnum() for c in password)
    
    variety_count = sum([has_lowercase, has_uppercase, has_numbers, has_symbols])
    score += (variety_count - 1) * 15
    
    # Deductions for patterns
    # Check for repeated characters
    for i in range(len(password) - 2):
        if password[i] == password[i+1] == password[i+2]:
            score -= 20
            break
    
    # Check if only letters
    if password.isalpha():
        score -= 15
    
    # Check if only numbers
    if password.isdigit():
        score -= 20
    
    # Normalize score
    score = max(0, min(100, score))
    
    return score

@app.route('/')
def serve_index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/generate', methods=['POST'])
def generate_password():
    """API endpoint to generate passwords"""
    try:
        data = request.json
        
        # Get parameters from request
        length = data.get('length', 12)
        quantity = data.get('quantity', 1)
        use_uppercase = data.get('uppercase', True)
        use_lowercase = data.get('lowercase', True)
        use_numbers = data.get('numbers', True)
        use_symbols = data.get('symbols', True)
        exclude_similar = data.get('exclude_similar', False)
        
        # Validate input
        if length < 6 or length > 50:
            return jsonify({'error': 'Password length must be between 6 and 50'}), 400
        
        if quantity < 1 or quantity > 10:
            return jsonify({'error': 'Quantity must be between 1 and 10'}), 400
        
        # Generate password(s)
        if quantity == 1:
            password = generate_password_api(
                length, use_uppercase, use_lowercase, 
                use_numbers, use_symbols, exclude_similar
            )
            passwords = [password]
        else:
            passwords = []
            for _ in range(quantity):
                password = generate_password_api(
                    length, use_uppercase, use_lowercase, 
                    use_numbers, use_symbols, exclude_similar
                )
                passwords.append(password)
        
        # Calculate strength for the first password
        strength_score = calculate_password_strength(passwords[0])
        
        # Determine strength level
        if strength_score < 30:
            strength_level = "Weak"
        elif strength_score < 60:
            strength_level = "Fair"
        elif strength_score < 80:
            strength_level = "Good"
        else:
            strength_level = "Strong"
        
        # Store the password if single
        if quantity == 1:
            password_record = {
                'password': passwords[0],
                'timestamp': datetime.now().isoformat(),
                'strength': strength_score,
                'length': length
            }
            passwords_store.append(password_record)
            
            # Keep only last 20 passwords
            if len(passwords_store) > 20:
                passwords_store.pop(0)
        
        # Prepare response
        response = {
            'passwords': passwords,
            'strength': {
                'score': strength_score,
                'level': strength_level
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/save', methods=['POST'])
def save_password():
    """API endpoint to save a password (for demonstration)"""
    try:
        data = request.json
        password = data.get('password', '')
        
        if not password:
            return jsonify({'error': 'No password provided'}), 400
        
        # In a real application, you would:
        # 1. Hash the password (never store plain text passwords!)
        # 2. Store in a secure database
        # 3. Associate with a user account
        
        # For this demo, we'll just log and return a success message
        print(f"Password received for secure storage (would be hashed in production): {password[:3]}...")
        
        # Simulate secure storage
        timestamp = datetime.now().isoformat()
        
        return jsonify({
            'message': 'Password saved securely',
            'timestamp': timestamp,
            'note': 'In production, passwords are never stored in plain text!'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """API endpoint to get password generation history"""
    # Return only basic info (not the actual passwords in a real app)
    history = []
    for record in passwords_store[-10:]:  # Last 10 passwords
        history.append({
            'timestamp': record['timestamp'],
            'strength': record['strength'],
            'length': record['length']
        })
    
    return jsonify({'history': history})

@app.route('/analyze', methods=['POST'])
def analyze_password():
    """API endpoint to analyze password strength"""
    try:
        data = request.json
        password = data.get('password', '')
        
        if not password:
            return jsonify({'error': 'No password provided'}), 400
        
        # Calculate strength
        score = calculate_password_strength(password)
        
        # Determine level
        if score < 30:
            level = "Weak"
            suggestions = [
                "Increase password length to at least 12 characters",
                "Add numbers and special characters",
                "Use a mix of uppercase and lowercase letters"
            ]
        elif score < 60:
            level = "Fair"
            suggestions = [
                "Consider increasing length further",
                "Add more variety of character types",
                "Avoid common words and patterns"
            ]
        elif score < 80:
            level = "Good"
            suggestions = [
                "Your password is reasonably strong",
                "Consider using a passphrase for even better security"
            ]
        else:
            level = "Strong"
            suggestions = [
                "Excellent password strength!",
                "Consider using a password manager to store it securely"
            ]
        
        # Additional analysis
        length = len(password)
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(not c.isalnum() for c in password)
        
        return jsonify({
            'score': score,
            'level': level,
            'length': length,
            'has_lowercase': has_lower,
            'has_uppercase': has_upper,
            'has_numbers': has_digit,
            'has_symbols': has_special,
            'suggestions': suggestions
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Password Generator Server...")
    print("Open your browser and navigate to: http://localhost:5000")
    app.run(debug=True, port=5000)
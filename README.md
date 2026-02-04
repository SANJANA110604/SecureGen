# 🔐 SecureGen - Password Generator

A modern password generator built with Python Flask, HTML5, CSS3, JavaScript and Python/Flask. This is my engineering student project featuring a beautiful responsive interface and advanced security features.

## ✨ Features

### 🔒 Advanced Security
- **Cryptographically Secure Generation**: Uses Python's `secrets` module for true randomness
- **Multiple Character Sets**: Uppercase, lowercase, numbers, symbols, and custom characters
- **Sensible Passwords**: Generates memorable passwords with word-like structures (e.g., "Blue42River", "Quick157er")
- **Password Strength Analysis**: Real-time strength scoring and detailed analysis
- **Advanced Options**: Exclude similar characters, prevent duplicates, avoid sequential patterns

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with smooth animations
- **Real-time Preview**: See password strength and characteristics as you configure
- **Interactive Controls**: Clickable character set options with visual feedback
- **Toast Notifications**: User-friendly success/error messages

### 📊 Analytics & History
- **Password History**: Save and manage generated passwords
- **Statistics Dashboard**: Track total passwords generated and strong password count
- **Strength Meter**: Visual representation of password security levels
- **Detailed Analysis**: Character variety, entropy calculation, pattern detection

### 🚀 Performance
- **Client-side Generation**: All passwords generated locally in your browser
- **No Data Storage**: Your passwords never leave your device
- **Fast & Lightweight**: Optimized for speed and minimal resource usage

## 🛠️ Technologies Used

- **Backend**: Python 3.7+, Flask 2.0+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables for theming
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Poppins, JetBrains Mono)
- **Security**: Python `secrets` module for cryptographic security

## 📋 Prerequisites

Before running this application, make sure you have:

- Python 3.7 or higher installed
- pip (Python package manager)
- A modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SANJANA110604/securegen.git
   cd securegen-pro
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install flask flask-cors
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

## 📖 Usage

### Basic Password Generation

1. **Set Password Length**: Use the length slider (8-32 characters)
2. **Select Character Sets**: Click on the character set options you want to include:
   - 🔤 Uppercase letters (A-Z)
   - 🔡 Lowercase letters (a-z)
   - 🔢 Numbers (0-9)
   - 🔣 Symbols (!@#$%^&*)
   - 🎯 Custom characters (define your own)
3. **Set Quantity**: Choose how many passwords to generate (1-20)
4. **Click "Generate Passwords"**: Your secure passwords will appear instantly

### Advanced Options

- **Exclude Similar Characters**: Removes confusing characters like 'i', 'l', '1', 'O', '0'
- **No Duplicates**: Ensures no repeated characters in the password
- **Avoid Sequential Patterns**: Prevents patterns like 'abc', '123', etc.
- **Pronounceable**: Generates easier-to-remember passwords

### Managing Generated Passwords

- **Copy Individual Passwords**: Click the copy icon next to each password
- **Copy All Passwords**: Use the "Copy All" button to copy all generated passwords
- **Save to History**: Click the save icon to store passwords for later reference
- **Clear Results**: Remove all generated passwords from the current session

### Theme Switching

Click the moon/sun icon in the top-right corner to toggle between light and dark themes.

The Flask backend provides the following API endpoints:

- `GET /` - Serve the main application
- `POST /generate` - Generate passwords (accepts JSON with parameters)
- `GET /history` - Retrieve password history
- `POST /analyze` - Analyze password strength
- `DELETE /history` - Clear password history

### Example API Usage

```python
import requests

# Generate passwords
response = requests.post('http://localhost:5000/generate', json={
    'length': 16,
    'quantity': 5,
    'use_uppercase': True,
    'use_lowercase': True,
    'use_numbers': True,
    'use_symbols': True
})

passwords = response.json()['passwords']
```

## 🏗️ Project Structure

```
securegen-pro/
├── app.py                 # Flask backend server
├── Index.html            # Main HTML page
├── script.js             # Frontend JavaScript logic
├── style.css             # CSS styling and themes
├── README.md             # Project documentation
└── requirements.txt      # Python dependencies
```

---

**Built with ❤️ by an Engineering Student**

*SecureGen - My Password Generator Project*


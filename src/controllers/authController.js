exports.login = async (req, res) => {
    const { username, password } = req.body;
    // Simple hardcoded check for now
    if (username === 'admin' && password === 'admin') {
        return res.json({ success: true, message: 'Login successful' });
    }
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
};

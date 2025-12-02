const { Sale, Customer, Product } = require('../models');

exports.getStats = async (req, res) => {
    try {
        const sales = await Sale.find({});
        const totalSales = sales.reduce((sum, s) => sum + (s.manualTotal || s.total || 0), 0);
        const totalCustomers = await Customer.countDocuments();
        const lowStockItems = await Product.countDocuments({ $expr: { $lte: ["$stock", "$minStock"] } });
        const today = new Date().toISOString().slice(0, 10);
        const todaySales = sales.filter(s => s.timestamp.startsWith(today)).reduce((sum, s) => sum + (s.manualTotal || s.total || 0), 0);

        res.json({ todaySales, totalCustomers, lowStockItems, totalRevenue: totalSales });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRecentSales = async (req, res) => {
    try {
        const recent = await Sale.find({}).sort({ timestamp: -1 }).limit(4);
        // Process to match frontend expectation if needed
        res.json(recent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLowStock = async (req, res) => {
    try {
        const lowStock = await Product.find({ $expr: { $lte: ["$stock", "$minStock"] } }).limit(4);
        const mapped = lowStock.map(p => ({
            ...p.toObject(),
            image: p.image_id ? `/api/images/${p.image_id}` : p.image_path ? `/Uploads/${p.image_path}` : null
        }));
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const { Customer } = require('../models');

exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({});
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addCustomer = async (req, res) => {
    try {
        const customer = await Customer.create(req.body);
        res.status(201).json({ message: "Customer added", customer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        await Customer.updateOne({ _id: req.params.id }, req.body);
        res.json({ message: "Customer updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        await Customer.deleteOne({ _id: req.params.id });
        res.json({ message: "Customer deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchCustomers = async (req, res) => {
    try {
        const query = req.query.query || '';
        const customers = await Customer.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phone: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

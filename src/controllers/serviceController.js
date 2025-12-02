const { Service } = require('../models');

exports.getServices = async (req, res) => {
    try {
        const services = await Service.find({});
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addService = async (req, res) => {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ message: "Service added", id: service._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        delete data._id;
        await Service.updateOne({ _id: id }, { $set: data });
        res.json({ message: "Service updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        await Service.deleteOne({ _id: req.params.id });
        res.json({ message: "Service deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const { Setting, Print, Email } = require('../models');

exports.getSettings = async (req, res) => {
    try {
        const s = await Setting.findOne({ key: "gst_settings" });
        res.json(s || { gstPercentage: 18, enableGst: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.saveSettings = async (req, res) => {
    try {
        await Setting.updateOne({ key: "gst_settings" }, { $set: req.body }, { upsert: true });
        res.json({ message: "Settings saved" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPrintSettings = async (req, res) => {
    try {
        const p = await Print.findOne({ _id: "print_settings" });
        res.json(p || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.savePrintSettings = async (req, res) => {
    try {
        await Print.updateOne({ _id: "print_settings" }, { $set: req.body }, { upsert: true });
        res.json({ message: "Print settings saved" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEmailSettings = async (req, res) => {
    try {
        const e = await Email.findOne({});
        res.json(e || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.saveEmailSettings = async (req, res) => {
    try {
        await Email.updateOne({}, { $set: req.body }, { upsert: true });
        res.json({ message: "Email settings saved" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

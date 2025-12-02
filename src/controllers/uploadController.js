const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Product } = require('../models');
const xlsx = require('xlsx');

const getBucket = () => {
    const db = mongoose.connection.db;
    return new GridFSBucket(db);
};

exports.uploadImages = async (req, res) => {
    try {
        const files = req.files;
        const bucket = getBucket();
        const uploadedImages = [];

        for (const file of files) {
            const uploadStream = bucket.openUploadStream(file.originalname, { contentType: file.mimetype });
            uploadStream.end(file.buffer);
            uploadedImages.push({
                filename: file.originalname,
                imageId: uploadStream.id,
                path: `/api/images/${uploadStream.id}`
            });
        }
        res.status(201).json({ message: "Images uploaded successfully", uploadedImages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.serveImage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid image ID" });

        const bucket = getBucket();
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(id));

        downloadStream.on('error', () => res.status(404).json({ error: "Image not found" }));
        downloadStream.pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.exportMobiles = async (req, res) => {
    try {
        const data = await Product.find({ category: { $regex: '^mobile$', $options: 'i' } }).lean();
        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Mobiles");
        const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="mobiles.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buf);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

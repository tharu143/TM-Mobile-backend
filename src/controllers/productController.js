const { Product, Mobile, Accessory, StockAddition } = require('../models');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Helper to get GridFS bucket
const getBucket = () => {
    const db = mongoose.connection.db;
    return new GridFSBucket(db);
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        const mapped = products.map(p => ({
            ...p.toObject(),
            image: p.image_id ? `/api/images/${p.image_id}` : p.image_path ? `/api/images/by-name/${p.image_path}` : null
        }));
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const data = req.body;
        const file = req.file;

        if (data.category?.toLowerCase() === 'mobile' && data.newMobile) {
            await Mobile.updateOne({ name: data.newMobile }, { $setOnInsert: { name: data.newMobile, category: 'Mobile' } }, { upsert: true });
            data.model = data.newMobile;
        }
        if (data.category?.toLowerCase() === 'accessories' && data.newAccessoryName && data.newAccessoryModel) {
            const fullName = `${data.newAccessoryModel} - ${data.newAccessoryName}`;
            await Accessory.updateOne(
                { accessoryName: data.newAccessoryName, accessoryModel: data.newAccessoryModel },
                { $setOnInsert: { accessoryName: data.newAccessoryName, accessoryModel: data.newAccessoryModel, category: 'Accessories', type: data.type } },
                { upsert: true }
            );
            data.accessoryType = fullName;
        }

        const productData = {
            name: data.name,
            price: parseFloat(data.price || 0),
            stock: parseInt(data.stock || 0),
            category: data.category,
            supplier: data.supplier || '',
            minStock: parseInt(data.minStock || 5),
            barcode: data.barcode || `BC${Date.now()}`,
            model: data.model || '',
            accessoryType: data.accessoryType || '',
            type: data.type || '',
            image_path: data.image_path || null
        };

        if (file) {
            const bucket = getBucket();
            const uploadStream = bucket.openUploadStream(file.originalname, { contentType: file.mimetype });
            uploadStream.end(file.buffer);
            productData.image_id = uploadStream.id;
            productData.image_path = file.originalname;
        }

        const product = new Product(productData);
        await product.save();

        if (product.stock > 0) {
            await StockAddition.create({ product_id: product._id.toString(), quantity: product.stock, date: new Date().toISOString() });
        }

        res.status(201).json({ message: "Product added", id: product._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const file = req.file;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        if (file) {
            const bucket = getBucket();
            if (product.image_id) {
                try { await bucket.delete(new mongoose.Types.ObjectId(product.image_id)); } catch (e) { }
            }
            const uploadStream = bucket.openUploadStream(file.originalname, { contentType: file.mimetype });
            uploadStream.end(file.buffer);
            data.image_id = uploadStream.id;
            data.image_path = file.originalname;
        }

        // Logic for updating stock additions if stock changed
        if (data.stock && parseInt(data.stock) > product.stock) {
            const diff = parseInt(data.stock) - product.stock;
            await StockAddition.create({ product_id: id, quantity: diff, date: new Date().toISOString() });
        }

        Object.assign(product, data);
        await product.save();
        res.json({ message: "Product updated" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        if (product.image_id) {
            const bucket = getBucket();
            try { await bucket.delete(new mongoose.Types.ObjectId(product.image_id)); } catch (e) { }
        }

        await Product.deleteOne({ _id: id });
        res.json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMobiles = async (req, res) => {
    try {
        const mobiles = await Mobile.find({});
        res.json(mobiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addMobile = async (req, res) => {
    try {
        await Mobile.create(req.body);
        res.status(201).json({ message: "Mobile type added" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAccessories = async (req, res) => {
    try {
        const accessories = await Accessory.find({});
        res.json(accessories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addAccessory = async (req, res) => {
    try {
        await Accessory.create(req.body);
        res.status(201).json({ message: "Accessory type added" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

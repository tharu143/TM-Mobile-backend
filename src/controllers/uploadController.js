const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { Product, Mobile, Accessory, StockAddition } = require('../models');
const xlsx = require('xlsx');

const getBucket = () => {
    if (mongoose.connection.readyState !== 1) {
        throw new Error("Database not connected");
    }
    const db = mongoose.connection.db;
    return new GridFSBucket(db);
};

exports.uploadImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }
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

exports.importProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No Excel file provided" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        let importedCount = 0;
        const errors = [];

        for (const [index, row] of data.entries()) {
            try {
                // Map Excel columns to DB fields (adjust keys based on your template)
                // Assuming keys like "Name", "Price", "Stock", "Category", "Supplier", "MinStock", "Barcode", "Model", "Type", "AccessoryType", "ImagePath"
                // Case insensitive mapping helper could be useful, but keeping it simple for now based on likely template

                const name = row['Name'] || row['name'];
                if (!name) {
                    errors.append(`Row ${index + 2}: Name is required`);
                    continue;
                }

                const productData = {
                    name: String(name).trim(),
                    price: parseFloat(row['Price (₹)'] || row['Price'] || row['price'] || 0),
                    stock: parseInt(row['Stock Quantity'] || row['Stock'] || row['stock'] || 0),
                    category: String(row['Category'] || row['category'] || '').trim(),
                    supplier: String(row['Supplier'] || row['supplier'] || '').trim(),
                    minStock: parseInt(row['Minimum Stock Level'] || row['MinStock'] || row['minStock'] || 5),
                    barcode: String(row['Barcode'] || row['barcode'] || `BC${Date.now() + index}`).trim(),
                    model: String(row['Model'] || row['model'] || '').trim(),
                    type: String(row['Type'] || row['type'] || '').trim(),
                    accessoryType: String(row['Accessory Type'] || row['AccessoryType'] || row['accessoryType'] || '').trim(),
                    image_path: String(row['Image Path'] || row['ImagePath'] || row['image_path'] || '').trim() || null
                };

                // Logic for Mobile/Accessory types creation if they don't exist
                if (productData.category.toLowerCase() === 'mobile' && productData.model) {
                    await Mobile.updateOne(
                        { name: productData.model },
                        { $setOnInsert: { name: productData.model, category: 'Mobile' } },
                        { upsert: true }
                    );
                }

                if (productData.category.toLowerCase() === 'accessories' && productData.accessoryType) {
                    // Try to split if format is "Model - Name"
                    let accName = productData.accessoryType;
                    let accModel = "";
                    if (productData.accessoryType.includes(' - ')) {
                        [accModel, accName] = productData.accessoryType.split(' - ');
                    }
                    await Accessory.updateOne(
                        { accessoryName: accName, accessoryModel: accModel },
                        { $setOnInsert: { accessoryName: accName, accessoryModel: accModel, category: 'Accessories', type: productData.type } },
                        { upsert: true }
                    );
                }

                const product = new Product(productData);
                await product.save();

                if (product.stock > 0) {
                    await StockAddition.create({ product_id: product._id.toString(), quantity: product.stock, date: new Date().toISOString() });
                }
                importedCount++;
            } catch (err) {
                errors.push(`Row ${index + 2}: ${err.message}`);
            }
        }

        res.json({
            message: `Successfully imported ${importedCount} products`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

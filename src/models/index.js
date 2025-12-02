const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    category: { type: String, required: true },
    supplier: { type: String, default: '' },
    minStock: { type: Number, default: 5 },
    barcode: { type: String },
    model: { type: String, default: '' },
    type: { type: String, default: '' },
    accessoryType: { type: String, default: '' },
    image_path: { type: String, default: null },
    image_id: { type: String, default: null }
});

const mobileSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, default: 'Mobile' }
});

const accessorySchema = new mongoose.Schema({
    accessoryName: { type: String, required: true },
    accessoryModel: { type: String, required: true },
    category: { type: String, default: 'Accessories' },
    type: { type: String, default: '' }
});

const saleSchema = new mongoose.Schema({
    customer: {
        id: { type: String },
        name: { type: String },
        phone: { type: String }
    },
    items: [{
        id: { type: String },
        name: { type: String },
        quantity: { type: Number },
        price: { type: Number },
        total: { type: Number }
    }],
    subtotal: { type: Number },
    tax: { type: Number },
    total: { type: Number },
    manualTotal: { type: Number },
    paymentMethod: { type: String },
    timestamp: { type: String },
    invoiceId: { type: String },
    status: { type: String, default: 'completed' },
    gstPercentage: { type: Number }
});

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    purchases: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    lastPurchase: { type: String, default: '' },
    posBalance: { type: Number, default: 0 }
});

const serviceSchema = new mongoose.Schema({
    customer: {
        name: String,
        phone: String,
        address: String
    },
    device: {
        brand: String,
        model: String,
        imei: String,
        color: String,
        ram: String,
        rom: String,
        password: String,
        receivedBy: String,
        receivedDate: String
    },
    problem: {
        complaintType: String,
        description: String,
        productRate: Number,
        serviceCharge: Number
    },
    status: { type: String, default: 'pending' },
    total: Number,
    manualTotal: Number,
    paymentStatus: String
});

const stockAdditionSchema = new mongoose.Schema({
    product_id: { type: String },
    quantity: { type: Number },
    date: { type: String }
});

const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    // Flexible schema for different settings
    gstPercentage: Number,
    enableGst: Boolean,
    backupEmail: String,
    backupOptions: Object,
    dailyInterval: Number,
    weeklyDay: String,
    monthlyDay: Number
}, { strict: false });

const printSchema = new mongoose.Schema({
    _id: { type: String, default: 'print_settings' },
    shopName: String,
    address: String,
    gstin: String,
    phoneNumber: String,
    panNumber: String,
    shopColor: String,
    enableGstinPrint: Boolean,
    enablePanPrint: Boolean,
    enableTermsPrint: Boolean
});

const emailSchema = new mongoose.Schema({
    emailAddress: String,
    fromEmailAddress: String,
    appPassword: String
});

const backupSchema = new mongoose.Schema({
    timestamp: Date,
    filename: String,
    filepath: String,
    type: String
});

module.exports = {
    Product: mongoose.model('Product', productSchema),
    Mobile: mongoose.model('Mobile', mobileSchema),
    Accessory: mongoose.model('Accessory', accessorySchema),
    Sale: mongoose.model('Sale', saleSchema),
    Customer: mongoose.model('Customer', customerSchema),
    Service: mongoose.model('Service', serviceSchema),
    StockAddition: mongoose.model('StockAddition', stockAdditionSchema, 'stock_additions'),
    Setting: mongoose.model('Setting', settingSchema),
    Print: mongoose.model('Print', printSchema, 'print'),
    Email: mongoose.model('Email', emailSchema, 'email'),
    Backup: mongoose.model('Backup', backupSchema, 'backup')
};

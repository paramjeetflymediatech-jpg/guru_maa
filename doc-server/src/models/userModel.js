const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Service Layer Wrappers

async function getAllUsers() {
    return await User.find().sort({ createdAt: -1 });
}

async function getUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return await User.findById(id);
}

async function createUser(userData) {
    const user = new User(userData);
    return await user.save();
}

async function updateUser(id, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    // { new: true } returns the updated document
    return await User.findByIdAndUpdate(id, updateData, { new: true });
}

async function deleteUser(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await User.findByIdAndDelete(id);
    return !!result;
}

// Check email existence (helper for validation)
async function findUserByEmail(email) {
    return await User.findOne({ email });
}

module.exports = {
    User, // Exporting the model itself too, just in case
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    findUserByEmail
};

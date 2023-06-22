const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const Admin = require('../models/admin/admin.model');
const Candidate = require('../models/candidate/candidate.model')
// Apply cookie-parser middleware
app.use(cookieParser());
const secretKey = process.env.JWT_SECRET_KEY;

async function registerAdmin(req, res) {
    // #swagger.tags = ['Admin']
    // #swagger.description = 'Endpoint to register an admin'
    const {
        names,
        nationalId,
        address,
        phoneNumber,
        email,
        password
    } = req.body;
    try {

        // Check if the admin with the given national ID already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { nationalID }, { phoneNumber }]
        });
        if (existingAdmin) {
            return res.status(409).json({ message: 'Candidate with the provided national ID already exists' });
        }

        const admin = new Admin({
            names,
            nationalId,
            address,
            phoneNumber,
            email,
            password,
        });

        await admin.validate();

        const savedAdmin = await admin.save();

        res.status(201).json({ message: 'Registration successful', admin: savedAdmin });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function loginAdmin(req, res) {
    // #swagger.tags = ['Admin']
    // #swagger.description = 'Endpoint to login an admin'
    const {
        email,
        password
    } = req.body;
    try {

        const admin = await Admin.findOne({ email });

        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            throw new Error('Invalid email or password');
        }

        const token = jwt.sign({ email }, secretKey);

        res.status(201).json({ message: `${admin.names} logged in successful`, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function registerCandidate(req, res) {
    // #swagger.tags = ['Admin']
    // #swagger.description = 'Endpoint to register a candidate'
    try {
        const { names, nationalID, profilePicture, gender, missionStatement } = req.body;

        // Check if the candidate with the given national ID already exists
        const existingCandidate = await Candidate.findOne({ nationalID });
        if (existingCandidate) {
            return res.status(409).json({ message: 'Candidate with the provided national ID already exists' });
        }

        // Create a new candidate object
        const newCandidate = new Candidate({
            names,
            nationalID,
            profilePicture,
            gender,
            missionStatement
        });

        // Save the new candidate to the database
        await newCandidate.save();

        res.status(201).json({ message: `Candidate ${newCandidate.names} registered successfully`, candidate: newCandidate });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    registerAdmin,
    loginAdmin,
    registerCandidate
};
